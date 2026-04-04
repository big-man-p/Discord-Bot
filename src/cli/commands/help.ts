import { Client } from "discord.js";
import { logText } from "../../utilities";
import { CliCommand } from "../../types";
import { commands } from "../command-manager";

const alias: string = "help";
const description: string = "List all cli commands.";

async function execute(client: Client, args: string[]): Promise<void> {
  commands.forEach(command => logText(`${command.alias} - ${command.description}`));
}

export default { alias, description, execute } satisfies CliCommand;
