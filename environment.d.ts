declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'dev' | 'prod';
            DISCORD_BOT_TOKEN: string;
            DISCORD_BOT_ID: string;
            GUILD_ID: string;
            DATABASE_URL: string;
            REDIS_HOST: string;
            REDIS_PORT: string;
            YOUTUBE_COOKIE: string;
            YOUTUBE_ID_TOKEN: string;
        }
    }
}

export {}
