import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../typings/client";
import ClientEmbeds from "../../embeds/clientEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("About bot")
        .setDescriptionLocalization("ru", "Информация о боте"),

    execute: async( { client, interaction }) => {
        interaction.reply({
            embeds: [
                ClientEmbeds.About(client)
            ],
        });
    }
} as Command;