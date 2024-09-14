const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { match } = require('assert');

const generatedIds = new Set(); // Using a Set to store unique IDs

function generateUniqueId(length = 6) {
  let id;
  do {
    id = crypto.randomBytes(length)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, length);
  } while (generatedIds.has(id)); // Keep generating if the ID already exists

  generatedIds.add(id); // Add the new ID to the Set
  return id;
}

class Match{

    constructor(host, numShips, matchId, gridDimensions = [10, 10]){
        this.host = host;
        this.numShips = numShips;
        this.id = matchId;
        this.players = [ host ];
        this.gridDimensions = gridDimensions;
    }

    addOpponent(Opponent){
        this.players.push(Opponent);
    }
}

module.exports = [ Match, generateUniqueId ];
