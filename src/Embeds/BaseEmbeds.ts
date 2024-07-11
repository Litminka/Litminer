import { ColorResolvable, Colors, EmbedBuilder } from "discord.js";

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
}