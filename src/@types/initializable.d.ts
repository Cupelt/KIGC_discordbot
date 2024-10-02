import { Guild } from "discord.js";
import { Client } from "discordx";

// implemented class must be @injectable
export interface IInitializable {
    public async init(): Promise<void>;
    public priority: number;
}
