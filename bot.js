const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const { Soul, Blueprints } = require('socialagi');
const samantha = new Soul(Blueprints.SAMANTHA);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const channelId = '1111061024645320834';


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

  console.log('got message', message.content);
  if (message.channel.id === '1111061024645320834') {
    samantha.tell(`${message.author.username} says ${message.content}`);
  }
});

samantha.on('says', message => {
  console.warn('SEND MESSAGE', message);
  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setAuthor({ name: 'Samantha', iconURL: 'https://i2-prod.dailystar.co.uk/incoming/article24246568.ece/ALTERNATES/s1200c/1_JS236355871.jpg' })
    .setThumbnail('https://i2-prod.dailystar.co.uk/incoming/article24246568.ece/ALTERNATES/s1200c/1_JS236355871.jpg')
    .setDescription(message);

  const channel = client.channels.cache.get(channelId);
  channel.send({ embeds: [exampleEmbed] });
});

client.login('MTExMTA0NzQxOTM2NzUzNDcxMw.G2PiRv.uxo1RHoLPq95y1i7tbRtUFzcqfAe8Se2WM5ZpU');
