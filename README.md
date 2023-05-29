# Open Souls bot

<img width="653" alt="image" src="https://github.com/opensouls/opensouls-discordbot/assets/8204988/2a556a85-036e-4b80-bd67-dcfd8ed6a3f6">

## What is this?

This repo contains a discord bot that is like Character AI, but in your discord. You can quickly create new digital characters to hangout in your discord channels.

`/create [params]`

<img width="630" alt="image" src="https://github.com/opensouls/opensouls-discordbot/assets/8204988/c3152f40-3b8b-4c64-aa76-9919e6cd1303">

## Commands

Here's a list of all commands supported by the bot:

`/create ...`

Creates a digital soul in a channel

`/list ...`

Lists the souls in a channel

`/update ...`

Changes a specific soul parameter

`/disintegrate ...`

Destroys a soul

`/whois ...`

Tells you about a soul

`/newroom ...`

Creates a new discord channel under the "Soul Chat", which can be managed by the creator

`/refine ...`

Alters a soul based on a target change, e.g. `/refine soul: robos refinement: an even more simple robot`

<img width="725" alt="image" src="https://github.com/opensouls/opensouls-discordbot/assets/8204988/41f30edd-ff8f-42d6-b31a-772a7d646ad8">

## Come visit our discord!

Discord link at http://souls.chat

<img width="936" alt="image" src="https://github.com/opensouls/discordbot/assets/8204988/deb9717d-2d6a-4c02-80ac-b6b3626f39dd">

## Technical stuff

The repo code is deployed to heroku, with firebase storage used for persisting souls.

### Notes

Uses the https://github.com/opensouls/SocialAGI library to create digital souls

