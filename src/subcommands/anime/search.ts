import { ExecuteOptions } from "../../typings/client";
import LitminkaEmbeds from "../../embeds/litminkaEmbeds";
import { CommandInteractionOptionResolver } from "discord.js";
import { APIRequestService } from "../../services/apiRequestService";
import AnimeSearchEmbed from "../../embeds/paginated/animeSearchEmbed";

export async function AnimeSearchSubcommand({ client, interaction }: ExecuteOptions) {
    const name = (interaction.options as CommandInteractionOptionResolver).getString("name") as string;

    const paginatedEmbed = new AnimeSearchEmbed({
        userId: interaction.user.id
    }, APIRequestService.SearchAnime, LitminkaEmbeds.ShowAnimeSearch, name);

    await paginatedEmbed.initialize();
    const message = paginatedEmbed.renderMessage();
    const response = await interaction.reply({
        ephemeral: true,
        ...message
    })

    paginatedEmbed.createResponseCollector(response);
}