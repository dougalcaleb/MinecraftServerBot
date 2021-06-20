const Discord = require("discord.js");
const client = new Discord.Client();
const utility = require("./utility");
const token = require("./token");

//?  PLANNED FEATURES
/**
 * FROM DISCORD
 * - start/stop/restart server
 *    - requires access to a run.bat (local node server if it can execute files)
 * - kick, ban, whitelist/blacklist edit
 * FROM SERVER 
 * - send restart request
 * - send ticks and memory
 * */

//* ====================================
//* DISCORD
//* ====================================

let server = {
	lastOnline: 0,
	online: false,
   players: [],
   health: [],
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
   
   client.user.setActivity("DevServer", { type: "WATCHING" });
});

client.on("message", (message) => {
	if (message.channel.id === "854133172564131870") {
		let type = "";
		let player = "";

		// Server offline
		if (message.content.includes("SERVER_SHUTDOWN_PROCESS")) {
			type = "offline";
			server.online = false;
			server.lastOnline = Date.now();

			server.players = [];
		}
		// Server online
		if (message.content.includes("SERVER_INIT_SUCCESS")) {
			type = "online";
			server.online = true;
			server.lastOnline = Date.now();

			global.pingInt = setInterval(() => {
				// console.log("Pinging server");
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
		if (message.content.includes("joined. online:")) {
			type = "join";
			server.lastOnline = Date.now();
			server.online = true;

			player = utility.parsePlayerName(message.content.split(" joined. online: ")[0]);

			server.players.push(player);
		}
		// Player leaves
		if (message.content.includes("left. online:")) {
			type = "leave";

			player = utility.parsePlayerName(message.content.split(" left. online: ")[0]);

			server.players = server.players.filter((playerOnline) => {
				return playerOnline != player;
			});
      }
      // Health update
      if (message.content.includes("SERVER_HEALTH_REPORT")) {
         type = "health";
         server.lastOnline = Date.now();
         server.online = true;

         let report = message.content.split("|");
         report.shift();
         report[0] = report[0].split(": ");
         report[0][1] = report[0][1].match(/^-?\d+(?:\.\d{0,1})?/)[0];
         report[0] = report[0].join(": ");
         server.health[0] = report[0];
         server.health[1] = report[1];
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