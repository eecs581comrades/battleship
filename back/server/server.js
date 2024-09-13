//wil, a few notes:
//I've added in a numShips parameter to tryCreateParty, since we're going to need that for future communications
//

// ALL REQUESTS FROM CLIENTS SHOULD INCLUDE DATA FORMATTED AS A TABLE: { prop: value }
// ALL REQUESTS FROM CLIENTS MUST INCLUDE A CLIENT ID { ..., ClientId: 123456... ... }

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const round = require('./modules/battleshipRound');
<<<<<<< HEAD
const matchmaking = require('./modules/matchmaking')
=======
const [ Match, generateUniqueId ] = require('./modules/matchmaking')
>>>>>>> 9ce4380f3979d0f10c2bd4f913f859924b507e86

const app = express();
const server = http.createServer(app);

let playerPartyAssociations = {};
let playerRoundAssociations = {};

let playerSockets = {};
let socketClientAssociations = {};

let activeParties = {};
let activeRounds = {};

const io = socketIo(server, {
    cors: {
        origin: "*",  // Allow all origins to post to this server.
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json());

const port = 5100;
const localNetworkHost = '0.0.0.0';

// For setup and original fetching of information
app.post('/data', (req, res) => {
    const data = req.body;

    // Do Things
    // This is for debug access only.

    res.send({ status: 'success' });

    io.emit('update', data);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/assets/serverView.html');
});

// For in-game communication
io.on('connection', (socket) => {
    console.log("Client Connected:", socket.id);

    socket.emit('getClientId', {});

    socket.on('registerClientId', (data) => {
        playerSockets[data.ClientId] = socket;
        socketClientAssociations[socket.id] = data.ClientId;
<<<<<<< HEAD
    });

    socket.on('tryCreateParty', (numShips) => {
        if (playerPartyAssociations[socket.id] !== undefined){
=======
        console.log("Connection Registered for Client " + data.ClientId + " @ Socket " + socket.id);
        socket.ClientId = data.ClientId
    });

    socket.on('tryCreateParty', (numShips) => {
        if (playerPartyAssociations[socket.ClientId] !== undefined){
>>>>>>> 9ce4380f3979d0f10c2bd4f913f859924b507e86
            socket.emit('createParty', { status: 'Rejected', reason: 'Target player is already registered in a party' });
            return;
        }
        try{
<<<<<<< HEAD
            matchId = matchmaking.generateUniqueId();
            while (activeParties[matchId] !== undefined){
                matchId = matchmaking.generateUniqueId();
            }
            activeParties[matchId] = socket.id;
            const newMatch = new Match(socket.id, numShips, matchId)
            playerPartyAssociations[socket.id] = newMatch;
=======
            matchId = generateUniqueId();
            while (activeParties[matchId] !== undefined){
                matchId = generateUniqueId();
            }
            activeParties[matchId] = socket.ClientId;
            const newMatch = new Match(socket.ClientId, numShips, matchId)
            playerPartyAssociations[socket.ClientId] = newMatch;
>>>>>>> 9ce4380f3979d0f10c2bd4f913f859924b507e86
            socket.emit('createParty', {status: 'Success', matchId: matchId});
            return;
        }
        catch(err){
<<<<<<< HEAD
=======
            console.log(err);
>>>>>>> 9ce4380f3979d0f10c2bd4f913f859924b507e86
            socket.emit('createParty', {  status: 'Rejected', reason: err});
            return;
        }

    });

    socket.on('tryJoinParty', (partyId) => {
        if (activeParties[partyId] === undefined){
            socket.emit('joinParty', { status: 'Rejected', reason: 'Requested party could not be found' });
            return;
        }
        else if (activeParties[partyId].length > 1){
            socket.emit('joinParty', { status: 'Rejected', reason: 'Party is full'})
            return;
        }
        try{
            const curMatch = playerPartyAssociations[activeParties[partyId]];
<<<<<<< HEAD
            curMatch.addOpponent(socket.id);
=======
            curMatch.addOpponent(socket.ClientId);
>>>>>>> 9ce4380f3979d0f10c2bd4f913f859924b507e86
            io.to(curMatch.host).emit('joinParty', { status: 'Join Successful', reason: 'Opponent has joined the game'});
            socket.emit('joinParty', { status: 'Join Successful', reason: 'You have joined party' + partyId + 'successfully'});
            return;
        }
        catch(err){
            socket.emit('joinParty', { status: 'Error', reason: err});
            return;
        }
    });

    socket.on('tryStartRound', () => {
<<<<<<< HEAD
        const party = playerPartyAssociations[socket.id];
        if (party === undefined || party.id == undefined || party.host !== socket.id){
=======
        const party = playerPartyAssociations[socket.ClientId];
        if (party === undefined || party.id == undefined || party.host !== socket.ClientId){
>>>>>>> 9ce4380f3979d0f10c2bd4f913f859924b507e86
            socket.emit('startRound', { status: 'Rejected', reason: 'The requesting player is not a member of an active party'});
            return;
        }
        try{        
            activeRounds[matchId] = party.players;
<<<<<<< HEAD
            const newRound = new BattleshipRound(socket.id, party.numShips, party.gridDimensions);
            playerRoundAssociations[socket.id] = newRound;
=======
            const newRound = new BattleshipRound(socket.ClientId, party.numShips, party.gridDimensions);
            playerRoundAssociations[socket.ClientId] = newRound;
>>>>>>> 9ce4380f3979d0f10c2bd4f913f859924b507e86
            party.players.forEach(player => {
                //playerSockets[player.ClientId].emit('startRound', { status: 'Round Started', players: party.players });
            });
        }
        catch (err){
            socket.emit('startRound', {status: 'Error', reason: err});
            return;
        }
    });

    socket.on('tryHit', (attemptData) => {

    });

    socket.on('disconnect', () => {
        if (socketClientAssociations[socket.id]){
            playerSockets[socketClientAssociations[socket.id]] = undefined;
            socketClientAssociations[socket.id] = undefined;
        }
        console.log("Client Disconnected:", socket.id);
    });
});

server.listen(port, localNetworkHost, () => {
    console.log(`The BattleShip Server is now active on http://${localNetworkHost}:${port}`)
});