import { Interaction } from "discord.js";
import { Discord, On, Once } from "discordx";
@Discord()
export class ThreadManager {
    @On({ event: "threadCreate" })
    private async threadCreate(
        [event]: DiscordX.ArgsOf<"threadCreate">,
        client: DiscordX.Client
    ) {
        const owner = await event.fetchOwner()
            .then( tc => tc?.guildMember )
        console.log(owner);
    }

    @On({ event: "interactionCreate" })
    private async menuInteraction(
        interaction: Interaction,
        client: DiscordX.Client
    ) {
        if (!interaction.isAnySelectMenu()) {
            return;
        }
        
    }
}