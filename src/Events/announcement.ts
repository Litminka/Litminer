import { CustomEvents, Event } from "../typings/client";
import { AnimeAnnouncement } from "../typings/anime";
import AnimeService from "../services/AnimeService";

export default {
    name: CustomEvents.Announcement,
    execute: async (client, announcement: AnimeAnnouncement) => {
        AnimeService.NotifyGuilds(announcement);
        AnimeService.NotifyUsers(announcement);
    }
} as Event;