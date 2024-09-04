import { CommandInteractionOptionResolver, GuildMember, VoiceChannel } from "discord.js";
import { SearchPlatform, SearchResult, Track } from "lavalink-client/dist/types";
import AudioService from "../../services/AudioService";
import AutocompleteService from "../../services/AutocompleteService";
import { AutocompleteOptions, ExecuteOptions } from "../../typings/client";
import { formatMS_HHMMSS } from "../../utils/time";
import MusicEmbeds from "../../embeds/MusicEmbeds";
import ChannelAccessError from "../../errors/interaction/ChannelAccessError";
import JoinVCError from "../../errors/interaction/JoinVCError";
import NotInVCError from "../../errors/player/NotInVCError";
import NoTracksError from "../../errors/search/NoTracksError";

export async function PlayTrackSubcommand({client, interaction}: ExecuteOptions) {
    // #region Validation
    if (!interaction.guildId) return;

    const vcId = (interaction.member as GuildMember)?.voice?.channelId;
    if (!vcId) throw new JoinVCError();

    const vc = (interaction.member as GuildMember)?.voice?.channel as VoiceChannel;
    if (!vc.joinable || !vc.speakable) throw new ChannelAccessError();
    // #endregion
    // #region Getting track query
    const query = (interaction.options as CommandInteractionOptionResolver).getString("query") as string;

    if (query === "nothing_found") throw new NoTracksError();
    if (query === "join_vc") throw new JoinVCError(`You joined a VC, but redo the Command please.`);
    // #endregion
    // #region AudioPlayer create
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
    // #endregion
    // #region Searching for track
    const src = (interaction.options as CommandInteractionOptionResolver).getString("source") as SearchPlatform | undefined;
    const fromAutoComplete = (Number(query.replace("autocomplete_", "")) >= 0) && AutocompleteService.GetSearchResultMap(interaction.user.id);

    const response = (fromAutoComplete || await player.search({ query: query, source: src }, interaction.user)) as SearchResult;

    if (!response || !response.tracks?.length) throw new NoTracksError();
    // #endregion
    // #region Adding tracks to queue
    const track: Track = (response.loadType !== "playlist") ? response.tracks[fromAutoComplete ? Number(query.replace("autocomplete_", "")) : 0] : response.tracks[0];

    await player.queue.add(response.loadType === "playlist" ? response.tracks : track);

    await interaction.reply({
        embeds: [
            response.loadType === "playlist"
                ? MusicEmbeds.PlaylistAdded(response.playlist, response.tracks, player.queue.tracks.length)
                : MusicEmbeds.TrackAdded(track, player.queue.tracks.length)
        ]
    });
    // #endregion
    const playOptions = player.connected ? { volume: client.defaultVolume, paused: false } : undefined
    if (!player.playing) await AudioService.play(player, playOptions);
}

export async function PlayTrackSubcommandAutocomplete({client, interaction}: AutocompleteOptions) {
    // #region Validation
    if (!interaction.guildId) return;
    const vcId = (interaction.member as GuildMember)?.voice?.channelId;
    if (!vcId) return interaction.respond([{ name: `Join a voice Channel`, value: "join_vc" }]);
    // #endregion
    // #region Getting track query
    const focussedQuery = interaction.options.getFocused();
    // #endregion
    // #region AudioPlayer create
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

    if (player.voiceChannelId !== vcId) return await interaction.respond([{ name: `You need to be in my Voice Channel`, value: "join_vc" }]);
    // #endregion
    // #region Searching for tracks
    const res = await AudioService.search(
        player,
        { query: focussedQuery, source: interaction.options.getString("source") as SearchPlatform },
        interaction.user
    ) as SearchResult;

    if (!res.tracks.length) return await interaction.respond([{ name: `No Tracks found`, value: "nothing_found" }]);
    // #endregion
    // #region Setting autocomplete map
    AutocompleteService.SetSearchResultMap(interaction.user.id, res);
    await interaction.respond(
        res.loadType === "playlist" ?
            [{ name: `Playlist [${res.tracks.length} Tracks] - ${res.playlist?.title}`, value: `autocomplete_0` }]
            : res.tracks.map((t: Track, i) => ({ name: `[${formatMS_HHMMSS(t.info.duration)}] ${t.info.title} (by ${t.info.author || "Unknown-Author"})`.substring(0, 100), value: `autocomplete_${i}` })).slice(0, 25)
    );
    // #endregion
}