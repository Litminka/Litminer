
import { ChatInputCommandInteraction, GuildMember, User } from "discord.js";
import { Player, EQBand, RepeatMode, EQList, PlayOptions, SearchPlatform, SearchQuery, SearchResult, UnresolvedSearchResult } from "lavalink-client";
import { ExecuteOptions } from "../typings/Client";
import BaseEmbeds from "../Embeds/BaseEmbeds";

export const EQ = {
    "Clear" : null,
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

export interface SeekOptions{
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

    public static async seek(player: Player, {rewind, position}: SeekOptions) {
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
    }

    public static async search(player: Player, query: SearchQuery, requestUser: User): Promise<SearchResult | UnresolvedSearchResult>{
        return await player.search(query, requestUser)
    }

    public static async play(player: Player, options?: Partial<PlayOptions>){
        await player.play(options);
    }

    public static async validateConnection({ client, interaction }: ExecuteOptions): Promise<boolean> {
        if (!interaction.guildId) return;
        const vcId = (interaction.member as GuildMember)?.voice?.channelId;
        const player = client.lavalink.getPlayer(interaction.guildId);
        if (!player) {
            interaction.reply({ 
                ephemeral: true, 
                embeds: [
                    BaseEmbeds.Error(`I'm not connected`)
                ] 
            });
            return false;
        }
        if (!vcId) {
            interaction.reply({ 
                ephemeral: true,
                embeds: [
                    BaseEmbeds.Error(`Join a Voice Channel`)
                ] 
             });
            return false;
        }
        if (player.voiceChannelId !== vcId) {
            interaction.reply({ ephemeral: true, 
                embeds: [
                BaseEmbeds.Error(`You need to be in my Voice Channel`)
                ]
            })
            return false;
        }
        return true;
    }
}