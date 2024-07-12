import { Colors, EmbedBuilder } from "discord.js";
import { Player, PlaylistInfo, Track } from "lavalink-client";
import { formatMS_HHMMSS } from "../Utils/Time";
import { CustomRequester } from "../typings/Client";
import BaseEmbeds from "./BaseEmbeds";

export default class MusicEmbeds {

    public static TrackStarted(track: Track): EmbedBuilder{
        const embed = BaseEmbeds.TimestampEmbed(Colors.Blurple, `🎶 ${track.info.title}`.substring(0, 256))
        .setDescription(
            [
                `- **Author:** ${track.info.author}`,
                `- **Duration:** ${formatMS_HHMMSS(track.info.duration)} | Ends <t:${Math.floor((Date.now() + track.info.duration) / 1000)}:R>`,
                `- **Source:** ${track.info.sourceName}`,
                `- **Requester:** <@${(track.requester as CustomRequester).id}>`,
                track.pluginInfo?.clientData?.fromAutoplay ? `> *From Autoplay* ✅` : undefined
            ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
        )
        .setImage(track.info.artworkUrl || track.pluginInfo?.artworkUrl || null)
        .setFooter({
            text: `Requested by ${(track.requester as CustomRequester)?.username}`,
            iconURL: (track?.requester as CustomRequester)?.avatar || undefined
        })
        // local tracks are invalid uris
        if(/^https?:\/\//.test(track.info.uri)) embed.setURL(track.info.uri);

        return embed;
    }

    public static TrackPaused(track: Track, pauseTime: string) : EmbedBuilder{
        return BaseEmbeds.Info(`${track.info.title} paused at ${pauseTime}`);
    }

    public static TrackSkipped(oldTrack: Track, newTrack: Track) : EmbedBuilder{
        return BaseEmbeds.Info(`Skipping [\`${oldTrack.info.title}\`] to [\`${newTrack.info.title}\`]`);
    }

    public static TrackAdded(track: Track, position: number): EmbedBuilder{
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

    public static PlaylistAdded(playlist: PlaylistInfo, tracks: Track[], lastQueuePosition: number): EmbedBuilder{
        console.log(playlist);
        const embed = BaseEmbeds.Success(`Added ${playlist.title} playlist`)
        .setDescription(
            [
                `- **Queue position:** ${lastQueuePosition - tracks.length}`,
                playlist.uri ? `**URL:** ${playlist.uri}` : undefined,
            ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
        )
        .setImage(playlist.thumbnail)

        return embed;
    }

    public static QueueEnded(): EmbedBuilder{
        return BaseEmbeds.Error("Queue Ended");
    }
}