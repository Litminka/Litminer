import { VoiceConnectionConnectingState, getVoiceConnection } from "@discordjs/voice";
import { Command } from "../../Structures/Command";
import AudioService from "../../Services/AudioService";

export default new Command({
    name: "skip",
    description: "Skip music",
    descriptionLocalizations: {
        ru: "Пропустить"
    },
    run: async( {interaction} ) => {
        const connection = getVoiceConnection(interaction.guildId);
        const player = (<VoiceConnectionConnectingState>connection.state).subscription.player;
        
        const success = await AudioService.playSong(interaction.guildId, player);
        if (!success){
            interaction.followUp({
                content: "Nothing to skip",
            });
            return;
        }
        interaction.followUp({
            content: "Audio stopped successful",
        });
    }
});
