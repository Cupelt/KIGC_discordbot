import {
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    ThreadChannel,
    UserSelectMenuBuilder,
} from "discord.js";
import { Discord, On } from "discordx";
import { IInitializable } from "../@types/initializable";
import { EnvManager } from "../utils/EnvManager";
import { container, injectable } from "tsyringe";
import { client } from "../main";
import { injectRegister } from "../utils/reigister";
@Discord()
@injectable()
@injectRegister("IInitializable")
export class ThreadManager implements IInitializable {
    public async init(): Promise<void> {
        const env = container.resolve(EnvManager);
        const threads = env.getQnaChannel().threads.cache;

        const promise = threads.map(async (t) => {
            const msgIter = (await t.messages.fetchPinned()).values();
            const msgResult = msgIter.next();

            if (msgResult.done || msgResult.value.author.id != client.user?.id) return;
            const msg = msgResult.value;

            const users = await Promise.all(
                t.members.cache.map((m) => ({ label: `@${m.user?.tag}`, value: m.id })),
            );
            console.log(users);

            const userSelComp = new UserSelectMenuBuilder()
                .setCustomId("user")
                .setPlaceholder("체택할 답변자")
                .setMinValues(1)
                .setMaxValues(3);

            msg.edit({
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        userSelComp,
                    ),
                ],
            });
        });

        await Promise.all(promise);
    }

    @On({ event: "threadCreate" })
    private async threadCreate([event]: DiscordX.ArgsOf<"threadCreate">, client: DiscordX.Client) {
        const owner = await event.fetchOwner().then((tc) => tc?.guildMember);
        console.log(owner);
    }

    @On({ event: "interactionCreate" })
    private async menuInteraction(
        [interaction]: DiscordX.ArgsOf<"interactionCreate">,
        client: DiscordX.Client,
    ) {
        if (!interaction.isStringSelectMenu() && !interaction.isUserSelectMenu()) {
            return;
        }

        if (interaction.user.id != (interaction.channel as ThreadChannel).ownerId) return;

        await interaction.deferUpdate();

        console.log(interaction.values);
    }
}
