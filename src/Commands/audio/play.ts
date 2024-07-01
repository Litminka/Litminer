import { ApplicationCommandOptionType, CommandInteractionOptionResolver, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { Command } from "../../typings/Client";
import { formatMS_HHMMSS } from "../../Utils/Time";
import { SearchPlatform, SearchResult, Track } from "lavalink-client";

const autocompleteMap = new Map();

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

        execute: async ( {client, interaction} ) => {
            if(!interaction.guildId) return;
            
            const vcId = (interaction.member as GuildMember)?.voice?.channelId;
            if(!vcId) return interaction.reply({ ephemeral: true, content: `Join a voice Channel` });
    
            const vc = (interaction.member as GuildMember)?.voice?.channel as VoiceChannel;
            if(!vc.joinable || !vc.speakable) return interaction.reply({ ephemeral: true, content: "I am not able to join your channel / speak in there." });
            
            
            const query = (interaction.options as CommandInteractionOptionResolver).getString("query") as string;
            
            if(query === "nothing_found") return interaction.reply({ content: `No Tracks found`, ephemeral: true });
            if(query === "join_vc") return interaction.reply({ content: `You joined a VC, but redo the Command please.`, ephemeral: true });
            
            const fromAutoComplete =  (Number(query.replace("autocomplete_", "")) >= 0 && autocompleteMap.has(`${interaction.user.id}_res`)) && autocompleteMap.get(`${interaction.user.id}_res`);
            if(autocompleteMap.has(`${interaction.user.id}_res`)) {
                if(autocompleteMap.has(`${interaction.user.id}_timeout`)) clearTimeout(autocompleteMap.get(`${interaction.user.id}_timeout`));
                autocompleteMap.delete(`${interaction.user.id}_res`);
                autocompleteMap.delete(`${interaction.user.id}_timeout`);
            }

            const player = client.lavalink.getPlayer(interaction.guildId) || await client.lavalink.createPlayer({
                guildId: interaction.guildId, 
                voiceChannelId: vcId, 
                textChannelId: interaction.channelId, 
                selfDeaf: true, 
                selfMute: false,
                volume: client.defaultVolume,  // default volume
                instaUpdateFiltersFix: true, // optional
                applyVolumeAsFilter: false, // if true player.setVolume(54) -> player.filters.setVolume(0.54)
                // node: "YOUR_NODE_ID",
                // vcRegion: (interaction.member as GuildMember)?.voice.channel?.rtcRegion!
            });
            
            const connected = player.connected;
    
            if(!connected) await player.connect();
    
            if(player.voiceChannelId !== vcId) return interaction.reply({ ephemeral: true, content: "You need to be in my Voice Channel" });

            const src = (interaction.options as CommandInteractionOptionResolver).getString("source") as SearchPlatform|undefined;
            console.log(`[Autoresponse] - ${fromAutoComplete as SearchResult}`);
            
            const response = (fromAutoComplete || await player.search({ query: query, source: src }, interaction.user)) as SearchResult;
            //console.log("[Response] - ")
            //response.tracks.forEach((track) => {
            //    console.log(track.info.title);
            //})

            if(!response || !response.tracks?.length) return interaction.reply({ content: `No Tracks found`, ephemeral: true });
            
            const track: Track = (response.loadType !== "playlist") ? response.tracks[fromAutoComplete ? Number(query.replace("autocomplete_", "")) : 0] : response.tracks[0] ;

            await player.queue.add(response.loadType === "playlist" ? response.tracks : track);
    
            await interaction.reply({
                content: response.loadType === "playlist" 
                    ? `✅ Added [${response.tracks.length}] Tracks${response.playlist?.title ? ` - from the ${response.pluginInfo.type || "Playlist"} ${response.playlist.uri ? `[\`${response.playlist.title}\`](<${response.playlist.uri}>)` : `\`${response.playlist.title}\``}` : ""} at \`#${player.queue.tracks.length-response.tracks.length}\`` 
                    : `✅ Added [\`${track.info.title}\`](<${track.info.uri}>) by \`${track.info.author}\` at \`#${player.queue.tracks.length}\`` 
            });
    
            if(!player.playing) await player.play(connected ? { volume: client.defaultVolume, paused: false } : undefined);
        },
    autocomplete: async ( {client, interaction} ) => {
        if(!interaction.guildId) return;
        const vcId = (interaction.member as GuildMember)?.voice?.channelId;
        if(!vcId) return interaction.respond([{ name: `Join a voice Channel`, value: "join_vc" }]);

        const focussedQuery = interaction.options.getFocused();
        const player = client.lavalink.getPlayer(interaction.guildId) || await client.lavalink.createPlayer({
            guildId: interaction.guildId, voiceChannelId: vcId, textChannelId: interaction.channelId, // in what guild + channel(s)
            selfDeaf: true, selfMute: false, volume: client.defaultVolume, instaUpdateFiltersFix: true // configuration(s)
        });

        if(!player.connected) await player.connect();

        if(player.voiceChannelId !== vcId) return interaction.respond([{ name: `You need to be in my Voice Channel`, value: "join_vc" }]);

        const res = await player.search({ query: focussedQuery, source: interaction.options.getString("source") as SearchPlatform }, interaction.user) as SearchResult;
        
        if(!res.tracks.length) return await interaction.respond([{ name: `No Tracks found`, value: "nothing_found" }]);
        // handle the res
        if(autocompleteMap.has(`${interaction.user.id}_timeout`)) 
            clearTimeout(autocompleteMap.get(`${interaction.user.id}_timeout`));
        autocompleteMap.set(`${interaction.user.id}_res`, res);
        autocompleteMap.set(`${interaction.user.id}_timeout`, setTimeout(() => {
            autocompleteMap.delete(`${interaction.user.id}_res`);
            autocompleteMap.delete(`${interaction.user.id}_timeout`);
        }, 25000));
        await interaction.respond(
            res.loadType === "playlist" ? 
            [{ name: `Playlist [${res.tracks.length} Tracks] - ${res.playlist?.title}`, value: `autocomplete_0`}]
            : res.tracks.map((t:Track, i) => ({ name: `[${formatMS_HHMMSS(t.info.duration)}] ${t.info.title} (by ${t.info.author || "Unknown-Author"})`.substring(0, 100), value: `autocomplete_${i}` })).slice(0, 25)
        );
    }
} as Command;