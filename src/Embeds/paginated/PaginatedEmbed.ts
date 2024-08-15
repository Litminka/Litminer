import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ComponentType, InteractionResponse } from "discord.js";
import BaseButtons from "../buttons/BaseButons";
import { LitminerDebug } from "../../utils/LitminerDebug";
import LitminkaEmbeds from "../LitminkaEmbeds";
import MusicEmbeds from "../MusicEmbeds";
import { LitminkaAPIRequests } from "../../LitminkaAPI/requests";

export enum PaginatedEmbedType{
    Unknown = 0,
    WatchList = 1,
    MusicQueue = 2
}

const PaginatedEmbedFunctions = {
    0: () => {LitminerDebug.Debug(`Paginated embed default function was called`);},
    1: LitminkaEmbeds.ShowWatchlist,
    2: MusicEmbeds.PrintQueue
}

export default class PaginatedEmbed {
    private embedType: PaginatedEmbedType = null;
    private embedFunction: Function;
    private components = [];
    private collector = null;
    private page = 1;
    private pageLimit = 10;
    private maxPage = 0;
    private list = [];
    private listLength = 0;
    private startButton = BaseButtons.PrimaryButton(`start`, null, `⏮️`).setDisabled(true);
    private prevButton = BaseButtons.PrimaryButton(`prev`, null, `⬅️`).setDisabled(true);
    private pageView = null;
    private nextButton = BaseButtons.PrimaryButton(`next`, null, `➡️`);
    private endButton = BaseButtons.PrimaryButton(`end`, null, `⏭️`);

    private userId = ``;

    constructor(userId: string, embedType: PaginatedEmbedType, list?: any[], listLength?: number, ) {
        this.list = list ?? [];
        this.listLength = listLength ?? 0;
        this.userId = userId;
        this.embedType = embedType ?? PaginatedEmbedType.Unknown;
        this.embedFunction = PaginatedEmbedFunctions[embedType];
    }

    public async initialize(){
        await this.updateList(this.userId);
        this.maxPage = Math.ceil(this.listLength / this.pageLimit);
        this.pageView = BaseButtons.SecondaryButton(`page`, `${this.page} / ${this.maxPage ? this.maxPage : `?`}`, null).setDisabled(true);
        this.components = [this.startButton, this.prevButton, this.pageView, this.nextButton, this.endButton];
    }

    public createResponseCollector(response: InteractionResponse){
        this.collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 600000,
        })

        this.collector.on("collect", async (button) => {
            button.deferUpdate();
            const selection = button.customId;
            LitminerDebug.Debug(`${selection} pressed`);

            const commands = {
                "start": this.startPage,
                "prev": this.previousPage,
                "next": this.nextPage,
                "end": this.endPage,
            }

            await commands[selection].call(this, this.userId);

            this.pageView.setLabel(`${this.page} / ${this.maxPage}`);
            this.startButton.setDisabled(false);
            this.prevButton.setDisabled(false);
            this.nextButton.setDisabled(false);
            this.endButton.setDisabled(false);

            if (this.page <= 1) {
                this.startButton.setDisabled(true);
                this.prevButton.setDisabled(true);
            }

            if (this.page * this.pageLimit >= this.listLength) {
                this.nextButton.setDisabled(true);
                this.endButton.setDisabled(true);
            }

            LitminerDebug.Debug(`${response.client.user.id} ${response.client.user.username}`);
            //const watchlist = await LitminkaAPIRequests.GetUserWatchlist(interaction.user.id, page, pageLimit);
           
            const embeds = this.getEmbeds();

            return await response.edit({
                embeds,
                components: [this.getActionRow()]
            });
        });

        this.collector.on("end", async () => {
            this.components.forEach((button) => {
                button.setDisabled(true);
            });
            await response.edit({
                components: [this.getActionRow()],
            });
        });
    }

    public getEmbeds(){
        return this.embedFunction(this.list);
    }

    public getActionRow() { 
        return new ActionRowBuilder<ButtonBuilder>().addComponents(this.components); 
    }

    private async updateList(userId: string){
        if (this.embedType != PaginatedEmbedType.WatchList) return;
        LitminerDebug.Debug(`Loading ${this.page} page`);

        const watchlist = await LitminkaAPIRequests.GetUserWatchlist(userId, this.page, this.pageLimit);
        this.list = watchlist.list;
        this.listLength = watchlist.count;
    }

    private async nextPage(userId: string){
        this.page++;
        await this.updateList(userId);
    }

    private async previousPage(userId: string){
        this.page--;
        await this.updateList(userId)
    }

    private async startPage(userId: string){    
        this.page = 1;
        await this.updateList(userId)
    }

    private async endPage(userId: string){
        this.page = this.maxPage;
        await this.updateList(userId)
    }

}