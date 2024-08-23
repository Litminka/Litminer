import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { formatMS_HHMMSS } from "../../utils/time";
import { Command } from "../../typings/client";
import AudioService, { SeekOptions } from "../../services/AudioService";
import BaseEmbeds from "../../embeds/BaseEmbeds";
import NotPlayingError from "../../errors/player/NotPlayingError";

export default {
    data: new SlashCommandBuilder()
        .setName("seek").setDescription("Seek the position within the current Track")
        .addIntegerOption(o => o.setName("rewind").setDescription("Skip specified number of seconds"))
        .addIntegerOption(o => o.setName("position").setDescription("To what position (seconds) to seek to?")),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })
        const player = client.lavalink.getPlayer(interaction.guildId);

        if (!player.queue.current) throw new NotPlayingError();
        const rewind = (interaction.options as CommandInteractionOptionResolver).getInteger("rewind")
        const position = (interaction.options as CommandInteractionOptionResolver).getInteger("position");

        await AudioService.seek(player, { rewind, position } as SeekOptions);
        await interaction.reply({
            embeds: [
                BaseEmbeds.Success(`\`${interaction.member.user.displayName}\` seeked to: \`${formatMS_HHMMSS(player.position)}\``)
            ]
        });
    }
} as Command;