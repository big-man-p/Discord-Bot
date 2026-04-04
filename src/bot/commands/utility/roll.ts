import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BotCommand } from "../../../types";
import { randomInt } from "../../../utilities";

const data = new SlashCommandBuilder()
  .setName("roll")
  .setDescription("Roll a random number between 1 ~ 100 (range can be customised)")
  .addIntegerOption((option) =>
    option.setName("lower").setDescription("Set the lowest possible number to roll").setRequired(false)
  )
  .addIntegerOption((option) =>
    option.setName("upper").setDescription("Set the highest possible number to roll").setRequired(false)
  );

async function execute(interaction: ChatInputCommandInteraction) {
  let lower: number = (interaction.options.get("lower")?.value as number) || 0;
  let upper: number = (interaction.options.get("upper")?.value as number) || 100;

  await interaction.reply(randomInt(lower, upper).toString());
}

export default { data, execute } satisfies BotCommand;
