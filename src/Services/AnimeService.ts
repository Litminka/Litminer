import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, TextChannel, User, VoiceChannel } from "discord.js";
import { Player, EQBand, RepeatMode, EQList, PlayOptions, SearchPlatform, SearchQuery, SearchResult, UnresolvedSearchResult } from "lavalink-client";
import { AnimeAnnouncement, ExecuteOptions, NotifyStatuses } from "../typings/Client";
import BaseEmbeds from "../embeds/BaseEmbeds";
import JoinVCError from "../errors/interactionErrors/JoinVCError";
import ConnectionError from "../errors/interactionErrors/ConnectionError";
import NotInVCError from "../errors/playerErrors/NotInVCError";
import ChannelAccessError from "../errors/interactionErrors/ChannelAccessError";
import prisma from "../db";
import { client } from "../app";
import BaseError from "../errors/BaseError";
import LitminkaEmbeds from "../embeds/LitminkaEmbeds";



export default class AnimeService {
    public static async NotifyGuilds(announcement: AnimeAnnouncement){
        const guilds = await prisma.guild.getNotifiable();
        if (guilds.length == 0) console.log(`[LitminerV2] No guilds to notify`);
        for (const guild of guilds) {
            try {
                const channel = client.channels.cache.get(guild.notifyChannelId) as TextChannel;
                if (!channel) throw new BaseError(`Channel is restricted or not found`);

                await channel.send({
                    embeds: [
                        await AnimeService.getAnnouncementEmbed(announcement)
                    ]
                });
                console.log(`[LitminerV2] ${channel.guild.name} was notified`);
            } catch (err) {
                console.log(`[LitminerV2] ${err}`)
            }
        }
    }

    public static async NotifyUsers(announcement: AnimeAnnouncement){
        const users = await prisma.user.findNotifiable(announcement.userIds);
        if (users.length == 0) console.log(`[LitminerV2] No users to notify`);
        for (const user of users) {
            const discordUser = await client.users.fetch(user.discordId);
            const channel = await discordUser.createDM();

            await channel.send({
                embeds: [
                    AnimeService.getAnnouncementEmbed(announcement)
                ]
            });
            console.log(`[LitminerV2] ${user.username} was notified`)
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
}