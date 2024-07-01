
import { GuildMember, SlashCommandBuilder } from "discord.js";
import { Command } from "../../typings/Client";
import AudioService from "../../Services/AudioService";

export default {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop music")
        .setDescriptionLocalization("ru", "Выключить музыку"),

    execute: async( { client, interaction } ) => {
        if (!(await AudioService.validateConnection({client, interaction}))) return;
        const player = client.lavalink.getPlayer(interaction.guildId);
        
        // example to apply a filter!
        await AudioService.stop(player, `${interaction.user.username} stopped the Player`);

        // and it is good again!
        interaction.reply({ content: "Stopped the player" });
    }
} as Command;