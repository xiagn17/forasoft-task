const express = require('express');
const io = require('socket.io')();
const path = require('path');

const sockets = require('./sockets');

const PORT = process.env.PORT || 4000;

const app = express();


app.use(express.static(path.join(__dirname, 'client/build')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.get(/^\/room\/\w+?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.get('*', (req, res) => {
    res.send('404 Page not found')
});




const server = app.listen(PORT, () => {
    console.log(`server has been started on port ${PORT}`);
    // Establishes a socket-listener on this server and hangs handlers
    io.listen(server);
    sockets(io);
});



