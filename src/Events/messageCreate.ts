import { Event } from "../typings/Client";
import { Events, Message } from "discord.js";
export default {
    name: Events.MessageCreate,
    execute: async (client, message: Message) => {
        console.log(`${message.author.bot ? `[BOT]`: ``} ${message.author.username} (${message.author.id}): \`${message.content}\``);
    }
} as Event;