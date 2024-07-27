
import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../typings/Client";
import AudioService from "../../services/AudioService";
import BaseEmbeds from "../../embeds/BaseEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop music")
        .setDescriptionLocalization("ru", "Выключить музыку"),

    execute: async( { client, interaction } ) => {
        if (!(await AudioService.validateConnection({client, interaction}))) return;
        const player = client.lavalink.getPlayer(interaction.guildId);
        
        // example to apply a filter!
        await AudioService.stop(player);

        // and it is good again!
        await interaction.reply({ 
            embeds: [
                BaseEmbeds.Success(`Stopped the player`)
            ] 
        });
    }
} as Command;