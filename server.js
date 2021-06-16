const Discord = require("discord.js");
const client = new Discord.Client();
const utility = require("./utility");
const token = require("./token");

let server = {
	lastOnline: 0,
	online: false,
	players: [],
	onlineColor: "0x00b7ff",
	offlineColor: "0xff0000",
};

let selfStats = {
	hasSentMessage: false,
	lastOnline: Date.now(),
};

let global = {
	pingInt: null,
	pingIntTimeout: 3 * 60 * 1000,
	botChannel: null,
	lastMessage: null,
};

client.once("ready", (c) => {
	console.log("MinecraftBot Ready!");

	global.botChannel = client.channels.cache.get("854121009313873940");

	if (!global.lastMessage) {
		utility.fetchBotMessage(global.botChannel, (message) => {
			global.lastMessage = message;
		});
	}
});

client.on("message", (message) => {
	if (message.channel.id === "854133172564131870") {
		let type = "";
		let player = "";

		// Server offline
		if (message.content.includes("The server is going offline!")) {
			type = "offline";
			server.online = false;
			server.lastOnline = Date.now();

			server.players = [];
		}
		// Server online
		if (message.content.includes("The server is online!")) {
			type = "online";
			server.online = true;
			server.lastOnline = Date.now();

			global.pingInt = setInterval(() => {
				console.log("Pinging server");
				utility.pingServer([25565, "localhost"], (result) => {
					console.log(`Server is online: ${result}`);
					if (result) {
						server.online = true;
					} else {
						server.online = false;
					}

               utility.editMessage(global.lastMessage, server);
				});
			}, global.pingIntTimeout);
		}
		// Player joins
		if (message.content.includes("Joined the server!")) {
			type = "join";
			server.lastOnline = Date.now();
			server.online = true;

			player = utility.parsePlayerName(message.content.split(" Joined the server!")[0]);

			server.players.push(player);
		}
		// Player leaves
		if (message.content.includes("Left the server!")) {
			type = "leave";

			player = utility.parsePlayerName(message.content.split(" Left the server!")[0]);

			server.players = server.players.filter((playerOnline) => {
				return playerOnline != player;
			});
      }
      
		// Sends new message on online/offline event
		if (type === "online" || type === "offline") {
         utility.sendNewMessage(global.lastMessage, global.botChannel, server, () => {
            utility.fetchBotMessage(global.botChannel, (message) => {
               global.lastMessage = message;
            });
         });
      // Edits message on join/leave event
		} else {
         utility.editMessage(global.lastMessage, server);
		}
	}
});

client.login(token.token);