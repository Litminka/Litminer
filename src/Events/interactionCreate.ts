
import BaseEmbeds from "../embeds/BaseEmbeds";
import BaseError from "../errors/BaseError";
import { Command, SubCommand, Event } from "../typings/Client";
import {
    ChatInputCommandInteraction, CommandInteractionOptionResolver, Events, Interaction
} from "discord.js";

export default {
    name: Events.InteractionCreate,
    execute: async (client, interaction: Interaction) => {
        if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
        const subCommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand(false);
        const command = client.commands.get(interaction.commandName);
        if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);
        
        try {
            if (interaction.isCommand()) {
                if (subCommand) {
                    if (typeof (command as SubCommand).execute[subCommand] !== "function") return console.error(`[Command-Error] Sub-Command is missing property "execute#${subCommand}".`);
                    // execute subcommand
                    return await (command as SubCommand).execute[subCommand]({ client, interaction: interaction as ChatInputCommandInteraction<"cached"> });
                }
                // execute command
                console.log(`[Interaction create] Executing ${interaction.commandName} function`);
                return await (command as Command).execute({ client, interaction: interaction as ChatInputCommandInteraction<"cached"> });
            }
            if (interaction.isAutocomplete()) {
                if (subCommand) {
                    if (typeof (command as SubCommand).autocomplete?.[subCommand] !== "function") return console.error(`[Command-Error] Sub-Command is missing property "autocomplete#${subCommand}".`);
                    // execute subcommand-autocomplete
                    return await (command as SubCommand).autocomplete?.[subCommand]({ client, interaction });
                }
                if (!(command as Command).autocomplete) return console.error(`[Command-Error] Command is missing property "autocomplete".`);
                // execute command-autocomplete
                console.log(`[Interaction create] Executing ${interaction.commandName}-autocomplete function`);
                return await (command as Command).autocomplete?.({ client, interaction });
            }
        } catch (error) {
            console.error(`[${error}] with message: ${error.message}`);
            if (interaction.isAutocomplete()) {
                console.log(`Error in autocomplete`);
                return;
            }
            if (interaction.replied || interaction.deferred) {
                return await interaction.followUp({ 
                    ephemeral: true,
                    //content: 'There was an error while executing this command!', 
                    embeds:[
                        BaseEmbeds.Error(error.message)
                    ]
                });
            } else {
                return await interaction.reply({ 
                    ephemeral: true,
                    //content: 'There was an error while executing this command!', 
                    embeds:[
                        BaseEmbeds.Error(error.message)
                    ]
                });
            }
        }
    }
} as Event;