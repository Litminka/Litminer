import { ButtonBuilder } from "discord.js";
import BaseButtons from "../buttons/baseButons";
import PaginatedEmbed from "./paginatedEmbed";
import { LitminerDebug } from "../../utils/litminerDebug";
import { Anime, AnimeStatuses, FollowTypes, TranslationGroup } from "../../typings/anime";
import { APIRequestService } from "../../services/apiRequestService";

export default class AnimeSearchEmbed extends PaginatedEmbed {

    protected pageLimit: number = 1;
    private animeToFollow: Anime;
    private groups: TranslationGroup[];
    private groupToFollow: TranslationGroup;
    private nextGroupToFollow: TranslationGroup;
    private prevGroupToFollow: TranslationGroup;
    private gIndex: number = 0;
    private groupCount: number = 0;

    private set groupIndex(index: number) {
        if (index < 0) index = this.groupCount - 1;
        this.gIndex = index % this.groupCount;
        
    }
    private get groupIndex(): number {
        return this.gIndex;
    }

    private subscribeButton: ButtonBuilder = BaseButtons.PrimaryButton(`sub`, `Подписаться`, `🔔`);
    private nextGroupButton: ButtonBuilder = BaseButtons.SecondaryButton(`gNext`, `Озвучка`);
    private prevGroupButton: ButtonBuilder = BaseButtons.SecondaryButton(`gPrev`, `Озвучка`);

    public async initialize() {
        await this.updateListData(1);
        this.setButtonsState();

        this.buttonCommands = {
            "prev": this.previousPage,
            "gPrev": this.previousGroup,
            "sub": this.subcribeToAnime,
            "unsub": this.unsubscribeFromAnime,
            "gNext": this.nextGroup,
            "next": this.nextPage,
        }
    }

    protected setButtonsState() {
        this.prevButton.setDisabled(false);
        this.nextButton.setDisabled(false);
        this.updateSubscribeButton(`sub`);
        this.prevGroupButton.setLabel(this.prevGroupToFollow?.name ?? `Нет озвучки`).setDisabled(this.groups.length === 0);
        this.nextGroupButton.setLabel(this.nextGroupToFollow?.name ?? `Нет озвучки`).setDisabled(this.groups.length === 0);
        this.subscribeButton.setDisabled(
            !this.groupToFollow ||
            this.animeToFollow.status === AnimeStatuses.Released
        );

        if (this.animeToFollow.follows.filter(follow => follow.translation.groupId === this.groupToFollow.id).length > 0) {
            this.updateSubscribeButton(`unsub`);
        }

        if (this.currentPage <= 1) {
            this.prevButton.setDisabled(true);
        }

        if (this.currentPage * this.pageLimit >= this.listLength || this.listLength <= this.pageLimit) {
            this.nextButton.setDisabled(true);
        }

        if (this.groups.length <= 1){
            this.components = [this.prevButton, this.subscribeButton, this.nextButton];
        } else{
            this.components = [this.prevButton, this.prevGroupButton, this.subscribeButton, this.nextGroupButton, this.nextButton];
        }
    }

    protected async updateListData(page: number) {
        await super.updateListData(page);
        const {id, slug} = this.list.at(0) as Anime;
        this.animeToFollow = await APIRequestService.GetSingleAnimeFullInfo(this.discordId, slug);
        if (this.animeToFollow && id !== this.animeToFollow.id){
            this.groupIndex = 0;
        }
        this.groups = this.animeToFollow.animeTranslations.map(translation => translation.group);
        this.groupCount = this.animeToFollow.animeTranslations.length;
        this.prevGroupToFollow = this.groups.at((this.groupIndex - 1) % this.groupCount);
        this.groupToFollow = this.groups.at(this.groupIndex);
        this.nextGroupToFollow = this.groups.at((this.groupIndex + 1) % this.groupCount);
    }

    private async subcribeToAnime() {
        const { animeTranslations } = this.animeToFollow;
        if (animeTranslations.length == 0) return LitminerDebug.Error(`Anime have no translations`);
        if (!this.animeToFollow) return LitminerDebug.Error(`Nothing to subsribe`);
        const followType = this.animeToFollow.status === AnimeStatuses.Announced ? FollowTypes.Announcement : FollowTypes.Follow;
        await APIRequestService.FollowAnime(this.discordId, this.animeToFollow.id, this.groupToFollow.name, followType);

        this.updateSubscribeButton.call(this, `unsub`);
    }

    private async unsubscribeFromAnime() {
        await APIRequestService.UnfollowAnime(this.discordId, this.animeToFollow.id, this.groupToFollow.name);

        this.updateSubscribeButton.call(this, `sub`);
    }

    private updateSubscribeButton(buttonId: string) {
        const buttonState = {
            "sub": () => this.subscribeButton.setCustomId(`sub`).setLabel(`Подписаться (${this.groupToFollow?.name ?? ``})`),
            "unsub": () => this.subscribeButton.setCustomId(`unsub`).setLabel(`Отписаться (${this.groupToFollow?.name ?? ``})`)
        }

        buttonState[buttonId]();
    }

    private async nextGroup() {
        this.groupIndex += 1;
    }

    private async previousGroup() {
        this.groupIndex -= 1;
    }

}