import { Command } from "../../typings/Client";
import { SlashCommandBuilder } from "discord.js";
import { api } from "../../axios";
import LitminkaEmbeds from "../../embeds/LitminkaEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("profile").setDescription("Get litminka profile"),
    execute: async ({ client, interaction }) => {
        const user = (await api.get("users/profile")).data;

        //console.log(user);

        await interaction.reply({
            ephemeral: true,
            embeds: [LitminkaEmbeds.UserProfile(user)]
        })
    }
} as Command;