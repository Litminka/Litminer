import { Command } from "../../typings/client";
import AudioService from "../../services/AudioService";
import MusicEmbeds from "../../embeds/MusicEmbeds";
import NotPlayingError from "../../errors/player/NotPlayingError";
import CurrentTrackEmbed from "../../embeds/interactable/CurrentTrackEmbed";
import { SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("current")
        .setDescription("Current track")
        .setDescriptionLocalization("ru", "Текущий трек"),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })
        const player = client.lavalink.getPlayer(interaction.guildId);
        const current = player.queue.current;
        if (!current) throw new NotPlayingError();

        const currentTrackEmbed = new CurrentTrackEmbed({
            userId: interaction.user.id,
            object: player
        }, MusicEmbeds.Current);

        await currentTrackEmbed.initialize();
        const message = currentTrackEmbed.renderMessage();
        const response = await interaction.reply({
            ephemeral: true,
            ...message
        })
        currentTrackEmbed.createResponseCollector(response);
    }
} as Command;
