declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'dev' | 'prod';
            DiscordBotToken: string;
            GuildID: string;
            DATABASE_URL: string;
            REDIS_HOST: string;
            REDIS_PORT: string;
            YOUTUBE_COOKIE: string;
            YOUTUBE_ID_TOKEN: string;
        }
    }
}

export {}
