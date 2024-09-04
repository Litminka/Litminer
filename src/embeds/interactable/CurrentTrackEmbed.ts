import { EmbedBuilder, InteractionResponse, ComponentType, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonComponentData, DiscordjsError, DiscordjsErrorCodes, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction, Interaction } from "discord.js";
import BaseError from "../../errors/BaseError";
import BaseEmbeds from "../BaseEmbeds";
import { LitminerDebug } from "../../utils/LitminerDebug";
import { Player, Track as LVTrack } from "lavalink-client";
import ActionRow, { ActionRowExecuteParameters } from "../actionRow/ActionRow";
import AudioService, { SeekOptions } from "../../services/AudioService";
import ActionRowPrimaryButton from "../buttons/ActionRowPrimaryButton";
import ActionRowSecondaryButton from "../buttons/ActionRowSecondaryButton";
import { delay } from "../../utils/time";
import { Playlist, Track } from "@prisma/client";
import prisma from "../../db";

export type listCallback = (userId: string, page: number, pageLimit: number, ...params: unknown[]) => Promise<{
    list: unknown[],
    count: number
}>

export type renderEmbedCallBack = (data: unknown) => EmbedBuilder[]

export interface EmbedData {
    userId: string,
    listLength?: number,
    list?: unknown[],
    object?: unknown
}

export default class CurrentTrackEmbed {
    protected userDiscordId = ``;
    protected player: Player = null;
    protected currentTrack: LVTrack = null;
    protected renderEmbedsCallback: renderEmbedCallBack = null;
    protected rows: ActionRow[] = [];
    protected params: unknown[] = [];

    private playlistConfirmationMessage = `DELETE`;

    protected response: InteractionResponse;

    private _currentPlaylistIndex = 0;
    private set currentPlaylistIndex(index: number) {
        if (index < 0) index = this.playlists.length - 1;
        this._currentPlaylistIndex = index % this.playlists.length;

    }
    private get currentPlaylistIndex(): number {
        return this._currentPlaylistIndex;
    }

    protected playlists: Playlist[] = [];
    protected prevSelectablePlaylist: Playlist = null;
    protected selectedPlaylist: Playlist = null;
    protected selectedPlaylistTracks: Track[] = [];
    protected nextSelectablePlaylist: Playlist = null;

    private playlistNameTextInput = new TextInputBuilder().setCustomId(`plName`).setLabel(`Введите название нового плейлиста`).setStyle(TextInputStyle.Short);
    private playlistNameActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(this.playlistNameTextInput);
    private playlistNameModal = new ModalBuilder().setTitle(`Создание плейлиста`).addComponents(this.playlistNameActionRow);

    private playlistDeleteTextInput = new TextInputBuilder().setCustomId(`plDInput`).setLabel(`Введите ${this.playlistConfirmationMessage} для удаления`).setStyle(TextInputStyle.Short);
    private playlistDeleteActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(this.playlistDeleteTextInput);
    private playlistDeleteModal = new ModalBuilder().setTitle(`Удаление плейлиста`).addComponents(this.playlistDeleteActionRow);

    private backSkipButton = ActionRowSecondaryButton.createButton("bskip",
        async () => {
            await AudioService.skip(this.player, -1)
        },
        { emoji: `⏮️` } as ButtonComponentData
    );

    private toStartButton = ActionRowSecondaryButton.createButton("toStart",
        async () => {
            await AudioService.seek(this.player, { position: 0 } as SeekOptions)
        },
        { emoji: `⏮️` } as ButtonComponentData
    );

    private backSeekButton = ActionRowSecondaryButton.createButton("bseek",
        async () => {
            await AudioService.seek(this.player, { rewind: -5 } as SeekOptions)
        },
        { emoji: `⏪` } as ButtonComponentData
    );

    private pauseButton = ActionRowPrimaryButton.createButton("pause",
        async () => {
            await AudioService.pause(this.player)
        },
        { emoji: `⏸` } as ButtonComponentData
    );

    private unpauseButton = ActionRowPrimaryButton.createButton("unpause",
        async () => {
            await AudioService.resume(this.player)
        },
        { emoji: `▶️` } as ButtonComponentData
    );

    private forwardSeekButton = ActionRowSecondaryButton.createButton("fseek",
        async () => {
            await AudioService.seek(this.player, { rewind: 5 } as SeekOptions)
        },
        { emoji: `⏩` } as ButtonComponentData
    );

    private forwardSkipButton = ActionRowSecondaryButton.createButton("fskip",
        async () => {
            await AudioService.skip(this.player, 1)
        },
        { emoji: `⏭️` } as ButtonComponentData
    );

    private trackComponents = new ActionRow().addButtons([
        this.backSkipButton,
        this.toStartButton.hide(),
        this.backSeekButton,
        this.pauseButton,
        this.unpauseButton.hide(),
        this.forwardSeekButton,
        this.forwardSkipButton
    ]);

