import { Event } from "../typings/Client";
import { Events, Message } from "discord.js";
import { LitminerDebug } from "../utils/LitminerDebug";
export default {
    name: Events.MessageCreate,
    execute: async (client, message: Message) => {
        LitminerDebug.Debug(`${message.author.bot ? `[BOT]`: ``} ${message.author.username} (${message.author.id}): \`${message.content}\``);
    }
} as Event;