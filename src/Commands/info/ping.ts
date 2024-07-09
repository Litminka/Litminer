import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../typings/Client";

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("reply with pong")
        .setDescriptionLocalization("ru", "Ответить Pong"),

    execute: async( { client, interaction }) => {
        interaction.reply({
            content: "Pong!",
        });
    }
} as Command;