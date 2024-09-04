import { SearchResult } from "lavalink-client/dist/types";

export default class AutocompleteService {
    static autocompleteMap = new Map();

    public static SetSearchResultMap(userId: string, res: SearchResult) {
        if (this.autocompleteMap.has(`${userId}_timeout`))
            clearTimeout(this.autocompleteMap.get(`${userId}_timeout`));
        this.autocompleteMap.set(`${userId}_res`, res);
        this.autocompleteMap.set(`${userId}_timeout`, setTimeout(() => {
            this.autocompleteMap.delete(`${userId}_res`);
            this.autocompleteMap.delete(`${userId}_timeout`);
        }, 25000));
    }

    public static GetSearchResultMap(userId: string) {
        let mapRes;
        if (this.autocompleteMap.has(`${userId}_res`))
            mapRes = this.autocompleteMap.get(`${userId}_res`);
        if (this.autocompleteMap.has(`${userId}_timeout`))
            clearTimeout(this.autocompleteMap.get(`${userId}_timeout`));
        this.autocompleteMap.delete(`${userId}_res`);
        this.autocompleteMap.delete(`${userId}_timeout`);
        return mapRes;
    }
}