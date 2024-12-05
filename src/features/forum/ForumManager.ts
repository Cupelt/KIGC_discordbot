import { ButtonComponent, Discord, SelectMenuComponent } from "discordx";
import { container, injectable } from "tsyringe";
import { EnvManager } from "../../utils/EnvManager";
import {
	ActionRowBuilder,
	BaseMessageOptions,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	MessageActionRowComponentBuilder,
	RoleSelectMenuBuilder,
	RoleSelectMenuInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
	UserSelectMenuBuilder,
} from "discord.js";

@Discord()
@injectable()
export class ForumManager {
	private envManager: EnvManager;

	// <tagId, roleId>
	private static roleMap: Map<string, string> = new Map();
	private static selectedTag: string;

	constructor(envManager: EnvManager) {
		this.envManager = envManager;
	}

	// @ButtonComponent({ id: "init_apply_btn" })
	// private async applyBtn(interaction: ButtonInteraction) {}

	// @ButtonComponent({ id: "init_cancel_btn" })
	// private async cancelBtn(interaction: ButtonInteraction) {
	// 	await interaction.update(ForumManager.getConfigMsg());
	// }

	@SelectMenuComponent({ id: "init_tag_select" })
	private async selectTag(interaction: StringSelectMenuInteraction) {
		ForumManager.selectedTag = await interaction.values[0];
		await interaction.update(ForumManager.getConfigMsg());
	}

	@SelectMenuComponent({ id: "init_role_select" })
	private async selectRole(interaction: RoleSelectMenuInteraction) {
		console.log(ForumManager.selectedTag);
	}

	public static getConfigMsg(): BaseMessageOptions {
        const tags = container
            .resolve(EnvManager)
            .getForumChannel()
            .availableTags.filter((tag) => !tag.moderated);

		const tagSelMenu = new StringSelectMenuBuilder()
			.setCustomId("init_tag_select")
			.setPlaceholder("매치시킬 태그")
			.addOptions(
				tags.map((tag) => {
                    let builder = new StringSelectMenuOptionBuilder()
                        .setLabel(tag.name)
                        .setValue(tag.id)
                        .setDefault(this.selectedTag == tag.id);

                    if (tag.emoji) {
                        const emoji = tag.emoji.id ?? tag.emoji.name!;

                        builder = builder.setEmoji(emoji);
                    }

                    return builder;
                }),
			)
			.setMinValues(1)
			.setMaxValues(1);

		const compoennts = [];
		compoennts.push(
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				tagSelMenu,
			),
		);

		if (this.selectedTag) {
			const roleSelMenu = new RoleSelectMenuBuilder()
				.setCustomId("init_role_select")
				.setPlaceholder("매치시킬 역할")
				.setMinValues(1)
				.setMaxValues(1);

            if ()

			if (this.roleMap.has(this.selectedTag)) {
				roleSelMenu.setDefaultRoles(this.roleMap.get(this.selectedTag)!);
			}

			compoennts.push(
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					roleSelMenu,
				),
			);

			// compoennts.push(
			// 	new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			// 		applyButton,
			// 		cancelButton,
			// 	),
			// );
		}

		return {
			components: compoennts,
		};
	}
}
