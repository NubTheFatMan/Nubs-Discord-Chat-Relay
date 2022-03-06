// This simple bot will allow discord messages to appear in your Garry's Mod server,
// as well as the server chat to appear in a Discord channel.

// https://discord.com/oauth2/authorize?client_id=CLIENTID&permissions=536873984&scope=bot

// You may notice I only require the functions I actually use. That's because Discord has made it so you have to specify
// exactly what you need/are doing with your bot. So I said fuck it and I might as well do that with everything :^) 

const { readFileSync, writeFile, appendFile } = require('fs');         // We need this to read and write the config file, and the connection log
const { WebSocketServer }                     = require('ws');         // Allows for the gmod server and the bot to communicate
const { Client, Intents, Permissions }        = require('discord.js'); // Making a bot (duh)
const { get }                                 = require('axios');      // We use http.get to get Steam avatars

let config = JSON.parse(readFileSync("./config.json"));

// Constants
const wss = new WebSocketServer({host: '0.0.0.0', port: 8080});
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS]});

// Some handy dandy functions
function logConnection(ip, status) {
    let date = new Date();
    let timestamp = `[${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} @ ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;

    let message = `${timestamp} ${status ? 'Accepting' : 'Denying'} websocket connection request from ${ip}`;

    console.log(message);

    if (config.LogConnections) 
        appendFile('/connection_log.txt', message, err => {if (err) console.err(err);});
}
function assignWebhook(wh) {
    webhook = wh; 
    config.Webhook.ID = webhook.id;
    config.Webhook.Token = webhook.token;
}

let avatarCache = {};
async function getSteamAvatar(id) {
    if (config.SteamAPIKey.length === 0)
        return;

    let needsRefresh = false;
    if (avatarCache[id]) {
        if (Date.now() - avatarCache[id].lastFetched >= config.SteamAvatarRefreshTime * 60000) {
            needsRefresh = true;
        }
    } else {
        needsRefresh = true;
    }

    if (needsRefresh) {
        let res = await get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.SteamAPIKey}&steamids=${id}`).catch(console.error);
        avatarCache[id] = {
            avatar: res.data.response.players[0].avatarfull,
            lastFetched: Date.now()
        };
    }
}

let queue = [];
let runningQueue = false;
async function sendQueue() {
    if (!webhook || runningQueue)
        return; 

    runningQueue = true;

    let i = 0;
    while (i < queue.length) {
        let packet = queue[i];
        if (packet.content.length > 0) {
            let opts = {
                content: packet.content,
                username: `(Gmod) ${packet.from}`
            }
            
            await getSteamAvatar(packet.fromSteamID);
            if (avatarCache[packet.fromSteamID]) 
                opts.avatarURL = avatarCache[packet.fromSteamID].avatar;
            
            await webhook.send(opts).catch(console.error);
        }
        i++;
    }

    // Made it to the end of the queue, clear it
    queue = [];
    runningQueue = false;
}

function getWebhook(json) {
    if (!client.isReady()) 
        return;

    client.fetchWebhook(config.Webhook.ID, config.Webhook.Token)
        .then(assignWebhook)
        .catch(() => {
            // Make a new webhook
            let guild = client.guilds.resolve(config.GuildID);
            if (guild) {
                let channel = guild.channels.resolve(config.ChannelID);
                if (channel) {
                    channel.createWebhook("Discord Communication Relay")
                        .then(assignWebhook)
                        .catch(console.error);
                }
            }
        });

    if (webhook && json) {
        if (json instanceof Array) { // From a queue of message from a lost connection
            for (let i = 0; i < json.length; i++) {
                queue.push(json[i]);
            }
            sendQueue();
        } else if (json instanceof Object) {
            queue.push(json);
            sendQueue();
        }
    }
}

// Websocket server stuff
let webhook;

let relaySocket;
wss.shouldHandle = req => {
    let ip = req.socket.remoteAddress;
    if (ip === "127.0.0.1") 
        ip = "localhost";

    let accepting = ip === config.ServerIP;

    logConnection(ip, accepting);
    
    return accepting;
};

wss.on('connection', async ws => {
    relaySocket = ws;

    relaySocket.on('message', buf => {
        console.log('Message received from Websocket connection to server.');
        
        let json;
        try {
            json = JSON.parse(buf.toString());
        } catch(err) {
            console.log("Invalid JSON received from server.");
        }

        if (!webhook) {
            getWebhook(json);
        } else {
            if (json instanceof Array) { // From a queue of message from a lost connection
                for (let i = 0; i < json.length; i++) {
                    queue.push(json[i]);
                }
                sendQueue();
            } else if (json instanceof Object) {
                queue.push(json);
                sendQueue();
            }
        }
    });
});

wss.on('close', () => console.log('Websocket server connection closed.'));
wss.on('error', err => console.log('Error occured in websocket server:\n' + err.stack));


// Discord stuff
client.on('messageCreate', message => {
    if (message.author.bot)
        return; // Do nothing for bots

    if (message.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD, true) && message.content.toLowerCase() === "--setgmodchannel") {
        config.ChannelID = message.channel.id;
        config.GuildID   = message.guild.id;
        writeFile("./config.json", JSON.stringify(config, null, 4), err => {if (err) console.error(err);});
        message.react('✅');
    } else { // I'm unsure of the best way to get messages to be sent to the gmod server almost instantaniously, so I'll just make a websocket :^)
        if (message.channel.id === config.ChannelID) {
            if (relaySocket) {
                if (relaySocket.readyState == 1) { // 1 means open, we can communicate to the server
                    let data = {};
                    data.color = message.member.displayHexColor;
                    data.author = message.member.displayName;
                    data.content = message.content;
                    if (data.content.length === 0)
                        data.content = "[attachment]"
                    relaySocket.send(Buffer.from(JSON.stringify(data)));
                }
            }
        }
    }
});

client.on('ready', () => {
    console.log("Bot initialized");

    // Get a webhook object
    getWebhook();
});

client.login(config.DiscordBotToken);