import { ChatRequest, ChatResponse, Ollama } from "ollama";
import { readFileSync } from "fs";
import { Message, OmitPartialGroupDMChannel } from "discord.js";
import { logError, logText } from "../../utilities";

const FAKEAWAKE_USER_ID = "707698652076048406";
const ollama: Ollama = new Ollama({ host: process.env.OLLAMA_HOST });
const chats: Map<string, ChatRequest["messages"]> = new Map();
const chatExpiryTimers: Map<string, NodeJS.Timeout> = new Map();
const MAX_CHAT_HISTORY = 20;
const CHAT_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
const SYSTEM_PROMPT = {
  role: "system",
  content: readFileSync("./bot/system-prompt.md", "utf-8")
};
const VALID_IMAGE_TYPES = ["image/png", "image/jpeg"];

function resetChatExpiryTimer(channelId: string) {
  if (chatExpiryTimers.has(channelId)) {
    clearTimeout(chatExpiryTimers.get(channelId)!);
    chatExpiryTimers.delete(channelId);
  }

  chatExpiryTimers.set(channelId, setTimeout(() => {
    chats.delete(channelId);
    chatExpiryTimers.delete(channelId);
  }, CHAT_EXPIRY_TIME));
}

function getChats() {
  return Array.from(chats.entries())
    .map(([channelId, messages]) => ({
      channelId,
      messages: (messages!)
        .filter(msg => msg.role !== "system")
        .map(msg => ({
          role: msg.role,
          content: msg.content,
          images: `${msg.images ? msg.images.length : 0} image(s)` // Just indicate number of images to avoid dumping large base64 strings
        }))
    }));
}

export async function onMessageCreated(message: OmitPartialGroupDMChannel<Message<boolean>>) {
  if (message.author.id === FAKEAWAKE_USER_ID) return; // Ignore messages from bots

  /***** Track Discord channel messages *****/
  const content = `${message.member?.nickname || message.author.displayName}: ${message.cleanContent}`;
  const images = (await Promise.all(
    message.attachments.map(async (attachment) => {
      // Only accept images. Gifs or other formats crash the bot :(
      if (!attachment.contentType) return "";
      if (!VALID_IMAGE_TYPES.includes(attachment.contentType)) return "";
      const res = await fetch(attachment.url);
      const buffer = Buffer.from(await res.arrayBuffer());

      return buffer.toString("base64");
    })
  )).filter((img) => img !== "");

  logText(`[AI] Received message in channel ${message.channelId}: ${content} with ${images.length} image(s)`);
  logText(`[AI] Content types: ${message.attachments.map(att => att.contentType).join(", ")}`);

  const userMessage = {
    role: "user",
    content,
    images
  }

  if (!chats.has(message.channelId)) {
    chats.set(message.channelId, [SYSTEM_PROMPT, userMessage]);
  } else {
    const chat = chats.get(message.channelId)!;
    chat.push(userMessage);
    if (chat.length > MAX_CHAT_HISTORY) {
      chat.splice(1, chat.length - MAX_CHAT_HISTORY); // Keep system prompt and last MAX_CHAT_HISTORY - 1 messages
    }
    chats.set(message.channelId, chat);
  }

  resetChatExpiryTimer(message.channelId);

  /***** Generate Response *****/
  // Ignore message that arent for FakeAwake
  if (!message.mentions.users.has(FAKEAWAKE_USER_ID)) return;

  // Verify Ollama
  if (!process.env.OLLAMA_MODEL) {
    await message.reply("Tell Awake that I'm not configured properly. Also, someone get me a cup of tea.")
    logError("OLLAMA_MODEL environment variable is not defined.");
    return;
  }

  // Generate response
  await message.channel.sendTyping()
    .catch(err => logError(`Error sending typing indicator: ${err}`));

  const chat = chats.get(message.channelId);
  if (!chat) {
    await message.reply("Something went wrong with the conversation history. Please try again.");
    logError(`No chat history found for channel ${message.channelId}`);
    return;
  }

  const response: ChatResponse = await ollama.chat({
    model: process.env.OLLAMA_MODEL as string,
    messages: chat
  }).catch(async err => {
    await message.reply("I ran into an error while trying to generate a response. Please try again later.");
    logError(`Error generating chat response: ${err}`);
  }) as ChatResponse;

  if (response.message.content || response.message.images) {
    message.reply({
      content: response.message.content,
      files: response.message.images?.map((img, index) => ({
        attachment: Buffer.from(img.toString(), "base64"),
        name: `response_image_${index}.png`
      }))
    }).catch(err => logError(`Error sending reply: ${err}`));

    chats.set(message.channelId, [...chat, { role: "assistant", content: response.message.content || "", images: response.message.images }]);
    resetChatExpiryTimer(message.channelId);
  }
}

export default onMessageCreated;
export { getChats };