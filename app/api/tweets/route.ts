import { NextRequest, NextResponse } from 'next/server';
import { TwitterClient } from '@/lib/client/twitter/twitter-client';
import { TwitterService } from '@/lib/service/tweet-incident';
import {entitiesToCSV} from "@/lib/service/parse-tweets";
import {analyzeTwitterFeedback, parseAndValidateGroqResponse} from "@/lib/groq";
import {TweetEntity} from "@/lib/client/twitter/types/twitter";
import {supabase} from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
    try{
        const apiKey = process.env.TWITTER_API_KEY;
        const twitterQuery = process.env.TWITTER_QUERY;

        if (!apiKey) {
            console.error('TWITTER_API_KEY not found in environment variables');
            return NextResponse.json(
                { error: 'Twitter API key not configured' },
                { status: 500 }
            );
        }
        if (!twitterQuery) {
            console.error('TWITTER_QUERY not found in environment variables');
            return NextResponse.json(
                { error: 'Twitter QUERY not configured' },
                { status: 500 }
            );
        }

        const client = new TwitterClient(apiKey, twitterQuery);
        // Fetch tweets
        const tweets = await client.fetchLatestTweets();

        // Map to entities
        const entities = TwitterService.mapToEntities(tweets);

        // Optional: filter and sort
        const processedEntities = TwitterService.filterAndSort(entities);

        const cleanedEntities = processedEntities.map((entity: any) => ({
            ...entity,
            text: cleanText(entity.text)
        }));

        const feedbackTexts = cleanedEntities.map((entity: any) => entity.text);

        let analyzedFeedback = [];
        if (feedbackTexts.length > 0) {
            const groqResult = await analyzeTwitterFeedback(feedbackTexts);
            analyzedFeedback = parseAndValidateGroqResponse(groqResult, feedbackTexts.length);
        }


        const csvContent = entitiesToCSV(processedEntities);
        // Merge analyzed data with original entities
        const enrichedEntities = processedEntities.map((entity: any, idx: number) => ({
            ...entity,
            analysis: analyzedFeedback[idx] || null
        }));


        const saveEntities = enrichedEntities.map(item => ({
            time: item.parsedDate,
            service: 'metro', // or extract from item if available
            source: 'twitter', // or extract from item if available
            subservice: item.analysis.subservice,
            priority: item.analysis.priority,
            category: item.analysis.category,
            sentiment_analysis: item.analysis.sentiment_analysis,
            summary: item.analysis.summary,
            original: item.analysis.original,
            keywords: item.analysis.keywords
        }))

        const { data, error } = await supabase
            .from('incidents_x')
            .insert(saveEntities)
            .select()

        // Save to file (Node.js)
        const fs = require('fs');
        const path = require('path');

        const folderPath = './exports';
        const fileName = `tweets_${Date.now()}.csv`;
        const filePath = path.join(folderPath, fileName);

        // Create folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Write CSV to file
        fs.writeFileSync(filePath, csvContent, 'utf8');
        console.log(`CSV saved to: ${filePath}`);
        return NextResponse.json({
            success: true,
            data,
            count: data?.length || 0
        })
    }catch(error){
        console.error('Error in tweets endpoint:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch tweets'
            },
            { status: 500 }
        );
    }
}

function cleanText(text: string): string {
    if (!text) return '';

    // Remove non-letter, non-number, and non-space characters (keeping unicode letters/numbers)
    let cleanedText = text.replace(/[^\p{L}\p{N}\s]/gu, '');

    // Remove multiple consecutive spaces and trim
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    return cleanedText;
}