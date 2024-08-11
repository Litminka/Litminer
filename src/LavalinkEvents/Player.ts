import {  TextChannel } from "discord.js";
import { BotClient } from "../structures/BotClient";
import MusicEmbeds from "../embeds/MusicEmbeds";
import ClientEmbeds from "../embeds/ClientEmbeds";
import { LitminerDebug } from "../utils/LitminerDebug";


export function PlayerEvents(client:BotClient) {
    /**
     * PLAYER EVENTS
     */
    client.lavalink.on("playerCreate", (player) => {
        LitminerDebug.Success(`${player.guildId} Created a Player`);
    }).on("playerDestroy", (player, reason) => {
        LitminerDebug.Warning(`${player.guildId} Player got Destroyed`);
        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel;
        if(!channel) return LitminerDebug.Error(`No Channel? ${player}`);
        channel.send({
            embeds: [
                ClientEmbeds.PlayerDestroyed(reason)
            ]
        })
    }).on("playerDisconnect", (player, voiceChannelId) => {
        LitminerDebug.Success(`${player.guildId} Player disconnected the Voice Channel, Old VCID - ${voiceChannelId}`);
    }).on("playerMove", (player, oldVoiceChannelId, newVoiceChannelId) => {
        LitminerDebug.Warning(`${player.guildId} Player moved from Voice Channel ${oldVoiceChannelId} to ${newVoiceChannelId}`);
    }).on("playerSocketClosed", (player, payload) => {
        LitminerDebug.Success(`${player.guildId} Player socket got closed from lavalink, Payload - ${payload}`);
    })

    /**
     * Queue/Track Events
     */
    client.lavalink.on("trackStart", (player, track) => {
        LitminerDebug.Info(`${player.guildId} Started playing ${track.info.title}, Queue: ${player.queue.tracks.map(v => v.info.title)}`);
        const channel = client.channels.cache.get(player.textChannelId!) as TextChannel;
        if(!channel) return;
        channel.send({
            embeds: [ 
                MusicEmbeds.TrackStarted(track) 
            ]
        })
    }).on("trackEnd", (player, track, payload) => {
        LitminerDebug.Success(`${player.guildId} Finished playing ${track.info.title}`)
    }).on("trackError", (player, track, payload) => {
        LitminerDebug.Error(`${player.guildId} Errored while Playing ${track?.info?.title}, Data - ${payload}`)
    }).on("trackStuck", (player, track, payload) => {
        LitminerDebug.Warning(`${player.guildId} Got Stuck while Playing ${track?.info?.title}, Data - ${payload}`)
        
    }).on("queueEnd", (player, track, payload) => {
        LitminerDebug.Warning(`${player.guildId} No more tracks in the queue, after playing ${track?.info?.title || track}`)
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