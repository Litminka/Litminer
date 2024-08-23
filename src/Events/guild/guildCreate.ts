import { Event } from "../../typings/client";
import { ApplicationCommandDataResolvable, Events, Guild } from "discord.js";
import { LitminerDebug } from "../../utils/litminerDebug";
import prisma from "../../db";
export default {
    name: Events.GuildCreate,
    execute: async (client, guild: Guild) => {
        await prisma.guild.createGuild(guild);
        LitminerDebug.Info(`Bot was added to ${guild.name} (${guild.id})`);

        client.guilds.cache.get(guild.id)?.commands.set(client.commands.map(v => v.data.toJSON()) as ApplicationCommandDataResolvable[])
    }
} as Event;