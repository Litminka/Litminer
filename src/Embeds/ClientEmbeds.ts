import { EmbedBuilder } from "discord.js";
import BaseEmbeds from "./BaseEmbeds";
import { BotClient } from "../Structures/BotClient";

export default class ClientEmbeds{

    public static PlayerDestroyed(reason: string): EmbedBuilder{
        const embed = BaseEmbeds.Error("Player Destroyed")
        .setDescription(`Reason: ${reason || "Unknown"}`);
        
        return embed;
    }

    public static About(client: BotClient): EmbedBuilder{
        const embed = BaseEmbeds.Info("О боте")
        .setThumbnail(client.user.avatarURL())
        .setDescription(
            [
                `> - **Name:** ${client.lavalink.options.client.username}`,
                `> - **Version:** 2.0.0`
            ].filter(v => typeof v === "string" && v.length).join("\n").substring(0, 4096)
        );

        return embed;
    }
}