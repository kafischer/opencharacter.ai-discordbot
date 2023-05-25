const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Soul, Blueprints } = require('socialagi');

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

const profiles = new Map();

client.once('ready', async () => {
  console.log('Ready!');
  // Define a new global slash command
  client.application.commands.create({
    name: 'create',
    description: 'Creates a new soul',
    options: [
      {
        name: 'name',
        type: 3,
        description: 'The name of the bot profile',
        required: true,
      },
      {
        name: 'essence',
        type: 3,
        description: 'The essence of the bot profile',
        required: true,
      },
      {
        name: 'personality',
        type: 3,
        description: 'The personality of the bot profile',
        required: true,
      },
      {
        name: 'avatar',
        type: 3,
        description: 'The avatar URL of the bot profile',
        required: true,
      },
    ],
  });

  console.log('Slash command /create has been created');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'create') {
    const name = interaction.options.getString('name');
    const essence = interaction.options.getString('essence');
    const personality = interaction.options.getString('personality');
    const avatar = interaction.options.getString('avatar');

    profiles.set(name, { name, essence, personality, avatar });

    await interaction.reply(`Profile ${name} created!`);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  console.log('got message', message.content, message.type);
  if (Object.keys(channelToSoul).includes(message.channel.id) && message.type === 0) {
    channelToSoul[message.channel.id].soul.tell(`${message.author.username} says ${message.content}`);
  }
});

for (const channelId of Object.keys(channelToSoul)) {
  const soul = channelToSoul[channelId].soul;
  const profileImg = channelToSoul[channelId].profileImg;
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

client.login(process.env.DISCORD_TOKEN);
