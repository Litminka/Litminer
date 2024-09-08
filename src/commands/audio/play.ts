import { SlashCommandBuilder } from "discord.js";
import { PlayTrackSubcommand, PlayTrackSubcommandAutocomplete } from "../../subcommands/play/track";
import { SubCommand } from "../../typings/client";
import { PlaylistSubcommand, PlaylistSubcommandAutocomplete } from "../../subcommands/play/list";

export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play Music")
        .addSubcommand(subcommand => subcommand
            .setName("tracks")
            .setDescription(`Play youtube video or playlist`)
            .addStringOption(o => o.setName("source").setDescription("From which Source you want to play?").setRequired(true).setChoices(
                { name: "Youtube", value: "ytsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
                { name: "Youtube Music", value: "ytmsearch" }, // Requires plugin on lavalink: https://github.com/lavalink-devs/youtube-source
                { name: "Soundcloud", value: "scsearch" },
                //{ name: "Deezer", value: "dzsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                //{ name: "Spotify", value: "spsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                //{ name: "Apple Music", value: "amsearch" }, // Requires plugin on lavalink: https://github.com/topi314/LavaSrc
                { name: "Bandcamp", value: "bcsearch" }
            ))
            .addStringOption(o => o.setName("query").setDescription("What to play?").setAutocomplete(true).setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("list")
            .setDescription(`Play saved playlist`)
            .addStringOption(o => o.setName("listname").setDescription("Which to play?").setAutocomplete(true).setRequired(true))
        ),
    execute: {
        tracks: async ({ client, interaction }) => await PlayTrackSubcommand({ client, interaction }),
        list: async ({ client, interaction }) => await PlaylistSubcommand({ client, interaction })
    },

    autocomplete: {
        tracks: async ({ client, interaction }) => await PlayTrackSubcommandAutocomplete({ client, interaction }),
        list: async ({ client, interaction }) => await PlaylistSubcommandAutocomplete({ client, interaction })
    },
} as SubCommand;