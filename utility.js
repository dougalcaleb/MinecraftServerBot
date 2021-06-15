const Ping = require("ping");
const Net = require("net");

// Returns a string that says how long it has been since the given timestamp
function getTimeSince(date) {
	var seconds = Math.floor((Date.now() - date) / 1000);
	var interval = seconds / 31536000;
	if (interval > 1) {
		if (Math.floor(interval) > 5) {
			return "a very long time ago";
		}
		return Math.floor(interval) + (Math.floor(interval) == 1 ? " year ago" : " years ago");
	}
	interval = seconds / 2592000;
	if (interval > 1) {
		return Math.floor(interval) + (Math.floor(interval) == 1 ? " month ago" : " months ago");
	}
	interval = seconds / 86400;
	if (interval > 1) {
		return Math.floor(interval) + (Math.floor(interval) == 1 ? " day ago" : " days ago");
	}
	interval = seconds / 3600;
	if (interval > 1) {
		return Math.floor(interval) + (Math.floor(interval) == 1 ? " hour ago" : " hours ago");
	}
	interval = seconds / 60;
	if (interval > 1) {
		return Math.floor(interval) + (Math.floor(interval) == 1 ? " minute ago" : " minutes ago");
	}
	return "Just now";
}

function getTime(date) {
	return new Date(date).toLocaleTimeString("en-US") + ", " +  new Date(date).toLocaleDateString("en-US");
}

function pingServer(ip, callback) {
   // Ping.sys.probe("localhost:25565", (active) => {
   //    callback(active);
   // });

   let socket = new Net.Socket();
   socket.setTimeout(3000);
   socket.on("connect", () => {
      callback(true);
      socket.destroy();
   }).on("error", () => {
      callback(false);
   }).on("timeout", () => {
      callback(false);
   }).connect(25565, "localhost");
}

function parsePlayerName(name) {
   let fixedName = name.trim().substring(2, name.length - 2);
   fixedName = fixedName.split("").map((char) => {
      if (char === "*" || char === "_") {
         return "\\" + char;
      } 
      return char;
   });
   fixedName = fixedName.join("");
   return fixedName;
}

module.exports = { getTimeSince, getTime, pingServer, parsePlayerName };