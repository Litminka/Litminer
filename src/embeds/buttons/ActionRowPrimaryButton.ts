import { ButtonComponentData, ButtonStyle } from "discord.js";
import ActionRowButton, { actionRowButtonCallback } from "./ActionRowButtons";

export default class ActionRowPrimaryButton extends ActionRowButton{

    public static createButton(id: string, callback: actionRowButtonCallback, data?: ButtonComponentData): ActionRowButton {
        const button = super.createButton(id, callback, data);
        button.component.setStyle(ButtonStyle.Primary);
        return button;
    }
}