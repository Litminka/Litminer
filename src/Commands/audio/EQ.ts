import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";

import { Command } from "../../typings/Client";
import AudioService, { EQ } from "../../services/AudioService";
import BaseEmbeds from "../../embeds/BaseEmbeds";

export default { 
    data: new SlashCommandBuilder()
        .setName("equalizers")
        .setDescription("Apply a specific Equalizer")
        .addStringOption(o => o.setName("equalizer").setDescription("Which Equalizer to apply?").setRequired(true).addChoices(
            { name: "Clear Equalizers", value: "Clear" },
            { name: "Bassboost (Earrape)", value: "Earrape Bassboost" },
            { name: "Bassboost (High)", value: "High Bassboost" },
            { name: "Bassboost (Medium)", value: "Medium Bassboost" },
            { name: "Bassboost (Low)", value: "Low Bassboost" },
            { name: "Better Music", value: "Better Music" }, // available in lavalink-filters lavalink-plugin
            { name: "Rock", value: "Rock" },
            { name: "Classic", value: "Classic" },
            { name: "Electronic", value: "Electronic"},
            { name: "Gaming", value: "Gaming"},
            { name: "Pop", value: "Pop"},
            { name: "Full sound", value: "Full sound"}
        )),
    execute: async ({client, interaction}) => {
        if (!(await AudioService.validateConnection({client, interaction}))) return;
        
        const player = client.lavalink.getPlayer(interaction.guildId);
        const eqOption = (interaction.options as CommandInteractionOptionResolver).getString("equalizer");

        let response = `Applied the ${eqOption} Equalizer`; 
        
        await AudioService.setEQ(player, EQ[eqOption]);
        
        await interaction.reply({
            embeds: [
                BaseEmbeds.Success(response)
            ]
        })
    }

} as Command;