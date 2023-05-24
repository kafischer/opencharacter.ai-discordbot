const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    // Check if the message is in the specific channel
    if (message.channel.id === 'testing') {
        if (message.content === '!hello') {
            message.channel.send('Hello!');
        }
    }
});

client.login('MTExMTA0NzQxOTM2NzUzNDcxMw.G2PiRv.uxo1RHoLPq95y1i7tbRtUFzcqfAe8Se2WM5ZpU');
