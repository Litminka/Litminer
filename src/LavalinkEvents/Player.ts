import {  TextChannel } from "discord.js";
import { BotClient } from "../Structures/BotClient";
import EmbedService from "../Embeds/MusicEmbeds";
import MusicEmbeds from "../Embeds/MusicEmbeds";
import ClientEmbeds from "../Embeds/ClientEmbeds";


export function PlayerEvents(client:BotClient) {
    /**
     * PLAYER EVENTS
     */
    client.lavalink.on("playerCreate", (player) => {
        console.log(player.guildId, " :: Created a Player :: ");
    }).on("playerDestroy", (player, reason) => {
        console.log(player.guildId, " :: Player got Destroyed :: ");
        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel;
        if(!channel) return console.log("No Channel?", player);
        channel.send({
            embeds: [
                ClientEmbeds.PlayerDestroyed(reason)
            ]
        })
    }).on("playerDisconnect", (player, voiceChannelId) => {
        console.log(player.guildId, " :: Player disconnected the Voice Channel :: ", voiceChannelId);
    }).on("playerMove", (player, oldVoiceChannelId, newVoiceChannelId) => {
        console.log(player.guildId, " :: Player moved from Voice Channel :: ", oldVoiceChannelId, " :: To ::", newVoiceChannelId);
    }).on("playerSocketClosed", (player, payload) => {
        console.log(player.guildId, " :: Player socket got closed from lavalink :: ", payload);
    })

    /**
     * Queue/Track Events
     */
    client.lavalink.on("trackStart", (player, track) => {
        console.log(player.guildId, " :: Started Playing :: ", track.info.title, "QUEUE:", player.queue.tracks.map(v => v.info.title));
        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel;
        if(!channel) return;
        channel.send({
            embeds: [ 
                EmbedService.TrackStarted(track) 
            ]
        })
    }).on("trackEnd", (player, track, payload) => {
        console.log(player.guildId, " :: Finished Playing :: ", track.info.title)
    }).on("trackError", (player, track, payload) => {
        console.log(player.guildId, " :: Errored while Playing :: ", track?.info?.title, " :: ERROR DATA :: ", payload)
    }).on("trackStuck", (player, track, payload) => {
        console.log(player.guildId, " :: Got Stuck while Playing :: ", track?.info?.title, " :: STUCKED DATA :: ", payload)
        
    }).on("queueEnd", (player, track, payload) => {
        console.log(player.guildId, " :: No more tracks in the queue, after playing :: ", track?.info?.title || track)
        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel;
        if(!channel) return;
        channel.send({
            embeds: [
                MusicEmbeds.QueueEnded()
            ]
        })
    }).on("playerUpdate", (player) => {
        // use this event to update the player in the your cache if you want to save the player's data(s) externally!
        /**
         * 
        */
    });
}