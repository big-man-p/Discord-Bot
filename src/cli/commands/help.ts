import { Client } from "discord.js";
import { log } from "../../../utilities";
import { CliCommand } from "../../../models";
import { commands } from "../command-manager";

const alias: string = "help";
const description: string = "List all cli commands.";

async function execute(client: Client, args: string[]): Promise<void> {
  commands.forEach(command => log(`${command.alias} - ${command.description}`));
}

export default { alias, description, execute } satisfies CliCommand;
