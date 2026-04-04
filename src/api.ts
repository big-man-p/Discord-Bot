import * as express from "express";
import { Request, Response } from "express";
import bot from "./bot";
import { BotStatus } from "./types";

const api = express.default();
api.get("/", root);
api.get("/bot_status", botStatus);

/********** Route Handlers **********/
function root(req: Request, res: Response): void {
  res.send("Bot and API are running.");
}

async function botStatus(req: Request, res: Response): Promise<void> {  
  const guildsResponse = await bot.client.guilds.fetch();
  const guilds = guildsResponse.map(guild => ({ id: guild.id, name: guild.name }));
  const uptime = bot.client.uptime || -1;

  const status: BotStatus = { guilds, uptime };

  res.json(status);
}

function aiLogs(req: Request, res: Response): void {
  res.json(bot.aiLogs);
}

/******* End of Route Handlers *******/

function startApi(port: number): void {
  api.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
}

export { startApi };