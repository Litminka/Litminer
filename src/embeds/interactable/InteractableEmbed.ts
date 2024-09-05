import { EmbedBuilder, InteractionResponse, ComponentType, ButtonInteraction, ActionRowBuilder, ButtonBuilder } from "discord.js";
import BaseError from "../../errors/BaseError";
import BaseEmbeds from "../BaseEmbeds";
import { LitminerDebug } from "../../utils/LitminerDebug";
import ActionRow, { ActionRowExecuteParameters } from "../actionRow/ActionRow";
import { delay } from "../../utils/time";

export type listCallback = (userId: string, page: number, pageLimit: number, ...params: unknown[]) => Promise<{
    list: unknown[],
    count: number
}>

export type renderEmbedCallBack = (...data: unknown[]) => EmbedBuilder[]

export interface EmbedData {
    userId: string,
    listLength?: number,
    list?: unknown[]
}

export default class InteractableEmbed {
    protected userDiscordId = ``;
    protected renderEmbedsCallback: renderEmbedCallBack = null;
    protected rows: ActionRow[] = [];
    protected params: unknown[] = [];
    protected list: unknown[] = [];
    protected _isUpdating: boolean = false;

    protected get isUpdating(): boolean {
        return this._isUpdating;
    }

    protected response: InteractionResponse;

    constructor({ userId }: EmbedData, renderEmbedCallBack: renderEmbedCallBack, ...params: unknown[]) {
        this.renderEmbedsCallback = renderEmbedCallBack;
        this.userDiscordId = userId;
        this.params = params;
    }

    public async initialize(): Promise<void> {
        await this.updateListData()
        this.setActionRows();
        this.setButtonsState();
    }

    protected setActionRows(): void {
        this.rows = [];
    }

    protected async updateListData(): Promise<void> {}

    public renderMessage() {
        return {
            embeds: this.renderEmbedsCallback(this.list),
            components: this.getActionRows()
        }
    }

    public async createResponseCollector(response: InteractionResponse) {
        this.response = response;

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 600000,
            filter: i => i.user.id === this.userDiscordId
        })

        collector.on("collect", async (buttonInteraction) => {
            try {
                const buttonId = this.getButtonId(buttonInteraction);
                LitminerDebug.Debug(`${buttonId} interaction was detected`);
                const actionRow = this.findActionRow(buttonId);
                if (typeof actionRow === "undefined") throw new BaseError(`No action row with \"${buttonId}\" button id was found`);
                const interactableButton = actionRow.find(buttonId);
                if (interactableButton.isInteractionDeferred) {
                    LitminerDebug.Debug(`Interaction deferred`);
                    await buttonInteraction.deferUpdate();
                }
                await actionRow.execute(buttonId, this.extendExecuteParameters({ interaction: buttonInteraction }));

                await this.updateListData();
                this.setButtonsState();

                return await response.edit(this.renderMessage());
            } catch (error) {
                LitminerDebug.Error(error.stack);
                return await response.edit({
                    embeds: [BaseEmbeds.Error(error.message)],
                    components: []
                })
            }
        });

        collector.on("end", async () => {
            await response.edit({
                components: [],
            });
        });

        return collector;
    }

    public async startUpdating(): Promise<void> {
        this._isUpdating = true;
        while (this.updateCondition()) {
            delay(1000);
            await this.updateListData();
            this.setButtonsState();
            await this.response.edit(this.renderMessage());
        }
        this._isUpdating = false;
    }

    protected updateCondition(): boolean {
        return true;
    };

    protected extendExecuteParameters(params: ActionRowExecuteParameters): ActionRowExecuteParameters{
        return { ...params };
    }

    protected getButtonId(button: ButtonInteraction) {
        const selection = button.customId;
        return selection;
    }

    protected findActionRow(buttonId: string): ActionRow {
        return this.rows.filter(row => row.find(buttonId)).at(0);
    }

    protected setButtonsState(): void {}

    protected getActionRows(): ActionRowBuilder<ButtonBuilder>[] {
        return this.rows.map(row => row.createActionRow());
    }
}
