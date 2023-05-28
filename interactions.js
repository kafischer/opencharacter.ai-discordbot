const {FS_DB: db} = require('./config');
const {AttachmentBuilder} = require('discord.js');
const { PermissionFlagsBits, ChannelType } = require('discord-api-types/v10');
const { Soul, LanguageProcessor } = require('socialagi');
const {setDoc, doc, deleteField } = require('firebase/firestore');
const {refineSoul} = require('./lmProcessing');
const {registerSoul} = require('./souls');
const fetch = require('node-fetch');
const {getImage} = require('./images');

async function create({interaction, channel, channelId, souls, client}) {
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
    const found = [...souls.keys()].filter(name => souls.get(name).channelId === channelId);
    if (found.length > 0) {
      await interaction.editReply('❗️ ERROR: Currently only one soul allowed per channel. Will fix within next few days!');
      return;
    }
    await interaction.deferReply();
    const essence = interaction.options.getString('essence');
    const personality = interaction.options.getString('personality');
    let avatar = interaction.options.getString('avatar_url');
    if (avatar === null) {
      avatar = await getImage(`Profile image of ${name}, ${essence.slice(0, 1000)}`);
    }
    const imageBuffer = await (await fetch(avatar)).buffer();
    const attachment = new AttachmentBuilder(imageBuffer, {name: `${name}.png`});

    const blueprint = {name, essence, personality, languageProcessor: LanguageProcessor.GPT_3_5_turbo};
    const soul = new Soul(blueprint);
    await setDoc(doc(db, 'souls', 'record'), {[name.toLowerCase()]: {blueprint, channelId, avatar}}, {merge: true});
    souls.set(name.toLowerCase(), {soul, channelId, avatar});
    registerSoul(client, soul, avatar, channelId);

    await interaction.editReply({content:`✨
✨✨
  ✨✨✨
    ✨✨✨✨✨
         ✨✨✨✨✨✨✨✨
                ✨ Soul of **${name}** is born into ${channel}!\n`, files: [attachment] });
  }
}

async function list({interaction, channel, channelId, souls, category}) {
  const found = [...souls.keys()].filter(name => souls.get(name).channelId === channelId);
  const guild = interaction.guild;
  let categoryChannel = guild.channels.cache.find(
    channel => channel.type === ChannelType.GuildCategory && channel.name === category
  );
  await interaction.reply(`💫 ${channel.parentId === categoryChannel ? channel.topic : 'A space managed by the **admins**'}

✨ Found ${found.length} souls: ${found.map(n => `**${n}**`).join(', ')} in this channel`);
}

async function disintegrate({interaction, channel, souls}) {
  const user = interaction.user;
  const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
  if ((!channel.topic || !channel.topic.includes(user)) && !isAdmin) {
    await interaction.reply('❗️ You can only disintegrate souls in channels you\'ve made through /newroom');
    return;
  }
  const name = interaction.options.getString('name').toLowerCase();
  const found = [...souls.keys()];
  if (found.includes(name)) {
    souls.delete(name);
    await setDoc(doc(db, 'souls', 'record'), {[name]: deleteField()}, {merge: true});
    await interaction.reply(`🧨
🧨
🧨
🧨
💥 Disintegrated soul of **${name}**`);
  } else {
    await interaction.reply('❗️ No soul to disintegrate');
  }
}

async function whois({interaction, souls}) {
  const name = interaction.options.getString('name');
  const found = [...souls.keys()];
  if (found.includes(name)) {
    const soul = souls.get(name).soul;
    const {essence, personality} = soul.blueprint;
    await interaction.reply(`✨ Soul of **${name}**

🪄 **Essence**: *${essence}*

💫 **Personality**: *${personality}*`);
  } else {
    await interaction.reply('❗️ No soul to inspect');
  }
}

async function newRoom({interaction}) {
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
}

async function destroyRoom({interaction, client}) {
  const channelId = interaction.channelId;
  const guild = interaction.guild;
  const channel = client.channels.cache.get(channelId);
  const user = interaction.user;
  if (channel.topic && channel.topic.includes(user)) {
    await guild.channels.delete(channelId);
  } else {
    await interaction.reply('❗ Error: you can only delete channels you\'ve created in your /newroom \'s');
  }
}

