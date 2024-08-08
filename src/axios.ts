import axios, { AxiosError } from "axios";
import BaseError from "./errors/BaseError";

enum UnauthorizedTypes {
    Unauthorized = 'unauthorized',
    NotProvided = 'not_provided',
    Expired = 'expired',
    RefreshExpired = 'refresh_expired',
}

interface UnauthorizedError {
    message: UnauthorizedTypes;
}

interface RefreshResponse {
    token: string;
    refreshToken: string;
}

if (process.env.DEV) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
const api = axios.create({ baseURL: 'https://api.litminka.ru/' });

api.interceptors.request.use(
    function (config) {
        const token = process.env.LITMINKA_TOKEN;

        if (!token) return config;

        config.headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
            ...config.headers
        };

        if (!config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data?.userId) {
            config.params.userId = config.data.userId;
            delete config.data.userId;
        }

        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error: AxiosError) {
        const response = error.response;
        const status = error.response?.status;
        const config = error.response?.config;

        if (status === 422) return response; // maybe throw a validation error?

        if (status === 403) throw new BaseError("[403]: Forbidden");

        if (status === 404) throw new BaseError('[404]: Not found');

        if (status === 401) {
            const refresh = process.env.LITMINKA_REFRESH_TOKEN;

            if (
                response === undefined ||
                (<UnauthorizedError>response.data).message !== UnauthorizedTypes.Expired ||
                !refresh
            ) {
                // if 401 and token anything but expired, relogin
                await login();
            } else {
                await refreshToken(refresh);
            }

            // retry original request
            if (config !== undefined) {
                config.headers.Authorization = process.env.LITMINKA_TOKEN;
                return api.request(config);
            }
        }

        return Promise.reject(error);
    },
);

export async function login() {
    console.log(`Logging in to [Litminka-API]`);
    const res = await api.post('users/login', {
        login: process.env.DISCORD_BOT_LOGIN,
        password: process.env.DISCORD_BOT_PASSWORD,
    });

    const { token, refreshToken }: RefreshResponse = res.data.body;
    process.env.LITMINKA_TOKEN = token;
    process.env.LITMINKA_REFRESH_TOKEN = refreshToken;

    await api.delete('token');
}

async function refreshToken(refresh: string) {
    const res = await api.get('token/refresh', {
        headers: {
            Authorization: `Bearer ${refresh}`,
        },
    });

    const { token, refreshToken }: RefreshResponse = res.data.body;

    process.env.LITMINKA_TOKEN = token;
    process.env.LITMINKA_REFRESH_TOKEN = refreshToken;
}

export { api };