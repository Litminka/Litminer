import { createClient } from "redis";
let client = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    }
});;

(async function createRedis(){
    client.connect();
})();

export default class AudioQueueService{

    public static async resetQueue(guildId: string){
        this.setQueue(guildId, {
            currentTrack: null,
            elapsed: 0,
            queue: [],
            mode: MusicQueueMode.Standart
        })
    }

    public static async setQueue(guildId: string, musicQueue: MusicQueue): Promise<void>{
        const { currentTrack, elapsed, queue, mode } = musicQueue;
        await client.set(`${guildId}:queue`, JSON.stringify({ queue, mode }));
        await client.set(`${guildId}:current`, JSON.stringify(currentTrack));
        await client.set(`${guildId}:elapsed`, elapsed);
    }

    public static async getQueue(guildId: string): Promise<MusicQueue>{
        
        const resQueue = await client.get(`${guildId}:queue`);
        const {queue, mode} = JSON.parse(resQueue);
        const current = await client.get(`${guildId}:current`);
        const parsedCurrent = JSON.parse(current);
        const elapsed = await client.get(`${guildId}:elapsed`);
        const musicQueue: MusicQueue = {
            currentTrack: parsedCurrent,
            elapsed: Number(elapsed),
            queue,
            mode
        }
        return musicQueue;
    }

    public static async setCurrent(guildId: string, song: Song): Promise<void>{
        await client.set(`${guildId}:current`, JSON.stringify(song));
    }

    public static async getCurrent(guildId: string): Promise<Song>{
        const current = await client.get(`${guildId}:current`);
        const parsedCurrent = JSON.parse(current);
        return parsedCurrent;
    }

    public static async getNext(guildId: string): Promise<Song>{
        const current = await this.getCurrent(guildId);
        const resQueue = await client.get(`${guildId}:queue`);
        const {queue, mode}: {queue: Song[], mode: MusicQueueMode} = JSON.parse(resQueue);
        if (!current) return queue[0] ?? null;
        if (current.id >= 0){
            return queue.find((song) => song.id == current.id + 1);
        }
    }

    public static async addToQueue(guildId: string, url: string): Promise<void>{
        const queue = await this.getQueue(guildId);
        //console.log(queue);
        const id = queue.queue.length ? queue.queue[queue.queue.length - 1].id + 1 : 0;
        queue.queue.push({ url, name: "", id, length: 0, preview: "" });
        await this.setQueue(guildId, queue);
    }
}

export interface MusicQueue {
    currentTrack: Song | null,
    elapsed: number
    queue: Song[],
    mode: MusicQueueMode,
}

export interface Song {
    name: string,
    preview: string,
    length: number,
    url: string,
    id: number,
}

export enum MusicQueueMode {
    Standart,
    Repeat,
    RepeatSingle,
    Shuffle
}