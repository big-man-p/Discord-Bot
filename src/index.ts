import "dotenv/config";
import { bot, cli, db } from "./services";
import { default as api } from "./routes";

cli.start();
// db.connectToDatabase();
// api.start(Number(process.env.API_PORT));
bot.start(process.env.BOT_TOKEN as string);
