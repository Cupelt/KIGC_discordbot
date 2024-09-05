import { Client } from "discordx";
import { IntentsBitField } from "discord.js"
import "dotenv/config";

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
    ],
    silent: false,
});

client.on("ready", async () => {
    
    // TODO: replace qna interactions.
    
    await client.initApplicationCommands();
});

client.login(process.env.TOKEN);

