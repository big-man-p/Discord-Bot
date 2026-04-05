import { Client, Events, GatewayIntentBits } from "discord.js";
import { commands, loadCommands } from "./command-manager";
import { onInteractionCreate, onMessageCreated, onReady } from "./handlers";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

function start(token: string) {
  loadCommands(`${__dirname}/commands`);
  client.once(Events.ClientReady, onReady);
  client.on(Events.MessageCreate, onMessageCreated);
  client.on(Events.InteractionCreate, onInteractionCreate);
  client.login(token);
}

export default {
  client,
  commands,
  start,
};
