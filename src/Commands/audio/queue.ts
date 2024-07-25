import { Command } from "../../typings/Client";
import AudioService from "../../Services/AudioService";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    SlashCommandBuilder,
} from "discord.js";
import { formatMS_HHMMSS } from "../../Utils/Time";
import BaseEmbeds, { EmbedQueue } from "../../Embeds/BaseEmbeds";
import MusicEmbeds from "../../Embeds/MusicEmbeds";

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
            .setLabel("Previous");

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
            time: 3600000,
        });

        collector.on("collect", async (button) => {
            button.deferUpdate();
            const selection = button.customId;
            console.log(`${selection} pressed`);
            switch (selection) {
                case "previous": {
                    console.log(`shifting backwards`);
                    trackQueue.ShiftBy(-5);
                    if (trackQueue.currentIndex < 5)
                        row.components.forEach(button => {
                            if (button.data.label == `Previous`)
                                button.setDisabled(true);
                            else
                                button.setDisabled(false);
                        })
                    else
                        row.components.forEach(button => {
                            button.setDisabled(false);
                        })
                    return await response.edit({
                        embeds: [MusicEmbeds.PrintQueue(trackQueue)],
                        components: [row]
                    });
                }
                case "next": {
                    console.log(`shifting forward`);
                    trackQueue.ShiftBy(5);
                    if (trackQueue.currentIndex > trackQueue.tracks.length - 5)
                        row.components.forEach(button => {
                            if (button.data.label == `Next`)
                                button.setDisabled(true);
                            else
                                button.setDisabled(false);
                        })
                    else
                        row.components.forEach(button => {
                            button.setDisabled(false);
                        })
                    return await response.edit({
                        embeds: [MusicEmbeds.PrintQueue(trackQueue)],
                        components: [row]
                    });
                }
            }
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
