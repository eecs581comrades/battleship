const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",  // Allow all origins to post to this server.
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json());

const port = 5000;
const localNetworkHost = '0.0.0.0';

// For setup and original fetching of information
app.post('/data', (req, res) => {
    const data = req.body;

    // Do Things

    res.send({ status: 'success' });

    io.emit('update', data);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/assets/serverView.html');
});

// For in-game communication
io.on('connection', (socket) => {
    console.log("Client Connected:", socket.id);

    socket.emit('update', { text: 'Welcome to the real-time server!' });

    socket.on('clientMessage', (message) => {
        console.log('Message from client:', message);
        
        socket.emit('update', { status: 'Message received!' });
    });

    socket.on('disconnect', () => {
        console.log("Client Disconnected:", socket.id);
    });
});

server.listen(port, localNetworkHost, () => {
    console.log(`The BattleShip Server is now active on http://${localNetworkHost}:${port}`)
});