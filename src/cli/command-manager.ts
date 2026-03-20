import { readdirSync } from "fs";
import { log, logError } from "../utilities";
import { CliCommand } from "../models";

const commands = new Map<string, CliCommand>();

function loadCommands(directory: string) {
  const commandFiles = readdirSync(directory).filter((file) => file.endsWith(".js"));

  log(">>> Loading CLI Commands <<<");

  for (const file of commandFiles) {
    const command: CliCommand = require(`${directory}/${file}`).default;
    if (command satisfies CliCommand) {
      commands.set(command.alias, command);
      log(`Command "${command.alias}" loaded`);
    } else {
      logError(`Command "${command.alias}" does not satisfy the type CliCommand`);
    }
  }
}

export { commands, loadCommands };
