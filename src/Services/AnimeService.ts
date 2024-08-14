import { EmbedBuilder, TextChannel } from "discord.js";
import { AnimeAnnouncement, AnimeMediaTypes, NotifyStatuses } from "../typings/Anime";
import prisma from "../db";
import { client } from "../app";
import BaseError from "../errors/BaseError";
import LitminkaEmbeds from "../embeds/LitminkaEmbeds";
import { LitminerDebug } from "../utils/LitminerDebug";



export default class AnimeService {
    public static async NotifyGuilds(announcement: AnimeAnnouncement){
        const guilds = await prisma.guild.getNotifiable();
        if (guilds.length == 0) LitminerDebug.Warning(`No guilds to notify`);
        for (const guild of guilds) {
            try {
                const channel = client.channels.cache.get(guild.notifyChannelId) as TextChannel;
                if (!channel) throw new BaseError(`Channel is restricted or not found`);

                await channel.send({
                    embeds: [
                        await AnimeService.getAnnouncementEmbed(announcement)
                    ]
                });
                LitminerDebug.Success(`${channel.guild.name} was notified`);
            } catch (err) {
                LitminerDebug.Error(`${err}`)
            }
        }
    }

    public static async NotifyUsers(announcement: AnimeAnnouncement){
        const users = await prisma.user.findNotifiable(announcement.userIds);
        if (users.length == 0) LitminerDebug.Warning(`No users to notify`);
        for (const user of users) {
            const discordUser = await client.users.fetch(user.discordId);
            const channel = await discordUser.createDM();

            await channel.send({
                embeds: [
                    AnimeService.getAnnouncementEmbed(announcement)
                ]
            });
            LitminerDebug.Success(`${user.username} was notified`)
        }
    }

    private static getAnnouncementEmbed(announcement: AnimeAnnouncement): EmbedBuilder{
        const notificationType = announcement.notificationType as NotifyStatuses;
        let embed: EmbedBuilder;

        switch (notificationType) {
            case NotifyStatuses.EpisodeRelease:
                embed = LitminkaEmbeds.NewEpisode(announcement)
                break;
            case NotifyStatuses.FinalEpisodeReleased:
                embed = LitminkaEmbeds.FinalEpisode(announcement)
                break;
            case NotifyStatuses.AnimeRelease:
                embed = LitminkaEmbeds.AnimeRelease(announcement)
                break;
            default:
                throw new BaseError(`Invalid group type`);
        }

        return embed;
    }

    public static ParseSeason(animeSeason: string){
        if (!animeSeason || animeSeason === `?`) return `?`;
        let params = animeSeason.split(`_`);
        const season = {
            summer: `Лето`,
            autumn: `Осень`,
            winter: `Зима`,
            spring: `Весна`
        }
        
        return `${season[params[0]] ? `${season[params[0]]} ` : ``}${params[1]}`
    }

    public static ParseMediaType(mediaType: AnimeMediaTypes){
        const types = {
            tv: 'ТВ-Сериал',
            tv_special:'ТВ-Спешл',
            special: 'Спешл',
            ona: 'ONA',
            ova: 'OVA',
            movie: 'Фильм',
        }
        return types[mediaType] ?? `?`;
    }
}