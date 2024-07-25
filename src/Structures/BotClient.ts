import { Client, GatewayIntentBits, IntentsBitField } from "discord.js";
import { promisify } from "util";
import glob from "glob";
import { LavalinkManager, MiniMap } from "lavalink-client";
import { Command, SubCommand, Event } from "../typings/Client";
import { RedisClientType, createClient } from "redis";
import { autoPlayFunction, requesterTransformer } from "../Utils/OptionalFunctions";
import { myCustomStore, myCustomWatcher } from "../Utils/CustomClasses";

import { NodesEvents } from "../LavalinkEvents/Nodes";
import { PlayerEvents } from "../LavalinkEvents/Player";


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
                GatewayIntentBits.GuildVoiceStates
            ]
        });

        this.commands = new MiniMap();

        this.redis = createClient({
            socket: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT)
            }
        });
        this.redis.connect();
        //this.redis.on("error", (err) => console.log('Redis Client Error', err));

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
                    // sessionId: "lsvunq8h8bxx0m9w", // add the sessionId in order to resume the session for the node, and then to recover the players listen to nodeManager#resumed.
                    requestSignalTimeoutMS: 3000,
                }
            ],
            sendToShard: (guildId, payload) => this.guilds.cache.get(guildId)?.shard?.send(payload),
            autoSkip: true,
            client: { // client: client.user
                id: process.env.DISCORD_BOT_ID, // REQUIRED! (at least after the .init)
                username: "LitminerV2-Testing"
            },
            playerOptions: {
                applyVolumeAsFilter: false,
                clientBasedPositionUpdateInterval: 50, // in ms to up-calc player.position
                defaultSearchPlatform: "ytmsearch",
                volumeDecrementer: 0.75, // on client 100% == on lavalink 75%
                requesterTransformer: requesterTransformer,
                onDisconnect: {
                    autoReconnect: false, // automatically attempts a reconnect, if the bot disconnects from the voice channel, if it fails, it get's destroyed
                    destroyPlayer: true // overrides autoReconnect and directly destroys the player if the bot disconnects from the vc
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
                    noAudio: false,
                    playerDestroy: {
                        dontThrowError: false,
                        debugLog: false
                    }
                }
            }
        });
        //console.log("lavalink connected");
    }

    public async Disconnect(){
        console.log(`disconnecting lavalink`);
        await this.lavalink.nodeManager.disconnectAll();
        console.log(`disconnecting redis`);
        await this.redis.quit();
        console.log(`disconnecting bot`);
        //await this.destroy();
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
                console.warn(`[WARNING] The Command ${command} is missing a required "data" or "execute" property.`)
                return;
            }
            console.log(`Loaded command ${command.data.name}`);

            this.commands.set(command.data.name, command);
        });
    }

    private async RegisterLavalinkEvents() {
        NodesEvents(this);
        PlayerEvents(this);
    }

    private async RegisterEvents(){
        const EventFiles = await globPromise(`${__dirname}/../Events/*{.ts,.js}`);

        EventFiles.forEach(async (FilePath) => {
            const event: Event = await this.ImportFile(FilePath) as Event;
            if (!event.name || !event.execute) {
                console.warn(`[WARNING] The Event ${event} is missing a required "name" or "execute" property.`)
                return;
            }
            console.log(`Loaded event ${event.name}`);

            this.on(event.name, event.execute.bind(null, this));
        });
    }
}