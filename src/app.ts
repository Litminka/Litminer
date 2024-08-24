require("dotenv").config();
import { login } from "./axios";
import express, { Express, Request, Response } from 'express';
import bodyParser from "body-parser";
import { BotClient } from "./structures/BotClient";
import { CustomEvents } from "./typings/client";
import { LitminerDebug } from "./utils/LitminerDebug";

export const app: Express = express();
app.use(bodyParser.json())
app.post('/notify', (req: Request, res: Response) => {
    client.emit(CustomEvents.Announcement, req.body);
    res.send(`[LitminerV2] POST request successful`);
})

app.listen(process.env.DISCORD_BOT_PORT, () => {
    LitminerDebug.Special(`Listening on ${process.env.DISCORD_BOT_PORT}`);
})

login();
export const client = new BotClient();

process.on("SIGINT", async ()=>{
    LitminerDebug.Warning(`Process stopped`);
    await client.Disconnect();
    process.exit(process.exitCode || 0);
})