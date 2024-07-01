import { Command } from "../../typings/Client";
import AudioService from "../../Services/AudioService";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../Utils/Time";

export default {
    data: new SlashCommandBuilder()
        .setName("resume").setDescription("Resume track"),
    execute: async ( {client, interaction} ) => {
        if (!(await AudioService.validateConnection({client, interaction}))) return;

        const player = client.lavalink.getPlayer(interaction.guildId);
        if(!player.queue.current) return interaction.reply({ ephemeral: true, content: "I'm not playing anything" });
        
        await AudioService.resume(player);

        await interaction.reply({
            content: `Track resumed from ${formatMS_HHMMSS(player.position)}`
        });
    }
} as Command;