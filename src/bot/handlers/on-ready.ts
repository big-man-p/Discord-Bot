import { ActivityType, Client } from "discord.js";

function onReady(client: Client<true>) {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  client.user.setActivity({
    name: "My last 2 transistors are fighting for 3rd place 🐒",
    type: ActivityType.Competing,
  });
}

export default onReady;