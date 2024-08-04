import { Command } from "../../typings/Client";
import AudioService from "../../services/AudioService";
import { SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../utils/Time";
import MusicEmbeds from "../../embeds/MusicEmbeds";
import NotPlayingError from "../../errors/playerErrors/NotPlayingError";

export default {
    data: new SlashCommandBuilder()
        .setName("current")
        .setDescription("Current track")
        .setDescriptionLocalization("ru", "Текущий трек"),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })
        const player = client.lavalink.getPlayer(interaction.guildId);
        

        if (!player.queue.current) throw new NotPlayingError();
        const current = player.queue.current;
        const reply = await interaction.reply({
            //ephemeral: true,
            embeds: [
                MusicEmbeds.Current(player)
            ]
        });
        
        while (player.playing && current == player.queue.current){
            await reply.edit({
                embeds:[
                    MusicEmbeds.Current(player)
                ]
            })
        } 
    }
} as Command;