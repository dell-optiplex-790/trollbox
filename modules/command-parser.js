var gotoRoom = require('./goto-room');
var findRooms = require('./room-finder');
var sendMessage = require('./message-sender');
var configManager = require('./config-manager');
var serverCfg = configManager.read('server');

module.exports = function parseCmd(socket, io, users, data, leaderboard) {
    if(data.startsWith('/r ')) {
        gotoRoom(socket, io, users, data.slice(3), leaderboard)
        return false;
    }
    
    if(data.startsWith('/room ')) {
        gotoRoom(socket, io, users, data.slice(6), leaderboard)
        return false;
    }
    
    if(data == '/a') {
        gotoRoom(socket, io, users, 'atrium')
        return false;
    }
    
    if(data == '/r' || data == '/room') {
        rs = findRooms(io)
        msg = `Your current room is: <b>${Object.keys(socket.rooms)[0]}</b>\n––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––\nOnline rooms:\n`
        for(i=0;i<rs.length;i++) {
            msg += `${rs[i].name} (${rs[i].members})\n`
        }
        sendMessage(
            socket,
            msg,
            serverCfg.serverUser,
            true
        );
        return false;
    }
    
    if(data==='/o'||data==='/who') {
        msg = 'Users:\n=======================' + leaderboard.map(e => {
            return `\nUsername: ${users[e].nick}\nColor: ${users[e].color}\nHome: ${users[e].home}`
        }).join('\n=======================') + '\n======================='
        sendMessage(
            socket,
            msg,
            serverCfg.serverUser,
            true
        );
        return false;
    }
    return true;
}