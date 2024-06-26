import { Command } from "../../Structures/Command";
import AudioService from "../../Services/AudioService";

export default new Command({
    name: "stop",
    description: "Stop music",
    descriptionLocalizations: {
        ru: "Выключить музыку"
    },
    run: async( {interaction} ) => {
        
        AudioService.stop(interaction.guildId);
        
        interaction.followUp({
            content: "Audio stopped successful",
        });
    }
});
