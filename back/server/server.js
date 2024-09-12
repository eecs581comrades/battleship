const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const round = require('modules/battleshipRound');

const app = express();
const server = http.createServer(app);

let playerPartyAssociations = {};
let playerRoundAssociations = {};

let activeParties = {};
let activeRounds = {};

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
    socket.on('clientMessage', (message) => {
        console.log('Message from client:', message);
        
        socket.emit('update', { status: 'Message received!' });
    });


    socket.on('tryCreateParty', () => {
        if (playerPartyAssociations[socket.id] !== undefined){
            socket.emit('createParty', { status: 'Rejected', reason: 'Target player is already registered in a party' });
            return;
        }

        // Party Creation Logic

    });

    socket.on('tryJoinParty', (partyId) => {
        if (activeParties[partyId] === undefined){
            socket.emit('joinParty', { status: 'Rejected', reason: 'Requrested party could not be found' });
            return;
        }

        // Party Join Logic
    });

    socket.on('tryStartRound', () => {
        const party = playerPartyAssociations[socket.id];
        if (party === undefined || party.id == undefined || party.host !== socket.id){
            socket.emit('startRound', { status: 'Rejected', reason: 'The requesting player is not a member of an active party'});
            return
        }

        // Destroy Party

        const newRound = new BattleshipRound(socket.id, party.numberOfShips, party.gridDimensions);

        playerRoundAssociations[socket.id] = newRound;
    });

    socket.on('tryHit', (attemptData) => {

    });

    socket.on('disconnect', () => {
        console.log("Client Disconnected:", socket.id);
    });
});

server.listen(port, localNetworkHost, () => {
    console.log(`The BattleShip Server is now active on http://${localNetworkHost}:${port}`)
});