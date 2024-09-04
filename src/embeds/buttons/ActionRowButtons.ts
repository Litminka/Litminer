import { ButtonBuilder, ButtonComponentData, EmojiResolvable } from "discord.js";
import { ActionRowExecuteParameters } from "../actionRow/ActionRow";

export type actionRowButtonCallback = (executeParams: ActionRowExecuteParameters) => Promise<void>;

export default class ActionRowButton {
    public id: string;
    public component: ButtonBuilder;
    public call: actionRowButtonCallback;
    private _isVisible: boolean;
    private _isInteractionDeferred: boolean;

    public get isVisible() {
        return this._isVisible;
    }

    public get isInteractionDeferred() {
        return this._isInteractionDeferred;
    }

    constructor(id: string, callback: actionRowButtonCallback) {
        this.component = new ButtonBuilder()
            .setCustomId(id);

        this.id = id;
        this.call = callback;
        this._isVisible = true;
        this._isInteractionDeferred = true;
    }

    public static createButton(id: string, callback: actionRowButtonCallback, data?: ButtonComponentData): ActionRowButton {
        const button = new ActionRowButton(id, callback);

        if (data.label != null)
            button.component.setLabel(data.label);

        if (data.emoji != null)
            button.component.setEmoji(data.emoji);
        return button;
    }

    public hide(): ActionRowButton {
        this._isVisible = false;
        return this;
    }

    public show(): ActionRowButton {
        this._isVisible = true;
        return this;
    }

    public undeferInteraction(): ActionRowButton {
        this._isInteractionDeferred = false;
        return this;
    }

    public disable(): ActionRowButton {
        this.component.setDisabled(true);
        return this;
    }

    public enable(): ActionRowButton {
        this.component.setDisabled(false);
        return this;
    }

    public changeName(newName: string): ActionRowButton{
        this.component.setLabel(newName);
        return this;
    }

    public changeEmoji(newEmoji: EmojiResolvable): ActionRowButton{
        this.component.setEmoji(newEmoji);
        return this;
    }
}