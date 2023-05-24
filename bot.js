const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    console.log('got message', message);
    if (message.channel.id === '1111061024645320834') {
        const embed = new MessageEmbed()
            .setColor('#0099ff') // Set the color
            .setTitle('New message received') // Set the title
            .setDescription(`Message content: ${message.content}`) // Set the description
            .setAuthor('Samantha 2.0', "https://lexica.art/prompt/369f5877-5c72-4c3a-9da6-19a8766d2657");

       message.channel.send({ embeds: [embed] });
    }
});

client.login('MTExMTA0NzQxOTM2NzUzNDcxMw.G2PiRv.uxo1RHoLPq95y1i7tbRtUFzcqfAe8Se2WM5ZpU');
