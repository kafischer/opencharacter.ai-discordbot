const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Soul, Blueprints, LanguageProcessor } = require('socialagi');

const samantha = new Soul(Blueprints.SAMANTHA);
const page = new Soul(Blueprints.PAGE);
const reggie = new Soul(Blueprints.REGGIE);
const dustin = new Soul(Blueprints.DUSTIN);

const channelToSoul = {
  '1111126482912284723': {
    soul: dustin,
    profileImg: 'https://cdn.discordapp.com/attachments/1103405119766282491/1111125819847352330/dusty.png'
  },
  '1111126681994932244': {
    soul: samantha,
    profileImg: 'https://cdn.discordapp.com/attachments/1103405119766282491/1111129745271296030/Screen_Shot_2023-05-24_at_11.12.22_PM.png'
  },
  '1111126931916718090': {
    soul: page,
    profileImg: 'https://cdn.discordapp.com/attachments/1103405119766282491/1111127124091342868/page.png'
  },
  '1111127239577309266': {
    soul: reggie,
    profileImg: 'https://cdn.discordapp.com/attachments/1103405119766282491/1111126842125066250/reggie.png'
  },
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let currentSandboxSoul = null;
const profiles = new Map();
const sandboxChannelId = '1111406298836246628';
const guildId = '1099805146814365698';

client.once('ready', async () => {
  console.log('Ready!');
  
  // const guild = client.guilds.cache.get(guildId);
  // let commands = await guild.commands.fetch();
  // await commands.map(async (command) => {
  //   try {
  //     await guild.commands.delete(command.id);
  //     console.log(`Deleted command ${command.name}`);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // });
  // commands = await client.application?.commands.fetch();
  // await commands.map(async (command) => {
  //   try {
  //     await client.application?.commands.delete(command.id);
  //     console.log(`Deleted command ${command.name}`);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // });
    
  await client.application.commands.create({
    name: 'create',
    description: 'Creates a new soul',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'Unique name of the soul',
        required: true,
      },
      {
        name: 'essence',
        type: 3,
        description: 'The essence of the soul',
        required: true,
      },
      {
        name: 'personality',
        type: 3,
        description: 'The personality of the soul',
        required: true,
      },
      {
        name: 'avatar',
        type: 3,
        description: 'The avatar URL of the soul',
        required: true,
      },
    ],
  });
  console.log('Created /create');

  await client.application.commands.create({
    name: 'list',
    description: 'List custom souls',
    options: [],
  });
  console.log('Created /list');

  await client.application.commands.create({
    name: 'activate',
    description: 'Activate custom soul',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'The name of the soul',
        required: true,
      },
    ],
  });
  console.log('Created /activate');

});

function registerSoul(soul, profileImg, channelId) {
  soul.on('says', message => {
    console.warn('SEND MESSAGE for', soul.blueprint.name, message);
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setAuthor({ name: soul.blueprint.name, iconURL:profileImg })
      .setThumbnail(profileImg)
      .setDescription(message);

    const channel = client.channels.cache.get(channelId);
    channel.send({ embeds: [exampleEmbed] });
  });
}


for (const channelId of Object.keys(channelToSoul)) {
  const soul = channelToSoul[channelId].soul;
  const profileImg = channelToSoul[channelId].profileImg;
  registerSoul(soul, profileImg, channelId);
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'create') {
    const name = interaction.options.getString('name');
    const essence = interaction.options.getString('essence');
    const personality = interaction.options.getString('personality');
    const avatar = interaction.options.getString('avatar');

    const soul = new Soul({name, essence, personality, languageProcessor: LanguageProcessor.GPT_3_5_turbo});
    profiles.set(name, soul);
    registerSoul(soul, avatar, sandboxChannelId);
    currentSandboxSoul = soul;

    await interaction.reply(`@@@@@@@@@@@@@@@@@@@@@@@@
@ WARNING: SOUL STORE IS CURRENTLY TEMPORARY @
@@@@@@@@@@@@@@@@@@@@@@@@

✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
      Soul of ${name} is born! 
✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨`);
  } else if (commandName === 'list') {
    const found = [...profiles.keys()];
    await interaction.reply(`Found ${found.length} souls: ${found}`);
  } else if (commandName === 'activate') {
    const name = interaction.options.getString('name');
    currentSandboxSoul = profiles.get(name);
    await interaction.reply(`Activated ${name}`);
  }
});

const DEFAULT_MSG = 0;
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  console.log('got message', message.content, message.type);
  if (message.mentions.users.size > 0) return;
  if (Object.keys(channelToSoul).includes(message.channel.id) && message.type === DEFAULT_MSG) {
    message.channel.sendTyping();
    channelToSoul[message.channel.id].soul.tell(`${message.author.username} says ${message.content}`);
  }
  if (currentSandboxSoul !== null && message.channel.id === sandboxChannelId && message.type === DEFAULT_MSG) {
    currentSandboxSoul.tell(`${message.author.username} says ${message.content}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
