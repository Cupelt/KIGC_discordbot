import { AnyThreadChannel, Embed, ForumThreadChannel, Message, Snowflake, ThreadChannel } from "discord.js";
import { container, injectable } from "tsyringe";
import { EnvManager } from "../../utils/EnvManager";
import { ThreadManager } from "../ForumInitializer";

@injectable()
export class UserData {
    private envManager: EnvManager;

    private userId: Snowflake;
    private historyThreadIds: string[]

    // key: threadId
    private static messageCache = new Map<string, Embed>();

    constructor(userId: Snowflake, envManager: EnvManager) {
        this.userId = userId;
        this.historyThreadIds = [];

        this.envManager = envManager;
    }

    public static async EmbedCahceRegister(threadId: string): Promise<boolean> {
        const thread = await container.resolve(EnvManager).getForumChannel().threads.fetch(threadId);
        if (thread)
            return UserData._EmbedCahceRegister(thread);
        else
            return false;
    }

    public static async _EmbedCahceRegister(thread: AnyThreadChannel): Promise<boolean> {
        if (!thread) {
            return false;
        }

        const pinned = await thread.messages.fetchPinned();
        const message = pinned.first();

        if (!message || message.embeds.length <= 0) {
            return false;
        }

        const embed = message.embeds[0];
        this.messageCache.set(thread.id, embed);

        return true;
    }

    public static getEmbedJsonFromThreadId(threadId: string) {
        return this.messageCache.get(threadId);
    }

    public async addHistory(threadId: string) {
        if (!UserData.getEmbedJsonFromThreadId(threadId)) {
            await UserData.EmbedCahceRegister(threadId);
        }

        this.historyThreadIds.push(threadId);
    }

    public normalization() {
        this.historyThreadIds = this.historyThreadIds.filter(id => UserData.getEmbedJsonFromThreadId(id) !== undefined)
    }

    public async getScore(): Promise<number> {
        let score = 0;

        this.normalization();
        await Promise.all(
            this.historyThreadIds
                .map(id => UserData.getEmbedJsonFromThreadId(id)!)
                .map(async embed => {
                    const members = await ThreadManager.getChoseMemberFormField(embed.fields);

                    if (members[0].id == this.userId) {
                        score += 300
                    } else {
                        score += 150 / (members.length - 1)
                    }
                })
        )

        return score;
    }

    public static createInstance(id: Snowflake): UserData {
        const env = container.resolve(EnvManager);

        return new UserData(id, env);
    }
}