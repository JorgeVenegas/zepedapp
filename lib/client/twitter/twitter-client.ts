// lib/twitter-client.ts
import {Tweet, TwitterApiResponse} from "@/lib/client/twitter/types/twitter";

//const TWITTER_API_URL = 'https://api.twitterapi.io/twitter/tweet/advanced_search';
import { twitterConfig } from '@/lib/client/twitter/config/twitter-config';

export class TwitterClient {
    private apiKey: string;
    private searchQuery: string;

    constructor(apiKey: string, query: string) {
        this.apiKey = apiKey;
        this.searchQuery = query;
    }

    async fetchLatestTweets(): Promise<Tweet[]> {
        const url = new URL(twitterConfig.apiUrl);
        url.searchParams.set('queryType', 'Latest');
        url.searchParams.set('query', this.searchQuery);

        const options = {
            method: 'GET',
            headers: {
                'X-API-Key': this.apiKey,
            },
        };

        try {
            const response = await fetch(url.toString(), options);

            if (!response.ok) {
                throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
            }

            const data: TwitterApiResponse = await response.json();
            return data.tweets || [];
        } catch (error) {
            console.error('Error fetching tweets:', error);
            throw error;
        }
    }
}