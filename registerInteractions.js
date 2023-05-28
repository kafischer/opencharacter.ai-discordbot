const { ApplicationCommandOptionType } = require('discord-api-types/v10');

async function registerRefine(client) {
  await client.application.commands.create({
    name: 'refine',
    description: 'Refines a soul along a target refinement',
    options: [
      {
        name: 'soul',
        type: ApplicationCommandOptionType.String,
        description: 'Unique name of the soul',
        required: true,
      },
      {
        name: 'refinement',
        type: ApplicationCommandOptionType.String,
        description: 'A specification for how the soul should be refined, e.g. "Be the same, but more kind"',
        required: true,
      },
    ],
  });
  console.log('Created /refine');
}

async function registerUpdate(client) {
  await client.application.commands.create({
    name: 'update',
    description: 'Update a soul by changing one of its properties',
    options: [
      {
        name: 'name',
        type: 1,
        description: 'Change the essence of the soul',
        options: [
          {
            name: 'soul',
            type: 3,
            description: 'Unique name of the soul',
            required: true,
          },
          {
            name: 'new_name',
            type: 3,
            description: 'The new name of the soul',
            required: true,
          },
        ],
      },
      {
        name: 'essence',
        type: 1,
        description: 'Change the essence of the soul',
        options: [
          {
            name: 'soul',
            type: 3,
            description: 'Unique name of the soul',
            required: true,
          },
          {
            name: 'new_essence',
            type: 3,
            description: 'The new essence of the soul',
            required: true,
          },
        ],
      },
      {
        name: 'personality',
        type: 1,
        description: 'Change the personality of the soul',
        options: [
          {
            name: 'soul',
            type: 3,
            description: 'Unique name of the soul',
            required: true,
          },
          {
            name: 'new_personality',
            type: 3,
            description: 'The new personality of the soul',
            required: true,
          },
        ],
      },
      {
        name: 'avatar',
        type: 1,
        description: 'Change the avatar of the soul',
        options: [
          {
            name: 'soul',
            type: 3,
            description: 'Unique name of the soul',
            required: true,
          },
          {
            name: 'new_avatar',
            type: 3,
            description: 'The new avatar URL of the soul',
            required: false,
          },
        ],
      },
    ],
  });
  console.log('Created /update');
}

async function registerCreate(client) {
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
        name: 'avatar_url',
        type: 3,
        description: 'The avatar URL of the soul',
        required: false,
      },
    ],
  });
  console.log('Created /create');
}

async function registerList(client) {
  await client.application.commands.create({
    name: 'list',
    description: 'List custom souls in this channel',
    options: [],
  });
  console.log('Created /list');
}

async function registerDisintegrate(client) {
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
}

async function registerWhois(client) {
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
}

async function registerNewroom(client) {
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
}

async function registerDestroyroom(client) {
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
}

async function deleteAll(client) {
  const commands = await client.application?.commands.fetch();
  for (const command of commands) {
    try {
      await client.application?.commands.delete(command.id);
      console.log(`Deleted command ${command.name}`);
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = {
  registerCreate,
  registerDestroyroom,
  registerDisintegrate,
  registerUpdate,
  registerList,
  registerNewroom,
  registerRefine,
  registerWhois,
  deleteAll
};