const { Configuration, OpenAIApi } = require('openai');
const { OPENAI_API_KEY } = require('./config');

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function process(lmProgram) {
  const res = await openai.createChatCompletion({
    'model': 'gpt-3.5-turbo',
    'messages': [{'role': 'system', 'content': lmProgram}]
  });
  return res.data.choices[0].message.content;
}

function getTag({tag, input}) {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'is');
  const match = input.match(regex);
  return match ? match[1] : null;
}

async function  refineSoul({name, essence, personality, refinement}) {
  const lmProgram = `<BACKGROUND>
You are modeling the output of a writers workshop. Today, the most eminent writers have gathered to discuss how to improve inventive personality descriptions of characters they're creating.
</BACKGROUND>

The existing character description submitted to the writers workshop is:

<NAME>${name}</NAME>
<ESSENCE>${essence}</ESSENCE>
<PERSONALITY>${personality}</PERSONALITY>

The original writer asks that the character be transfigured to be:

<TRANSFIGURATION>${refinement}</TRANSFIGURATION>

You will model:

1. Which writer will speak
2. The background of that writer
3. Their new improved description of the character

Please reply in the following format:

<AUTHOR_NAME>[[fill in]]</AUTHOR_NAME>
<AUTHOR_BACKGROUND>[[fill in]]</AUTHOR_BACKGROUND>
<NEW_NAME>[[fill in]]</NEW_NAME>
<NEW_ESSENCE>[[fill in]]</NEW_ESSENCE>
<NEW_PERSONALITY>[[fill in]]</NEW_PERSONALITY>`;
  const output = await process(lmProgram);
  const newName = getTag({tag: 'NEW_NAME', input: output});
  const newEssence = getTag({tag: 'NEW_ESSENCE', input: output});
  const newPersonality = getTag({tag: 'NEW_PERSONALITY', input: output});
  return {newName, newEssence, newPersonality};
}

module.exports = {
  refineSoul
};