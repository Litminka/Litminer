import { Command } from "../../typings/client";
import AudioService, { SeekOptions } from "../../services/AudioService";
import { ActionRowBuilder, ButtonBuilder, ComponentType, DiscordjsError, DiscordjsErrorCodes, Interaction, InteractionCollector, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { delay } from "../../utils/time";
import MusicEmbeds from "../../embeds/MusicEmbeds";
import NotPlayingError from "../../errors/player/NotPlayingError";
import BaseButtons from "../../embeds/buttons/BaseButtons";
import { LitminerDebug } from "../../utils/LitminerDebug";
import play from "./play";
import BaseEmbeds from "../../embeds/BaseEmbeds";

export default {
    data: new SlashCommandBuilder()
        .setName("current")
        .setDescription("Current track")
        .setDescriptionLocalization("ru", "Текущий трек"),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })
        const player = client.lavalink.getPlayer(interaction.guildId);

        const bskipButton = BaseButtons.SecondaryButton("bskip", null, `⏮️`);
        const lseekButton = BaseButtons.SecondaryButton("lseek", null, `⏪`);
        const pauseButton = BaseButtons.PrimaryButton("pause", null, `⏸`);
        const rseekButton = BaseButtons.SecondaryButton("rseek", null, `⏩`);
        const fskipButton = BaseButtons.SecondaryButton("fskip", null, `⏭️`);

        const trackComponents = [bskipButton, lseekButton, pauseButton, rseekButton, fskipButton];

        const createListButton = BaseButtons.SecondaryButton("plCreate", `Создать плейлист`);
        const prevPlaylistButton = BaseButtons.SecondaryButton("plPrev", "Предыдущий плейлист");
        const addTrackButton = BaseButtons.PrimaryButton("tAdd", `Добавить в плейлист`);
        const nextPlaylistButton = BaseButtons.SecondaryButton("plNext", "Следующий плейлист");

        const playlistComponents = [createListButton, prevPlaylistButton, addTrackButton, nextPlaylistButton];

        const playlistNameTextInput = new TextInputBuilder().setCustomId(`plName`).setLabel(`Введите название нового плейлиста`).setStyle(TextInputStyle.Short);
        const playlistNameActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(playlistNameTextInput);
        const playlistNameModal = new ModalBuilder().setCustomId(`plModal`).setTitle(`Создание плейлиста`).addComponents(playlistNameActionRow);

        bskipButton.setCustomId("bskip");
        pauseButton.setCustomId("pause").setEmoji(`⏸`);
        fskipButton.setDisabled(false);

        if (player.paused) {
            pauseButton.setCustomId("unpause").setEmoji(`▶️`);
        }
        if (player.position >= 5000)
            bskipButton.setCustomId("tostart");

        if (player.queue.tracks.length == 0)
            fskipButton.setDisabled(true);


        if (!player.queue.current) throw new NotPlayingError();
        const current = player.queue.current;
        const reply = await interaction.reply({
            //ephemeral: true,
            embeds: [
                MusicEmbeds.Current(player)
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(trackComponents),
                new ActionRowBuilder<ButtonBuilder>().addComponents(playlistComponents)
            ]
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: player.queue.current.info.duration,
        });


        collector.on("collect", async (button) => {
            const selection = button.customId;
            if (selection !== `plCreate`)
                await button.deferUpdate();
            const currentTrack = player.queue.current;
            const commands = {
                "bskip": async () => { await AudioService.skip(player, -1) },
                "tostart": async () => { await AudioService.seek(player, { position: 0 } as SeekOptions) },
                "fskip": async () => { await AudioService.skip(player, 1) },
                "lseek": async () => { await AudioService.seek(player, { rewind: -5 } as SeekOptions) },
                "rseek": async () => { await AudioService.seek(player, { rewind: 5 } as SeekOptions) },
                "pause": async () => { await AudioService.pause(player) },
                "unpause": async () => { await AudioService.resume(player) },

                "tAdd": async () => { LitminerDebug.Debug(`${currentTrack.info.title} need to add to playlist`); },
                "tRemove": async () => { LitminerDebug.Debug(`${currentTrack.info.title} need to remove from playlist`); },
                "plCreate": async () => { 
                    await button.showModal(playlistNameModal);
                    const filter = (i: ModalSubmitInteraction) => i.customId === `plModal`;
                    
                    try {
                        const modalSubmit = await button.awaitModalSubmit({filter, time: 2000});
                        const playlistName = modalSubmit.fields.getTextInputValue(playlistNameTextInput.data.custom_id);
                        await interaction.followUp({
                            ephemeral: true,
                            embeds: [BaseEmbeds.Success(`Плейлист ${playlistName} успешно создан.`)]
                        })
                    }
                    catch (error){
                        if (!(error instanceof DiscordjsError)) return;
                        let message: string;
                        if (error.code === DiscordjsErrorCodes.InteractionCollectorError)
                            message = `Время действия модального окна истекло`;
                        else message = error.message;
                        await interaction.followUp({
                            ephemeral: true,
                            embeds: [BaseEmbeds.Error(`${message}`)]
                        })
                    }
                    
                 },
                "plNext": async () => { LitminerDebug.Debug(`Next playlist should be selected`); },
                "plPrev": async () => { LitminerDebug.Debug(`Previous playlist should be selected`); },
            }
            await commands[selection]();

            bskipButton.setCustomId("bskip");
            pauseButton.setCustomId("pause").setEmoji(`⏸`);
            fskipButton.setDisabled(false);

            if (player.paused) {
                pauseButton.setCustomId("unpause").setEmoji(`▶️`);
            }
            if (player.position >= 5000)
                bskipButton.setCustomId("tostart");

            if (player.queue.tracks.length == 0)
                fskipButton.setDisabled(true);

            return await reply.edit({
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(trackComponents),
                    new ActionRowBuilder<ButtonBuilder>().addComponents(playlistComponents)
                ]
            })
        })

        collector.on("end", async () => {
            await reply.edit({
                components: []
            });
        });

        while (player.playing && current == player.queue.current) {
            delay(500);
            await reply.edit({
                embeds: [
                    MusicEmbeds.Current(player)
                ],
            })
        }
    }
} as Command;
