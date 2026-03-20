import { GuildMember, Message, OmitPartialGroupDMChannel } from "discord.js";
import { ChatRequest, Ollama } from "ollama";

const ollama = new Ollama();
const chats = new Map<string, ChatRequest["messages"]>();
const chatExpiryTimers = new Map<string, number>();
const CHAT_EXPIRY_TIME = 1000 * 60 * 30; // 30 minutes

async function onMessageCreate(message: OmitPartialGroupDMChannel<Message<boolean>>) {
  if (!message.mentions.users.has("707698652076048406")) return;
  
  const botMember: GuildMember = await message.guild!.members.fetch("707698652076048406");
  const prompt: string = message.cleanContent.replace(`@${botMember.displayName}`, "").trim();
  const attachments: string[] = message.attachments.map((attachment) => attachment.url);
  const replyRef = message.reference ? await message.fetchReference() : null;
  const replyRefMsg: string = replyRef ? replyRef.cleanContent : "";

    // console.log(reference);
    // console.log(`${prompt.length} ${attachments.length} ${referenceMessage.length} ${referenceAttachments.length}`);

  if (prompt === "" && attachments.length < 1 && replyRefMsg === "")
    return;

  message.channel.sendTyping();

  // Build input for Ollama chat completion
  const chat = chats.get(message.channelId) || [];
  chat.push({ role: "user", content: prompt, images: attachments });
  chats.set(message.channelId, chat);

  const response = await ollama.chat({
    model: "qwen3:0.6b",
    messages: chats.get(message.channelId),
  });
  
  // Send response back to Discord
  message.reply(response.message.content);

  // Reset chat expiry timer
  if (chatExpiryTimers.has(message.channelId)) {
    clearTimeout(chatExpiryTimers.get(message.channelId)!);
  }

  chatExpiryTimers.set(message.channelId, window.setTimeout(() => {
    chats.delete(message.channelId);
    chatExpiryTimers.delete(message.channelId);
  }, CHAT_EXPIRY_TIME));
}

export default onMessageCreate;
