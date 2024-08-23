import { User } from "@prisma/client";
import prisma from "../../db";
import LitminkaEmbeds from "../../embeds/litminkaEmbeds";
import { ExecuteOptions } from "../../typings/client";
import { LitminerDebug } from "../../utils/litminerDebug";
import BaseButtons from "../../embeds/buttons/baseButtons";
import { ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { api } from "../../axios";

export async function SettingsUserSubcommand({ client, interaction }: ExecuteOptions) {
    const userSettings = await prisma.user.getSettings(interaction.user.id) as User;

    const notify = BaseButtons.SecondaryButton(
        `notify`,
        userSettings.isNotifiable ? `Не уведомлять о сериях` : `Уведомлять о сериях`,
        `🔔`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(notify);

    const response = await interaction.reply({
        ephemeral: true,
        embeds: [
            await LitminkaEmbeds.UserProfile(userSettings)
        ],
        components: [row]
    })

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 600000,
    });

    collector.on("collect", async (button) => {
        button.deferUpdate();
        const selection = button.customId;
        LitminerDebug.Debug(`${selection} pressed`);
        const [notify_component] = row.components;

        const commands = {
            "notify": async () => {
                userSettings.isNotifiable = !userSettings.isNotifiable;
                await prisma.user.updateSettings(userSettings);
                await api.patch(`users/settings`, {
                    userId: userSettings.litminkaId,
                    notifyDiscord: userSettings.isNotifiable
                })
                notify_component.setLabel(userSettings.isNotifiable ? `Не уведомлять о сериях` : `Уведомлять о сериях`);
            }
        }

        await commands[selection]();

        return await response.edit({
            embeds: [await LitminkaEmbeds.UserProfile(userSettings)],
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