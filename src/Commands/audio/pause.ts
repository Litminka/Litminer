import { Command } from "../../typings/Client";
import AudioService from "../../Services/AudioService";
import { SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../Utils/Time";
import BaseEmbeds from "../../Embeds/BaseEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("pause").setDescription("Pause track"),
    execute: async ( {client, interaction} ) => {
        if (!(await AudioService.validateConnection({client, interaction}))) return;
        const player = client.lavalink.getPlayer(interaction.guildId);
        
        if(!player.queue.current) 
            return interaction.reply({ 
                ephemeral: true,
                embeds: [
                    BaseEmbeds.Error(`I'm not playing anything`)
                ] 
            });
        
        await AudioService.pause(player);

        await interaction.reply({
            embeds: [
                BaseEmbeds.Info(`Paused at: \`${formatMS_HHMMSS(player.position)}\``)
            ] 
        });
    }
} as Command;