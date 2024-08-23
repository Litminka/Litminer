
import BaseEmbeds from "../embeds/baseEmbeds";
import { Command, SubCommand, Event } from "../typings/client";
import {
    ChatInputCommandInteraction, CommandInteractionOptionResolver, Events, Interaction
} from "discord.js";
import { LitminerDebug } from "../utils/litminerDebug";

export default {
    name: Events.InteractionCreate,
    execute: async (client, interaction: Interaction) => {
        if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
        const subCommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand(false);
        const command = client.commands.get(interaction.commandName);
        if (!command) return LitminerDebug.Error(`No command matching ${interaction.commandName} was found.`);
        
        try {
            if (interaction.isCommand()) {
                LitminerDebug.Debug(`Executing ${interaction.commandName} command`);
                if (subCommand) {
                    if (typeof (command as SubCommand).execute[subCommand] !== "function") 
                        return LitminerDebug.Error(`Sub-Command is missing property "execute#${subCommand}".`);
                    LitminerDebug.Debug(`Executing ${subCommand} sub-command`);
                    return await (command as SubCommand).execute[subCommand]({ client, interaction: interaction as ChatInputCommandInteraction<"cached"> });
                }
                // execute command
                return await (command as Command).execute({ client, interaction: interaction as ChatInputCommandInteraction<"cached"> });
            }
            if (interaction.isAutocomplete()) {
                LitminerDebug.Debug(`Executing ${interaction.commandName}-autocomplete command`);
                if (subCommand) {
                    if (typeof (command as SubCommand).autocomplete?.[subCommand] !== "function") 
                        return LitminerDebug.Error(`Sub-Command is missing property "autocomplete#${subCommand}".`);
                    LitminerDebug.Debug(`Executing ${subCommand}-autocomplete sub-command`);
                    return await (command as SubCommand).autocomplete?.[subCommand]({ client, interaction });
                }
                if (!(command as Command).autocomplete) return LitminerDebug.Error(`Command is missing property "autocomplete".`);
                return await (command as Command).autocomplete?.({ client, interaction });
            }
        } catch (error) {
            LitminerDebug.Error(error.stack);
            if (interaction.isAutocomplete()) {
                LitminerDebug.Error(`Error in autocomplete`);
                return;
            }
            if (interaction.replied || interaction.deferred) {
                return await interaction.followUp({ 
                    ephemeral: true,
                    embeds:[
                        BaseEmbeds.Error(error.message)
                    ]
                });
            } else {
                return await interaction.reply({ 
                    ephemeral: true,
                    embeds:[
                        BaseEmbeds.Error(error.message)
                    ]
                });
            }
        }
    }
} as Event;