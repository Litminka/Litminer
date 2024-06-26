import { Command } from "../../Structures/Command";
import AudioService from "../../Services/AudioService";

export default new Command({
    name: "unpause",
    description: "Unpause audio",
    descriptionLocalizations: {
        ru: "Убрать музыку с паузы"
    },
    run: async( {interaction} ) => {
        
        AudioService.unpause(interaction.guildId);

        interaction.followUp({
            content: "Unpaused successful",
        });
    }
});
