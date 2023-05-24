const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    console.log('got message', message);
    if (message.channel.id === '1111061024645320834') {
        await client.user.setUsername('New_Username');
        const avatar = 'https://cdn-icons-png.flaticon.com/512/4711/4711987.png';
        await client.user.setAvatar(avatar);
       message.channel.send("Hello!");
    }
});

client.login('MTExMTA0NzQxOTM2NzUzNDcxMw.G2PiRv.uxo1RHoLPq95y1i7tbRtUFzcqfAe8Se2WM5ZpU');
