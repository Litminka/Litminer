import { ApplicationCommandDataResolvable, Events } from "discord.js";
import { Event } from "../typings/Client";

export default {
    name: Events.ClientReady,
    execute: async (client) => {
        // console.log("[Discord Bot] Clearing commands"); 
        // await client.application.commands.set([]);
        // console.log("[Discord Bot] Clearing guild commands"); 
        // const guild = await client.guilds.fetch(process.env.GUILD_ID);
        // guild.commands.set([]);
        console.log("[LitminerV2] Ready to be used!"); 
        await client.lavalink.init({ ...client.user!, shards: "auto" });  //VERY IMPORTANT!

        client.guilds.cache.get(process.env.GUILD_ID)?.commands.set(client.commands.map(v => v.data.toJSON()) as ApplicationCommandDataResolvable[])
    }
} as Event;