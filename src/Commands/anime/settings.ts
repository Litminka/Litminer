import { SubCommand } from "../../typings/Client";
import { SlashCommandBuilder } from "discord.js";
import { SettingsUserSubcommand } from "../../subcommands/settings/user";
import { SettingsGuildSubcommand } from "../../subcommands/settings/guild";

export default {
    data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription(`Change settings`)
        .addSubcommand(subcommand => subcommand.setName("user").setDescription(`Internal user settings`))
        .addSubcommand(subcommand => subcommand.setName("guild").setDescription(`Internal guild settings`)),
    execute: {
        user: async ({ client, interaction }) => SettingsUserSubcommand({client, interaction}),
        guild: async ({ client, interaction }) => SettingsGuildSubcommand({client, interaction})
    }
} as SubCommand;