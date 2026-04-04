import { OAuth2Guild } from "discord.js";

type BotStatus = {
  guilds: Pick<OAuth2Guild, "id" | "name">[];
  uptime: number;
}

export default BotStatus;