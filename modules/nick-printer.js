var encoder = require('./encoder');

module.exports = function printNick(user) {
    return `<span style="color:${encoder.decode(user.color)}">${encoder.decode(user.nick)}</span>`;
}