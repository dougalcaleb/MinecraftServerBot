const Discord = require("discord.js");
const utility = require("./utility");
const token = require("./token");
// const sys = require("sys");
const client = new Discord.Client();

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
	pingIntTimeout: 1 * 60 * 1000,
   botChannel: null,
   lastMessage: null,
};

client.once("ready", (client) => {
   console.log("MinecraftBot Ready!");
});

client.on("message", (message) => {
	if (message.channel.id === "854133172564131870") {
		let type = "";
		let player = "";
      global.botChannel = client.channels.cache.get("854121009313873940");
      
      if (!global.lastMessage) {
         global.lastMessage = global.botChannel
            .fetchMessages({ limit: 1 });
      }

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
				utility.pingServer("http://localhost:22565/", (result) => {
					console.log(`Server is online: ${result}`);
					if (result) {
						server.online = true;
					} else {
						server.online = false;
					}
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
				console.log(`Player leaving is not ${playerOnline}: ${playerOnline != player}`);
				return playerOnline != player;
			});
		}

		// Message
		let embedMsg = `${server.online ? ":white_check_mark: Online" : ":x: Offline"}
      \n:clock2: Last online: ${utility.getTime(server.lastOnline)} (${utility.getTimeSince(server.lastOnline)}) 
      \n:video_game: Players online (${server.players.length}):\n`;

		server.players.forEach((op) => {
			embedMsg += `- ${op} \n`;
		});

		const embed = new Discord.MessageEmbed()
			.setTitle("Server Stats")
			.setColor(server.online ? server.onlineColor : server.offlineColor)
			.setDescription(embedMsg);

		// Sends new message on online/offline event
		if (type === "online" || type === "offline") {
         global.lastMessage.delete();
			global.botChannel.send(embed).then;
      } else {
         global.lastMessage.edit(embed);
      }
	}
});

client.login(token.token);