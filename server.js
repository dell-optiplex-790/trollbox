var users = {}
var colors = {}
var leaderboard = []
var fs = require('fs');
var express = require('express');
var http = require('http');
var socketIo = require('socket.io');


// modules
var hash = require('./modules/hasher');
var parseCmd = require('./modules/command-parser');
var configManager = require('./modules/config-manager');
var logger = require('./modules/logger');
var sendMessage = require('./modules/message-sender');
var encoder = require('./modules/encoder');
var checkForBan = require('./modules/ban-checker');

var serverCfg = configManager.read('server');

var date = new Date();
logger.log('\n==== Server started at ' + date.toLocaleDateString("en-GB", {
	hour: "2-digit",
	minute: "2-digit",
	day: "2-digit",
	month: "2-digit",
	year: "numeric"
}) + ' ====');


var configs = ["server", "banned_users", "banned_words"];

if(serverCfg.serveClient) {
	configs.push("mimes");
}


for(var i = 0; i < configs.length; i++) {
	logger.log("Validating configuration file: " + configs[i]);


	if(configManager.exists(configs[i])) {


		logger.log("\tExists: true");

		if(configManager.validate(configs[i])) {

			logger.log("\tValid: true");

		} else {

			logger.log("\tValid: false");
			logger.log("");
			logger.log("Server ERROR: JSON syntax is invalid, exiting!")
			process.exit();

		}

	} else {

		logger.log("\tExists: false");
		logger.log("");
		logger.log("Server ERROR: Configuration file does not exist, exiting!")
		process.exit();

	}

	logger.log("");
}

logger.log("Config validation succeeded, starting server set-up...")

var app = express();
var server = http.createServer(app);
var io = socketIo(server);

if(serverCfg.serveClient) {
	var fileHandler = require('./modules/file-handler');
	app.all('*a', (req, res) => {
		fileHandler(req, res);
	});
}


Array.prototype.random = function(){
	return this[Math.floor(Math.random()*this.length)];
}




io.on('connection', (socket) => {
	checkForBan(socket, leaderboard);
	socket.join('atrium'); // default room
	socket.leave(socket.id)
    socket.on('message', (data) => {
		checkForBan(socket, leaderboard);
        if(users[socket.id]) {
			wb = configManager.read('banned_words')
			for(i=0;i<wb.length;i++) {
				if(data.toLowerCase().includes(wb[i])) {
					return
				}
			}
			if(!parseCmd(socket, io, users, data, leaderboard)) {
				return;
			}

			sendMessage(
				io.to(Object.keys(socket.rooms)[0]),
				data,
				{...users[socket.id], room: Object.keys(socket.rooms)[0]}
			);
			delete d
		}
    });
	
	socket.on('user joined', (pseudo, color, style, pass) => {
		if(!color) {
			if(!colors[pseudo]) {
				color = ['orangered', 'green', '#0088ff', '#fb8700', 'purple', 'magenta'].random()
				colors[pseudo] = color
			} else {
				color = colors[pseudo]
			}
		}
		if(!users[socket.id]) {
			home = hash(socket.handshake.address);
			users[socket.id] = {nick: encoder.encode(pseudo), color, home}
			logger.log(`-> ${users[socket.id].nick} has entered teh trollbox`)
			io.to('atrium').emit('user joined', users[socket.id])
			if(!leaderboard.includes(socket.id)) {
				leaderboard.push(socket.id)
			}
			sendMessage(
				socket,
				'Welcome',
				{nick: '~', color: '#fff', home: 'nodejs'},
				true
			)
		} else {
			if(users[socket.id].color!==color) {users[socket.id].color=color} // be silent about it...
			if(users[socket.id].nick!==pseudo) {
				ou = users[socket.id]
				users[socket.id].nick = encoder.encode(pseudo)
				io.emit('user change nick', [ou, users[socket.id]])
				delete ou
			}
		}
		io.emit('update users', leaderboard.map(u=>users[u]))
	})

    socket.on('disconnect', () => {
		if(users[socket.id]) {
			io.emit('user left', users[socket.id])
			logger.log(`<- ${encoder.decode(users[socket.id].nick)} has left teh trollbox`)
			leaderboard.splice(leaderboard.indexOf(socket.id), 1) // leaderboard fix
			io.emit('update users', leaderboard.map(u=>users[u]))
			delete users[socket.id]
		}
    });
});

server.listen(serverCfg.port, '0.0.0.0');
logger.log("Server set-up completed. begin chat log here:\n");