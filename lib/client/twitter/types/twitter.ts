// types/twitter.ts
export interface Tweet {
    text: string;
    createdAt: string;
}

export interface TwitterApiResponse {
    tweets: Tweet[];
}

export interface TweetEntity {
    text: string;
    createdAt: string;
    parsedDate: Date;
}