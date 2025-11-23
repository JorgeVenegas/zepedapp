export const twitterConfig = {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiUrl: 'https://api.twitterapi.io/twitter/tweet/advanced_search',
    searchQuery: 'metro OR linea geocode:19.4326,-99.1332,30km',
} as const;