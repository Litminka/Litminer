import { Command } from "../../typings/client";
import { SlashCommandBuilder } from "discord.js";
import LitminkaEmbeds from "../../embeds/litminkaEmbeds";
import WatchlistEmbed from "../../embeds/paginated/watchlistEmbed";
import { APIRequestService } from "../../services/apiRequestService";

export default {
    data: new SlashCommandBuilder()
        .setName("watchlist")
        .setDescription(`Get watchlist`),
    execute: async ({ interaction }) => {

        const paginatedEmbed = new WatchlistEmbed({
            userId: interaction.user.id
        }, APIRequestService.GetUserWatchlist, LitminkaEmbeds.ShowWatchlist);

        await paginatedEmbed.initialize();
        const message = paginatedEmbed.renderMessage();
        const response = await interaction.reply({
            ephemeral: true,
            ...message
        })

        paginatedEmbed.createResponseCollector(response);
    }
} as Command;