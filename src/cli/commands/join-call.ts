import { Client } from "discord.js";
import { logText } from "../../utilities";
import { CliCommand } from "../../types";
import calls from "../../bot/call-manager";

const alias: string = "join-call";
const description: string = "Join a voice call.";

async function execute(client: Client, args: string[]): Promise<void> {
  if (args.length < 1) {
    logText("Usage: join-call <voiceChannelId>");
    return;
  }
  const voiceChannelId = args[0].toString();
  calls.joinByChannelId(voiceChannelId);
}

export default { alias, description, execute } satisfies CliCommand;
