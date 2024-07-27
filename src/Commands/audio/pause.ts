import { Command } from "../../typings/Client";
import AudioService from "../../services/AudioService";
import { SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../utils/Time";
import BaseEmbeds from "../../embeds/BaseEmbeds";
import MusicEmbeds from "../../embeds/MusicEmbeds";

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
                MusicEmbeds.TrackPaused(player.queue.current, formatMS_HHMMSS(player.position))
            ] 
        });
    }
} as Command;