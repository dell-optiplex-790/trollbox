var logger = require('./logger');
var sendMessage = require('./message-sender');
var printNick = require('./nick-printer');
var encoder = require('./encoder');
var configManager = require('./config-manager');
var serverCfg = configManager.read('server');

module.exports = function gotoRoom(socket, io, users, room, leaderboard) {
    PREV_ROOM = Object.keys(socket.rooms)[0]
	socket.join(room);
	socket.leave(PREV_ROOM);
    users[socket.id].room = room;
	sendMessage(
        io.to(PREV_ROOM).to(room), // destination sockets 
        printNick(users[socket.id])+' has entered room: <b>' + encoder.encode(room) + '</b>', // message
        serverCfg.serverUser, // sender
        true // yes, this is a system message
    );

    io.emit('update users', leaderboard.map(u=>users[u])) // fix for ruxvania client

	logger.log(`~ ${users[socket.id].nick} has entered room: ${room}`)
}