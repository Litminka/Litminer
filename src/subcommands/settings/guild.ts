import { ExecuteOptions } from "../../typings/Client";
import { Guild } from "@prisma/client";
import prisma from "../../db";
import LitminkaEmbeds from "../../embeds/LitminkaEmbeds";
import { LitminerDebug } from "../../utils/LitminerDebug";
import BaseButtons from "../../embeds/buttons/BaseButons";
import { ActionRowBuilder, ButtonBuilder, ChannelSelectMenuBuilder, ChannelType, ComponentType, GatewayIntentBits, PermissionsBitField } from "discord.js";
import { api } from "../../axios";
import BaseError from "../../errors/BaseError";
import NoPermissionError from "../../errors/interactionErrors/NoPermissionError";

export async function SettingsGuildSubcommand({client, interaction}: ExecuteOptions) {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageGuild)) throw new NoPermissionError();
    const guildSettings = await prisma.guild.getSettings(interaction.guildId) as Guild;

    const notify = BaseButtons.SecondaryButton(
        `notify`,
        guildSettings.isNotifiable ? `Не уведомлять о сериях` : `Уведомлять о сериях`,
        `🔔`);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(notify);

    const channelsDropDown = new ChannelSelectMenuBuilder()
        .setCustomId(`channel`)
        .setChannelTypes(ChannelType.GuildText);

    if (guildSettings.notifyChannelId)
        channelsDropDown.setDefaultChannels(guildSettings.notifyChannelId);

    const channelsRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelsDropDown);

    const response = await interaction.reply({
        ephemeral: true,
        embeds: [
            await LitminkaEmbeds.GuildProfile(guildSettings)
        ],
        components: [channelsRow, row]
    })

    const channelCollector = response.createMessageComponentCollector({
        componentType: ComponentType.ChannelSelect,
        time: 600000,
    });

    channelCollector.on("collect", async (interaction) => {
        interaction.deferUpdate();
        const selection = interaction.customId;
        const notifyChannelId = interaction.values.at(0);
        LitminerDebug.Debug(`${selection} changed - ${notifyChannelId} selected`);
        
        const commands = {
            "channel": async () => {
                guildSettings.notifyChannelId = notifyChannelId;
                await prisma.guild.updateSettings(guildSettings);
            }
        }

        await commands[selection]();

        return await response.edit({
            embeds: [await LitminkaEmbeds.GuildProfile(guildSettings)],
            components: [channelsRow, row]
        });
    });

    channelCollector.on("end", async () => {
        channelsRow.components.forEach((channel) => {
            channel.setDisabled(true);
        });
        await response.edit({
            components: [channelsRow, row],
        });
    });

    const buttonCollector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 600000,
    });

    buttonCollector.on("collect", async (button) => {
        button.deferUpdate();
        const selection = button.customId;
        LitminerDebug.Debug(`${selection} pressed`);
        const [notify_component] = row.components;

        const commands = {
            "notify": async () => {
                guildSettings.isNotifiable = !guildSettings.isNotifiable;
                await prisma.guild.updateSettings(guildSettings);
                // await api.patch(`users/settings`, {
                //     notifyDiscord: guildSettings.isNotifiable
                // })
                notify_component.setLabel(guildSettings.isNotifiable ? `Не уведомлять о сериях` : `Уведомлять о сериях`);
            }
        }

        await commands[selection]();

        return await response.edit({
            embeds: [await LitminkaEmbeds.GuildProfile(guildSettings)],
            components: [channelsRow, row]
        });
    });

    buttonCollector.on("end", async () => {
        row.components.forEach((button) => {
            button.setDisabled(true);
        });
        await response.edit({
            components: [channelsRow, row],
        });
    });
}