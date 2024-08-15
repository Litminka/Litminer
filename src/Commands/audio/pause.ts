import { Command } from "../../typings/client";
import AudioService from "../../services/audioService";
import { SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../utils/time";
import MusicEmbeds from "../../embeds/musicEmbeds";
import NotPlayingError from "../../errors/playerErrors/notPlayingError";

export default {
    data: new SlashCommandBuilder()
        .setName("pause").setDescription("Pause track"),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })
        const player = client.lavalink.getPlayer(interaction.guildId);

        if (!player.queue.current) throw new NotPlayingError();

        await AudioService.pause(player);

        await interaction.reply({
            embeds: [
                MusicEmbeds.TrackPaused(player.queue.current, formatMS_HHMMSS(player.position))
            ]
        });
    }
} as Command;