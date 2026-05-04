import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import { logError, logText } from "../utilities";
import { VoiceConnectionStatus } from "@discordjs/voice";
import bot from ".";
import ytdl from "ytdl-core";

function joinByChannelId(voiceChannelId: string): VoiceConnection | void {
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

  return connection;
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
    return;
  }

  return connection;
}

async function playAudioFromYouTube(url: string, channelId: string) {
  const channel = bot.client.channels.cache.get(channelId);

  if (!channel || !channel.isVoiceBased()) {
    logError("[Call Manager] Invalid voice channel ID");
    return;
  }

  const connection = get(channelId) || joinByChannelId(channelId);

  if (!connection) {
    logError("[Call Manager] Failed to join voice channel");
    return;
  }

  const player = createAudioPlayer();
  const guildName = channel ? channel.guild.name : channelId;

  logText(`[Call Manager] Downloading audio from YouTube URL: ${url} for guild ${guildName}...`);
  const stream = await ytdl(url, { filter: "audioonly"  });
                           
  if (!stream) {
    logError(`[Call Manager] Failed to download audio from YouTube URL: ${url}`);
    return;
  }
  
  const resource = createAudioResource(stream);
  
  player.on(AudioPlayerStatus.Idle,       () => { logText(`[Call Manager] Finished playing audio in ${guildName}`); });
  player.on(AudioPlayerStatus.Buffering,  () => { logText(`[Call Manager] Buffering audio in ${guildName}`); });
  player.on(AudioPlayerStatus.Playing,    () => { logText(`[Call Manager] Playing audio in ${guildName}`); });
  player.on(AudioPlayerStatus.AutoPaused, () => { logText(`[Call Manager] Audio auto-paused in ${guildName}`); });
  player.on(AudioPlayerStatus.Paused,     () => { logText(`[Call Manager] Audio paused in ${guildName}`); });


  connection.subscribe(player);
  player.play(resource);
}

const calls = { join, joinByChannelId, leave, leaveByGuildId, get, playAudioFromYouTube };

export default calls;