import { Colors, EmbedBuilder } from "discord.js";
import BaseEmbeds from "./BaseEmbeds";
import { AnimeAnnouncement, GroupType } from "../typings/Client";
import { Guild, User } from "@prisma/client";
import { client } from "../app";

export default class LitminkaEmbeds {

    public static async UserProfile(user: User): Promise<EmbedBuilder> {
        const embed = BaseEmbeds.Info("Информация о пользователе")
            .addFields([
                {
                    name: "**Имя**",
                    value: user.username,
                    inline: true
                },
                {
                    name: `**Уведомлять о новых сериях**`,
                    value: user.isNotifiable ? `Да` : `Нет`
                },
                {
                    name: `**Интеграция с Litminka.ru**`,
                    value: user.litminkaId ? `Есть (Id: ${user.litminkaId})` : `Отсутствует`
                }
            ])
            .setThumbnail((await client.users.fetch(user.discordId)).avatarURL())

        return embed;
    }

    public static async GuildProfile(guild: Guild): Promise<EmbedBuilder> {
        const embed = BaseEmbeds.Info("Информация о сервере")
            .addFields([
                {
                    name: "**Наименование**",
                    value: guild.name,
                    inline: true
                },
                {
                    name: `**Уведомлять о новых сериях**`,
                    value: guild.isNotifiable ? `Да` : `Нет`
                }
            ])
            .setThumbnail((await client.guilds.cache.get(guild.guildId)).iconURL())
        if (guild.isNotifiable)
            embed.addFields([
                {
                    name: `**Канал для уведомлений**`,
                    value: guild.notifyChannelId ? `<#${guild.notifyChannelId}>` : `Не установлен`
                }
            ])
        return embed;
    }

    public static AnimeRelease(announcement: AnimeAnnouncement): EmbedBuilder {
        const animeURL = `https://litminka.ru/anime/${announcement.slug}`;
        const embed = BaseEmbeds.Info(`Аниме начало выходить!`)
            .setDescription(`**${announcement.animeName}**\n - [Litminka.ru](${animeURL})`);
        if (/^https?:\/\//.test(announcement.image)) embed.setImage(announcement.image);
        if (/^https?:\/\//.test(animeURL)) embed.setURL(animeURL);
        return embed;
    }

    public static NewEpisode(announcement: AnimeAnnouncement): EmbedBuilder {
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
    public static FinalEpisode(announcement: AnimeAnnouncement): EmbedBuilder {
        const embed = LitminkaEmbeds.NewEpisode(announcement)
            .setTitle(`Вышла последняя серия!`)
            .setColor(Colors.Gold)
        return embed;
    }


}