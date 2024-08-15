import { ColorResolvable, EmbedBuilder, Colors } from "discord.js";
import { Queue } from "lavalink-client/dist/types";
import { EmbededTrack } from "../typings/client";


export default class BaseEmbeds{

    public static TimestampEmbed(color?: ColorResolvable, message?: string): EmbedBuilder{
        const embed = new EmbedBuilder()
        .setTimestamp();

        if (color != null)
            embed.setColor(color);

        if (message != null)
            embed.setTitle(`${message}`);
        
        return embed;
    }

    public static Error(message: string): EmbedBuilder{
        return BaseEmbeds.TimestampEmbed(Colors.Red, `❌ ${message}`);
    }

    public static Success(message: string): EmbedBuilder{
        return BaseEmbeds.TimestampEmbed(Colors.Green, `✅ ${message}`);
    }

    public static Info(message: string): EmbedBuilder{
        return BaseEmbeds.TimestampEmbed(Colors.Aqua, `❗ ${message}`); 
    }

    public static Audio(message: string): EmbedBuilder{
        return BaseEmbeds.TimestampEmbed(Colors.Blurple, `🎶 ${message}`);
    }

    public static Anime(message: string): EmbedBuilder{
        return BaseEmbeds.TimestampEmbed(Colors.DarkVividPink, `${message}`);
    }
}

export class EmbedQueue {
    currentIndex: number; 
    tracks: EmbededTrack[];

    constructor(queue: Queue) {
        this.currentIndex = queue.previous.length + 1;
        this.tracks = [...queue.previous, queue.current, ...queue.tracks].map((track, i) => { return {track, isCurrent: queue.current === track, position: i + 1}});
    }

    public ShiftBy(index: number){
        this.currentIndex += index;
    }
}