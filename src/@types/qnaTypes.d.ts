import { Snowflake } from "discord.js";

interface QNAResult {
    channelId: string;
    author: Snowflake;
    acceptedUesr: Snowflake;
    assistent: Snowflake[];
}