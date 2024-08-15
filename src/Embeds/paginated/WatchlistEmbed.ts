import { ButtonBuilder } from "discord.js";
import BaseButtons from "../buttons/baseButons";
import PaginatedEmbed from "./paginatedEmbed";

export default class WatchlistEmbed extends PaginatedEmbed {
    
    protected maxPage = 2;

    private pageCountButton: ButtonBuilder = BaseButtons.SecondaryButton(`page`).setDisabled(true);;
    private startButton = BaseButtons.PrimaryButton(`start`, null, `⏮️`).setDisabled(true);
    private endButton = BaseButtons.PrimaryButton(`end`, null, `⏭️`);

    public async initialize() {
        await this.updateListData(1);
        
        this.maxPage = Math.ceil(this.listLength / this.pageLimit);
        this.pageCountButton.setLabel(`${this.currentPage} / ${this.maxPage ? this.maxPage : `?`}`);
        this.components = [this.startButton, this.prevButton, this.pageCountButton, this.nextButton, this.endButton];

        this.buttonCommands = {
            "start": this.startPage,
            "prev": this.previousPage,
            "next": this.nextPage,
            "end": this.endPage,
        }
    }

    protected setButtonsState(): void {
        this.pageCountButton.setLabel(`${this.currentPage} / ${this.maxPage}`);
        this.startButton.setDisabled(false);
        this.prevButton.setDisabled(false);
        this.nextButton.setDisabled(false);
        this.endButton.setDisabled(false);

        if (this.currentPage <= 1) {
            this.startButton.setDisabled(true);
            this.prevButton.setDisabled(true);
        }

        if (this.currentPage * this.pageLimit >= this.listLength) {
            this.nextButton.setDisabled(true);
            this.endButton.setDisabled(true);
        }
    }

    private async startPage() {
        this.currentPage = 1;
    }

    private async endPage() {
        this.currentPage = this.maxPage;
    }
}