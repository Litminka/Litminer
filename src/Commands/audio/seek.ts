import { CommandInteractionOptionResolver, GuildMember, SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../Utils/Time";
import { Command } from "../../typings/Client";
import AudioService, { SeekOptions } from "../../Services/AudioService";

export default {
    data: new SlashCommandBuilder()
        .setName("seek").setDescription("Seek the position within the current Track")
        .addIntegerOption(o => o.setName("rewind").setDescription("Skip specified number of seconds"))
        .addIntegerOption(o => o.setName("position").setDescription("To what position (seconds) to seek to?")),
    execute: async ( {client, interaction} ) => {
        if (!(await AudioService.validateConnection({client, interaction}))) return;
        const player = client.lavalink.getPlayer(interaction.guildId);
        
        if(!player.queue.current) return interaction.reply({ ephemeral: true, content: "I'm not playing anything" });
        const rewind = (interaction.options as CommandInteractionOptionResolver).getInteger("rewind")
        const position = (interaction.options as CommandInteractionOptionResolver).getInteger("position");

        await AudioService.seek(player, {rewind, position} as SeekOptions);
        await interaction.reply({
            content: `${interaction.member.user} seeked to: \`${formatMS_HHMMSS(player.position)}\``
        });
    }
} as Command;