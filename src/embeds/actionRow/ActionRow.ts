import ActionRowButton from "../buttons/ActionRowButtons";
import BaseError from "../../errors/BaseError";
import { ActionRowBuilder, ButtonBuilder, Interaction } from "discord.js";
import { LitminerDebug } from "../../utils/LitminerDebug";
import { Queue, Track } from "lavalink-client";

export interface ActionRowExecuteParameters { 
    interaction?: Interaction,
    track?: Track,
    queue?: Queue 
};

export default class ActionRow {
    private components = {}

    constructor() {
        this.components = {};
    }

    public find(id: string): ActionRowButton {
        return this.components[id];
    }

    public addButton(button: ActionRowButton) {
        this.components[button.id] = button;
    }

    public addButtons(buttons: ActionRowButton[]): ActionRow {
        for (let button of buttons) {
            this.addButton(button);
        }

        return this;
    }

    public async execute(id: string, executeParams?: ActionRowExecuteParameters) {
        if (!this.components[id]) throw new BaseError(`No button \"${id}\" found`);
        const button: ActionRowButton = this.components[id];
        await button.call(executeParams);
    }

    public hideButton(id: string) {
        if (!this.components[id]) throw new BaseError(`No button \"${id}\" found`);
        const button: ActionRowButton = this.components[id];
        button.hide();
    }

    public showButton(id: string) {
        if (!this.components[id]) throw new BaseError(`No button \"${id}\" found`);
        const button: ActionRowButton = this.components[id];
        button.show();
    }

    public disableButton(id: string) {
        if (!this.components[id]) throw new BaseError(`No button \"${id}\" found`);
        const button: ActionRowButton = this.components[id];
        button.disable();
    }

    public enableButton(id: string) {
        if (!this.components[id]) throw new BaseError(`No button \"${id}\" found`);
        const button: ActionRowButton = this.components[id];
        button.enable();
    }

    public changeButtonName(id: string, name: string) {
        if (!this.components[id]) throw new BaseError(`No button \"${id}\" found`);
        if (!name.length) throw new BaseError(`Can't rename button with empty space`);
        const button: ActionRowButton = this.components[id];
        button.changeName(name);
    }

    public createActionRow(): ActionRowBuilder<ButtonBuilder> {
        let actionRow = new ActionRowBuilder<ButtonBuilder>();
        for (let component of Object.values(this.components)) {
            const actionRowButton: ActionRowButton = component as ActionRowButton;
            if (actionRowButton.isVisible) actionRow.addComponents(actionRowButton.component);
        }

        return actionRow;
    }
}