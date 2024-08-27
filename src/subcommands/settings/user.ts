import LitminkaEmbeds from "../../embeds/LitminkaEmbeds";
import { ExecuteOptions } from "../../typings/client";
import { LitminerDebug } from "../../utils/LitminerDebug";
import BaseButtons from "../../embeds/buttons/BaseButtons";
import { ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { APIRequestService } from "../../services/APIRequestService";
import { Settings } from "../../typings/anime";
import BaseEmbeds from "../../embeds/BaseEmbeds";

export async function SettingsUserSubcommand({ client, interaction }: ExecuteOptions) {
    const userLitminkaProfile = await APIRequestService.GetUser(interaction.user.id);
    const userSettings = userLitminkaProfile.settings as Settings;

    const notify = BaseButtons.SecondaryButton(
        `notify`,
        userSettings.notifyDiscord ? `Не уведомлять о сериях` : `Уведомлять о сериях`,
        `🔔`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(notify);

    const response = await interaction.reply({
        ephemeral: true,
        embeds: [
            await LitminkaEmbeds.UserProfile(userLitminkaProfile)
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
        const [notify_component] = row.components;

        try {
            const commands = {
                "notify": async () => {
                    userSettings.notifyDiscord = !userSettings.notifyDiscord;
                    await APIRequestService.UpdateUserSettings(interaction.user.id, {
                        notifyDiscord: userSettings.notifyDiscord
                    } as Settings);
                    notify_component.setLabel(userSettings.notifyDiscord ? `Не уведомлять о сериях` : `Уведомлять о сериях`);
                }
            }

            await commands[selection]();

            return await response.edit({
                embeds: [await LitminkaEmbeds.UserProfile(await APIRequestService.GetUser(interaction.user.id))],
                components: [row]
            });
        } catch (error) {
            LitminerDebug.Error(error.stack);
            return await response.edit({
                embeds: [BaseEmbeds.Error(error.message)],
                components: []
            })
        }
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