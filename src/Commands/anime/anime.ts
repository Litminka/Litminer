import { SubCommand } from "../../typings/client";
import { SlashCommandBuilder } from "discord.js";
import { AnimeSearchSubcommand } from "../../subcommands/anime/search";

export default {
    data: new SlashCommandBuilder()
        .setName("anime")
        .setDescription(`Anime functions`)
        .addSubcommand(subcommand => subcommand.setName("search")
            .setDescription(`Search for anime`)
            .addStringOption(option => option.setName("name")
                .setDescription("What anime to look for?")
                .setDescriptionLocalizations({
                    ru: `Введите название искомого аниме`
                })
                .setRequired(true)
            )
        ),
    execute: {
        search: async ({ client, interaction }) => await AnimeSearchSubcommand({ client, interaction })
    }
} as SubCommand;