import { CommandInteractionOptionResolver, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { Command } from "../../typings/client";
import { formatMS_HHMMSS } from "../../utils/time";
import { SearchPlatform, SearchResult, Track } from "lavalink-client";
import AudioService from "../../services/audioService";
import AutocompleteService from "../../services/autocompleteService";
import MusicEmbeds from "../../embeds/musicEmbeds";
import JoinVCError from "../../errors/interactionErrors/joinVCError";
import ChannelAccessError from "../../errors/interactionErrors/channelAccessError";
import NoTracksError from "../../errors/searchErrors/noTracksError";
import NotInVCError from "../../errors/playerErrors/notInVCError";



export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play Music")
        .addStringOption(o => o.setName("source").setDescription("From which Source you want to play?").setRequired(true).setChoices(
            { name: "Youtube", value: "ytsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
            { name: "Youtube Music", value: "ytmsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
            { name: "Soundcloud", value: "scsearch" },
            //{ name: "Deezer", value: "dzsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
            //{ name: "Spotify", value: "spsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
            //{ name: "Apple Music", value: "amsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
            { name: "Bandcamp", value: "bcsearch" }
        ))
        .addStringOption(o => o.setName("query").setDescription("What to play?").setAutocomplete(true).setRequired(true)),

    execute: async ({ client, interaction }) => {
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
        const fromAutoComplete = (Number(query.replace("autocomplete_", "")) >= 0) && AutocompleteService.GetMap(interaction.user.id);

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
    },
    autocomplete: async ({ client, interaction }) => {
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
        AutocompleteService.SetMap(interaction.user.id, res);
        await interaction.respond(
            res.loadType === "playlist" ?
                [{ name: `Playlist [${res.tracks.length} Tracks] - ${res.playlist?.title}`, value: `autocomplete_0` }]
                : res.tracks.map((t: Track, i) => ({ name: `[${formatMS_HHMMSS(t.info.duration)}] ${t.info.title} (by ${t.info.author || "Unknown-Author"})`.substring(0, 100), value: `autocomplete_${i}` })).slice(0, 25)
        );
        // #endregion
    }
} as Command;