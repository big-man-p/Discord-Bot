import { Client } from "discord.js";
import { logText } from "../../utilities";
import { CliCommand } from "../../types";

const alias: string = "list-servers";
const description: string = "Lists all the servers the bot is a part of.";

async function execute(client: Client, args: string[]): Promise<void> {
  const guilds: string[] = [];
  (await client.guilds.fetch()).values().forEach(guild => guilds.push(guild.name));
  logText("Server List");
  console.log(guilds);
}

export default { alias, description, execute } satisfies CliCommand;
