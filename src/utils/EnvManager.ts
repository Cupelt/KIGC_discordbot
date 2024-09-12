import { ForumChannel, Guild } from "discord.js";
import { client } from "../main";
import { exit } from "process";
import { Client } from "discordx";
import { injectable, Lifecycle, singleton } from "tsyringe";
import { injectRegister } from "./reigister";

@singleton()
@injectable()
@injectRegister("EnvManager", Lifecycle.Singleton)
export class EnvManager {
    private client: Client;
    private guild: Guild;
    private qnaChannel: ForumChannel;

    constructor() {
        this.client = client;

        const guildId = process.env.GUILD_ID;
        const guild = client.guilds.cache.find((g) => g.id == guildId);
        if (!guild) {
            Error("Could not found Guild. guild_id : " + guildId);
            exit();
        }
        this.guild = guild;

        const channelId = process.env.QNA_FORUM_ID;
        const channel = guild.channels.cache.find((c) => c.id == channelId);
        if (!(channel instanceof ForumChannel)) {
            Error("Channel cannot Cast ForumChannel. channel_id : " + channelId);
            exit();
        }
        this.qnaChannel = channel;
    }

    public getGuild(): Guild {
        return this.guild;
    }

    public getQnaChannel(): ForumChannel {
        return this.qnaChannel;
    }
}
