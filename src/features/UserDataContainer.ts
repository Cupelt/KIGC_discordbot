import { Discord } from "discordx";
import { IInitializable } from "../@types/initializable";
import { injectable, singleton } from "tsyringe";
import { injectRegister } from "../utils/reigister";
import { EnvManager } from "../utils/EnvManager";
import { Collection, Snowflake } from "discord.js";
import { ThreadManager } from "./ForumInitializer";
import { UserData } from "../@types/qnaTypes";

@singleton()
@injectable()
@injectRegister("IInitializable")
export class UserDataContainer implements IInitializable {
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
            members.map((gm, i) => {
                const score = (i == 0) ? 3 : 1.5;
                
                this.addScore(gm.id, t.id, )
            })
        }))
    }

    public updateLeaderboard(id: Snowflake) {
        let userIndex = this.userLeaderboard.indexOf(id);
        if (userIndex < 0)
            return;

        // wtf
        while((userIndex - 1) >= 0 && this.userData.get(id)?.userScore! 
                > this.userData.get(this.userLeaderboard[userIndex - 1])?.userScore!) {
            // swap
            [this.userLeaderboard[userIndex], this.userLeaderboard[(userIndex - 1)]] = 
                [this.userLeaderboard[(userIndex - 1)], this.userLeaderboard[userIndex]]

            userIndex--;
        }
    }

    public addScore(userId: Snowflake, recentId: string, score: number) {
        if (this.userData.has(userId)) {
            const userData: UserData = this.userData.get(userId)!;
            userData.userScore += score;
            userData.recentAnswersId.push(recentId);
        } else {
            this.userData.set(userId, {
                userScore: score,
                recentAnswersId: [ recentId ]
            })
            this.userLeaderboard.unshift(userId);
        }
    }
}