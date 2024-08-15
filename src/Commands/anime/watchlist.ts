import { Command } from "../../typings/Client";
import { SlashCommandBuilder } from "discord.js";
import { LitminkaAPIRequests } from "../../litminka-api/requests";
import LitminkaEmbeds from "../../embeds/LitminkaEmbeds";
import WatchlistEmbed from "../../embeds/paginated/watchlistEmbed";

export default {
    data: new SlashCommandBuilder()
        .setName("watchlist")
        .setDescription(`Get watchlist`),
    execute: async ({ interaction }) => {

        const paginatedEmbed = new WatchlistEmbed({
            userId: interaction.user.id
        }, LitminkaAPIRequests.GetUserWatchlist, LitminkaEmbeds.ShowWatchlist);

        await paginatedEmbed.initialize();
        const message = paginatedEmbed.renderMessage();
        console.log(message);
        const response = await interaction.reply({
            ephemeral: true,
            ...message
        })

        paginatedEmbed.createResponseCollector(response);
    }
} as Command;