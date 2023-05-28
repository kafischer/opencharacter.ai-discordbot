const { Client } = require('discord.js');
const { Soul } = require('socialagi');
const { GatewayIntentBits, MessageType } = require('discord-api-types/v10');
const {registerSoul} = require('./souls');

const {doc, getDoc } = require('firebase/firestore');
const {create, list, disintegrate, whois, newRoom, destroyRoom, update, refine} = require('./interactions');
const {
  registerCreate,
  registerDestroyroom,
  registerDisintegrate,
  registerUpdate,
  registerList,
  registerNewroom,
  registerRefine,
  registerWhois,
  deleteAll
} = require('./registerInteractions');

const {FS_DB: db} = require('./config');

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
    souls.set(name.toLowerCase(), {soul, channelId, avatar});
    registerSoul(client, soul, avatar, channelId);
  }      
  console.log('Souls loaded');

  // await deleteAll(client);

  await registerCreate(client);
  await registerRefine(client);
  await registerNewroom(client);
  await registerList(client);
  await registerUpdate(client);
  await registerDisintegrate(client);
  await registerDestroyroom(client);
  await registerWhois(client);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const channelId = interaction.channelId;
  const channel = client.channels.cache.get(channelId);
  if (commandName === 'create') {
    await create({interaction, channel, channelId, souls, client});
  } else if (commandName === 'list') {
    await list({interaction, channel, channelId, souls, category});
  } else if (commandName === 'disintegrate') {
    await disintegrate({interaction, channel, souls});
  } else if (commandName === 'whois') {
    await whois({interaction, souls});
  } else if (commandName === 'newroom') {
    await newRoom({interaction});
  } else if (commandName === 'destroyroom') {
    await destroyRoom({interaction, client});
  } else if (commandName === 'update') {
    await update({interaction, client, souls, channel, channelId});
  } else if (commandName === 'refine') {
    await refine({client, interaction, souls, channel, channelId});
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  console.log('got message', message.content, message.type);
  if (message.mentions.users.size > 0) return;

  if ([MessageType.Default, MessageType.UserJoin].includes(message.type)) {
    const found = [...souls.keys()].filter(name => souls.get(name).channelId === message.channelId);
    for (const name of found) {
      await message.channel.sendTyping();
      souls.get(name.toLowerCase()).soul.tell(`[${message.author.username}] :: ${message.content}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN_OPEN_SOULS);