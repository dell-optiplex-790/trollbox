var sendMessage = require('./message-sender');
var configManager = require('./config-manager');
var hash = require('./hasher');

module.exports = function checkForBan(socket, leaderboard) {
	banned_users = configManager.read('banned_users');
	home = hash(socket.handshake.address)
	if(banned_users.includes(home)) {
		sendMessage(
			socket,
			'<em>you have been banned from teh trollbox</em>',
			{nick: '~', color: '#fff', home: 'nodejs'}
		);
		socket.disconnect()
		if(users[socket.id]) {
			leaderboard.splice(leaderboard.indexOf(socket.id), 1) // leaderboard fix
			io.emit('update users', leaderboard.map(u=>users[u]))
			delete users[socket.id]
		}
	}
}