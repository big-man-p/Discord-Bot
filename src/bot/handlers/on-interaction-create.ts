import { Interaction, MessageFlags } from "discord.js";
import { commands } from "../command-manager";
import { log, logError } from "../../utilities";

async function onInteractionCreate(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    logError(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  log(`Command "${interaction.commandName}" executed by ${interaction.user.tag}`);
}

export default onInteractionCreate;
