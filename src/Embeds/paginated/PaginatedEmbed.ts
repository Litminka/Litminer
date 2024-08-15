import { EmbedBuilder, InteractionResponse, ComponentType, ButtonInteraction, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { LitminerDebug } from "../../utils/litminerDebug";
import BaseButtons from "../buttons/baseButons";

type buttonCommands = Record<string, () => Promise<void>>;
export type listCallback = (userId: string, page: number) => Promise<{
    list: unknown[],
    count: number,
}>

export type renderEmbedCallBack = (data: unknown[]) => EmbedBuilder[]

export interface EmbedData {
    userId: string,
    listLength?: number,
    list?: unknown[],
}

export default class PaginatedEmbed {
    protected userId = ``;

    private page: number = 1
    protected pageLimit: number = 10;
    
    protected list: unknown[] = [];
    protected listLength: number = 0;

    protected set currentPage(page: number) {
        this.page = Math.max(page, 1);
    }
    protected get currentPage() {
        return this.page;
    }
    protected updateListCallback: listCallback = null;
    protected renderEmbedsCallback: renderEmbedCallBack = null;
    
    protected components = [];
    protected prevButton = BaseButtons.PrimaryButton(`prev`, null, `⬅️`).setDisabled(true);
    protected nextButton = BaseButtons.PrimaryButton(`next`, null, `➡️`);
    protected buttonCommands: buttonCommands = {
        "prev": this.previousPage,
        "next": this.nextPage
    }

    constructor({ userId, list, listLength }: EmbedData, updateListCallback: listCallback, renderEmbedCallBack: renderEmbedCallBack) {
        this.updateListCallback = updateListCallback;
        this.renderEmbedsCallback = renderEmbedCallBack;
        this.list = list ?? [];
        this.listLength = listLength ?? 0;
        this.userId = userId;
    }

    public async initialize() {
        await this.updateListData(1);
        this.components = [this.prevButton, this.nextButton];
    }

    protected async updateListData(page: number) {
        const response = await this.updateListCallback(this.userId, page);

        this.list = response.list;
        this.listLength = response.count;
    }

    public renderMessage() {
        return {
            embeds: this.renderEmbedsCallback(this.list),
            components: [this.getActionRow()]
        }
    }

    public createResponseCollector(response: InteractionResponse) {
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 600000,
        })

        collector.on("collect", async (button) => {
            button.deferUpdate();

            const buttonId = this.getButtonId(button);

            const buttonFunction = this.buttonCommands[buttonId];
            if (typeof buttonFunction === "undefined") throw new Error(`No button command \"${buttonId}\"`);
            await buttonFunction.call(this);

            await this.updateListData(this.currentPage);

            this.setButtonsState();

            const embeds = this.renderEmbedsCallback(this.list);

            return await response.edit({
                embeds,
                components: [this.getActionRow()]
            });
        });

        collector.on("end", async () => {
            for (const button of this.components) {
                button.setDisabled(true);
            }

            await response.edit({
                components: [this.getActionRow()],
            });
        });
        return collector;
    }

    protected getButtonId(button: ButtonInteraction) {
        const selection = button.customId;
        return selection;
    }

    protected setButtonsState() {
        this.prevButton.setDisabled(false);
        this.nextButton.setDisabled(false);

        if (this.currentPage <= 1) {
            this.prevButton.setDisabled(true);
        }

        if (this.currentPage * this.pageLimit >= this.listLength) {
            this.nextButton.setDisabled(true);
        }
    }

    protected async nextPage() {
        this.currentPage += 1;
    }

    protected async previousPage() {
        this.currentPage -= 1;
    }

    private getActionRow() {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(this.components);
    }

}