import { ButtonBuilder } from "discord.js";
import BaseButtons from "../buttons/BaseButtons";
import PaginatedEmbed from "./PaginatedEmbed";
import { Anime, AnimeStatuses, FollowTypes, TranslationGroup } from "../../typings/anime";
import { APIRequestService } from "../../services/APIRequestService";

export default class AnimeSearchEmbed extends PaginatedEmbed {

    protected pageLimit: number = 1;
    private animeToFollow: Anime;
    private groups: TranslationGroup[] = [];
    private groupToFollow: TranslationGroup;
    private groupFollowType: FollowTypes;
    private nextGroupToFollow: TranslationGroup;
    private prevGroupToFollow: TranslationGroup;
    private _currentGroupIndex: number = 0;

    private set currentGroupIndex(index: number) {
        if (index < 0) index = this.groups.length - 1;
        this._currentGroupIndex = index % this.groups.length;

    }
    private get currentGroupIndex(): number {
        return this._currentGroupIndex;
    }

    private subscribeButton: ButtonBuilder = BaseButtons.PrimaryButton(`sub`, `Подписаться`, `🔔`);
    private nextGroupButton: ButtonBuilder = BaseButtons.SecondaryButton(`gNext`, `Озвучка`);
    private prevGroupButton: ButtonBuilder = BaseButtons.SecondaryButton(`gPrev`, `Озвучка`);

    protected setButtomCommands() {
        this.buttonCommands = {
            "prev": this.previousPage,
            "gPrev": this.previousGroup,
            "sub": async () => { await APIRequestService.FollowAnime(this.discordId, this.animeToFollow.id, this.groupToFollow.name, this.groupFollowType) },
            "unsub": async () => { await APIRequestService.UnfollowAnime(this.discordId, this.animeToFollow.id, this.groupToFollow.name); },
            "gNext": this.nextGroup,
            "next": this.nextPage,
        }
    }

    protected setButtonsState() {
        this.setComponents();
        this.prevButton.setDisabled(false);
        this.nextButton.setDisabled(false);
        this.prevGroupButton.setLabel(this.prevGroupToFollow?.name ?? `Нет озвучки`).setDisabled(this.groups.length === 0);
        this.nextGroupButton.setLabel(this.nextGroupToFollow?.name ?? `Нет озвучки`).setDisabled(this.groups.length === 0);
        this.subscribeButton
            .setCustomId(`sub`)
            .setLabel(`Подписаться (${this.groupToFollow?.name ?? ``})`)

        if (this.animeToFollow.follows.filter(follow => follow.translation.groupId === this.groupToFollow.id).length > 0) {
            this.subscribeButton
                .setCustomId(`unsub`)
                .setLabel(`Отписаться (${this.groupToFollow?.name ?? ``})`);
        }

        if (this.currentPage <= 1) {
            this.prevButton.setDisabled(true);
        }

        if (this.currentPage * this.pageLimit >= this.listLength || this.listLength <= this.pageLimit) {
            this.nextButton.setDisabled(true);
        }
    }

    protected setComponents(): void {
        if (!this.groupToFollow || this.animeToFollow.status === AnimeStatuses.Released){
            this.components = [this.prevButton, this.nextButton];
            return;
        }
        if (this.groups.length <= 1) {
            this.components = [this.prevButton, this.subscribeButton, this.nextButton];
            return;
        } 
        if (this.groups.length <= 2) {
            this.components = [this.prevButton, this.subscribeButton, this.nextGroupButton, this.nextButton];
            return;
        } 
        this.components = [this.prevButton, this.prevGroupButton, this.subscribeButton, this.nextGroupButton, this.nextButton];
    }

    protected async updateListData(page: number) {
        await super.updateListData(page);
        const { id, slug } = this.list.at(0) as Anime;
        this.animeToFollow = await APIRequestService.GetSingleAnimeFullInfo(this.discordId, slug);
        if (this.animeToFollow && id !== this.animeToFollow.id) {
            this.currentGroupIndex = 0;
        }
        this.groups = this.animeToFollow.animeTranslations.map(translation => translation.group);
        this.prevGroupToFollow = this.groups.at((this.currentGroupIndex - 1) % this.groups.length);
        this.groupToFollow = this.groups.at(this.currentGroupIndex);
        this.nextGroupToFollow = this.groups.at((this.currentGroupIndex + 1) % this.groups.length);
        this.groupFollowType = this.animeToFollow.status === AnimeStatuses.Announced ? FollowTypes.Announcement : FollowTypes.Follow;
    }

    private async nextGroup() {
        this.currentGroupIndex += 1;
    }

    private async previousGroup() {
        this.currentGroupIndex -= 1;
    }
}