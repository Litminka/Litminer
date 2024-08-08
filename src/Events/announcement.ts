import { AnimeAnnouncement, CustomEvents, Event, NotifyStatuses } from "../typings/Client";
import LitminkaEmbeds from "../embeds/LitminkaEmbeds";
import BaseError from "../errors/BaseError";
import prisma from "../db";

export default {
    name: CustomEvents.Announcement,
    execute: async (client, announcement: AnimeAnnouncement) => {
        const notificationType = announcement.notificationType as NotifyStatuses;        
        let embed;

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

        const usersToNotify = announcement.userIds;
        for (const litminkaId of usersToNotify){
            const userId = (await prisma.userLink.getDiscordId(`${litminkaId}`))?.discordId;
            if (!userId) continue;
            console.log(userId);
            const user = await client.users.fetch(userId);
            const channel = await user.createDM();
        
            await channel.send({
                embeds:[
                    embed
                ]
            });
        }
    }
} as Event;