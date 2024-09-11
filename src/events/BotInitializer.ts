import {
    ActionRowBuilder,
    ForumChannel,
    MessageActionRowComponentBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
} from "discord.js";
import { Discord, On, Once } from "discordx";

const rateSelect = [
    { label: "⭐️", value: "1" },
    { label: "⭐️⭐️", value: "2" },
];
@Discord()
export class BotInitializer {
    @Once({ event: "ready" })
    private async ready(_: any, client: DiscordX.Client): Promise<void> {
        const channelId = "1083738942504960051";
        const guildId = "815587239022690306";

        const guild = client.guilds.cache.find((g) => g.id == guildId);
        if (!guild) {
            Error("Could not found Guild. guild_id : " + guildId);
            return;
        }

        const channel = guild.channels.cache.find((c) => c.id == channelId);
        if (!(channel instanceof ForumChannel)) {
            Error("Channel cannot Cast ForumChannel. channel_id : " + channelId);
            return;
        }

        const threads = channel.threads.cache;
        await Promise.all(
            threads.map(async (t) => {
                const msgIter = (await t.messages.fetchPinned()).values();
                const msgResult = msgIter.next();

                if (msgResult.done || msgResult.value.author.id != client.user?.id) return;
                const msg = msgResult.value;

                const rateSelComp = new StringSelectMenuBuilder()
                    .addOptions(rateSelect)
                    .setCustomId("test");

                const userSelComp = new UserSelectMenuBuilder()
                    .setCustomId("user")
                    .setPlaceholder("체택할 답변자")
                    .setMaxValues(1);

                msg.edit({
                    components: [
                        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            rateSelComp,
                        ),
                        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                            userSelComp,
                        ),
                    ],
                });
            }),
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
