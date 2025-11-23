import { Tweet, TweetEntity } from '@/lib/client/twitter/types/twitter';

export class TwitterService {
    static mapToEntities(tweets: Tweet[]): TweetEntity[] {
        return tweets.map((tweet) => ({
            text: tweet.text,
            createdAt: tweet.createdAt,
            parsedDate: new Date(tweet.createdAt),
        }));
    }

    static filterAndSort(entities: TweetEntity[]): TweetEntity[] {
        // Sort by date descending (newest first)
        return entities.sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());
    }
}