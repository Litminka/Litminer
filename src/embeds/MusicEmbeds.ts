import { Colors, EmbedBuilder } from "discord.js";
import { Track, PlaylistInfo, Player, Queue } from "lavalink-client/dist/types";
import QueueEmptyError from "../errors/queue/QueueEmptyError";
import { CustomRequester, EmbededTrack } from "../typings/client";
import { formatMS_HHMMSS } from "../utils/time";
import BaseEmbeds from "./BaseEmbeds";
import NotPlayingError from "../errors/player/NotPlayingError";

export default class MusicEmbeds {
    static replacements = {
        '[': '(',
        ']': ')'
    }

    public static TrackStarted(track: Track): EmbedBuilder {
        const embed = BaseEmbeds.Audio(`${track.info.title}`.substring(0, 256))
            .setDescription(
                [
                    `- **Автор:** ${track.info.author}`,
                    `- **Длительность:** ${formatMS_HHMMSS(track.info.duration)} | Ends <t:${Math.floor((Date.now() + track.info.duration) / 1000)}:R>`,
                    `- **Источник:** ${track.info.sourceName}`,
                    `- **Заказчик:** <@${(track.requester as CustomRequester).id}>`,
                    track.pluginInfo?.clientData?.fromAutoplay ? `> *From Autoplay* ✅` : undefined
                ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
            )
            .setImage(track.info.artworkUrl || track.pluginInfo?.artworkUrl || null)
            .setFooter({
                text: `Заказан ${(track.requester as CustomRequester)?.username}`,
                iconURL: (track?.requester as CustomRequester)?.avatar || undefined
            })
        if (/^https?:\/\//.test(track.info.uri)) embed.setURL(track.info.uri);

        return embed;
    }

    public static TrackPaused(track: Track, pauseTime: string): EmbedBuilder {
        return BaseEmbeds.Info(`${track.info.title} paused at ${pauseTime}`);
    }

    public static TrackSkipped(oldTrack: Track, newTrack: Track): EmbedBuilder {
        return BaseEmbeds.Info(`Skipping [\`${oldTrack.info.title}\`] to [\`${newTrack.info.title}\`]`);
    }

    public static TrackAdded(track: Track, position: number): EmbedBuilder {
        const embed = BaseEmbeds.Success(`Added ${track.info.title}`)
            .setDescription(
                [
                    `- **Author:** ${track.info.author}`,
                    `- **URL:** ${track.info.uri}`,
                    `- **Queue position:** ${position}`
                ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
            )
            .setImage(track.info.artworkUrl || track.pluginInfo?.artworkUrl || null)

        return embed;
    }

    public static PlaylistAdded(playlist: PlaylistInfo, tracks: Track[], lastQueuePosition: number): EmbedBuilder {
        const embed = BaseEmbeds.Success(`Added ${playlist.title} playlist`)
            .setDescription(
                [
                    `- **Queue position:** ${tracks ? lastQueuePosition - tracks.length : lastQueuePosition}`,
                    playlist.uri ? `**URL:** ${playlist.uri}` : undefined,
                ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
            )
            .setImage(playlist.thumbnail)

        return embed;
    }

    public static QueueEnded(): EmbedBuilder {
        return BaseEmbeds.Error("Queue Ended");
    }

    public static ShowMusicQueue(tracks: EmbededTrack[]): EmbedBuilder[] {
        if (!tracks) throw new QueueEmptyError();
        const embeds = [];
        for (let track of tracks) {
            embeds.push(MusicEmbeds.TrackInfo(track));
        }
        return embeds;
    }

    public static TrackInfo(embededTrack: EmbededTrack) {
        const title = embededTrack.track.info.title.replace(/[\[\]]/g, c => this.replacements[c]);
        const trackAuthor = embededTrack.track.info.author;
        const requester = embededTrack.track.requester as CustomRequester;
        
        const embed = BaseEmbeds.Audio(title)
            .addFields([
                {
                    name: `**Автор**`,
                    value: trackAuthor,
                    inline: true
                },
                {
                    name: `**Длительность**`,
                    value: `${formatMS_HHMMSS(embededTrack.track.info.duration)}`,
                    inline: true
                },
                {
                    name: `**Источник**`,
                    value: `${embededTrack.track.info.sourceName}`,
                    inline: true
                }
            ])
            .setFooter({
                text: `Запрошено ${(requester?.username)}`,
                iconURL: requester?.avatar || undefined
            });
        if (/^https?:\/\//.test(embededTrack.track.info.artworkUrl)) embed.setThumbnail(embededTrack.track.info.artworkUrl);
        if (/^https?:\/\//.test(embededTrack.track.info.uri)) embed.setURL(embededTrack.track.info.uri);
        if (embededTrack.isCurrent) embed.setColor(Colors.LuminousVividPink).setDescription(`## Текущий трек`);
        return embed;
    }

    public static Current(track: Track, trackPosition: number) {
        if (!track) throw new NotPlayingError();
        const duration = track.info.duration;
        const embed = BaseEmbeds.Audio(`${track.info.title}`.substring(0, 256))
            .setAuthor({ name: track.info.author })
            .setImage(track.info.artworkUrl)
            .addFields([
                {
                    name: `**Requester**`,
                    value: `<@${(track.requester as CustomRequester).id}>`,
                    inline: true
                },
                {
                    name: `**Progress**`,
                    value: `${formatMS_HHMMSS(trackPosition)} / ${formatMS_HHMMSS(duration)}`,
                    inline: true
                }
            ])
        if (/^https?:\/\//.test(track.info.uri)) embed.setURL(track.info.uri);
        return [embed];
    }
}


export class EmbedQueue {
    tracks: EmbededTrack[];

    constructor(queue: Queue) {
        this.tracks = [...queue.previous, queue.current, ...queue.tracks].map((track, i) => { return { track, isCurrent: queue.current === track, position: i + 1 } });
    }

    public async GetTracks(userId: string, page: number, pageLimit: number = 10) {
        const currentIndex = (page - 1) * pageLimit;
        return {
            list: this.tracks.slice(currentIndex, currentIndex + pageLimit),
            count: this.tracks.length
        }
    }
}