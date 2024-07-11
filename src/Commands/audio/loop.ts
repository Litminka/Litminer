import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { Command } from "../../typings/Client";
import { RepeatMode } from "lavalink-client/dist/types";
import AudioService from "../../Services/AudioService";
import BaseEmbeds from "../../Embeds/BaseEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("loop").setDescription("Set the Repeat Mode")
        .addStringOption(o => o.setName("repeatmode").setDescription("What do you want to do?").setRequired(true).setChoices({ name: "Off", value: "off"}, { name: "Track", value: "track"}, { name: "Queue", value: "queue"})),
    execute: async ( { client, interaction } ) => {
        if (!(await AudioService.validateConnection({client, interaction}))) return;
        const player = client.lavalink.getPlayer(interaction.guildId);
        if(!player.queue.current) 
            return interaction.reply({ 
                ephemeral: true,
                embeds: [
                    BaseEmbeds.Error(`I'm not playing anything`)
                ] 
            });
        const mode = (interaction.options as CommandInteractionOptionResolver).getString("repeatmode") as RepeatMode;

        await AudioService.setRepeatMode(player, mode);

        await interaction.reply({
            ephemeral: true, 
            embeds: [
                BaseEmbeds.Success(`Set repeat mode to ${player.repeatMode}`)
            ]
        });
    }
} as Command;