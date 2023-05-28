const { EmbedBuilder } = require('discord.js');

function registerSoul(client, soul, profileImg, channelId) {
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

module.exports = {
  registerSoul
};