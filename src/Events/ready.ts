import { ApplicationCommandDataResolvable, Events } from "discord.js";
import { Event } from "../typings/Client";
import { LitminerDebug } from "../utils/LitminerDebug";

export default {
    name: Events.ClientReady,
    execute: async (client) => {
        LitminerDebug.Success("Ready to be used!"); 
        await client.lavalink.init({ ...client.user!, shards: "auto" });  //VERY IMPORTANT!

        client.guilds.cache.get(process.env.GUILD_ID)?.commands.set(client.commands.map(v => v.data.toJSON()) as ApplicationCommandDataResolvable[])
    }
} as Event;