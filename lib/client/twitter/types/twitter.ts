// types/twitter.ts
export interface Tweet {
    text: string;
    createdAt: string;
}

export interface TwitterApiResponse {
    tweets: Tweet[];
    next_cursor: string;
}

export interface TweetEntity {
    text: string;
    createdAt: string;
    parsedDate: Date;
}