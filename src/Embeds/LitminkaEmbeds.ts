import { Colors, EmbedBuilder } from "discord.js";
import BaseEmbeds from "./BaseEmbeds";
import { Guild, User } from "@prisma/client";
import { client } from "../app";
import { AnimeAnnouncement, GroupType, WatchListWithAnime } from "../typings/Anime";
import AnimeService from "../services/AnimeService";

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

    public static ShowWatchlist(list: WatchListWithAnime[], page: number, pageLimit: number): EmbedBuilder[] {
        const embeds = []

        for (let record of list) {
            const { animeId, id, isFavorite, rating, status, userId, watchedEpisodes, shikimoriId, anime } = record;
            const animeURL = `https://litminka.ru/anime/${anime.slug}`;
            const animeStatus = {
                planned: 'Запланировано',
                watching: 'Смотрю',
                rewatching: 'Пересматриваю',
                completed: 'Просмотрено',
                on_hold: 'Отложено',
                dropped: 'Брошено',
            }
            const animeEmbed = BaseEmbeds.Info(`${anime.name}`)
                .addFields([
                    {
                        name: `**${animeStatus[status]}**`,
                        value: `${watchedEpisodes} / ${anime.maxEpisodes ? anime.maxEpisodes : `?`}`,
                        inline: true,
                    },
                    {
                        name: `**Рейтинг**`,
                        value: `${rating} / 10`,
                        inline: true
                    },
                    {
                        name: `${isFavorite ? `❤️` : `💔`}`,
                        value: ` `,
                        inline: true,
                    },
                    {
                        name: `**Сезон выпуска**`,
                        value: AnimeService.ParseSeason(anime.season),
                        inline: true
                    },
                    {
                        name: `**Тип**`,
                        value: AnimeService.ParseMediaType(anime.mediaType),
                        inline: true
                    }
                ])
            if (/^https?:\/\//.test(anime.image)) animeEmbed.setThumbnail(anime.image);
            if (/^https?:\/\//.test(animeURL)) animeEmbed.setURL(animeURL);

            embeds.push(animeEmbed);
        }

        return embeds;
    }
}