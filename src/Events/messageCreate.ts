import { Event } from "../typings/client";
import { Events, Message } from "discord.js";
import { LitminerDebug } from "../utils/litminerDebug";
export default {
    name: Events.MessageCreate,
    execute: async (client, message: Message) => {
        if (!message.guild){
            LitminerDebug.Debug(`[DM (${message.channel.client.user.username})] ${message.author.bot ? `[BOT] `: ``}${message.author.username} (${message.author.id}): \`${message}\``);
        } else{
            LitminerDebug.Debug(`${message.author.bot ? `[BOT]`: ``} ${message.author.username} (${message.author.id}): \`${message}\``);
        }
        
    }
} as Event;