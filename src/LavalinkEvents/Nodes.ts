import { BotClient } from "../structures/BotClient";
import { LitminerDebug } from "../utils/LitminerDebug";


export function NodesEvents(client:BotClient) {
    /**
         * NODE EVENTS
         */
    client.lavalink.nodeManager.on("raw", (node, payload) => {
        //LitminerDebug.Debug(node.id, " :: RAW :: ", payload);
    }).on("disconnect", (node, reason) => {
        LitminerDebug.Success(`${node.id} Disconnected ${reason}`);
    }).on("connect", (node) => {
        LitminerDebug.Success(`${node.id} Connected`);
        // testPlay(client); // TEST THE MUSIC ONCE CONNECTED TO THE BOT
    }).on("reconnecting", (node) => {
        LitminerDebug.Warning(`${node.id} Reconnecting`);
    }).on("create", (node) => {
        LitminerDebug.Success(`${node.id} Created`);
    }).on("destroy", (node) => {
        LitminerDebug.Success(`${node.id} Destroyed`);
    }).on("error", (node, error, payload) => {
        LitminerDebug.Error(`${node.id} [${error}], Payload - ${payload}`);
    }).on("resumed", (node, payload, players) => {{
        LitminerDebug.Success(`${node.id} Resumed ${players.length} players still playing, Payload - ${payload}`);
        LitminerDebug.Debug(`${players}`);
    }});
}