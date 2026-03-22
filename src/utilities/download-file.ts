import * as Axios from "axios";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import path from "path";
import logText from "./log-text";
import { pipeline } from "stream/promises";

export async function downloadFile(url: string, filePath: string) {
  let wstream = createWriteStream(filePath);
  if (!existsSync(path.dirname(filePath))) mkdirSync(path.dirname(filePath), { recursive: true });
  let response: Axios.AxiosResponse = await Axios.default.get(url, { responseType: "stream" });
  logText(`[File Manager] Status Code: ${response.status}`);
  logText(`[File Manager] Downloading "${filePath}" from "${url}"`);
  await pipeline(response.data, wstream);
  wstream.close();
  logText(`[File Manager] Downloaded "${filePath}"`);
}

export default downloadFile;
