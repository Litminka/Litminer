import { api } from "../axios";
import prisma from "../db";

export class LitminkaAPIRequests{

    public static async GetUserWatchlist(discordId: string, page: number, pageLimit: number = 10){
        return (await api.get(`watch-list`, {
            params: {
                page,
                pageLimit
            },
            data: {
                userId: (await prisma.user.getSettings(discordId)).litminkaId
            }
        })).data.body;
    }
}