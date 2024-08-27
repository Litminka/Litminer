import { Client, GatewayIntentBits, Partials } from "discord.js";
import { promisify } from "util";
import glob from "glob";
import { LavalinkManager, MiniMap } from "lavalink-client";
import { Command, SubCommand, Event } from "../typings/client";
import { RedisClientType, createClient } from "redis";
import { NodesEvents } from "../lavalink-events/nodes";
import { PlayerEvents } from "../lavalink-events/player";
import { myCustomStore, myCustomWatcher } from "../utils/CustomClasses";
import { LitminerDebug } from "../utils/LitminerDebug";
import { requesterTransformer, autoPlayFunction } from "../utils/OptionalFunctions";


const globPromise = promisify(glob);

export class BotClient extends Client {
    lavalink: LavalinkManager;
    commands: MiniMap<string, Command | SubCommand>;
    redis: RedisClientType;
    defaultVolume: number;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.DirectMessages
            ],
            partials:[
                Partials.Channel
            ]
        });

        this.commands = new MiniMap();

        this.redis = createClient({
            socket: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT)
            }
        });
        this.redis.connect().catch(error => LitminerDebug.Error(error.message));

        this.LoadLavalink();
        this.RegisterModules();
        this.login(process.env.DISCORD_BOT_TOKEN);
    }

    private async LoadLavalink() {
        this.lavalink = new LavalinkManager({
            nodes: [
                {
                    authorization: "lava",
                    host: "localhost",
                    port: 2333,
                    id: "litminer_v2",
                    requestSignalTimeoutMS: 3000,
                }
            ],
            sendToShard: (guildId, payload) => this.guilds.cache.get(guildId)?.shard?.send(payload),
            autoSkip: true,
            client: { 
                id: process.env.DISCORD_BOT_ID, 
                username: "LitminerV2-Testing"
            },
            playerOptions: {
                applyVolumeAsFilter: false,
                clientBasedPositionUpdateInterval: 50, 
                defaultSearchPlatform: "ytmsearch",
                volumeDecrementer: 0.75, // on client 100% == on lavalink 75%
                requesterTransformer: requesterTransformer,
                onDisconnect: {
                    autoReconnect: false, 
                    destroyPlayer: true
                },
                onEmptyQueue: {
                    destroyAfterMs: 1000, // 0 === instantly destroy | don't provide the option, to don't destroy the player
                    autoPlayFunction: autoPlayFunction,
                },
                useUnresolvedData: false
            },
            queueOptions: {
                maxPreviousTracks: 10,
                queueStore: new myCustomStore(this.redis),
                queueChangesWatcher: new myCustomWatcher(this)
            },
            linksBlacklist: [],
            linksWhitelist: [],
            advancedOptions: {
                debugOptions: {
                    noAudio: true,
                    playerDestroy: {
                        dontThrowError: false,
                        debugLog: false
                    }
                }
            }
        });
    }

    public async Disconnect(){
        LitminerDebug.Special(`Destroying players`);
        this.lavalink.players.forEach( async (player) =>{
            await player.destroy();
        })
        LitminerDebug.Special(`Disconnecting lavalink`);
        await this.lavalink.nodeManager.disconnectAll();
        LitminerDebug.Special(`Disconnecting redis`);
        await this.redis.quit();
        LitminerDebug.Special(`Disconnecting bot`);
        await this.destroy();
    }

    private async ImportFile(path: string) {
        return (await import(path))?.default;
    }

    private async RegisterModules() {
        await this.RegisterCommands();
        await this.RegisterLavalinkEvents();
        await this.RegisterEvents();
    }

    private async RegisterCommands(){
        const CommandFiles = await globPromise(`${__dirname}/../Commands/**/*{.ts,.js}`);
        
        CommandFiles.forEach(async (FilePath) => {
            const command = await this.ImportFile(FilePath) as Command;
            
            if (!command.data || !command.execute) { 
                LitminerDebug.Warning(`The Command ${command} is missing a required "data" or "execute" property.`)
                return;
            }
            LitminerDebug.Info(`Loaded command ${command.data.name}`);

            this.commands.set(command.data.name, command);
        });
    }

    private async RegisterLavalinkEvents() {
        NodesEvents(this);
        PlayerEvents(this);
    }

    private async RegisterEvents(){
        const EventFiles = await globPromise(`${__dirname}/../Events/**/*{.ts,.js}`);

        EventFiles.forEach(async (FilePath) => {
            const event: Event = await this.ImportFile(FilePath) as Event;
            if (!event.name || !event.execute) {
                LitminerDebug.Warning(`The Event ${event} is missing a required "name" or "execute" property.`)
                return;
            }
            LitminerDebug.Info(`Loaded event ${event.name}`);

            this.on(event.name, event.execute.bind(null, this));
        });
    }
}