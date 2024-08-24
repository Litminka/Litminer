import { api } from "../axios";
import prisma from "../db";
import NoIntegrationError from "../errors/api/NoIntegrationError";
import NotFoundError from "../errors/api/NotFoundError";
import BaseError from "../errors/BaseError";
import { Anime, FollowTypes, Settings, User } from "../typings/anime";

export class APIRequestService {

    public static async GetUserWatchlist(discordId: string, page: number, pageLimit: number = 10, ...params: unknown[]) {
        const userSettings = await prisma.user.getSettings(discordId);
        if (!userSettings) throw new BaseError(`User is not registered`);
        const userId = userSettings.litminkaId;
        if (!userId) throw new NoIntegrationError();
        return (await api.get(`watch-list`, {
            params: {
                page,
                pageLimit
            },
            data: {
                userId
            }
        })).data.body;
    }

    public static async SearchAnime(discordId: string, page: number, pageLimit: number = 1, ...params: unknown[]) {
        const name: string = params[0] as string;
        const data = (await api.get(`anime`, {
            params: {
                page,
                pageLimit,
                name
            }
        })).data.body;

        if (data.count < 1) throw new NotFoundError();

        return {
            list: data.anime as Anime[],
            count: data.count as number
        };
    }

    public static async FollowAnime(discordId: string, animeId: number, groupName: string, type: FollowTypes) {
        const userSettings = await prisma.user.getSettings(discordId);
        if (!userSettings) throw new BaseError(`User is not registered`);
        const userId = userSettings.litminkaId;
        if (!userId) throw new NoIntegrationError();
        return (await api.post(`anime/follow/${animeId}`, {
                groupName,
                type,
                userId
            }
        ));
    }

    public static async UnfollowAnime(discordId: string, animeId: number, groupName: string) {
        const userSettings = await prisma.user.getSettings(discordId);
        if (!userSettings) throw new BaseError(`User is not registered`);
        const userId = userSettings.litminkaId;
        if (!userId) throw new NoIntegrationError();
        return (await api.delete(`anime/follow/${animeId}`, {
            data: {
                userId,
                groupName
            }
        }));
    }

    public static async GetSingleAnimeFullInfo(discordId: string, slug: string) {
        const userSettings = await prisma.user.getSettings(discordId);
        if (!userSettings) throw new BaseError(`User is not registered`);
        const userId = userSettings.litminkaId;
        if (!userId) throw new NoIntegrationError();
        return (await api.get(`anime/${slug}`, {
            data: {
                userId
            }
        })).data.body as Anime;
    }

    public static async GetUser(discordId: string) {
        const userSettings = await prisma.user.getSettings(discordId);
        if (!userSettings) throw new BaseError(`User is not registered`);
        const userId = userSettings.litminkaId;
        if (!userId) throw new NoIntegrationError();
        return (await api.get(`users/profile`, {
            data:{
                userId: userSettings.litminkaId
            }
        })).data.body as User;
    }

    public static async UpdateUserSettings(discordId: string, settings: Settings){
        const userSettings = await prisma.user.getSettings(discordId);
        if (!userSettings) throw new BaseError(`User is not registered`);
        const userId = userSettings.litminkaId;
        if (!userId) throw new NoIntegrationError();
        const { notifyDiscord } = settings;
        await api.patch(`users/settings`, {
            userId: userSettings.litminkaId,
            notifyDiscord
        })
    }
}