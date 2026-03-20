import { Channel, Client, GuildTextBasedChannel } from "discord.js";
import { CliCommand } from "../../../models";
import { logError } from "../../../utilities";
import { join, leave } from "../../bot/voice-manager";

const alias = "leave-voice-channel";
const description = "Leaves a user specified voice channel."

/**
 * @args <channelId: string>
 */
async function execute(client: Client, args: string[]): Promise<void> {
  if (args.length < 1) {
    logError("Usage - create-message <channelId: string>");
    return;
  };

  const channelId: string = args.shift()!;
  const channel: Channel | null = await client.channels.fetch(channelId);

  if (!channel) {
    logError(`Failed to fetch a channel with the following id - ${channelId}`);
    return;
  }

  if (!channel.isVoiceBased()) {
    logError("The channel must be a voice based channel");
    return;
  }

  leave(channel);
}

export default { alias, description, execute } satisfies CliCommand