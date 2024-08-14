import { Command } from "../../typings/Client";
import { ActionRowBuilder, AnyComponentBuilder, APISelectMenuOption, ButtonBuilder, ComponentType, Emoji, MessageComponentBuilder, SelectMenuComponentOptionData, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputComponent } from "discord.js";
import LitminkaEmbeds from "../../embeds/LitminkaEmbeds";
import { WatchListWithAnime } from "../../typings/Anime";
import { LitminerDebug } from "../../utils/LitminerDebug";
import BaseButtons from "../../embeds/buttons/BaseButons";
import { LitminkaAPIRequests } from "../../LitminkaAPI/requests";

export default {
    data: new SlashCommandBuilder()
        .setName("watchlist")
        .setDescription(`Get watchlist`),
    execute: async ({ client, interaction }) => {
        let page = 1;
        const pageLimit = 10;

        const watchlist = await LitminkaAPIRequests.GetUserWatchlist(interaction.user.id, page, pageLimit);
        const list = watchlist.list as WatchListWithAnime[];
        const listCount = watchlist.count as number;

        const maxPage = Math.ceil(listCount / pageLimit);
        const start = BaseButtons.PrimaryButton(`start`, null, `⏮️`).setDisabled(true);
        const prev = BaseButtons.PrimaryButton(`prev`, null, `⬅️`).setDisabled(true);
        const pageView = BaseButtons.SecondaryButton(`page`, `${page} / ${maxPage}`, null).setDisabled(true);
        const next = BaseButtons.PrimaryButton(`next`, null, `➡️`);
        const end = BaseButtons.PrimaryButton(`end`, null, `⏭️`);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(start, prev, pageView, next, end);

        const response = await interaction.reply({
            ephemeral: true,
            embeds: LitminkaEmbeds.ShowWatchlist(list, page, pageLimit),
            components: [row],

        })

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 600000,
        });

        collector.on("collect", async (button) => {
            button.deferUpdate();
            const selection = button.customId;
            LitminerDebug.Debug(`${selection} pressed`);
            const [start_component, prev_component, pageview_component, next_component, end_component] = row.components;

            const commands = {
                "start": () => page = 1,
                "prev": () => page--,
                "next": () => page++,
                "end": () => page = maxPage,
            }

            commands[selection]();

            pageview_component.setLabel(`${page} / ${maxPage}`);
            start_component.setDisabled(false);
            prev_component.setDisabled(false);
            next_component.setDisabled(false);
            end_component.setDisabled(false);

            if (page <= 1) {
                start_component.setDisabled(true);
                prev_component.setDisabled(true);
            }

            if (page * pageLimit >= listCount) {
                next_component.setDisabled(true);
                end_component.setDisabled(true);
            }

            const watchlist = await LitminkaAPIRequests.GetUserWatchlist(interaction.user.id, page, pageLimit);
            const list = watchlist.list as WatchListWithAnime[];

            return await response.edit({
                embeds: LitminkaEmbeds.ShowWatchlist(list, page, pageLimit),
                components: [row]
            });
        });

        collector.on("end", async () => {
            row.components.forEach((button) => {
                button.setDisabled(true);
            });
            await response.edit({
                components: [row],
            });
        });
    }
} as Command;