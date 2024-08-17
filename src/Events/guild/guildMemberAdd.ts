import { Event } from "../../typings/client";
import { Events, User } from "discord.js";
import { LitminerDebug } from "../../utils/litminerDebug";
import prisma from "../../db";
export default {
    name: Events.GuildMemberAdd,
    execute: async (client, user: User) => {
        await prisma.user.createUser(user, ``);
        LitminerDebug.Info(`${user.username} (${user.id}): \`Joined the server\``);
    }
} as Event;