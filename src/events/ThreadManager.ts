import { ForumChannel, Interaction, ThreadChannel } from "discord.js";
import { Discord, On, Once } from "discordx";
@Discord()
export class ThreadManager {
    @On({ event: "threadCreate" })
    private async threadCreate([event]: DiscordX.ArgsOf<"threadCreate">, client: DiscordX.Client) {
        const owner = await event.fetchOwner().then((tc) => tc?.guildMember);
        console.log(owner);
    }

    @On({ event: "interactionCreate" })
    private async menuInteraction([interaction]: DiscordX.ArgsOf<"interactionCreate">, client: DiscordX.Client) {
        if (!interaction.isStringSelectMenu() && !interaction.isUserSelectMenu()) {
            return;
        }

        if (interaction.user.id != (interaction.channel as ThreadChannel).ownerId)
            return;
            

        await interaction.deferUpdate();

        console.log(interaction.values);
    }
}
