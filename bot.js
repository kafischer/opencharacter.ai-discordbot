const { Client, EmbedBuilder } = require('discord.js');
const { Soul, LanguageProcessor } = require('socialagi');
const { GatewayDispatchEvents, GatewayIntentBits, ChannelType, ApplicationCommandOptionType, PermissionFlagsBits, MessageType } = require('discord-api-types/v10');

const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc, getDoc, deleteField } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.OPENSOULS_DISCORD_FB_APIKEY,
  authDomain: `${process.env.OPENSOULS_DISCORD_FB_DOMAIN}.firebaseapp.com`,
  projectId: process.env.OPENSOULS_DISCORD_FB_DOMAIN,
  storageBucket: `${process.env.OPENSOULS_DISCORD_FB_DOMAIN}.appspot.com`,
  messagingSenderId: process.env.OPENSOULS_DISCORD_FB_SENDERID,
  appId: process.env.OPENSOULS_DISCORD_FB_APPID,
  measurementId: process.env.OPENSOULS_DISCORD_FB_MEASID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const souls = new Map();
const category = '💫 soul chat';

client.once('ready', async () => {
  console.log('Configuring ...');
  
  console.log('Loading souls');
  const soulRecords = await getDoc(doc(db, 'souls', 'record'));
  const soulsData = soulRecords.data() || {};
  const names = Object.keys(soulsData);
  console.log(`=> found ${names.length || 0} souls`);
  for (const name of names) {
    console.log(`--> loading ${name}`);
    const {blueprint, channelId, avatar} = soulsData[name];
    const soul = new Soul(blueprint);
    souls.set(name.toLowerCase(), {soul, channelId});
    registerSoul(soul, avatar, channelId);
  }      
  console.log('Souls loaded');
  
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
    description: 'Creates a new soul in the current channel',
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
    description: 'List custom souls in this channel',
    options: [],
  });
  console.log('Created /list');

  await client.application.commands.create({
    name: 'disintegrate',
    description: 'Disintegrate a soul',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'Unique name of the soul',
        required: true,
      },
    ],
  });
  console.log('Created /disintegrate');

  await client.application.commands.create({
    name: 'whois',
    description: 'Inspect a soul in this channel',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'Unique name of the soul',
        required: true,
      },
    ],
  });
  console.log('Created /whois');

  await client.application.commands.create({
    name: 'newroom',
    description: 'Create a new channel for chatting souls',
    options: [
      {
        name: 'name',
        type: ApplicationCommandOptionType.String,
        description: 'Name of new room to appear under SOUL CHAT',
        required: true,
      },
    ],
  });
  console.log('Created /newroom');

  await client.application.commands.create({
    name: 'destroyroom',
    description: 'Create a new channel for chatting souls',
    options: [
      {
        name: 'sure',
        type: ApplicationCommandOptionType.Boolean,
        description: 'blah',
        required: true,
      },
    ],
  });
  console.log('Created /destroyroom');

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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const channelId = interaction.channelId;
  const channel = client.channels.cache.get(channelId);
  if (commandName === 'create') {
    const user = interaction.user;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    if ((!channel.topic || !channel.topic.includes(user)) && !isAdmin) {
      await interaction.reply('❗️ You can only create souls in channels you\'ve made through /newroom');
      return;
    }
    const name = interaction.options.getString('name');
    const found = [...souls.keys()];
    if (found.includes(name)) {
      const existingChannelId = souls.get(name).channelId;
      const existingChannel = client.channels.cache.get(existingChannelId);
      await interaction.reply(`❗️ Soul of **${name}** exists in ${existingChannel}`);
    } else {
      const essence = interaction.options.getString('essence');
      const personality = interaction.options.getString('personality');
      const avatar = interaction.options.getString('avatar');

      const blueprint = {name, essence, personality, languageProcessor: LanguageProcessor.GPT_3_5_turbo};
      const soul = new Soul(blueprint);
      await setDoc(doc(db, 'souls', 'record'), {[name.toLowerCase()]: {blueprint, channelId, avatar}}, {merge: true});
      souls.set(name.toLowerCase(), {soul, channelId});
      registerSoul(soul, avatar, channelId);

      await interaction.reply(`✨
✨✨
  ✨✨✨
    ✨✨✨✨✨
         ✨✨✨✨✨✨✨✨
                ✨ Soul of **${name}** is born into ${channel}!`);
    }
  } else if (commandName === 'list') {
    const found = [...souls.keys()].filter(name => souls.get(name).channelId === channelId);
    const guild = interaction.guild;
    let categoryChannel = guild.channels.cache.find(
      channel => channel.type === ChannelType.GuildCategory && channel.name === category
    );
    await interaction.reply(`💫 ${channel.parentId === categoryChannel ? channel.topic : 'A space managed by the **admins**'}

✨ Found ${found.length} souls: ${found.map(n => `**${n}**`).join(', ')} in this channel`);
  } else if (commandName === 'disintegrate') {
    const user = interaction.user;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    if ((!channel.topic || !channel.topic.includes(user)) && !isAdmin) {
      await interaction.reply('❗️ You can only disintegrate souls in channels you\'ve made through /newroom');
      return;
    }
    const name = interaction.options.getString('name');
    const found = [...souls.keys()];
    if (found.includes(name)) {
      souls.delete(name);
      await setDoc(doc(db, 'souls', 'record'), {[name.toLowerCase()]: deleteField()}, {merge: true});
      await interaction.reply(`🧨
🧨
🧨
🧨
💥 Disintegrated soul of **${name}**`);
    } else {
      await interaction.reply('❗️ No soul to disintegrate');
    }
  } else if (commandName === 'whois') {
    const name = interaction.options.getString('name');
    const found = [...souls.keys()];
    if (found.includes(name)) {
      const soul = souls.get(name).soul;
      const {essence, personality} = soul.blueprint;
      await interaction.reply(`✨ Soul of **${name}**

🪄 **Essence**: ${essence}

💫 **Personality**: ${personality}`);
    } else {
      await interaction.reply('❗️ No soul to inspect');
    }
  } else if (commandName === 'newroom') {
    const guild = interaction.guild;
    const category = '💫 soul chat';
    let categoryChannel = guild.channels.cache.find(
      channel => channel.type === ChannelType.GuildCategory && channel.name === category
    );

    if (categoryChannel) {
      console.log(`Found category with id ${categoryChannel.id}`);
    } else {
      categoryChannel = await guild.channels.create({
        name: category,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [],
      });
    }
  
    const channelName = interaction.options.getString('name');
    const user = interaction.user;
    try {
      const newChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: [],
        parent: categoryChannel.id,
        topic: `A soul chat managed by ${user}`
      });

      await interaction.reply(`${newChannel} created successfullly`);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  } else if (commandName === 'destroyroom') {
    const channelId = interaction.channelId;
    const guild = interaction.guild;
    const channel = client.channels.cache.get(channelId);
    const user = interaction.user;
    if (channel.topic && channel.topic.includes(user)) {
      await guild.channels.delete(channelId);
    } else {
      await interaction.reply('❗ Error: you can only delete channels you\'ve created through /newroom');
    }
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  console.log('got message', message.content, message.type);
  if (message.mentions.users.size > 0) return;

  if ([MessageType.Default, MessageType.UserJoin].includes(message.type)) {
    const found = [...souls.keys()].filter(name => souls.get(name).channelId === message.channelId);
    for (const name of found) {
      message.channel.sendTyping();
      souls.get(name.toLowerCase()).soul.tell(`${message.author.username} says ${message.content}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN_OPEN_SOULS);
