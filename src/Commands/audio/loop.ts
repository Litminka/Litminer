import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { Command } from "../../typings/client";
import { RepeatMode } from "lavalink-client/dist/types";
import AudioService from "../../services/AudioService";
import BaseEmbeds from "../../embeds/BaseEmbeds";
import NotPlayingError from "../../errors/player/NotPlayingError";

export default {
    data: new SlashCommandBuilder()
        .setName("loop").setDescription("Set the Repeat Mode")
        .addStringOption(o => o.setName("repeatmode").setDescription("What do you want to do?").setRequired(true).setChoices({ name: "Off", value: "off" }, { name: "Track", value: "track" }, { name: "Queue", value: "queue" })),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })

        const player = client.lavalink.getPlayer(interaction.guildId);
        if (!player.queue.current) throw new NotPlayingError();

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