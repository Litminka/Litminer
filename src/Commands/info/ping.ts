import { Command } from "../../Structures/Command";

export default new Command({
    name: "ping",
    description: "reply with pong",
    descriptionLocalizations: {
        ru: "Ответить Pong"
    },
    run: async( {interaction} ) => {
        interaction.followUp({
            content: "Pong!",
        });
    }
});