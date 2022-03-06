# Nubs Discord Chat Relay
Relays messages sent in Discord to a Garry's Mod server, and vice versa. It works by you hosting a Discord bot. This is needed to read messages and send player messages as webhooks. We can't use the Garry's Mod server to post to a webhook because Discord blocks post requests from Garry's Mod for some reason. The bot and server connect by the bot hosting a websocker server.

For a step by step tutorial, please watch this [video]().

# Installation:
### Garry's Mod server setup:
1. [gm_bromsock](https://github.com/Bromvlieg/gm_bromsock) - Installation:
    1. Find the `Builds` directory, and find an appropriate dll file for the operating system your server runs on.
    2. In your server files, navigate to `garrysmod/lua/bin`. The bin folder likely doesn't exist, so create it and drop the dll file in there.
2. [Gmod Websockets](https://github.com/HunterNL/Gmod-Websockets) - Installation
    1. Download the zip file and drop it in `garrysmod/addons`. 
    2. **Note: If you're on a linux based server, you will need to make every folder name lowercase.**
3. Drop `gmod_nubs_discord_chat_relay` into `garrysmod/addons`.
4. Navigate to `garrysmod/addons/gmod_nubs_discord_chat_relay/lua/autorun/server/ndc.lua` and change the `BotIP` variable to the IP address of the Discord bot.
    1. *Note:* If you're hosting the bot and gmod server on the same system, leave it as `localhost`.
    2. *Note:* If you're hosting on the same network but different computer, you will need to use internal network IPs
    3. *Note:* If you're hosting on separate networks, you will need to use public IPs and port forward port 8080 on the device hosting the Discord bot. Every ISP is different in how to port forward, so I cannot help you with this.

### Discord bot setup:
1. Put `Bot - Nubs Discord Chat Relay` anywhere in your computer.
2. Install [Node.js](https://nodejs.org/en/).
    1. You only need the long term version, recommended for most users.
3. Open `Command Prompt` and navigate to where you put the bot files.
4. Install [Discord.js](https://discord.js.org/#/docs/main/stable/general/welcome) with `npm install discord.js`.
    1. We need this to interact with the Discord API :^)
5. Install [Websockets](https://github.com/websockets/ws) with `npm install ws`.
    1. We need this to host a websocket server for the gmod server to connect to.
6. Install [Axios](https://github.com/axios/axios) with `npm install axios`.
    1. We need this to fetch Steam avatars. 
7. Open file explorer and go to where you put your bot, and find `config.json`.
8. Go to [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
9. Go to the bot section and create a new bot account.
10. Copy the bot's token into `config.json` to the variable `DiscordBotToken`.
11. Head to [Steams Web API Key](https://steamcommunity.com/dev/apikey) and create an API key for the bot. The domain can be anything. This will be used to get Steam avatars. If you don't want to use them, skip this step and the next step.
12. Copy your API key into `config.json` to the variable `SteamAPIKey`. 
13. The `SteamAvatarRefreshTime` variable is how many minutes until a Steam avatar is refreshed. You can leave this alone.
14. Set `ServerIP` to the IP of the gmod server. Remember the notes in *step 4* of the gmod server setup.
15. The `LogConnections` variable will log any attempted connections to a text file `connection_log.txt`. Make it false if you don't want them to be logged.
16. With this link, replace \[Client ID] with your bot's ID (found in General Information of the Discord developer applications), and use it to invite your bot. 
    1. `https://discord.com/api/oauth2/authorize?client_id=[Client ID]&permissions=536872000&scope=bot`
17. Start the bot with `start.bat`.
18. Find the channel you want to be used as the communication relay, and type `--setgmodchannel`. If succesful, the bot will react with ✅. From there, you should be good to go.
