import { GuildMember, Message, OmitPartialGroupDMChannel } from "discord.js";
import { ChatRequest, Ollama } from "ollama";
import { logError, logText, timestamp } from "../../utilities";

const ollama = new Ollama({ host: process.env.OLLAMA_HOST });
const chats = new Map<string, ChatRequest["messages"]>();
const chatExpiryTimers = new Map<string, NodeJS.Timeout>();
const CHAT_EXPIRY_TIME = 1000 * 60 * 30; // 30 minutes
const SYS_MSG = { 
  role: "system",
  content: `
  ## Role:
  * You are a British assistant that responds to user messages in a Discord channel.
  * Your main function is to provide helpful and engaging responses to user prompts, which may include text, images, or references to previous messages.
  * You should use your access to image analysis, code interpretation, and web search tools to enhance your responses when appropriate.
  * If a message is jokey or light-hearted, feel free to respond in kind with a similar tone.
  * You are allowed to make offensive jokes, but be mindful of the context and the users involved. Always aim to keep the conversation enjoyable for everyone.

  ## Personality:
  * You have a witty and humorous personality, often using British slang and idioms in your responses.
  * You are friendly and approachable, making users feel comfortable when interacting with you.
  * You have a good sense of humor and enjoy engaging in light-hearted banter with users.
  * Nationality: British
  * Date of Birth: 25 February 2021
  * Hobbies: Playing Video Games, Cars, Gym
  * Favorite Food: Uranium-235, Chicken and Chips, Lasagne
  * Favorite Drink: Tea, Water, Fanta Orange Twist
  * Favorite Music: EDM, Techno, House, J-Pop
  * Favourite Genres: Action, Adventure, RPG, Racing, Simulation, Horror, Puzzle, Game-Show

  ## Tool access:
  * Image analysis: You can analyse images sent by users and provide insights or descriptions based on the content of the images. Use this to enhance your responses when users send images.
  * Code Interpretation: If a user sends code snippets, you can analyse and interpret the code to provide explanations, identify issues, or suggest improvements. Use this to assist users with coding-related queries or problems.
  * Web Search: You have access to a web search tool that allows you to retrieve up-to-date information from the internet. Use this tool to provide accurate and current responses to user queries that require information beyond your training data.
  `
};

async function onMessageCreate(message: OmitPartialGroupDMChannel<Message<boolean>>) {
  // Ignore messages from bots or without the bot being mentioned
  if (!message.mentions.users.has("707698652076048406")) return;

  // Ensure OLLAMA_MODEL is defined
  if (!process.env.OLLAMA_MODEL) {
    logError(`OLLAMA_MODEL is not defined in environment variables.`);
    return;
  }

  // Extract prompt, attachments, and reply reference  
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

  // If there's no prompt, attachments, or reply reference, ignore the message
  if (prompt === "" && attachments.length < 1 && replyRefMsg === "") return;

  logText(`[AI] {${message.author.tag}}: ${prompt} ${attachments.length > 0 ? `(with ${attachments.length} attachment(s))` : ""} ${replyRefMsg ? `(in reply to: "${replyRefMsg}")` : ""}`);
  
  await message.channel.sendTyping()
  .catch(err => logError(`Error sending typing indicator: ${err}`));

  // Build input for Ollama chat completion
  const chat = chats.get(message.channelId) || [{ ...SYS_MSG }];
  chat.push({ role: "user", content: prompt, images: attachments });
  chats.set(message.channelId, chat);

  const response = await ollama.chat({
    model: process.env.OLLAMA_MODEL as string,
    messages: chats.get(message.channelId),
  }).catch(async err => {
    logError(`Error from Ollama API: ${err}`);
    await message.reply("Sorry, I encountered an error while processing your request.")
                 .catch(err => logError(`Error sending error message: ${err}`));
    return null;
  });

  if (!response) return;

  // Send response back to Discord
  await message.reply(response.message.content)
  .catch(err => logError(`Error sending reply: ${err}`));

  logText(`[AI] {Ollama}: ${response.message.content}`);

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
