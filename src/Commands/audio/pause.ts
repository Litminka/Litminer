import { Command } from "../../Structures/Command";
import AudioService from "../../Services/AudioService";

export default new Command({
    name: "pause",
    description: "Pause audio",
    descriptionLocalizations: {
        ru: "Поставить музыку на паузу"
    },
    run: async( {interaction} ) => {
        
        AudioService.pause(interaction.guildId);

        interaction.followUp({
            content: "Paused successful",
        });
    }
});
