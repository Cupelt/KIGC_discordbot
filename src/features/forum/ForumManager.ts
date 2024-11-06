import { Discord } from "discordx";
import { container, injectable } from "tsyringe";
import { EnvManager } from "../../utils/EnvManager";
import {
	ActionRowBuilder,
	BaseMessageOptions,
	MessageActionRowComponentBuilder,
	RoleSelectMenuBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	UserSelectMenuBuilder,
} from "discord.js";

@Discord()
@injectable()
export class ForumManager {
	private envManager: EnvManager;

	// <tagId, roleId>
	private roleMap: Map<string, string>;

	constructor(envManager: EnvManager) {
		this.envManager = envManager;
		this.roleMap = new Map();
	}

	public static getConfigMsg(
		tagId: string | undefined = undefined,
		roleId: string | undefined = undefined,
	): BaseMessageOptions {
		const tagSelMenu = new StringSelectMenuBuilder()
			.setCustomId("set_tagmap")
			.setPlaceholder("매치시킬 태그")
			.addOptions(
				container
					.resolve(EnvManager)
					.getForumChannel()
					.availableTags.filter((tag) => !tag.moderated)
					.map((tag) => {
						let builder = new StringSelectMenuOptionBuilder()
							.setLabel(tag.name)
							.setValue(tag.id)
							.setDefault(tagId == tag.id);

						if (tag.emoji) {
							const emoji = tag.emoji.id ?? tag.emoji.name!;

							builder = builder.setEmoji(emoji);
						}

						return builder;
					}),
			)
			.setDisabled(tagId !== undefined)
			.setMinValues(1)
			.setMaxValues(1);

		const roleSelMenu = new RoleSelectMenuBuilder()
			.setCustomId("set_tagmap")
			.setPlaceholder("매치시킬 역할")
			.setMinValues(1)
			.setMaxValues(1);

		const compoennts = [];
		compoennts.push(
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				tagSelMenu,
			),
		);

		if (tagId) {
		}

		return {
			components: compoennts,
		};
	}
}