async function update({interaction, client, souls, channel, channelId}) {
  const user = interaction.user;
  const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
  if ((!channel.topic || !channel.topic.includes(user)) && !isAdmin) {
    await interaction.reply('❗️ You can only update souls in channels you\'ve made in your /newroom \'s');
    return;
  }
  const name = interaction.options.getString('soul');

  const found = [...souls.keys()];
  if (found.includes(name)) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'essence') {
      const newEssence = interaction.options.getString('new_essence');
      const oldSoul = souls.get(name.toLowerCase());
      const avatar = oldSoul.avatar;
      const blueprint = oldSoul.soul.blueprint;
      const oldEssence = blueprint.essence;
      blueprint.essence = newEssence;
      souls.delete(name);
      const soul = new Soul(blueprint);
      souls.set(name.toLowerCase(), {soul, channelId, avatar});
      registerSoul(client, soul, avatar, channelId);
      await setDoc(doc(db, 'souls', 'record'), {[name.toLowerCase()]: {blueprint, channelId, avatar}}, {merge: true});
      await interaction.reply(`
🔧 Updated soul of **${name}**

🪄 from **Essence**: *${oldEssence}*

🪄 to **Essence**: *${newEssence}*`);
    } else if (subCommand === 'personality') {
      const newPersonality = interaction.options.getString('new_personality');
      const oldSoul = souls.get(name.toLowerCase());
      const avatar = oldSoul.avatar;
      const blueprint = oldSoul.soul.blueprint;
      const oldPersonality = blueprint.personality;
      blueprint.personality = newPersonality;
      souls.delete(name);
      const soul = new Soul(blueprint);
      souls.set(name.toLowerCase(), {soul, channelId, avatar});
      registerSoul(client, soul, avatar, channelId);
      await setDoc(doc(db, 'souls', 'record'), {[name.toLowerCase()]: {blueprint, channelId, avatar}}, {merge: true});
      await interaction.reply(`
🔧 Updated soul of **${name}**

💫 from **Personality**: *${oldPersonality}*

💫 to **Personality**: *${newPersonality}*`);
    } else if (subCommand === 'avatar') {
      await interaction.deferReply();
      let newAvatar = interaction.options.getString('new_avatar');
      const oldSoul = souls.get(name.toLowerCase());
      const blueprint = oldSoul.soul.blueprint;
      const oldAvatar = oldSoul.avatar;
      souls.delete(name);
      const soul = new Soul(blueprint);
      if (newAvatar === null) {
        newAvatar = await getImage(`Profile image of ${name}, ${blueprint.essence.slice(0, 1000)}`);
      }
      const imageBuffer = await (await fetch(newAvatar)).buffer();
      const attachment = new AttachmentBuilder(imageBuffer, {name: `${name}.png`});
      souls.set(name.toLowerCase(), {soul, channelId, avatar: newAvatar});
      registerSoul(client, soul, newAvatar, channelId);
      await setDoc(doc(db, 'souls', 'record'), {
        [name.toLowerCase()]: {
          blueprint,
          channelId,
          avatar: newAvatar
        }
      }, {merge: true});
      await interaction.editReply({content:`
🔧 Updated soul of **${name}**

🖼 to **Avatar**`, files: [attachment]});
    } else if (subCommand === 'name') {
      const newName = interaction.options.getString('new_name');
      const newNameKey = newName.toLowerCase();
      const found = [...souls.keys()];
      if (found.includes(newNameKey)) {
        const existingChannelId = souls.get(newNameKey).channelId;
        const existingChannel = client.channels.cache.get(existingChannelId);
        await interaction.reply(`❗️ Soul of **${newName}** exists in ${existingChannel}`);
      } else {
        const oldSoul = souls.get(name.toLowerCase());
        const avatar = oldSoul.avatar;
        const blueprint = oldSoul.soul.blueprint;
        blueprint.name = newName;
        souls.delete(name);
        const soul = new Soul(blueprint);
        souls.set(newName.toLowerCase(), {soul, channelId, avatar});
        registerSoul(client, soul, avatar, channelId);
        await setDoc(doc(db, 'souls', 'record'), {[name.toLowerCase()]: deleteField()}, {merge: true});
        await setDoc(doc(db, 'souls', 'record'), {
          [newName.toLowerCase()]: {
            blueprint,
            channelId,
            avatar
          }
        }, {merge: true});
        await interaction.reply(`
🔧 Refined soul of **${name}**

🌟 from **Name**: *${name}*

🌟 to **Name**: *${newName}*`);
      }
    }
  } else {
    await interaction.reply('❗️ No soul to update');
  }
}

async function refine({client, interaction, souls, channel, channelId}) {
  const user = interaction.user;
  const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
  if ((!channel.topic || !channel.topic.includes(user)) && !isAdmin) {
    await interaction.reply('❗️ You can only refine souls in channels you\'ve made in your /newroom \'s');
    return;
  }
  const name = interaction.options.getString('soul');

  const found = [...souls.keys()];
  if (found.includes(name)) {
    await interaction.deferReply();
    const name = interaction.options.getString('soul');
    const refinement = interaction.options.getString('refinement');
    const oldSoul = souls.get(name.toLowerCase());
    const avatar = oldSoul.avatar;
    const blueprint = oldSoul.soul.blueprint;
    const {newName, newEssence, newPersonality} = await refineSoul({
      name,
      essence: blueprint.essence,
      personality: blueprint.personality,
      refinement
    });
    const oldPersonality = blueprint.personality;
    const oldEssence = blueprint.essence;
    souls.delete(name);
    blueprint.name = newName;
    blueprint.personality = newPersonality;
    blueprint.essence = newEssence;
    const soul = new Soul(blueprint);
    const newAvatar = await getImage(`Profile image of ${name}, ${newEssence.slice(0, 1000)}`);
    souls.set(newName.toLowerCase(), {soul, channelId, avatar: newAvatar});
    registerSoul(client, soul, newAvatar, channelId);
    await setDoc(doc(db, 'souls', 'record'), {[name.toLowerCase()]: deleteField()}, {merge: true});
    await setDoc(doc(db, 'souls', 'record'), {[newName.toLowerCase()]: {blueprint, channelId, avatar: newAvatar}}, {merge: true});
    const imageBuffer = await (await fetch(newAvatar)).buffer();
    const attachment = new AttachmentBuilder(imageBuffer, {name: `${newName}.png`});

    await interaction.editReply({content: `
🔧 Refined soul of **${name}**

🌟 from **Name**: *${name}*

🪄 from **Essence**: *${oldEssence}*

💫 from **Personality**: *${oldPersonality}*


🌟 to **Name**: *${newName}*

🪄 to **Essence**: *${newEssence}*

💫 to **Personality**: *${newPersonality}*

🖼 to **Avatar**`,files: [attachment] });
  } else {
    await interaction.reply('❗️ No soul to refine');
  }
}

module.exports = {
  create,
  list,
  disintegrate,
  whois,
  newRoom,
  destroyRoom,
  update,
  refine
};