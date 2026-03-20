import { Client, Events, GatewayIntentBits } from "discord.js";
import { commands, loadCommands } from "./command-manager";
import { onInteractionCreate, onMessageCreate, onReady } from "./handlers";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

function start(token: string) {
  loadCommands(`${__dirname}/commands`);
  client.once(Events.ClientReady, onReady);
  client.on(Events.MessageCreate, onMessageCreate);
  client.on(Events.InteractionCreate, onInteractionCreate);
  client.login(token);
}

export default {
  client,
  commands,
  start,
};
