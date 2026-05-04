import { Client } from "discord.js";
import { logText } from "../../utilities";
import { CliCommand } from "../../types";
import calls from "../../bot/call-manager";

const alias: string = "play";
const description: string = "Play audio from a YouTube URL.";

async function execute(client: Client, args: string[]): Promise<void> {
  if (args.length < 2) {
    logText("Usage: play <YouTubeURL> <channelId>");
    return;
  }
  const url = args[0].toString();
  const channelId = args[1].toString();
  calls.playAudioFromYouTube(url, channelId);
}

export default { alias, description, execute } satisfies CliCommand;
