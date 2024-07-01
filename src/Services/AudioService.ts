
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Player, EQBand, RepeatMode, EQList } from "lavalink-client";
import { ExecuteOptions } from "../typings/Client";

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
        await player.filterManager.setEQ(eqFilter);
    }

    public static async clearEQ(player: Player) {
        await player.filterManager.clearEQ();
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

    public static async stop(player: Player, message?: string) {
        await player.destroy(message);
    }

    public static async validate({ client, interaction }: ExecuteOptions): Promise<boolean> {
        if (!interaction.guildId) return;
        const vcId = (interaction.member as GuildMember)?.voice?.channelId;
        const player = client.lavalink.getPlayer(interaction.guildId);
        if (!player) {
            interaction.reply({ ephemeral: true, content: "I'm not connected" });
            return false;
        }
        if (!vcId) {
            interaction.reply({ ephemeral: true, content: "Join a Voice Channel " });
            return false;
        }
        if (player.voiceChannelId !== vcId) {
            interaction.reply({ ephemeral: true, content: "You need to be in my Voice Channel" })
            return false;
        }
        return true;
    }
}