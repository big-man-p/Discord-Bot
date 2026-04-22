import { Request, Response } from "express";
import bot from "../../../bot";

async function servers(req: Request, res: Response): Promise<void> {
  const servers = await bot.client.guilds.fetch()
    .then(guilds => Promise.all(guilds.map(guild => guild.fetch())));
  const names = servers.map(server => server.name);
  res.json(names);
}

export default servers;