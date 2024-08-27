
import { GuildMember, User, VoiceChannel } from "discord.js";
import { Player, EQBand, RepeatMode, EQList, PlayOptions, SearchQuery, SearchResult, UnresolvedSearchResult, Queue, StoredQueue, Track, QueueSaver } from "lavalink-client";
import { ExecuteOptions } from "../typings/client";
import ChannelAccessError from "../errors/interaction/ChannelAccessError";
import ConnectionError from "../errors/interaction/ConnectionError";
import JoinVCError from "../errors/interaction/JoinVCError";
import NotInVCError from "../errors/player/NotInVCError";
import { LitminerDebug } from "../utils/LitminerDebug";

export const EQ = {
    "Clear": null,
    "Earrape Bassboost": EQList.BassboostEarrape,
    "High Bassboost": EQList.BassboostHigh,
    "Medium Bassboost": EQList.BassboostMedium,
    "Low Bassboost": EQList.BassboostLow,
    "Better Music": EQList.BetterMusic,
    "Classic": EQList.Classic,
    "Electronic": EQList.Electronic,
    "Full sound": EQList.FullSound,
    "Gaming": EQList.Gaming,
    "Pop": EQList.Pop,
    "Rock": EQList.Rock,
}

export interface SeekOptions {
    rewind: number | null;
    position: number | null;
}

export default class AudioService {

    public static async setEQ(player: Player, eqFilter: EQBand[]) {
        if (eqFilter == null) return player.filterManager.clearEQ();
        return player.filterManager.setEQ(eqFilter);
    }

    public static async setRepeatMode(player: Player, mode: RepeatMode) {
        await player.setRepeatMode(mode);
    }

    public static async pause(player: Player) {
        await player.pause();
    }

    public static async resume(player: Player) {
        await player.resume();
    }

    public static async skip(player: Player, shouldSkip: number) {
        if (shouldSkip < 0) {
            let previousTracks: Track[] = [];
            let newCurrent: Track;
            for (let i = 0; i < -shouldSkip; i++) {
                previousTracks.push(await player.queue.shiftPrevious())
            }
            newCurrent = previousTracks.pop();
            player.queue = new Queue(player.guildId, {
                current: newCurrent,
                previous: player.queue.previous,
                tracks: [...previousTracks.reverse(), player.queue.current, ...player.queue.tracks as Track[]]
            }, new QueueSaver(player.LavalinkManager.options.queueOptions), player.LavalinkManager.options.queueOptions);

            return await AudioService.play(player, { clientTrack: newCurrent });
        }
        await player.skip(shouldSkip);
    }

    public static async seek(player: Player, { rewind, position }: SeekOptions) {
        let seekTo = 0;

        if (rewind == null && position == null) {
            seekTo = player.position + 5 * 1000;
        }

        if (rewind != null) {
            seekTo = player.position + rewind * 1000;
        }

        if (position != null) {
            seekTo = position * 1000;
        }
        await player.seek(seekTo)
    }

    public static async stop(player: Player) {
        await player.stopPlaying(true, false);
        await player.destroy();
    }

    public static async search(player: Player, query: SearchQuery, requestUser: User): Promise<SearchResult | UnresolvedSearchResult> {
        return await player.search(query, requestUser)
    }

    public static async play(player: Player, options?: Partial<PlayOptions>) {
        await player.play(options);
    }

    public static async validateConnection({ client, interaction }: ExecuteOptions): Promise<boolean> {
        if (!interaction.guildId) return;
        const player = client.lavalink.getPlayer(interaction.guildId);
        if (!player) throw new ConnectionError();
        const vcId = (interaction.member as GuildMember)?.voice?.channelId;
        if (!vcId) throw new JoinVCError();
        const vc = (interaction.member as GuildMember)?.voice?.channel as VoiceChannel;
        if (!vc.joinable || !vc.speakable) throw new ChannelAccessError();
        if (player.voiceChannelId !== vcId) throw new NotInVCError();
        return true;
    }
}