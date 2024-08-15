import { CustomEvents, Event } from "../typings/Client";
import { AnimeAnnouncement } from "../typings/Anime";
import AnimeService from "../services/AnimeService";

export default {
    name: CustomEvents.Announcement,
    execute: async (client, announcement: AnimeAnnouncement) => {
        AnimeService.NotifyGuilds(announcement);
        AnimeService.NotifyUsers(announcement);
    }
} as Event;