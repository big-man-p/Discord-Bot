import "dotenv/config";
import bot from "./bot";

bot.start(process.env.BOT_TOKEN as string);
