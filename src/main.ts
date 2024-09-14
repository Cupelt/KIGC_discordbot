import dotenv from "dotenv";
import "reflect-metadata";
import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client, DIService, tsyringeDependencyRegistryEngine } from "discordx";
import { container, instanceCachingFactory } from "tsyringe";

dotenv.config();

export const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
    ],
    silent: true,
});

async function ready() {
    DIService.engine = tsyringeDependencyRegistryEngine
        .setUseTokenization(true)
        .setCashingSingletonFactory(instanceCachingFactory)
        .setInjector(container);
    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment");
    }

    await client.login(process.env.BOT_TOKEN);
}

void ready();
