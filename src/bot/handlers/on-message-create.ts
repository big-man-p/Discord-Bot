import { GuildMember, Message, OmitPartialGroupDMChannel } from "discord.js";
import { log } from "node:console";
import { ChatRequest, Ollama } from "ollama";
import { logError, timestamp } from "../../utilities";

const ollama = new Ollama({ host: process.env.OLLAMA_HOST });
const chats = new Map<string, ChatRequest["messages"]>();
const chatExpiryTimers = new Map<string, NodeJS.Timeout>();
const CHAT_EXPIRY_TIME = 1000 * 60 * 30; // 30 minutes

async function onMessageCreate(message: OmitPartialGroupDMChannel<Message<boolean>>) {
  if (!message.mentions.users.has("707698652076048406")) return;
  if (!process.env.OLLAMA_MODEL) {
    logError(`[${timestamp()}] OLLAMA_MODEL is not defined in environment variables.`);
    return;
  }
  
  const botMember: GuildMember   = await message.guild!.members.fetch("707698652076048406");
  const prompt: string           = message.cleanContent.replace(`@${botMember.displayName}`, "").trim();
  const attachments: string[]    = await Promise.all(
                                    message.attachments.map(async (attachment) => {
                                      const res = await fetch(attachment.url);
                                      const buffer = Buffer.from(await res.arrayBuffer());
                                      const mime = res.headers.get("content-type") || "image/png";

                                      return buffer.toString("base64");
                                    })
                                  );
  const replyRef                 = message.reference ? await message.fetchReference() : null;
  const replyRefMsg: string      = replyRef ? replyRef.cleanContent : "";

  if (prompt === "" && attachments.length < 1 && replyRefMsg === "") return;

  log(`[${timestamp()}] [AI] {${message.author.tag}}: ${prompt} ${attachments.length > 0 ? `(with ${attachments.length} attachment(s))` : ""} ${replyRefMsg ? `(in reply to: "${replyRefMsg}")` : ""}`);
  message.channel.sendTyping();

  // Build input for Ollama chat completion
  const chat = chats.get(message.channelId) || [];
  chat.push({ role: "user", content: prompt, images: attachments });
  chats.set(message.channelId, chat);

  const response = await ollama.chat({
    model: process.env.OLLAMA_MODEL as string,
    messages: chats.get(message.channelId),
  });
  
  // Send response back to Discord
  message.reply(response.message.content);

  // Reset chat expiry timer
  if (chatExpiryTimers.has(message.channelId)) {
    clearTimeout(chatExpiryTimers.get(message.channelId)!);
  }

  chatExpiryTimers.set(message.channelId, setTimeout(() => {
    chats.delete(message.channelId);
    chatExpiryTimers.delete(message.channelId);
  }, CHAT_EXPIRY_TIME));
}

export default onMessageCreate;
