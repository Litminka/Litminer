import { EmbedBuilder, InteractionResponse, ComponentType, ButtonInteraction, ActionRowBuilder, ButtonBuilder } from "discord.js";
import BaseButtons from "../buttons/BaseButtons";
import BaseError from "../../errors/BaseError";
import BaseEmbeds from "../BaseEmbeds";
import { LitminerDebug } from "../../utils/LitminerDebug";

type buttonCommands = Record<string, () => Promise<void>>;
export type listCallback = (userId: string, page: number, pageLimit: number, ...params: unknown[]) => Promise<{
    list: unknown[],
    count: number
}>

export type renderEmbedCallBack = (data: unknown[]) => EmbedBuilder[]

export interface EmbedData {
    userId: string,
    listLength?: number,
    list?: unknown[]
}

export default class PaginatedEmbed {
    protected discordId = ``;

    private page: number = 1
    protected pageLimit: number = 5;
    
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
    protected buttonCommands: buttonCommands = {};

    protected params: unknown[] = [];

    constructor({ userId, list, listLength }: EmbedData, updateListCallback: listCallback, renderEmbedCallBack: renderEmbedCallBack, ...params: unknown[]) {
        this.updateListCallback = updateListCallback;
        this.renderEmbedsCallback = renderEmbedCallBack;
        this.list = list ?? [];
        this.listLength = listLength ?? 0;
        this.discordId = userId;
        this.params = params;
    }

    public async initialize() {
        await this.updateListData(1);
        this.setButtomCommands();
        this.setComponents();
        this.setButtonsState();
    }

    protected setComponents(){
        this.components = [this.prevButton, this.nextButton];
    }

    protected setButtomCommands(){
        this.buttonCommands = {
            "prev": this.previousPage,
            "next": this.nextPage
        }
    }

    protected async updateListData(page: number) {
        const response = await this.updateListCallback(this.discordId, page, this.pageLimit, ...this.params);
        
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

            try{
                const buttonId = this.getButtonId(button);

                const buttonFunction = this.buttonCommands[buttonId];
                if (typeof buttonFunction === "undefined") throw new BaseError(`No button command \"${buttonId}\"`);
                await buttonFunction.call(this);
    
                await this.updateListData(this.currentPage);
    
                this.setButtonsState();
    
                const embeds = this.renderEmbedsCallback(this.list);

                return await response.edit({
                    embeds,
                    components: [this.getActionRow()]
                });
            } catch(error){
                LitminerDebug.Error(error.message);
                return await response.edit({
                    embeds: [BaseEmbeds.Error(error)],
                    components: []
                })
            }
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

        if (this.currentPage * this.pageLimit >= this.listLength || this.listLength <= this.pageLimit) {
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