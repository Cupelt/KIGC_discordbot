import { ForumChannel } from "discord.js";
import { Discord, On, Once } from "discordx";


@Discord()
export class BotInitializer {
    @Once({ event: "ready" })
    private async ready(_: any, client: DiscordX.Client): Promise<void> {
        const channelId = "1083738942504960051";
        const guildId = "815587239022690306"
        const guild = client.guilds.cache.find(g => g.id == guildId);

        if (guild) {
            const channel = guild.channels.cache.find(c => c.id == channelId);

            if (channel instanceof ForumChannel) {
                const forumChannels = channel.threads.cache;
                for (const thread of forumChannels) {
                    
                }

                forumChannels.forEach(async thread => console.log((await thread.messages.fetchPinned()).values().next()))
            }


        }

        void client.initApplicationCommands();
        console.log(`Bot logged in ${client.user?.displayName}`);
    }

    @On({ event: "interactionCreate" })
    private async slashCommandInteraction(
        [interaction]: DiscordX.ArgsOf<"interactionCreate">,
        client: DiscordX.Client
    ): Promise<void> {
        client.executeInteraction(interaction);
    }
}