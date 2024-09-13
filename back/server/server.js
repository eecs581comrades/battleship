//wil, a few notes:
//I've added in a numShips parameter to tryCreateParty, since we're going to need that for future communications
//

// ALL REQUESTS FROM CLIENTS SHOULD INCLUDE DATA FORMATTED AS A TABLE: { prop: value }
// ALL REQUESTS FROM CLIENTS MUST INCLUDE A CLIENT ID { ..., ClientId: 123456... ... }

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const round = require('modules/battleshipRound');
const matchmaking = require('modules/matchmaking')

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

const port = 5000;
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
    });

    socket.on('tryCreateParty', (numShips) => {
        if (playerPartyAssociations[socket.id] !== undefined){
            socket.emit('createParty', { status: 'Rejected', reason: 'Target player is already registered in a party' });
            return;
        }
        try{
            matchId = matchmaking.generateUniqueId();
            while (activeParties[matchId] !== undefined){
                matchId = matchmaking.generateUniqueId();
            }
            activeParties[matchId] = socket.id;
            const newMatch = new Match(socket.id, numShips, matchId)
            playerPartyAssociations[socket.id] = newMatch;
            socket.emit('createParty', {status: 'Success', matchId: matchId});
            return;
        }
        catch(err){
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
            curMatch.addOpponent(socket.id);
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
        const party = playerPartyAssociations[socket.id];
        if (party === undefined || party.id == undefined || party.host !== socket.id){
            socket.emit('startRound', { status: 'Rejected', reason: 'The requesting player is not a member of an active party'});
            return;
        }
        try{        
            activeRounds[matchId] = party.players;
            const newRound = new BattleshipRound(socket.id, party.numShips, party.gridDimensions);
            playerRoundAssociations[socket.id] = newRound;
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