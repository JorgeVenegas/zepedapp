import { NextRequest, NextResponse } from 'next/server';
import { TwitterClient } from '@/lib/client/twitter/twitter-client';
import { TwitterService } from '@/lib/service/tweet-incident';

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

        return NextResponse.json({
            success: true,
            count: processedEntities.length,
            data: processedEntities,
        });
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