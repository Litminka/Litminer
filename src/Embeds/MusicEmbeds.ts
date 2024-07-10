import { Colors, EmbedBuilder } from "discord.js";
import { Track } from "lavalink-client";
import { formatMS_HHMMSS } from "../Utils/Time";
import { CustomRequester } from "../typings/Client";
import BaseEmbeds from "./BaseEmbeds";

export default class MusicEmbeds {

    public static TrackStarted(track: Track): EmbedBuilder{
        const embed = BaseEmbeds.TimestampEmbed(Colors.Blurple, `🎶 ${track.info.title}`.substring(0, 256))
        .setThumbnail(track.info.artworkUrl || track.pluginInfo?.artworkUrl || null)
        .setDescription(
            [
                `> - **Author:** ${track.info.author}`,
                `> - **Duration:** ${formatMS_HHMMSS(track.info.duration)} | Ends <t:${Math.floor((Date.now() + track.info.duration) / 1000)}:R>`,
                `> - **Source:** ${track.info.sourceName}`,
                `> - **Requester:** <@${(track.requester as CustomRequester).id}>`,
                track.pluginInfo?.clientData?.fromAutoplay ? `> *From Autoplay* ✅` : undefined
            ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
        )
        .setFooter({
            text: `Requested by ${(track.requester as CustomRequester)?.username}`,
            iconURL: (track?.requester as CustomRequester)?.avatar || undefined
        })
        // local tracks are invalid uris
        if(/^https?:\/\//.test(track.info.uri)) embed.setURL(track.info.uri);

        return embed;
    }

    public static QueueEnded(): EmbedBuilder{
        return BaseEmbeds.Error("Queue Ended");;
    }
}