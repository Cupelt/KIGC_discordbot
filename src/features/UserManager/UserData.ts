import { Message, Snowflake } from "discord.js";
import { container, injectable } from "tsyringe";
import { EnvManager } from "../../utils/EnvManager";
import { ThreadManager } from "../ForumInitializer";

@injectable()
export class UserData {
    private envManager: EnvManager;

    private userId: Snowflake;
    private historyMessages: Message[]

    constructor(userId: Snowflake, envManager: EnvManager) {
        this.userId = userId;
        this.historyMessages = [];

        this.envManager = envManager;
    }

    public addHistory(message: Message) {
        this.historyMessages.push(message);
    }

    private async updateMessages() {
        this.historyMessages = await Promise.all(
            this.historyMessages
                .map(async e => await e.fetch())
            );

        const filteredMessages = await Promise.all(
            this.historyMessages.map(async e => {
                if (e && e.embeds) {
                    return false;
                }
        
                const members = await ThreadManager.getChoseMemberFormField(e.embeds[0].fields);
                return members.find(m => m.id == this.userId) != undefined;
            })
        );

        this.historyMessages = this.historyMessages.filter((_, index) => filteredMessages[index]);
    }

    public async getScore(): Promise<number> {
        this.updateMessages();

        let score = 0;

        await Promise.all(
            this.historyMessages.map(async msg => {                
                const members = await ThreadManager.getChoseMemberFormField(msg.embeds[0].fields);
                score += (members[0].id == this.userId) ? 3 : 1.5;
            })
        )

        return score;
    }

    public static createInstance(id: Snowflake): UserData {
        const env = container.resolve(EnvManager);

        return new UserData(id, env);
    }
}