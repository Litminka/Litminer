import { Command } from "../../typings/client";
import AudioService from "../../services/AudioService";
import { SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../utils/time";
import BaseEmbeds from "../../embeds/BaseEmbeds";
import NotPlayingError from "../../errors/player/NotPlayingError";

export default {
    data: new SlashCommandBuilder()
        .setName("resume").setDescription("Resume track"),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })

        const player = client.lavalink.getPlayer(interaction.guildId);
        if (!player.queue.current) throw new NotPlayingError();

        await AudioService.resume(player);

        await interaction.reply({
            embeds: [
                BaseEmbeds.Success(`Track resumed from ${formatMS_HHMMSS(player.position)}`)
            ]
        });
    }
} as Command;