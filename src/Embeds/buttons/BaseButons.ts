import { ButtonBuilder, ButtonStyle } from "discord.js";

export default class BaseButtons{

    public static Button(id: string, label?: string): ButtonBuilder{
        const button = new ButtonBuilder()
            .setCustomId(id);

        if (label != null)
            button.setLabel(label);

        return button;
    }

    public static PrimaryButton(id: string, label?: string, emoji?: string): ButtonBuilder{
        return BaseButtons.Button(id, label).setStyle(ButtonStyle.Primary).setEmoji(emoji);
    }

    public static SecondaryButton(id: string, label?: string, emoji?: string): ButtonBuilder{
        return BaseButtons.Button(id, label).setStyle(ButtonStyle.Secondary).setEmoji(emoji);
    }
}