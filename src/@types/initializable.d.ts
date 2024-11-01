import { Guild } from "discord.js";
import { Client } from "discordx";

// implemented class must be @injectable
export interface IInitializable {
	init(): Promise<void>;
	priority: number;
}
