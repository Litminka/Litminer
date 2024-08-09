import { Command } from "../../typings/Client";
import AudioService, { SeekOptions } from "../../services/AudioService";
import { ActionRowBuilder, ButtonBuilder, ComponentType, SlashCommandBuilder } from "discord.js";
import { delay } from "../../utils/Time";
import MusicEmbeds from "../../embeds/MusicEmbeds";
import NotPlayingError from "../../errors/playerErrors/NotPlayingError";
import BaseButtons from "../../embeds/buttons/BaseButons";

export default {
    data: new SlashCommandBuilder()
        .setName("current")
        .setDescription("Current track")
        .setDescriptionLocalization("ru", "Текущий трек"),
    execute: async ({ client, interaction }) => {
        await AudioService.validateConnection({ client, interaction })
        const player = client.lavalink.getPlayer(interaction.guildId);

        const lskip = BaseButtons.SecondaryButton("lskip", "5 sec", `⏪`);
        const pause = BaseButtons.PrimaryButton("pause", "Pause", `⏸`);
        const rskip = BaseButtons.SecondaryButton("rskip", "5 sec", `⏩`);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(lskip, pause, rskip);

        if (!player.queue.current) throw new NotPlayingError();
        const current = player.queue.current;
        const reply = await interaction.reply({
            //ephemeral: true,
            embeds: [
                MusicEmbeds.Current(player)
            ],
            components: [row]
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: player.queue.current.info.duration,
        });


        collector.on("collect", async (button) => {
            button.deferUpdate();
            const selection = button.customId;
            console.log(`${selection} pressed`);
            let [lskip_component, pause_component, rskip_component] = row.components;

            const commands = {
                "lskip": async () => await AudioService.seek(player, { rewind: -5, position: null } as SeekOptions),
                "rskip": async () => await AudioService.seek(player, { rewind: 5, position: null } as SeekOptions),
                "pause": async () => {
                    console.log(`In pause`)
                    await AudioService.pause(player);
                    pause_component
                        .setCustomId("unpause")
                        .setEmoji("▶️")
                        .setLabel("Resume");
                },
                "unpause": async () => {
                    console.log(`In resume`)
                    await AudioService.resume(player);
                    pause_component
                        .setCustomId("pause")
                        .setEmoji(`⏸`)
                        .setLabel("Pause");
                }
            }

            await commands[selection]();

            return await reply.edit({
                components: [row]
            })
        })

        collector.on("end", async () => {
            row.components.forEach((button) => {
                button.setDisabled(true);
            });
            await reply.edit({
                components: [row],
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