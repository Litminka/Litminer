const ytsearchapi = require("youtube-search-api");
export default class YoutubeService{

    public static async search(keywords: string, limit: number = 1): Promise<string>{
        const list= await ytsearchapi.GetListByKeyword(keywords, false, limit);
        console.log(list.items[0].id);
        return `https://www.youtube.com/watch?v=${ list.items[0].id }`;
    }
}