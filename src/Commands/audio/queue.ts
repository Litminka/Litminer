import { Command } from "../../typings/Client";
import AudioService from "../../services/AudioService";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    SlashCommandBuilder,
} from "discord.js";
import { formatMS_HHMMSS } from "../../utils/Time";
import BaseEmbeds, { EmbedQueue } from "../../embeds/BaseEmbeds";
import MusicEmbeds from "../../embeds/MusicEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Get queue")
        .setDescriptionLocalizations({
            ru: "Текущая очередь",
        }),
    execute: async ({ client, interaction }) => {
        if (!(await AudioService.validateConnection({ client, interaction })))
            return;

        const player = client.lavalink.getPlayer(interaction.guildId);
        if (!player.queue)
            return interaction.reply({
                ephemeral: true,
                embeds: [BaseEmbeds.Error(`Queue is empty`)],
            });

        const prev = new ButtonBuilder()
            .setCustomId("previous")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(`⬅️`)
            .setLabel("Previous")
            .setDisabled(true);

        const next = new ButtonBuilder()
            .setCustomId("next")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Next")
            .setEmoji(`➡️`);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prev, next);
    
        const trackQueue = new EmbedQueue(player.queue);

        const response = await interaction.reply({
            embeds: [MusicEmbeds.PrintQueue(trackQueue)],
            components: [row],
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 600000,
        });

        collector.on("collect", async (button) => {
            button.deferUpdate();
            const selection = button.customId;
            console.log(`${selection} pressed`);

            const shifts = {
                previous: -5,
                next: 5,
            }
            
            const shift: number = shifts[selection];
            trackQueue.ShiftBy(shift);
            const [prevButton, nextButton] = row.components;

            nextButton.setDisabled(false);
            prevButton.setDisabled(false);

            if (trackQueue.currentIndex < 5){
                prevButton.setDisabled(true);
            }

            if (trackQueue.currentIndex > trackQueue.tracks.length - 5) {
                nextButton.setDisabled(true);
            }

            if (trackQueue.tracks.length < 5) {
                nextButton.setDisabled(true);
                prevButton.setDisabled(true);
            }

            return await response.edit({
                embeds: [MusicEmbeds.PrintQueue(trackQueue)],
                components: [row]
            });
        });

        collector.on("end", (async) => {
            row.components.forEach((button) => {
                button.setDisabled(true);
            });
            response.edit({
                components: [row],
            });
        });
    },
} as Command;
