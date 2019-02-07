const roomsAdmin = require('./rooms');

module.exports = (io, id) => {
    io.to(id).emit('updatedRoom', roomsAdmin.hasRoom(id));
};