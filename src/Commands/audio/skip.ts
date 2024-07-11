import { Command } from "../../typings/Client";
import AudioService from "../../Services/AudioService";
import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import BaseEmbeds from "../../Embeds/BaseEmbeds";

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
        const nextTrack = player.queue.tracks[0];
        
        if(!nextTrack)
            return interaction.reply({ 
                ephemeral: true,
                embeds: [
                    BaseEmbeds.Error(`No Tracks to skip to`)
                ] 
            });
        
        const needToSkip = (interaction.options as CommandInteractionOptionResolver).getInteger("skipto") || 0;
        await AudioService.skip(player, needToSkip);

        await interaction.reply({
            ephemeral: true,
            embeds: [
                BaseEmbeds.Success(`${current ? 
                    `Skipped [\`${current?.info.title}\`](<${current?.info.uri}>) -> [\`${nextTrack?.info.title}\`](<${nextTrack?.info.uri}>)` :
                    `Skipped to [\`${nextTrack?.info.title}\`](<${nextTrack?.info.uri}>)`}`)
            ] 
        });
    }
} as Command;