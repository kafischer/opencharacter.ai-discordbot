# Open Character.AI bot

<img width="653" alt="241764865-2a556a85-036e-4b80-bd67-dcfd8ed6a3f6" src="https://github.com/opensouls/opencharacter.ai-discordbot/assets/8204988/d633eadd-a787-4aff-9f8c-3c528b430c0d">

## What is this?

This repo contains a discord bot that is like Character AI, but in your discord. You can quickly create new digital characters to hangout in your discord channels.

`/create [params]`

<img width="635" alt="Screen Shot 2023-06-19 at 5 37 01 PM" src="https://github.com/opensouls/opencharacter.ai-discordbot/assets/8204988/bc4c28e2-6b31-4b98-ba8b-38e90781d022">

## Commands

Here's a list of all commands supported by the bot:

`/create ...`

Creates a character in a channel

`/list ...`

Lists the characters in a channel

`/update ...`

Changes a specific character parameter

`/disintegrate ...`

Destroys a character

`/whois ...`

Tells you about a character

`/newroom ...`

Creates a new discord channel under the "Soul Chat", which can be managed by the creator

`/refine ...`

Alters a character based on a target change, e.g. `/refine soul: robos refinement: an even more simple robot`

<img width="732" alt="Screen Shot 2023-06-19 at 5 36 32 PM" src="https://github.com/opensouls/opencharacter.ai-discordbot/assets/8204988/4ecfb3ed-d123-4817-9a72-4fae8dc39164">

## In action, deployed into a Discord

<img width="854" alt="Screen Shot 2023-06-19 at 5 35 56 PM" src="https://github.com/opensouls/opencharacter.ai-discordbot/assets/8204988/2a7ea9d4-9647-4ccf-9072-d0478e435475">

## Technical stuff

The repo code is deployed to heroku, with firebase storage used for persisting souls.

Required env vars can be found in `config.js`

## Getting started

1. export all required environment vars in `config.js` - your discord app token and firebase tokens
1. `node bot.js`

And that's it!

## Deployment into Discord

Here's an [example tutorial](https://github.com/opensouls/samantha-discordbot) for deploying a socialagi-based bot into discord. The steps to follow are identical for this bot, plus adding channel management related permissions.

### Notes

Uses the https://github.com/opensouls/SocialAGI library to create digital souls

