import { Command } from "../../typings/client";
import AudioService from "../../services/AudioService";
import { SlashCommandBuilder } from "discord.js";
import MusicEmbeds, { EmbedQueue } from "../../embeds/MusicEmbeds";
import QueueEmptyError from "../../errors/queue/QueueEmptyError";
import PaginatedEmbed from "../../embeds/paginated/PaginatedEmbed";

export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Get queue")
        .setDescriptionLocalizations({
            ru: "Текущая очередь",
        }),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })

        const player = client.lavalink.getPlayer(interaction.guildId);
        const trackQueue = new EmbedQueue(player.queue);
        if (!trackQueue.tracks[0].track) throw new QueueEmptyError();

        const paginatedEmbed = new PaginatedEmbed({
            userId: interaction.user.id
        }, trackQueue.GetTracks.bind(trackQueue), MusicEmbeds.ShowMusicQueue);
        await paginatedEmbed.initialize();

        const message = paginatedEmbed.renderMessage();
        const response = await interaction.reply({
            ephemeral: true,
            ...message
        })

        paginatedEmbed.createResponseCollector(response);
    },
} as Command;
