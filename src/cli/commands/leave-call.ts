import { Client } from "discord.js";
import { logText } from "../../utilities";
import { CliCommand } from "../../types";
import calls from "../../bot/call-manager";

const alias: string = "leave-call";
const description: string = "Leave the current voice call.";

async function execute(client: Client, args: string[]): Promise<void> {
  if (args.length < 1) {
    logText("Usage: leave-call <guildId>");
    return;
  }
  const guildId = args[0].toString();
  calls.leaveByGuildId(guildId);
}

export default { alias, description, execute } satisfies CliCommand;
