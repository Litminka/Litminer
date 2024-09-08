import { CommandInteractionOptionResolver, GuildMember, VoiceChannel } from "discord.js";
import { AutocompleteOptions, ExecuteOptions } from "../../typings/client";
import prisma from "../../db";
import { Playlist, Track } from "@prisma/client";
import AutocompleteService from "../../services/AutocompleteService";
import { LavaSearchQuery, PlaylistInfo, SearchPlatform, LavaSearchType } from "lavalink-client";
import ChannelAccessError from "../../errors/interaction/ChannelAccessError";
import JoinVCError from "../../errors/interaction/JoinVCError";
import NotInVCError from "../../errors/player/NotInVCError";
import NoTracksError from "../../errors/search/NoTracksError";
import AudioService from "../../services/AudioService";
import MusicEmbeds from "../../embeds/MusicEmbeds";
import { LitminerDebug } from "../../utils/LitminerDebug";
import BaseEmbeds from "../../embeds/BaseEmbeds";

export async function PlaylistSubcommand({ client, interaction }: ExecuteOptions) {
    if (!interaction.guildId) return;

    const vcId = (interaction.member as GuildMember)?.voice?.channelId;
    if (!vcId) throw new JoinVCError();

    const vc = (interaction.member as GuildMember)?.voice?.channel as VoiceChannel;
    if (!vc.joinable || !vc.speakable) throw new ChannelAccessError();

    const listName = (interaction.options as CommandInteractionOptionResolver).getString("listname") as string;

    if (listName === "nothing_found") throw new NoTracksError();
    if (listName === "join_vc") throw new JoinVCError(`You joined a VC, but redo the Command please.`);

    const player = client.lavalink.getPlayer(interaction.guildId) || await client.lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: vcId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: client.defaultVolume,
        instaUpdateFiltersFix: true,
        applyVolumeAsFilter: false,
    });
    if (!player.connected) await player.connect();
    if (player.voiceChannelId !== vcId) throw new NotInVCError();
    const fromAutoComplete = (Number(listName.replace("playlist_", "")) >= 0) && AutocompleteService.GetPlaylistMap(interaction.user.id);
    let playlist: Playlist = fromAutoComplete[Number(listName.replace("playlist_", ""))];

    if (!fromAutoComplete) {
        const res = await prisma.playlist.getPlaylists(interaction.user.id);
        const playlists = res.filter((pl: Playlist) => pl.name.toLowerCase().startsWith(listName));
        playlist = playlists[0];
    }

    const innerTracks: Track[] = await prisma.playlist.getTracks(playlist);
    try {
        await interaction.deferReply({ ephemeral: true });

        const tracksAdded = await AudioService.searchAndAddMany(player,
            innerTracks.map(track => {
                //LitminerDebug.Debug(JSON.stringify(track, null, " "));
                return {
                    query: track.identifier,
                    source: track.source as SearchPlatform
                } as LavaSearchQuery
            }) as LavaSearchQuery[], interaction.user);

        await interaction.editReply({
            embeds: [
                MusicEmbeds.PlaylistAdded({ title: playlist.name } as PlaylistInfo, null, player.queue.tracks.length - tracksAdded)
            ]
        });

        if (innerTracks.length !== tracksAdded)
            await interaction.followUp({
                ephemeral: true,
                embeds: [
                    BaseEmbeds.Warning(`Playlist not fully added`)
                ]
            });
        const playOptions = player.connected ? { volume: client.defaultVolume, paused: false } : undefined
        if (!player.playing) await AudioService.play(player, playOptions);
    } catch (error) {
        LitminerDebug.Error(error.stack);
        if (interaction.replied || interaction.deferred) {
            return await interaction.followUp({
                ephemeral: true,
                embeds: [
                    BaseEmbeds.Error(error.message)
                ]
            });
        } else {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    BaseEmbeds.Error(error.message)
                ]
            });
        }
    }
}


export async function PlaylistSubcommandAutocomplete({ client, interaction }: AutocompleteOptions) {
    if (!interaction.guildId) return;
    const vcId = (interaction.member as GuildMember)?.voice?.channelId;
    if (!vcId) return interaction.respond([{ name: `Join a voice Channel`, value: "join_vc" }]);
    const focussedQuery = interaction.options.getFocused();
    const player = client.lavalink.getPlayer(interaction.guildId) || await client.lavalink.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: vcId,
        textChannelId: interaction.channelId,
        selfDeaf: true,
        selfMute: false,
        volume: client.defaultVolume,
        instaUpdateFiltersFix: true,
        applyVolumeAsFilter: false,
    });

    if (!player.connected) await player.connect();
    if (player.voiceChannelId !== vcId)
        return await interaction.respond([{ name: `You need to be in my Voice Channel`, value: "join_vc" }]);
    const res = await prisma.playlist.getPlaylists(interaction.user.id);
    if (!res.length)
        return await interaction.respond([{ name: `No Playlist found`, value: "nothing_found" }]);

    const playlists = res.filter((pl: Playlist) => pl.name.toLowerCase().startsWith(focussedQuery));

    AutocompleteService.SetPlaylistMap(interaction.user.id, playlists);
    await interaction.respond(
        playlists.map((pl: Playlist, i) => ({ name: `[Плейлист №${i}] ${pl.name}`.substring(0, 100), value: `playlist_${i}` })).slice(0, 25)
    );
}	