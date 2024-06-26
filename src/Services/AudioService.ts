import { AudioPlayer, AudioPlayerStatus, VoiceConnectionConnectingState, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import ytdl from "ytdl-core";
import AudioQueueService, { MusicQueue, Song } from "./AudioQueueService";

export default class AudioService{

    public static async play(url: string, channel: VoiceBasedChannel){
        
        let connection = getVoiceConnection(channel.guildId);
        if (connection){
            const player = (<VoiceConnectionConnectingState>connection.state).subscription.player;
            if (player.state.status == AudioPlayerStatus.Playing) {
                AudioQueueService.addToQueue(channel.guildId, url);
                return;
            }
        }
        
        connection = await joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
        const player = createAudioPlayer();
        connection.subscribe(player);
        connection.on(VoiceConnectionStatus.Ready, async () => {
            await AudioQueueService.resetQueue(channel.guildId);
            await AudioQueueService.addToQueue(channel.guildId, url);
            await this.playSong(channel.guildId, player);
        });
        player.on(AudioPlayerStatus.Idle, async () => {            
            const currentSong = await AudioQueueService.getCurrent(channel.guildId);
            const nextSong = await AudioQueueService.getNext(channel.guildId);
            if (!nextSong || nextSong.id == currentSong.id){
                console.log('left channel');
                await AudioQueueService.resetQueue(channel.guildId);
                player.stop();
                connection.disconnect();
                connection.destroy();
                return;
            } 
            await this.playSong(channel.guildId, player);
        })
    }

    public static async playSong(guildId: string, player: AudioPlayer){
        const song = await AudioQueueService.getNext(guildId);
        if (!song) return false;
        const stream = ytdl(song.url, {
            filter: 'audioonly',
            dlChunkSize: 0,
            requestOptions: {
                headers:{
                    cookie: process.env.YOUTUBE_COOKIE,
                    'x-youtube-identity-token': process.env.YOUTUBE_ID_TOKEN
                }
            }
        });
        
        const audio = createAudioResource(stream);
        await AudioQueueService.setCurrent(guildId, song);
        player.play(audio);
        return true;
    }

    public static async pause(guildId: string){
        const connection = getVoiceConnection(guildId);
        const player = (<VoiceConnectionConnectingState>connection.state).subscription.player;
        
        if (player.state.status = AudioPlayerStatus.Playing){
            player.pause();
        }
    }

    public static async unpause(guildId: string){
        const connection = getVoiceConnection(guildId);
        const player = (<VoiceConnectionConnectingState>connection.state).subscription.player;
        
        if (player.state.status = AudioPlayerStatus.Paused){
            player.unpause();
        }
    }

    public static async stop(guildId: string){
        const connection = getVoiceConnection(guildId);
        const player = (<VoiceConnectionConnectingState>connection.state).subscription.player;
        
        if (player.state.status = AudioPlayerStatus.Playing){
            player.stop();
            connection.disconnect();
            connection.destroy();
        }
    }

    public static async skip(guildId: string){
        const connection = getVoiceConnection(guildId);
        const player = (<VoiceConnectionConnectingState>connection.state).subscription.player;
    }
}