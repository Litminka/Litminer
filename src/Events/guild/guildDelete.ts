import { Event } from "../../typings/client";
import { Events, Guild } from "discord.js";
import { LitminerDebug } from "../../utils/litminerDebug";
import prisma from "../../db";
export default {
    name: Events.GuildDelete,
    execute: async (client, guild: Guild) => {
        await prisma.guild.removeGuild(guild);
        LitminerDebug.Warning(`Bot was removed from ${guild.name} (${guild.id})`);
    }
} as Event;