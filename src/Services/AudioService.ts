
import { ChatInputCommandInteraction, GuildMember, User, VoiceChannel } from "discord.js";
import { Player, EQBand, RepeatMode, EQList, PlayOptions, SearchPlatform, SearchQuery, SearchResult, UnresolvedSearchResult } from "lavalink-client";
import { ExecuteOptions } from "../typings/Client";
import BaseEmbeds from "../embeds/BaseEmbeds";
import JoinVCError from "../errors/interactionErrors/JoinVCError";
import ConnectionError from "../errors/interactionErrors/ConnectionError";
import NotInVCError from "../errors/playerErrors/NotInVCError";
import ChannelAccessError from "../errors/interactionErrors/ChannelAccessError";

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

    public static sliderGenerator(pos: number, maxPos: number, width?: number) {
        let slider = '';
        const radioButtonPos = Math.floor(pos * 30 / maxPos);
        for (let i = 0; i < 30; i++) {
            if (radioButtonPos === i) slider += '🔘';
            else slider += '▬';
        }
        return slider;
    }
}