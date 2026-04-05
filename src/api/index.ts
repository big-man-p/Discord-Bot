import * as express from "express";
import { readdirSync } from "fs";
import { logDebug, logError, logText } from "../utilities";
import { dirname } from "path";

type RouteHandler = (req: express.Request, res: express.Response) => void;

const api = express.default();
const routes: Map<string, RouteHandler> = new Map();
const ROUTE_DIR = "./api/routes";
function start(port: number): void {
  logText(">>> Loading API Routes <<<");

  readdirSync(ROUTE_DIR, { recursive: true, encoding: "utf-8" })
    .filter((file) => file.endsWith("route.js"))
    .forEach((file) => {
      const handler = require(`./routes/${file}`).default as RouteHandler;

      if (!handler) {
        logError(`Failed to load route from file: ${file}. No default export found.`);
        return;
      }

      api.get(`/${dirname(file) === "." ? "" : dirname(file)}`, handler);
      logText(`Route "/${dirname(file) === "." ? "" : dirname(file)}" loaded`)
    });

  api.listen(port, () => {
    console.log(`API is running on port ${port}`);
  });
}

export default { start };