import { Prisma, User } from "@prisma/client";
import prisma from "../db";

const extention = Prisma.defineExtension({
    name: 'UserModel',
    model: {
        user: {
            async findNotifiable(litminkaIds: number[]) {
                return await prisma.user.findMany({
                    where: {
                        litminkaId: {
                            in: litminkaIds.map(id => `${id}`)
                        },
                        isNotifiable: true
                    }
                });
            },

            /**
             * @param litminkaId
             * @returns User object
             */
            async getDiscordId(litminkaId: string) {
                return await prisma.user.findFirst({
                    where: {
                        litminkaId
                    },
                    select: {
                        discordId: true
                    }
                });
            },

            async getSettings(discordId: string) {
                return await prisma.user.findFirst({
                    where: {
                        discordId
                    }
                });
            },

            async updateSettings(user: User){
                const {id, isNotifiable} = user;
                return await prisma.user.update({
                    where: {
                        id
                    },
                    data:{
                        isNotifiable
                    }
                });
            }
        }
    }
});

export { extention as UserExt }