    private prevPlaylistButton = ActionRowSecondaryButton.createButton("plPrev",
        async () => {
            this.prevPlaylist();
        },
        { label: `Предыдущий плейлист` } as ButtonComponentData
    );

    private nextPlaylistButton = ActionRowSecondaryButton.createButton("plNext",
        async () => {
            this.nextPlaylist();
        },
        { label: `Следующий плейлист` } as ButtonComponentData
    );

    private addTrackButton = ActionRowPrimaryButton.createButton("tAdd",
        async ({ track }) => {
            await prisma.playlist.addTracks(this.selectedPlaylist, [track]);
        },
        { label: `Добавить в плейлист` } as ButtonComponentData
    );

    private removeTrackButton = ActionRowPrimaryButton.createButton("tRemove",
        async ({ track }) => {
            await prisma.playlist.removeTracks(this.selectedPlaylist, [track]);
        },
        { label: `Удалить из плейлиста` } as ButtonComponentData
    );

    private createPlaylistButton = ActionRowSecondaryButton.createButton("plCreate",
        async ({ track, interaction }) => {
            await this.createPlaylist({ track, interaction } as ActionRowExecuteParameters)
        },
        { label: `Создать плейлист` } as ButtonComponentData
    ).undeferInteraction();

    private deletePlaylistButton = ActionRowSecondaryButton.createButton("plDelete",
        async ({ track, interaction }) => {
            await this.deletePlaylist({ track, interaction } as ActionRowExecuteParameters)
        },
        { label: `Удалить плейлист` } as ButtonComponentData
    ).undeferInteraction();

    private playlistComponents = new ActionRow().addButtons([
        this.createPlaylistButton,
        this.prevPlaylistButton,
        this.addTrackButton,
        this.removeTrackButton.hide(),
        this.nextPlaylistButton,
        this.deletePlaylistButton
    ]);

    constructor({ userId, object }: EmbedData, renderEmbedCallBack: renderEmbedCallBack, ...params: unknown[]) {
        this.renderEmbedsCallback = renderEmbedCallBack;
        this.userDiscordId = userId;
        this.params = params;
        this.player = object as Player;
        this.currentTrack = this.player.queue.current;
    }

    public async initialize() {
        await this.updatePlaylistData()
        this.setActionRows();
        this.setButtonsState();
    }

    protected setActionRows() {
        this.rows = [this.trackComponents, this.playlistComponents];
    }

    protected async updatePlaylistData() {
        this.playlists = await prisma.playlist.getPlaylists(this.userDiscordId);

        this.prevSelectablePlaylist = this.playlists.at((this.currentPlaylistIndex - 1) % this.playlists.length);
        this.selectedPlaylist = this.playlists.at(this.currentPlaylistIndex);
        this.selectedPlaylistTracks = (await prisma.playlist.getTracks(this.selectedPlaylist))?.tracks ?? [];
        this.nextSelectablePlaylist = this.playlists.at((this.currentPlaylistIndex + 1) % this.playlists.length);
    }

    public renderMessage() {
        return {
            embeds: this.renderEmbedsCallback(this.player),
            components: this.getActionRows()
        }
    }

    public async createResponseCollector(response: InteractionResponse) {
        this.response = response;
        this.playlistNameModal.setCustomId(`plModal-${this.userDiscordId}`);
        this.playlistDeleteModal.setCustomId(`plDModal-${this.userDiscordId}`);

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
                await actionRow.execute(buttonId, { track: this.currentTrack, interaction: buttonInteraction });

                await this.updatePlaylistData();
                this.setButtonsState();

                const embeds = this.renderEmbedsCallback(this.player);

                return await response.edit({
                    embeds,
                    components: this.getActionRows()
                });
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

        while (this.player.playing && this.currentTrack == this.player.queue.current) {
            delay(500);
            await response.edit({
                embeds: this.renderEmbedsCallback(this.player)
            })
        }
        return collector;
    }

    protected getButtonId(button: ButtonInteraction) {
        const selection = button.customId;
        return selection;
    }

    protected findActionRow(buttonId: string): ActionRow {
        return this.rows.filter(row => row.find(buttonId)).at(0);
    }

