import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BotCommand } from "../../../models";

const data = new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong");

async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply("Pong");
}

export default { data, execute } satisfies BotCommand;
