import { Events } from "discord.js";
import { Event } from "../typings/client";
import { ChannelDeletePacket, VoicePacket, VoiceServer, VoiceState } from "lavalink-client";

export default {
    name: Events.Raw,
    execute: async (client, d: VoicePacket | VoiceServer | VoiceState | ChannelDeletePacket) => {
        client.lavalink.sendRawData(d);  // VERY IMPORTANT!
    }
} as Event;