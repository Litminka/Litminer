import { Colors, EmbedBuilder } from "discord.js";
import BaseEmbeds, { EmbedQueue } from "./BaseEmbeds";
import { AnimeAnnouncement, GroupType, NotifyStatuses } from "../typings/Client";

export default class LitminkaEmbeds {

    public static UserProfile(user): EmbedBuilder{
        const embed = BaseEmbeds.Info("Информация о пользователе")
        .addFields([
            {
                name: "**Имя**",
                value: user.body.name
            }
        ])

        return embed;
    }

    public static AnimeRelease(announcement: AnimeAnnouncement): EmbedBuilder{
        const animeURL = `https://litminka.ru/anime/${announcement.slug}`;
        const embed = BaseEmbeds.Info(`Аниме начало выходить!`)
        .setDescription(`**${announcement.animeName}**\n - [Litminka.ru](${animeURL})`);
        if (/^https?:\/\//.test(announcement.image)) embed.setImage(announcement.image);
        if (/^https?:\/\//.test(animeURL)) embed.setURL(animeURL);
        return embed;
    }
    
    public static NewEpisode(announcement: AnimeAnnouncement): EmbedBuilder{
        const embed = LitminkaEmbeds.AnimeRelease(announcement)
        .setTitle(`Вышла новая серия!`)
        .addFields([
            {
                name: "**Эпизод**",
                value: `${announcement.episode} / ${announcement.maxEpisodes ? announcement.maxEpisodes : `?`}`,
                inline: true
            },
            {
                name: `**${announcement.groupType === GroupType.Voice ? `Озвучка` : `Субтитры`}**`,
                value: `${announcement.groupName}`,
                inline: true
            },
        ])

        return embed;
    }
    public static FinalEpisode(announcement: AnimeAnnouncement): EmbedBuilder{
        const embed = LitminkaEmbeds.NewEpisode(announcement)
        .setTitle(`Вышла последняя серия!`)
        .setColor(Colors.Gold)
        return embed;
    }

    
}