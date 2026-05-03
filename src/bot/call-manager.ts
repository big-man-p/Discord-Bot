import { getVoiceConnection, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import { logError, logText } from "../utilities";
import { VoiceConnectionStatus } from "@discordjs/voice";
import bot from ".";

function joinByChannelId(voiceChannelId: string) {
  const channel = bot.client.channels.cache.get(voiceChannelId);
  if (!channel || !channel.isVoiceBased()) {
    logError("[Call Manager] Invalid voice channel ID");
    return;
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator
  });

  connection.on(VoiceConnectionStatus.Signalling,   () => logText(`[Call Manager] [${channel.guild.name}] Voice connection is signalling...`));
  connection.on(VoiceConnectionStatus.Connecting,   () => logText(`[Call Manager] [${channel.guild.name}] Voice connection is connecting...`));
  connection.on(VoiceConnectionStatus.Ready,        () => logText(`[Call Manager] [${channel.guild.name}] Voice connection is ready!`));
  connection.on(VoiceConnectionStatus.Disconnected, () => logText(`[Call Manager] [${channel.guild.name}] Voice connection is disconnected.`));
}

function join(member: GuildMember) {
  if (!member.voice.channel) {
    logError("[Call Manager] User is not in a voice channel");
    return;
  }

  const connection = joinVoiceChannel({
    channelId: member.voice.channel.id,
    guildId: member.guild.id,
    adapterCreator: member.guild.voiceAdapterCreator
  });

  connection.on(VoiceConnectionStatus.Signalling,   () => logText(`[Call Manager] [${member.guild.name}] Voice connection is signalling...`));
  connection.on(VoiceConnectionStatus.Connecting,   () => logText(`[Call Manager] [${member.guild.name}] Voice connection is connecting...`));
  connection.on(VoiceConnectionStatus.Ready,        () => logText(`[Call Manager] [${member.guild.name}] Voice connection is ready!`));
  connection.on(VoiceConnectionStatus.Disconnected, () => logText(`[Call Manager] [${member.guild.name}] Voice connection is disconnected.`));
}

function leave(connection: VoiceConnection) {
  connection.destroy();
  logText(`[Call Manager] Left voice channel in guild ${connection.joinConfig.guildId}`);
}

function leaveByGuildId(guildId: string) {
  const connection = getVoiceConnection(guildId);

  if (!connection) {
    logError("[Call Manager] Bot is not in a voice channel in this guild");
    return;
  }

  connection.destroy();
  const guildName = bot.client.guilds.cache.get(guildId)?.name || guildId;
  logText(`[Call Manager] Left voice channel in guild ${guildName}`);
}

function get(guildId: string): VoiceConnection | null {
  const connection = getVoiceConnection(guildId);

  if (!connection) {
    logError("[Call Manager] Bot is not in a voice channel in this guild");
    return null;
  }

  return connection;
}

const calls = { join, joinByChannelId, leave, leaveByGuildId, get };

export default calls;