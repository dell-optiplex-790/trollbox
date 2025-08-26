var encoder = require('./encoder');
var logger = require('./logger');

module.exports = function sendMessage(socket, message, user, isSystem) {
    socket.emit('message', {
        msg: isSystem ? message : encoder.encode(message),
        ...user,
        date: Date.now()
    });

    var date = new Date();

    if(user.room) {
        logger.log(`${date.toLocaleDateString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })}    (room=${user.room}) [${user.nick}] ${message}`)
    } else {
        logger.log(`${date.toLocaleDateString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        })}    [${user.nick}] ${message}`);
    }
}