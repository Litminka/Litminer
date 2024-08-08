require("dotenv").config();
import { login } from "./axios";
import { BotClient } from "./structures/BotClient";
import express, { Express, Request, Response } from 'express';
import { CustomEvents } from "./typings/Client";
import bodyParser from "body-parser";

export const app: Express = express();
const port = 3000;
app.use(bodyParser.json())
app.post('/', (req: Request, res: Response) => {
    client.emit(CustomEvents.Announcement, req.body);
    res.send(`[LitminerV2] POST request successful`);
})

app.listen(port, () => {
    console.log(`[LitminerV2] Listening on ${port}`);
})

login();
export const client = new BotClient();

process.on("SIGINT", async ()=>{
    console.log(`[LitminerV2] Process stopped`);
    await client.Disconnect();
    process.exit(process.exitCode || 0);
})