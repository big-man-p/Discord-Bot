import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  GuildTextBasedChannel,
} from "discord.js";
import { BotCommand } from "../../../models";

interface IWaifu {
  endpoint: string;
  url: string;
}

// Key: Channel Id, Value: End Point
const endpointTracker: Map<string, IWaifu> = new Map();
const waifuMenu = new StringSelectMenuBuilder()
  .setCustomId("emdpoint")
  .setPlaceholder("Waifu Type...")
  .setOptions([
    {
      label: "Avatar",
      value: "avatar",
    },
    {
      label: "Cuddle",
      value: "cuddle",
    },
    {
      label: "Feed",
      value: "feed",
    },
    {
      label: "Foxgirl",
      value: "fox_girl",
    },
    {
      label: "Gasm",
      value: "gasm",
    },
    {
      label: "Genetically Engineered Catgirl",
      value: "gecg",
    },
    {
      label: "Goose",
      value: "goose",
    },
    {
      label: "Hug",
      value: "hug",
    },
    {
      label: "Kiss",
      value: "kiss",
    },
    {
      label: "Lewd",
      value: "lewd",
    },
    {
      label: "Lizard",
      value: "lizard",
    },
    {
      label: "Meow",
      value: "meow",
    },
    {
      label: "Neko",
      value: "neko",
    },
    {
      label: "Neko Gif",
      value: "ngif",
    },
    {
      label: "Pat",
      value: "pat",
    },
    {
      label: "Slap",
      value: "slap",
    },
    {
      label: "Smug",
      value: "smug",
    },
    {
      label: "Spank",
      value: "spank",
      description: "Possible NSFW results",
    },
    {
      label: "Tickle",
      value: "tickle",
    },
    {
      label: "Wallpaper",
      value: "wallpaper",
      description: "Possible NSFW results",
    },
    {
      label: "Woof",
      value: "woof",
    },
  ]);

const rerollButton              = new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle(ButtonStyle.Primary);
const saveImage                 = new ButtonBuilder().setCustomId("save_image").setLabel("Save Image").setStyle(ButtonStyle.Secondary);
const iLostButton               = new ButtonBuilder().setCustomId("i_lost").setLabel("I Lost").setStyle(ButtonStyle.Secondary);
const actionRowMenu             = new ActionRowBuilder().addComponents(waifuMenu);
const standardActionRowButtons  = new ActionRowBuilder().addComponents(rerollButton, saveImage, iLostButton);
const saveImageActionRowButtons = new ActionRowBuilder().addComponents(rerollButton, iLostButton);
const instance                  = new EmbedBuilder().setTitle("Embrace the Waifus");
const data                      = new SlashCommandBuilder().setName("waifu").setDescription("God I love looking at waifus");

async function execute(interaction: CommandInteraction) {
  const response = await fetch(`https://nekos.life/api/v2/img/avatar`);
  const data = await response.json();
  endpointTracker.set(interaction.channelId, {
    endpoint: "avatar",
    url: data.url,
  });
  instance.setImage(data.url);
  const messageResponse = await interaction.reply({
    embeds: [instance],
    components: [actionRowMenu, standardActionRowButtons] as any,
  });

  const collector = messageResponse.createMessageComponentCollector();

  collector.on("collect", async (i) => {
    switch (i.componentType) {
      case ComponentType.StringSelect:
        const endpoint = i.values[0];
        const response = await fetch(`https://nekos.life/api/v2/img/${endpoint}`);
        const data = await response.json();
        endpointTracker.set(i.channelId, { endpoint: endpoint, url: data.url });
        instance.setImage(data.url);
        i.update({
          embeds: [instance],
          components: [actionRowMenu, standardActionRowButtons] as any,
        });
        break;

      case ComponentType.Button:
        switch (i.customId) {
          case "next":
            {
              let { endpoint } = endpointTracker.get(interaction.channelId) as IWaifu;
              const response = await fetch(`https://nekos.life/api/v2/img/${endpoint}`);
              const data = await response.json();
              endpointTracker.set(i.channelId, {
                endpoint: endpoint,
                url: data.url,
              });
              instance.setImage(data.url);
              i.update({
                embeds: [instance],
                components: [actionRowMenu, standardActionRowButtons] as any,
              });
            }
            break;

          case "i_lost":
            i.reply(`lmao you lost, ${i.member}`);
            break;

          case "save_image":
            {
              let { url } = endpointTracker.get(interaction.channelId) as IWaifu;
              if (i.channel && url) (i.channel as GuildTextBasedChannel).send(url);
              i.update({
                embeds: [instance],
                components: [actionRowMenu, saveImageActionRowButtons] as any,
              });
            }
            break;
        }
        break;
    }
  });
}

export default { data, execute } satisfies BotCommand;
