require("dotenv").config();
import { login } from "./axios";
import { BotClient } from "./structures/BotClient";
import express, { Express, Request, Response } from 'express';
import { CustomEvents } from "./typings/Client";
import bodyParser from "body-parser";
import { LitminerDebug } from "./utils/LitminerDebug";

export const app: Express = express();
const port = 3000;
app.use(bodyParser.json())
app.post('/', (req: Request, res: Response) => {
    client.emit(CustomEvents.Announcement, req.body);
    res.send(`[LitminerV2] POST request successful`);
})

app.listen(port, () => {
    LitminerDebug.Special(`Listening on ${port}`);
})

login();
export const client = new BotClient();

process.on("SIGINT", async ()=>{
    LitminerDebug.Special(`Process stopped`);
    await client.Disconnect();
    process.exit(process.exitCode || 0);
})