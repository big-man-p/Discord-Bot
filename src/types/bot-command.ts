import { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from "discord.js";

type BotCommand = {
  data: SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export default BotCommand;