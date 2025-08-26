module.exports = function findRooms(io) {
    var availableRooms = [];
    var rooms = io.sockets.adapter.rooms;

    if (rooms) {
        for (var room in rooms) {
            if (rooms[room].sockets) {
                availableRooms.push({
                    name: room,
                    members: rooms[room].length
                });
            }
        }
    }

    return availableRooms;
}