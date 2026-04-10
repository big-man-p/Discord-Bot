import "dotenv/config";
import bot from "./bot";
import cli from "./cli";
import api from "./api";
import { logText } from "./utilities";
import { getChats } from "./bot/handlers/on-message-created";

bot.start(process.env.BOT_TOKEN as string);
cli.start();
api.start(Number(process.env.API_PORT) || 3000);

process.on("exit", () => {
  logText("Shutting down...");
  console.log(JSON.stringify(getChats()));
});