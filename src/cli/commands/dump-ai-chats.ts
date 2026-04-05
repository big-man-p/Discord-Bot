import { Client } from "discord.js";
import { CliCommand } from "../../types";
import { getChats } from "../../bot/handlers/on-message-created";

const alias: string = "dump-ai-chats";
const description: string = "Dump all AI chats.";

async function execute(client: Client, args: string[]): Promise<void> {
  console.log(JSON.stringify(getChats(), null, 2));
}

export default { alias, description, execute } satisfies CliCommand;
