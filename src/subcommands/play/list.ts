import { AutocompleteOptions, ExecuteOptions } from "../../typings/client";

export async function PlayListSubcommand({client, interaction}: ExecuteOptions) {
    const listName = interaction.options.getString(`listname`) as string;
    
}

export async function PlayListSubcommandAutocomplete({client, interaction}: AutocompleteOptions) {
    const listName = interaction.options.getFocused();
}