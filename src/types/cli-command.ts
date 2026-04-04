import { Client } from "discord.js";

type CliCommand = {
  alias: string;
  description: string;
  execute: (client: Client, args: string[]) => Promise<void>;
};

export default CliCommand;
