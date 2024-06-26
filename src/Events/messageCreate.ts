import { Event } from "../Structures/Event";

export default new Event("messageCreate", async (message) => {
    if(message.author.bot) return;

    
    console.log(`[${message.guild}] ${message.author}: ${message.content}`);
});