    protected setButtonsState() {
        this.trackComponents.showButton(this.backSkipButton.id);
        this.trackComponents.showButton(this.pauseButton.id);
        this.trackComponents.hideButton(this.unpauseButton.id);
        this.trackComponents.hideButton(this.toStartButton.id);
        this.trackComponents.enableButton(this.forwardSkipButton.id);
        this.trackComponents.showButton(this.backSkipButton.id);

        if (this.player.paused) {
            this.trackComponents.hideButton(this.pauseButton.id);
            this.trackComponents.showButton(this.unpauseButton.id);
        }
        if (this.player.position >= 5000) {
            this.trackComponents.hideButton(this.backSkipButton.id);
            this.trackComponents.showButton(this.toStartButton.id);
        }
        if (this.player.queue.tracks.length == 0)
            this.trackComponents.disableButton(this.forwardSkipButton.id);

        this.playlistComponents.showButton(this.prevPlaylistButton.id);
        this.playlistComponents.showButton(this.addTrackButton.id);
        this.playlistComponents.enableButton(this.addTrackButton.id);
        this.playlistComponents.hideButton(this.removeTrackButton.id);
        this.playlistComponents.showButton(this.nextPlaylistButton.id);
        if (!this.selectedPlaylist) {
            this.playlistComponents.hideButton(this.addTrackButton.id);
            this.playlistComponents.hideButton(this.removeTrackButton.id);
        }
        this.addTrackButton.changeName(`Добавить в \`${this.selectedPlaylist?.name}\``);
        this.removeTrackButton.changeName(`Удалить из \`${this.selectedPlaylist?.name}\``);
        this.nextPlaylistButton.changeName(this.nextSelectablePlaylist?.name ?? `Нет плейлистов`).changeEmoji(`➡️`);
        this.prevPlaylistButton.changeName(this.prevSelectablePlaylist?.name ?? `Нет плейлистов`).changeEmoji(`⬅️`);
        this.deletePlaylistButton.changeName(`Удалить \`${this.selectedPlaylist?.name}\``)
        if (this.playlists.length === 0) {
            this.playlistComponents.hideButton(this.deletePlaylistButton.id);
        }
        if (this.playlists.length <= 2) {
            this.playlistComponents.hideButton(this.prevPlaylistButton.id);
        }
        if (this.playlists.length <= 1) {
            this.playlistComponents.hideButton(this.nextPlaylistButton.id);
        }
        if (this.selectedPlaylistTracks.length !== 0 && this.selectedPlaylistTracks.filter(track => track.url === this.currentTrack.info.uri).length !== 0) {
            this.playlistComponents.hideButton(this.addTrackButton.id);
            this.playlistComponents.showButton(this.removeTrackButton.id);
        }
    }

    protected getActionRows() {
        return this.rows.map(row => row.createActionRow());
    }

    private async createPlaylist({ interaction: buttonInteraction }: ActionRowExecuteParameters) {
        await (buttonInteraction as ButtonInteraction).showModal(this.playlistNameModal);

        const filter = (i: ModalSubmitInteraction) => i.customId === `plModal-${this.userDiscordId}`

        try {
            const modalSubmit = await (buttonInteraction as ButtonInteraction).awaitModalSubmit({ filter, time: 30000 });
            const playlistName = modalSubmit.fields.getTextInputValue(this.playlistNameTextInput.data.custom_id);
            await prisma.playlist.createPlaylist(playlistName, this.userDiscordId);

            await modalSubmit.reply({
                ephemeral: true,
                embeds: [BaseEmbeds.Success(`Плейлист ${playlistName} успешно создан.`)]
            })
        }
        catch (error) {
            if (!(error instanceof DiscordjsError)) return;
            let message: string = error.message;
            if (error.code === DiscordjsErrorCodes.InteractionCollectorError)
                message = `Время действия модального окна истекло`;
            await (this.response.interaction as ChatInputCommandInteraction).followUp({
                ephemeral: true,
                embeds: [BaseEmbeds.Error(`${message}`)]
            })
        }
    }

    private async deletePlaylist({ interaction: buttonInteraction }: ActionRowExecuteParameters) {
        await (buttonInteraction as ButtonInteraction).showModal(this.playlistDeleteModal);

        const filter = (i: ModalSubmitInteraction) => i.customId === `plDModal-${this.userDiscordId}`;

        try {
            const modalSubmit = await (buttonInteraction as ButtonInteraction).awaitModalSubmit({ filter, time: 30000 });
            const confirmationMessage = modalSubmit.fields.getTextInputValue(this.playlistDeleteTextInput.data.custom_id);
            if (this.playlistConfirmationMessage === confirmationMessage.toUpperCase()) {
                await prisma.playlist.deletePlaylist(this.selectedPlaylist.id, this.userDiscordId);
                return await modalSubmit.reply({
                    ephemeral: true,
                    embeds: [BaseEmbeds.Success(`Плейлист ${this.selectedPlaylist.name} успешно удален.`)]
                })
            }

            await modalSubmit.reply({
                ephemeral: true,
                embeds: [BaseEmbeds.Error(`Удаление прервано. Подтверждение не было получено`)]
            })
        }
        catch (error) {
            if (!(error instanceof DiscordjsError)) return;
            let message: string = error.message;
            if (error.code === DiscordjsErrorCodes.InteractionCollectorError)
                message = `Время действия модального окна истекло`;
            await (this.response.interaction as ChatInputCommandInteraction).followUp({
                ephemeral: true,
                embeds: [BaseEmbeds.Error(`${message}`)]
            })
        }
    }

    private prevPlaylist() {
        this.currentPlaylistIndex -= 1;
    }

    private nextPlaylist() {
        this.currentPlaylistIndex += 1;
    }
}
