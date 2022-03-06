# Nubs-Discord-Chat-Relay
Relays messages sent in Discord to a Garry's Mod server, and vice versa.
For a step by step tutorial, please watch this [video]().

# Requirements
### Required Garry's Mod addons:
* [gm_bromsock](https://github.com/Bromvlieg/gm_bromsock) - Installation:
  * Find the `Builds` directory, and find an appropriate dll file for the operating system your server runs on
  * In your server files, navigate to `garrysmod/lua/bin`. The bin folder likely doesn't exist, so create it and drop the dll file in there
* [Gmod Websockets](https://github.com/HunterNL/Gmod-Websockets) - Installation
  * Download the zip file and drop it in `garrysmod/addons`. **Note: If you're on a linux based server, you will need to make every folder lowercase.**

### You will need [Node.js](https://nodejs.org/en/) for the Discord bot. Required Node modules:
* [Discord.js](https://discord.js.org/#/docs/main/stable/general/welcome) - Install with `npm i discord.js`
* [Websockets](https://github.com/websockets/ws) - Install with `npm i ws`
* [Axios](https://github.com/axios/axios) - Install with `npm i axios`
