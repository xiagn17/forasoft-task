
module.exports = (function () {
    let rooms = {};

    return {
        hasRoom: function (roomID) {
            if (rooms[roomID]) {
                return rooms[roomID];
            }

            return false;
        },
        addRoom: function (roomID) {
            rooms[roomID] = {onlineUsers: []};
        },
        addUser: function (roomID, name, id) {
            const user = {
                name,
                id
            };
            rooms[roomID].onlineUsers.push(user);
        },
        deleteUser: function (roomID, userName, deleteRoom) {
            if (deleteRoom) {
                this.deleteRoom(roomID);
                return;
            }

            rooms[roomID].onlineUsers = rooms[roomID].onlineUsers
                .filter(user => userName !== user.name);
        },
        deleteRoom: function (roomID) {
            delete rooms[roomID];
        }
    }
}());