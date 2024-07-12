import { Command } from "../../typings/Client";
import AudioService from "../../Services/AudioService";
import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import BaseEmbeds from "../../Embeds/BaseEmbeds";
import MusicEmbeds from "../../Embeds/MusicEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skip music")
        .setDescriptionLocalization("ru", "Пропустить")
        .addIntegerOption(o => o.setName("skipto").setDescription("to which song to skip to?").setRequired(false)),
    execute: async( { client, interaction } ) => {
        if (!(await AudioService.validateConnection({client, interaction}))) return;
        const player = client.lavalink.getPlayer(interaction.guildId);
        
        const current = player.queue.current;
        let nextTrack = player.queue.tracks[0];
        
        if(!nextTrack)
            return interaction.reply({ 
                ephemeral: true,
                embeds: [
                    BaseEmbeds.Error(`No Tracks to skip to`)
                ] 
            });
        
        const needToSkip = (interaction.options as CommandInteractionOptionResolver).getInteger("skipto") || 0;
        await AudioService.skip(player, needToSkip);

        nextTrack = player.queue.current;
        
        await interaction.reply({
            ephemeral: true,
            embeds: [
                MusicEmbeds.TrackSkipped(current, nextTrack),
            ] 
        });
    }
} as Command;