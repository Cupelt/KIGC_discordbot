import { Discord } from "discordx";
import { IInitializable } from "../../@types/initializable";
import { injectable, singleton } from "tsyringe";
import { injectRegister } from "../../utils/reigister";
import { EnvManager } from "../../utils/EnvManager";
import { Collection, Message, Snowflake } from "discord.js";
import { ThreadManager } from "../ForumInitializer";
import { UserData } from "./UserData";

@singleton()
@injectable()
@injectRegister("IInitializable")
export class UserLeaderboard implements IInitializable {
    public priority: number = 1;
    private envManager: EnvManager;

    private userLeaderboard: Snowflake[];
    private userData: Collection<Snowflake, UserData>;

	constructor(envManager: EnvManager) {
		this.envManager = envManager;
        this.userData = new Collection();
        this.userLeaderboard = [];
	}

    public async init(): Promise<void> {
        const forum = this.envManager.getForumChannel();
        const archivedThreads = (await forum.threads.fetchArchived()).threads
            .sorted((a, b) => a.archivedAt?.getTime()! - b.archivedAt?.getTime()!);

        await Promise.all(archivedThreads.map(async t => {
            const pinned = await t.messages.fetchPinned();
            const message = pinned.first();

            if (!message || !message.embeds)
                return;

            const members = await ThreadManager.getChoseMemberFormField(message.embeds[0].fields);
            members.map((gm, i) => this.addHistory(gm.id, message));
        }))
    }

    public addHistory(id: Snowflake, message: Message) {
        if (!this.userData.has(id)) {
            this.userData.set(id, UserData.createInstance(id))
        }

        const data = this.userData.get(id)!;
        data.addHistory(message);
        this.updateLeaderboard(id);
    }

    public updateLeaderboard(id: Snowflake) {
        let userIndex = this.userLeaderboard.indexOf(id);
        if (userIndex < 0)
            return;
    
        let userScore = this.userData.get(id)?.getScore();
        if (userScore === undefined || userScore === null) 
            return;
    
        while (userIndex > 0) {
            const aboveUserId = this.userLeaderboard[userIndex - 1];
            const aboveUserScore = this.userData.get(aboveUserId)?.getScore();
    
            if (aboveUserScore === undefined || userScore <= aboveUserScore) 
                break;
    
            // 순위 교체 (swap)
            [this.userLeaderboard[userIndex], this.userLeaderboard[userIndex - 1]] = 
                [this.userLeaderboard[userIndex - 1], this.userLeaderboard[userIndex]];
    
            userIndex--;
        }
    }
}