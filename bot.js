const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const profiles = new Map();
let currentProfile = null;

client.once('ready', () => {
  console.log('Ready!');

  // Define a new global slash command
  client.application.commands.create({
    name: 'create',
    description: 'Creates a new soul',
    options: [
      {
        name: 'name',
        type: 'STRING',
        description: 'The name of the bot profile',
        required: true,
      },
      {
        name: 'essence',
        type: 'STRING',
        description: 'The essence of the bot profile',
        required: true,
      },
      {
        name: 'personality',
        type: 'STRING',
        description: 'The personality of the bot profile',
        required: true,
      },
      {
        name: 'avatar',
        type: 'STRING',
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

  console.log('got message', message);
  if (message.channel.id === '1111061024645320834') {
    if (message.content.startsWith('!')) {
      const name = message.content.slice(1);

      if (profiles.has(name)) {
        currentProfile = profiles.get(name);
        await message.reply(`Profile switched to ${name}!`);
      }
      else if (currentProfile) {
        return;
      }
    }
    await client.user.setUsername(currentProfile.name);
    const avatar = currentProfile.avatar;
    await client.user.setAvatar(avatar);
    message.channel.send('Hello!');
  }
});

client.login('MTExMTA0NzQxOTM2NzUzNDcxMw.G2PiRv.uxo1RHoLPq95y1i7tbRtUFzcqfAe8Se2WM5ZpU');
