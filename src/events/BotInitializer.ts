import { Discord, DIService, On, Once } from "discordx";
import { container, injectable } from "tsyringe";
import { IInitializable } from "../@types/initializable";
import { Identifier } from "../utils/reigister";

@Discord()
@injectable()
export class BotInitializer {
    @Once({ event: "ready" })
    private async ready(_: any, client: DiscordX.Client): Promise<void> {
        await Promise.all(
            (container.resolveAll("IInitializable" as Identifier) as IInitializable[]).map((i) =>
                i.init(),
            ),
        );

        void client.initApplicationCommands();
        console.log(`Bot logged in ${client.user?.displayName}`);
    }

    @On({ event: "interactionCreate" })
    private async slashCommandInteraction(
        [interaction]: DiscordX.ArgsOf<"interactionCreate">,
        client: DiscordX.Client,
    ): Promise<void> {
        client.executeInteraction(interaction);
    }
}
