import { ArgsOf, Client, Discord, On, Once } from "discordx";
import { container, injectable } from "tsyringe";
import { IInitializable } from "../@types/initializable";
import { Identifier } from "../utils/reigister";

@Discord()
@injectable()
export class BotInitializer {
	@Once({ event: "ready" })
	private async ready(_: any, client: Client): Promise<void> {
		console.time("Initializing BotInitalizer...");
		await client.initApplicationCommands();

		await Promise.all(
			(
				container.resolveAll("IInitializable" as Identifier) as IInitializable[]
			).map((i) => i.init()),
		);

		console.timeEnd("Initializing BotInitalizer...");
		console.log(`Bot logged in ${client.user?.displayName}`);
	}

	@On({ event: "interactionCreate" })
	private async slashCommandInteraction(
		[interaction]: ArgsOf<"interactionCreate">,
		client: Client,
	): Promise<void> {
		client.executeInteraction(interaction);
	}
}
