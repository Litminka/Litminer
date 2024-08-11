import { Event } from "../typings/Client";
import { Events, User } from "discord.js";
import { LitminerDebug } from "../utils/LitminerDebug";
export default {
    name: Events.GuildMemberAdd,
    execute: async (client, user: User) => {
        LitminerDebug.Debug(`${user.username} (${user.id}): \`Joined the server\``);
    }
} as Event;