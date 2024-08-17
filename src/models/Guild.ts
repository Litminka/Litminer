import { Guild, Prisma } from "@prisma/client";
import prisma from "../db";
import { Guild as DSGuild } from "discord.js";

const extention = Prisma.defineExtension({
    name: 'GuildModel',
    model: {
        guild: {
            async createGuild(guild: DSGuild) {
                const { id, name } = guild;
                await prisma.guild.create({
                    data: {
                        guildId: id,
                        name,
                        isNotifiable: false,
                        icon: guild.iconURL()
                    }
                })
            },
            async removeGuild(guild: DSGuild) {
                const { id } = guild;
                await prisma.guild.delete({
                    where:{
                        guildId: id
                    }
                })
            },
            /**
             * @param guildId
             * @returns Prisma.Guild object
             */
            async getSettings(guildId: string) {
                return await prisma.guild.findFirst({
                    where: {
                        guildId
                    }
                });
            },
            async getNotifiable() {
                return await prisma.guild.findMany({
                    where: {
                        isNotifiable: true,
                        notifyChannelId: {
                            not: null
                        }
                    }
                });
            },
            async updateSettings(guild: Guild) {
                const { id, isNotifiable, notifyChannelId } = guild;
                return await prisma.guild.update({
                    where: {
                        id
                    },
                    data: {
                        isNotifiable,
                        notifyChannelId
                    }
                });
            }

        }
    }
});

export { extention as GuildExt }