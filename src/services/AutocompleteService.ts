import { Playlist } from "@prisma/client";
import { SearchResult } from "lavalink-client/dist/types";

export default class AutocompleteService {
    static acTrackMap = new Map();
    static plMap = new Map();

    public static SetSearchResultMap(userId: string, res: SearchResult) {
        if (this.acTrackMap.has(`${userId}_timeout`))
            clearTimeout(this.acTrackMap.get(`${userId}_timeout`));
        this.acTrackMap.set(`${userId}_res`, res);
        this.acTrackMap.set(`${userId}_timeout`, setTimeout(() => {
            this.acTrackMap.delete(`${userId}_res`);
            this.acTrackMap.delete(`${userId}_timeout`);
        }, 25000));
    }


    public static GetSearchResultMap(userId: string) {
        let mapRes;
        if (this.acTrackMap.has(`${userId}_res`))
            mapRes = this.acTrackMap.get(`${userId}_res`);
        if (this.acTrackMap.has(`${userId}_timeout`))
            clearTimeout(this.acTrackMap.get(`${userId}_timeout`));
        this.acTrackMap.delete(`${userId}_res`);
        this.acTrackMap.delete(`${userId}_timeout`);
        return mapRes;
    }

    public static SetPlaylistMap(userId: string, playlists: Playlist[]) {
        if (this.plMap.has(`${userId}_playlist_timeout`))
            clearTimeout(this.plMap.get(`${userId}_playlist_timeout`));
        this.plMap.set(`${userId}_playlist`, playlists);
        this.plMap.set(`${userId}_playlist_timeout`, setTimeout(() => {
            this.plMap.delete(`${userId}_playlist`);
            this.plMap.delete(`${userId}_playlist_timeout`);
        }, 25000));
    }

    public static GetPlaylistMap(userId: string) {
        let mapRes;
        if (this.plMap.has(`${userId}_playlist`))
            mapRes = this.plMap.get(`${userId}_playlist`);
        if (this.plMap.has(`${userId}_playlist_timeout`))
            clearTimeout(this.plMap.get(`${userId}_playlist_timeout`));
        this.plMap.delete(`${userId}_playlist`);
        this.plMap.delete(`${userId}_playlist_timeout`);
        return mapRes;
    }
}	