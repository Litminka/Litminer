import { Event } from "../typings/Client";
import { Events, User } from "discord.js";
export default {
    name: Events.GuildMemberAdd,
    execute: async (client, user: User) => {
        console.log(`${user.username} (${user.id}): \`Joined the server\``);
    }
} as Event;