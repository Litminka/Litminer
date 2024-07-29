require("dotenv").config();
import { BotClient } from "./structures/BotClient";

export const client = new BotClient();

process.on("SIGINT", async ()=>{
    console.log(`[LitminerV2] Process stopped`);
    await client.Disconnect();
    process.exit(process.exitCode || 0);
})