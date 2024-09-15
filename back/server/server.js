//wil, a few notes:
//I've added in a numShips parameter to tryCreateParty, since we're going to need that for future communications
//

// ALL REQUESTS FROM CLIENTS SHOULD INCLUDE DATA FORMATTED AS A TABLE: { prop: value }
// ALL REQUESTS FROM CLIENTS MUST INCLUDE A CLIENT ID { ..., ClientId: 123456... ... }

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const [ BattleshipRound ] = require('./modules/battleshipRound');
const [ Match, generateUniqueId ] = require('./modules/matchmaking')

const app = express();
const server = http.createServer(app);

let playerPartyAssociations = {};
let playerRoundAssociations = {};

let playerSockets = {};
let socketClientAssociations = {};

let activeParties = {};

function cleanUpRound(players){
    const party = playerPartyAssociations[players[0]]
    players.forEach(player => {
        playerPartyAssociations[player] = undefined;
        playerRoundAssociations[player] = undefined;
    });

    activeParties[party.id] = undefined;
}

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
        console.log("Connection Registered for Client " + data.ClientId + " @ Socket " + socket.id);
        socket.ClientId = data.ClientId
    });

    socket.on('tryCreateParty', (numShips) => {
        if (playerPartyAssociations[socket.ClientId] !== undefined){
            socket.emit('createParty', { status: 'Rejected', reason: 'Target player is already registered in a party' });
            return;
        }
        try{
            matchId = generateUniqueId();
            while (activeParties[matchId] !== undefined){
                matchId = generateUniqueId();
            }
            const newMatch = new Match(socket.ClientId, numShips, matchId)
            activeParties[matchId] = newMatch;
            playerPartyAssociations[socket.ClientId] = newMatch;
            socket.emit('createParty', {status: 'Success', matchId: matchId});
            return;
        }
        catch(err){
            console.log(err);
            socket.emit('createParty', {  status: 'Rejected', reason: err});
            return;
        }

    });

    socket.on('tryJoinParty', (partyId) => {
        if (activeParties[partyId] === undefined){
            socket.emit('joinParty', { status: 'Rejected', reason: 'Requested party could not be found' });
            return;
        }
        else if (activeParties[partyId].players.length > 1){
            socket.emit('joinParty', { status: 'Rejected', reason: 'Party is full'});
            return;
        }
        try{
            const party = activeParties[partyId];
            party.addOpponent(socket.ClientId);
            playerPartyAssociations[socket.ClientId] = party;
            playerSockets[party.host].emit('opponentJoined', { status: 'Success', reason: 'Opponent has joined the game'});
            socket.emit('joinParty', { status: 'Success', reason: 'You have joined party' + partyId + 'successfully'});
            return;
        }
        catch(err){
            socket.emit('joinParty', { status: 'Rejected', reason: err.toString()});
            console.log(err);
            return;
        }
    });

    socket.on('tryStartRound', () => {
        const party = playerPartyAssociations[socket.ClientId];
        if (party === undefined || party.id == undefined || party.host !== socket.ClientId){
            socket.emit('startRound', { status: 'Rejected', reason: 'The requesting player is not a member of an active party'});
            return;
        }
        try{        
            const newRound = new BattleshipRound(socket.ClientId, party.numShips, party.gridDimensions);
            const randomIndex = Math.floor(Math.random() * party.players.length);
            newRound.whosTurn = party.players[randomIndex];
            party.players.forEach(player => {
                playerSockets[player].emit('startRound', { status: 'Success', players: party.players });
                newRound.addPlayer(player);
                playerRoundAssociations[player] = newRound;
            });
        }
        catch (err){
            socket.emit('startRound', {status: 'Error', reason: err.toString()});
            console.log(err);
            return;
        }
    });

    socket.on('fetchNumberOfShips', () => {
        const round = playerRoundAssociations[socket.ClientId];
        if (round === undefined){
            socket.emit('setNumberOfShips', { status: 'Rejected', reason: 'The requesting player is not associated with a round.' });
            return;
        }

        socket.emit('setNumberOfShips', { status: 'Success', numShips: round.numberOfShips });
    });

    socket.on('registerShipPlacements', (shipData) => {
        const round = playerRoundAssociations[socket.ClientId];
        if (round === undefined){
            socket.emit('registerShips', { status: 'Rejected', reason: 'The requesting player is not associated with a round.' });
            return;
        }

        if (round.hasPlacedShips[socket.ClientId] === true){
            socket.emit('registerShips', { status: 'Rejected', reason: 'The requesting player has already placed their ships.' });
            return;
        }

        round.hasPlacedShips[socket.ClientId] = true;

        for (let shipName in shipData) {
            if (shipData.hasOwnProperty(shipName)) {
                round.maps[socket.ClientId].addShip(shipName, shipData[shipName]);
            }
        }

        socket.emit('registerShips', { status: 'Success', reason: 'Ships placed successfully' });

        if (Object.keys(round.hasPlacedShips).length > 1){
            const party = playerPartyAssociations[socket.ClientId];
            party.players.forEach(player => {
                playerSockets[player].emit('playersReady', { status: 'Success', players: party.players, firstPlayer: round.whosTurn });
            });
        }
    });

    socket.on('tryHit', (coordinates) => {
        const round = playerRoundAssociations[socket.ClientId];
        const attackingPlayer = socket.ClientId;
        const attackedPlayer = round.players.find(player => player !== socket.ClientId);
        if (round.whosTurn === attackingPlayer) {
            const [ result, reason, sunkShip, hitShipObject ] = round.attemptFire(coordinates.x, coordinates.y, attackedPlayer, attackingPlayer);
            console.log(result, reason, sunkShip);
            if (reason === "InvalidGuess"){
                return;
            }
            if (result === true){
                // Hit!
                playerSockets[attackingPlayer].emit('hitTarget', { status: 'Success', coordinates: coordinates });
                playerSockets[attackedPlayer].emit('gotHit', { status: 'Success', coordinates: coordinates });

                if (sunkShip){
                    round.players.forEach(player => {
                        playerSockets[player].emit('sunkShip', { status: 'Success', attackedPlayer: attackedPlayer, shipObject: hitShipObject });
                    });
                }

                if (reason == "GameWin"){
                    playerSockets[attackingPlayer].emit('youWon', { status: "Success" });
                    playerSockets[attackedPlayer].emit('youLost', { status: "Success" });
                    cleanUpRound([ attackingPlayer, attackedPlayer ]);
                }
            } else {
                // Miss...
                playerSockets[attackingPlayer].emit('missedTarget', { status: 'Success', coordinates: coordinates });
                playerSockets[attackedPlayer].emit('theyMissed', { status: 'Success', coordinates: coordinates });
            }
            round.whosTurn = attackedPlayer;
            round.players.forEach(player => {
                playerSockets[player].emit('setTurn', { status: 'Success', whosTurn: attackedPlayer });
            });
        }
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