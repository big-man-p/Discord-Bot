import { Client } from "discord.js";
import { CliCommand } from "../../types";
import { getAllAiChatHistory } from "../../bot/handlers/on-message-create";

const alias: string = "dump-ai-chats";
const description: string = "Dump all AI chats.";

async function execute(client: Client, args: string[]): Promise<void> {
  console.log(JSON.stringify(getAllAiChatHistory(), null, 2));
}

export default { alias, description, execute } satisfies CliCommand;
