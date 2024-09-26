import {
	ActionRowBuilder,
	APIEmbedField,
	BaseMessageOptions,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	EmbedBuilder,
	ForumThreadChannel,
	GuildMember,
	MessageActionRowComponentBuilder,
	ThreadChannel,
	UserSelectMenuBuilder,
	UserSelectMenuInteraction,
} from "discord.js";
import { ArgsOf, ButtonComponent, Client, Discord, On, SelectMenuComponent } from "discordx";
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
		const pinned = await configChannel.messages.fetchPinned();

        let initMessage = pinned.first();
        if (!initMessage) {
            initMessage = await configChannel.send("Initializing..");
            initMessage.pin();
        }
        await initMessage.edit(this.getConfigMsg());
		
		const threads = this.envManager.getForumChannel().threads.cache;
		await Promise.all(threads.map(t => this.updateThreadMessage(t)));
	}

	private async updateThreadMessage(thread: ThreadChannel, arcnived: boolean = thread.archived ?? false) {
		const msg = (await thread.messages.fetchPinned()).first();
		if (!msg)
			return;

		const choseMember = await this.getChoseMemberFormField(msg.embeds[0].fields.slice());
		await msg.edit(this.getEvalMsg(choseMember, arcnived));
	}

	private async getChoseMemberFormField(embedFields: APIEmbedField[]): Promise<GuildMember[]> {
		const guild = this.envManager.getGuild();

		const userIdExp = /<@(\d+)>/g;
		const choseMembers: GuildMember[] = [];
		if (embedFields.length != 0) {
			embedFields.shift();
			for (const f of embedFields) {
				const matched = [...f.value.matchAll(userIdExp)];

				for (const id of matched) {
					await guild.members
						.fetch(id[1]) // regex id gruop
						.then((member) => choseMembers.push(member))
						.catch(() => undefined);
				}
			}
		}

		return choseMembers;
	}

	@On({ event: "threadCreate" })
	private async threadCreate([event]: ArgsOf<"threadCreate">, client: Client) {
		const msg = this.getEvalMsg([], false);
        msg.content = "t"; // mentions
        
        (await event.send(msg)).pin();
	}

	@On({ event: "threadUpdate" })
	private async threadUpdate([oldThread, newThread]: ArgsOf<"threadUpdate">, client: Client) {
		if (oldThread.archived != newThread.archived) {
			// tag change.
		}

		if (!newThread.archived) {
			await this.updateThreadMessage(newThread);
		}
	}

	@ButtonComponent({ id: "qna_close" })
	private async openClose(interaction: ButtonInteraction) {
		const channel = interaction.channel;

		if (channel?.isThread()) {
			const wasArchived = channel.archived ?? false;
			const evalMsg = this.getEvalMsg(
				await this.getChoseMemberFormField(
					interaction.message.embeds[0].fields
				),
				!wasArchived
			)

			await interaction.update(evalMsg);
			await channel.setArchived(true);
		}
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

		await interaction.update(this.getEvalMsg(validMembers, (interaction.channel as ThreadChannel).archived ?? false));
	}

	private getEvalMsg(users: GuildMember[], archived: boolean): BaseMessageOptions {
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

		const components = [];

		if (!archived) {
			const userSelComp = new UserSelectMenuBuilder()
				.setCustomId("qna_user_select")
				.setPlaceholder("체택할 답변자")
				.setDefaultUsers(users.map((u) => u.id))
				.setMinValues(1)
				.setMaxValues(3);

			components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				userSelComp,
			),);
		}

		const openCloseComp = new ButtonBuilder()
            .setCustomId("qna_close")
            .setLabel(archived ? "해결됨!" : "스레드 닫기")
            .setStyle(archived ? ButtonStyle.Success : ButtonStyle.Primary)
			.setDisabled(archived);

		components.push(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			openCloseComp,
		));
		

		return {
			embeds: [embed],
			components: components
		};
	}

    private getConfigMsg(): BaseMessageOptions {
        return {};
    }
}
