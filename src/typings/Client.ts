import {
    AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder,
    SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from "discord.js";
import { BotClient } from "../structures/BotClient";
import { Track, UnresolvedTrack } from "lavalink-client";

export interface ExecuteOptions {
    client: BotClient;
    interaction: ChatInputCommandInteraction<"cached">;
}

interface AutocompleteOptions {
    client: BotClient;
    interaction: AutocompleteInteraction;
}

type ExecuteFunction = (options: ExecuteOptions) => any;
type AutocompleteFunction = (options: AutocompleteOptions) => any;

export interface Command {
    data: SlashCommandBuilder;
    execute: ExecuteFunction;
    autocomplete?: AutocompleteFunction;
}

export interface CustomRequester {
    id: string,
    username: string,
    avatar?: string,
}

type subCommandExecute = { [subCommandName: string]: ExecuteFunction };
type subCommandAutocomplete = { [subCommandName: string]: AutocompleteFunction };
export interface SubCommand {
    data: SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: subCommandExecute;
    autocomplete?: subCommandAutocomplete;
}

export interface Event {
    name: string,
    execute: (client: BotClient, ...params: any) => any;
}

export interface EmbededTrack {
    track: Track | UnresolvedTrack,
    isCurrent: boolean,
    position: number
}

export enum CustomEvents {
    Announcement = "announcement",
}

export interface AnimeAnnouncement {
    animeName: string,
    groupType?: GroupType, 
    groupName?: string,
    episode: number,
    maxEpisodes: number,
    notificationType: NotifyStatuses,
    slug: string,
    image: string,
    userIds: number[]
}

export enum NotifyStatuses {
    AnimeRelease = 'anime_released',
    EpisodeRelease = 'episode_released',
    FinalEpisodeReleased = 'final_episode_released'
}

export enum GroupType{
    Voice = "voice",
    Subtitles = "subtitles"
}