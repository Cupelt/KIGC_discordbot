import {
	ActionRowBuilder,
	BaseMessageOptions,
	EmbedBuilder,
	GuildMember,
	MessageActionRowComponentBuilder,
	ThreadChannel,
	UserSelectMenuBuilder,
	UserSelectMenuInteraction,
} from "discord.js";
import { ArgsOf, Client, Discord, On, SelectMenuComponent } from "discordx";
import { IInitializable } from "../@types/initializable";
import { EnvManager } from "../utils/EnvManager";
import { injectable } from "tsyringe";
import { client } from "../main";
import { injectRegister } from "../utils/reigister";

@Discord()
@injectable()
@injectRegister("IInitializable")
export class ThreadManager implements IInitializable {
	private envManager: EnvManager;

	constructor(envManager: EnvManager) {
		this.envManager = envManager;
	}

	public async init(): Promise<void> {
		const configChannel = this.envManager.getConfigChannel();
		const messages = await configChannel.messages.fetch();
		await Promise.all(
			messages.map(async (m) => { 
                if (m.deletable && m.author.id !== client.user?.id) 
                    await m.delete();
            })
		)
		const threads = this.envManager.getForumChannel().threads.cache;
		await Promise.all(threads.map(t => this.updateThreadMessage(t)));
	}

	private async updateThreadMessage(thread: ThreadChannel) {
		const guild = this.envManager.getGuild();

		const msgIter = (await thread.messages.fetchPinned()).values();
		const msgResult = msgIter.next();

		if (msgResult.done || msgResult.value.author.id !== client.user?.id)
			return;
		const msg = msgResult.value;

		const userIdExp = /<@(\d+)>/g;

		const takeUppedMembers: GuildMember[] = [];
		const fields = msg.embeds[0].fields.slice();
		if (fields.length != 0) {
			fields.shift();
			for (const f of fields) {
				const matched = [...f.value.matchAll(userIdExp)];

				for (const id of matched) {
					await guild.members
						.fetch(id[1]) // regex id gruop
						.then((member) => takeUppedMembers.push(member))
						.catch(() => undefined);
				}
			}
		}

		msg.edit(this.getMessage(takeUppedMembers));
	}

	@On({ event: "threadCreate" })
	private async threadCreate([event]: ArgsOf<"threadCreate">, client: Client) {
		const msg = this.getMessage([]);
        msg.content = "t"; // mentions
        
        (await event.send(msg)).pin();
	}

	@SelectMenuComponent({ id: "qna_user_select" })
	private async menuInteraction(interaction: UserSelectMenuInteraction) {
		if (interaction.user.id !== (interaction.channel as ThreadChannel).ownerId)
			return;

		const guild = this.envManager.getGuild();
		const members = await Promise.all(
			interaction.values.map(
				async (id) => await guild.members.fetch(id).catch(() => undefined),
			),
		);

		const validMembers: GuildMember[] = members.filter(
			(m): m is GuildMember => m !== undefined,
		);

		await interaction.update(this.getMessage(validMembers));
	}

	private getMessage(users: GuildMember[]): BaseMessageOptions {
		const embed = new EmbedBuilder()
			.setColor(0xffffff)
			.setTitle("📝 질문 평가")
			.setDescription("답변이 끝났다면 채택할 답변자를 선택 해 주세요.\n");

		const userCount = users.length;
		if (userCount > 0) {
			const usersCopy = users.slice();

			embed.addFields({ name: "\u200B", value: "\u200B" });
			embed.addFields({ name: " 채택자", value: `${usersCopy.shift()}` });

			if (userCount > 1) {
				embed.addFields({
					name: "✨ 어시스턴트",
					value: usersCopy.map((m) => `${m}`).join(", "),
					inline: true,
				});
			}
		}

		const userSelComp = new UserSelectMenuBuilder()
			.setCustomId("qna_user_select")
			.setPlaceholder("체택할 답변자")
			.setDefaultUsers(users.map((u) => u.id))
			.setMinValues(1)
			.setMaxValues(3);
		//const openCloseComp = new ButtonBuilder().setCustomId("qna_open_close");

		return {
			embeds: [embed],
			components: [
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					userSelComp,
				),
			],
		} as BaseMessageOptions;
	}
}
