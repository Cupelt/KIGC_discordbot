import { Discord } from "discordx";
import { IInitializable } from "../../@types/initializable";
import { injectable, singleton } from "tsyringe";
import { injectRegister } from "../../utils/reigister";
import { EnvManager } from "../../utils/EnvManager";
import { Collection, Message, Snowflake } from "discord.js";
import { ForumHandler } from "../forum/ForumHandler";
import { UserData } from "./UserData";
import { client } from "../../main";

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
		const archivedThreads = (
			await forum.threads.fetchArchived()
		).threads.sorted(
			(a, b) => a.archivedAt?.getTime()! - b.archivedAt?.getTime()!,
		);

		await Promise.all(
			archivedThreads.map(async (t) => {
				if (!(await UserData._EmbedCahceRegister(t))) {
					return;
				}

				const members = await ForumHandler.getChoseMemberFormField(
					UserData.getEmbedJsonFromThreadId(t.id)!.fields,
				);

				await Promise.all(
					members.map(async (gm, i) => await this.addHistory(gm.id, t.id)),
				);
			}),
		);

		// debug only
		console.log(
			await Promise.all(
				this.userLeaderboard.map(async (id) => {
					const user = await client.users.fetch(id);
					const username = user?.username; // 유효한 사용자인지 확인
					const score = await this.userData.get(id)?.getScore(); // getScore 결과 얻기
					return { username, score }; // 값을 명확히 반환
				}),
			),
		);
	}

	public async addHistory(id: Snowflake, threadId: string) {
		if (!this.userData.has(id)) {
			this.userData.set(id, UserData.createInstance(id));
			this.userLeaderboard.push(id);
		}

		const data = this.userData.get(id)!;
		await data.addHistory(threadId);
		await this.updateLeaderboard(id);
	}

	public async updateLeaderboard(id: Snowflake) {
		let userIndex = this.userLeaderboard.indexOf(id);
		if (userIndex < 0) return;

		let userScore = await this.userData.get(id)?.getScore();
		if (userScore === undefined || userScore === null) return;

		while (userIndex > 0) {
			const aboveUserId = this.userLeaderboard[userIndex - 1];
			const aboveUserScore = await this.userData.get(aboveUserId)?.getScore();

			if (aboveUserScore === undefined || userScore <= aboveUserScore) break;

			// 순위 교체 (swap)
			[this.userLeaderboard[userIndex], this.userLeaderboard[userIndex - 1]] = [
				this.userLeaderboard[userIndex - 1],
				this.userLeaderboard[userIndex],
			];

			userIndex--;
		}
	}
}
