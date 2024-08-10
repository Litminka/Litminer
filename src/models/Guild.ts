import { Prisma } from "@prisma/client";
import prisma from "../db";

const extention = Prisma.defineExtension({
    name: 'GuildModel',
    model: {
        guild: {
            /**
             * @param guildId
             * @returns User object
             */
            async getSettings(guildId: string) {
                return await prisma.guild.findFirst({
                    where: {
                        guildId
                    }
                });
            },
            async getNotifiable(){
                return await prisma.guild.findMany({
                    where: {
                        isNotifiable: true,
                        notifyChannelId: {
                            not: null
                        }
                    }
                });
            }
            
        }
    }
});

export { extention as GuildExt }