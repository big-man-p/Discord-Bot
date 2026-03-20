import { Channel, Client, GuildTextBasedChannel } from "discord.js";
import { CliCommand } from "../../../models";
import { logError } from "../../../utilities";

const alias = "create-message";
const description = "Creates and sends a message into a user specified text channel."

/**
 * @args <channelId: string> <message: string>
 */
async function execute(client: Client, args: string[]): Promise<void> {
  if (args.length < 2) {
    logError("Usage - create-message <channelId: string> <message: string>");
    return;
  };

  const channelId: string = args.shift()!;
  const message: string = args.join(" ");
  const channel: Channel | null = await client.channels.fetch(channelId);

  if (!channel) {
    logError(`Failed to fetch a channel with the following id - ${channelId}`);
    return;
  }

  if (!channel.isTextBased()) {
    logError("The channel must be a text based channel");
    return;
  }

  if (!channel.isSendable()) {
    logError("Unable able to send message due to insufficient privilages");
    return;
  }

  channel.send(message);
}

export default { alias, description, execute } satisfies CliCommand