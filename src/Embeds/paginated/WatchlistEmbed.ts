import PaginatedEmbed, { PaginatedEmbedType } from "./PaginatedEmbed";

export default class WatchlistEmbed extends PaginatedEmbed {

    constructor(userId: string) {
        super(userId, PaginatedEmbedType.WatchList);
    }

}