import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../Structures/Command";
import AudioService from "../../Services/AudioService";
import ytdl from "ytdl-core";
import YoutubeService from "../../Services/YoutubeService";

export default new Command({
    name: "play",
    description: "Play music",
    descriptionLocalizations: {
        ru: "Включить музыку"
    },
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'keywords',
            description: 'Введите запрос',
            required: true
        }
    ],
    run: async( {interaction} ) => {
        const keywords = interaction.options.get("keywords").value.toString() ?? '';
        const url = ytdl.validateURL(keywords) ? keywords : await YoutubeService.search(keywords);
        console.log(url);
        const channel = interaction.member.voice.channel;
        if (!channel) {
            interaction.followUp({
                content: "fuk u"
            });
            return;
        }
        AudioService.play(url, channel);

        interaction.followUp({
            content: `По запросу "${keywords}" было найдено следующее:\n${url}`,
        });
    }
});
