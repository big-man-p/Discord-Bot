import { readdirSync } from "fs";
import { BotCommand } from "../models";
import { log, logError } from "../utilities";

const commands = new Map<string, BotCommand>();

function loadCommands(directory: string) {
  const folders: string[] = readdirSync(directory);

  log(">>> Loading Bot Commands <<<");

  for (const folder of folders) {
    const commandDirectory: string = `${directory}/${folder}`;
    const commandFiles: string[] = readdirSync(commandDirectory).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command: BotCommand = require(`${commandDirectory}/${file}`).default;
      if (command satisfies BotCommand) {
        commands.set(command.data.name, command);
        log(`Command "${command.data.name}" loaded`);
      } else {
        logError(`Command "${command.data.name}" does not satisfy the type BotCommand`);
      }
    }
  }
}

export { commands, loadCommands };
