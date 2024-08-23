import { ButtonBuilder, ButtonStyle } from "discord.js";

export default class BaseButtons{

    public static Button(id: string, label?: string, emoji?: string): ButtonBuilder{
        const button = new ButtonBuilder()
            .setCustomId(id);

        if (label != null)
            button.setLabel(label);

        if (emoji != null)
            button.setEmoji(emoji);

        return button;
    }

    public static PrimaryButton(id: string, label?: string, emoji?: string): ButtonBuilder{
        return BaseButtons.Button(id, label, emoji).setStyle(ButtonStyle.Primary);
    }

    public static SecondaryButton(id: string, label?: string, emoji?: string): ButtonBuilder{
        return BaseButtons.Button(id, label, emoji).setStyle(ButtonStyle.Secondary);
    }
}