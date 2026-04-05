import "dotenv/config";
import bot from "./bot";
import cli from "./cli";
import api from "./api";

bot.start(process.env.BOT_TOKEN as string);
cli.start();
api.start(Number(process.env.API_PORT) || 3000);