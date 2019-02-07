const roomsAdmin = require('./rooms');
const sendUpdatedUsers = require('./sendUpdatedUsers');


module.exports = (io) => {

    let offers = [];

    return (function () {
        io.on('connection', (socket) => {
            socket.on('connectToRoom', (roomID, username) => {
                // Joins to the room for the first time
                socket.join(roomID);
                console.log('joined to ' + roomID);

                let name = username;

                const room = roomsAdmin.hasRoom(roomID);
                !room ? roomsAdmin.addRoom(roomID) : null;
                name ? roomsAdmin.addUser(roomID, name, socket.id) : null;

                // Sends updated users everyone in the room
                sendUpdatedUsers(io, roomID);

                // Forwards the received message to others in the room
                socket.on('message', (msg) => {
                    socket.to(roomID).emit('message', msg);
                    io.sockets.connected[socket.id].emit('message', {
                        ...msg,
                        myMessage: true
                    });
                });


                // Accepts the first offers for other participants
                socket.on('sdp-creator-offer', (offer, id) => {
                    offers.push({
                        offer,
                        fromPeerID: id
                    });
                });
                // Then - send a offer to the every online user and remember them
                socket.on('sdp-creator-offer-end', (offer, id) => {
                    offers.push({
                        offer,
                        fromPeerID: id
                    });

                    const users = roomsAdmin.hasRoom(roomID).onlineUsers
                        .filter(user => user.id !== socket.id);

                    if (users) {
                        for (let i = 0; i < users.length; i++) {
                            const targetId = users[i].id;

                            if (io.sockets.connected[targetId]) {
                                offers[i].targetID = targetId;
                                io.sockets.connected[targetId].emit('sdp-creator-offer', offers[i].offer, name);
                            }
                        }

                    }

                });

                // Redirects answer to source peer
                socket.on('sdp-answer', (answer, peerID) => {

                    for (let i = 0; i < offers.length; i++) {
                        const {targetID, fromPeerID} = offers[i];

                        if (targetID === socket.id && io.sockets.connected[peerID]) {

                            io.sockets.connected[peerID].emit('sdp-answer', answer, fromPeerID);
                            break;
                        }
                    }

                });

                // Sends candidate (source) to target peer
                socket.on('candidate-creator-first', (candidate, fromID) => {

                    for (let i = 0; i < offers.length; i++) {
                        const { fromPeerID, targetID } = offers[i];

                        if (fromPeerID === fromID && io.sockets.connected[targetID]) {
                            io.sockets.connected[targetID].emit('candidate-creator-first', candidate, socket.id, fromID);
                            return;
                        }
                    }
                });

                // The last part of exchanging the candidates
                socket.on('candidate-receiver', (candidate, socketPeerID, peerID) => {
                    if (io.sockets.connected[socketPeerID]) {
                        io.sockets.connected[socketPeerID].emit('candidate-receiver', candidate, socketPeerID, peerID);
                    }
                });

                // Clears unnecessary(already) offers and notify another
                socket.on('close-video', () => {
                    offers = [];
                    socket.to(roomID).emit('close-video');
                });
                // If someone comes to room and stream is going - block him ability to start a new one
                io.sockets.connected[socket.id].emit('already-streaming', offers.length);


                // If user has been invited, adds him into the room (and remember his name)
                socket.on('addUser', (username) => {
                    name = username;

                    roomsAdmin.addUser(roomID, name, socket.id);
                    sendUpdatedUsers(io, roomID);

                    // If someone started streaming before user entered the name
                    io.sockets.connected[socket.id].emit('already-streaming', offers.length);

                    // Handles disconnection of invited user
                    socket.on('disconnect', () => {
                        const lastUserDisconnected = Object.keys(io.sockets.connected).length === 0;
                        roomsAdmin.deleteUser(roomID, name, lastUserDisconnected);

                        sendUpdatedUsers(io, roomID);
                    })
                });
                // Handles disconnection of the room creator
                socket.on('disconnect', () => {
                    if (name) {
                        const lastUserDisconnected = Object.keys(io.sockets.connected).length === 0;
                        roomsAdmin.deleteUser(roomID, name, lastUserDisconnected);

                        sendUpdatedUsers(io, roomID);
                    }
                })
            });

        });

    }());
};



