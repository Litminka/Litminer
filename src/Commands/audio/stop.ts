import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../typings/Client";
import AudioService from "../../services/AudioService";
import BaseEmbeds from "../../embeds/BaseEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop music")
        .setDescriptionLocalization("ru", "Выключить музыку"),

    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })
        const player = client.lavalink.getPlayer(interaction.guildId);

        await AudioService.stop(player);

        await interaction.reply({
            embeds: [
                BaseEmbeds.Success(`Stopped the player`)
            ]
        });
    }
} as Command;