import { BaseGuildTextChannel, ForumChannel, Guild } from "discord.js";
import { client } from "../main";
import { Client } from "discordx";
import { injectable, Lifecycle, singleton } from "tsyringe";
import { injectRegister } from "./reigister";
import { exit } from "node:process";

@singleton()
@injectable()
// @injectRegister("EnvManager", Lifecycle.Singleton)
export class EnvManager {
    private client: Client;
    private guild: Guild;

    private forumChannel: ForumChannel
    private configChannel: BaseGuildTextChannel

    constructor() {
        this.client = client;

        const guildId = process.env.GUILD_ID;
        const guild = client.guilds.cache.find((g) => g.id === guildId);
        if (!guild) {
            throw new Error("Could not found Guild. guild_id : " + guildId);
        }
        this.guild = guild;

        const forumId = process.env.QNA_FORUM_ID;
        const forum = guild.channels.cache.find((c) => c.id === forumId);
        if (!(forum instanceof ForumChannel)) {
            throw new Error("Channel cannot Cast ForumChannel. channel_id : " + forumId);
        }
        this.forumChannel = forum;

        const configId = process.env.QNA_CONFIG_ID;
        const config = guild.channels.cache.find((c) => c.id === configId);
        if (!(config instanceof BaseGuildTextChannel)) {
            throw new Error("Channel cannot Cast BaseGuildTextChannel. channel_id : " + configId);
        }
        this.configChannel = config;

        // const availableExp = /^(,?\s?\[(\d+),\s?(\d+)\])+$/g;
        // const tagSplitExp = /\[(\d+),\s?(\d+)\]/g;

        // const originTagMap = process.env.QNA_ROLE_MAP.replaceAll("\n", "");
        // if (!availableExp.test(originTagMap)) {
        //     Error("tag-role Map is not available! tag-role map must follow the '[tagId, roleId]' struct");
        //     exit();
        // }
        
        // const info: ForumInfo = { 
        //     tagRoleMap: new Map(
        //         [...originTagMap.matchAll(tagSplitExp)]
        //             .map(id => [id[1], id[2]])
        //         ),
        //     openTag: process.env.QNA_OPEN_TAG_ID,
        //     closeTag: process.env.QNA_CLOSE_TAG_ID
        // };

        // if ([...info.tagRoleMap.keys()].some(k => info.closeTag || info.openTag)) {
        //     Error("closeTag or openTag must be independent.");
        //     exit();
        // }

        // this.forumInfo = info;
    }

    public getGuild(): Guild {
        return this.guild;
    }

    public getForumChannel(): ForumChannel {
        return this.forumChannel;
    }

    public getConfigChannel(): BaseGuildTextChannel {
        return this.configChannel;
    }
}
