import readline from "node:readline";
import { onLine } from "./handlers";
import { commands, loadCommands } from "./command-manager";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function start() {
  loadCommands(`${__dirname}/commands`);
  rl.on("line", onLine);
}

export default {
  commands,
  start,
};
