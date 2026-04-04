import "dotenv/config";
import bot from "./bot";
import { startApi } from "./api";
import cli from "./cli";

bot.start(process.env.BOT_TOKEN as string);
cli.start();
startApi(Number(process.env.API_PORT) || 3000);