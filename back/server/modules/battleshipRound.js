/* battleshipRound.js
Description: Battleship Round module. Creates data structures for matches that keeps all necessary information required by server for a single game round
Inputs: None
Outputs: BattleshipRound
Sources: 
Authors: William Johnson
Creation date: 9-13-24
*/

//For internal use - creates a map based off a given X, Y format.
class Map {
    //takes dimensions in [x, y] format
    constructor(dimensions){
        console.log(dimensions[0]);
        this.Map = {};
        this.Ships = {};
        //creates an array based map
        for (let i = 0; i < dimensions[0]; i++) {
            const row = {};
            for (let j = 0; j < dimensions[1]; j++) {
                row[j] = { shipId: null, isHit: false };
            }
            this.Map[i] = row;
        }
    }
    //adds ship part at x, y coordinates
    addShip(shipId, shipDefinition){
        this.Ships[shipId] = {}
        this.Ships[shipId].Definition = shipDefinition;
        this.Ships[shipId].IsSunk = false;
        
        shipDefinition.forEach(coordinate => { //coordinate should be an array, so runs through each
            if (this.Map[coordinate.x] === undefined){
                this.Map[coordinate.x] = {};
            }
            this.Map[coordinate.x][coordinate.y] = { shipId: shipId, isHit: false };
        });
    }
}
//data structure for a battleship round
class BattleshipRound {
    //takes host clientId, num of ships, grid dimensions for Maps
    constructor(host, numberOfShips, gridDimensions){
        this.host = host;
        this.players = [];
        this.numberOfShips = numberOfShips;
        this.maps = {};
        this.guessHistory = {};
        this.gridDimensions = gridDimensions;
        this.whosTurn = null;
        this.hasPlacedShips = {};
    }
    //adds player and attaches a map
    addPlayer(clientId){
        this.players.push(clientId);
        this.maps[clientId] = new Map(this.gridDimensions);
    }
    //attempts to fire at a target
    attemptFire(x, y, targetPlayer, sourcePlayer){
        if (this.maps[targetPlayer] == undefined) { //no player
            return [false, "UndefinedPlayer"];
        } 

        if (x < 0 || y < 0 || x >= this.gridDimensions || y >= this.gridDimensions){ //out of bounds
            return [false, "BoundsRejection"];
        }

        if (!this.guessHistory[sourcePlayer]) { //if no guess history, make a new guest history
            this.guessHistory[sourcePlayer] = [];
        }

        this.guessHistory[sourcePlayer].push({ targetPlayer: targetPlayer, x: x, y: y }); //add guess

        const mapSquareData = this.maps[targetPlayer].Map[x][y]; //pulls a specific square from Map data struct

        if (mapSquareData === undefined || mapSquareData.shipId === null || mapSquareData.shipId === undefined){ //checks to see if the space has not been hit and if there is no ship
            mapSquareData.isHit = true;
            return [false, "TrueMiss"];
        }

        const hitShipObject = this.maps[targetPlayer].Ships[mapSquareData.shipId];

        if (hitShipObject === null || hitShipObject.IsSunk || mapSquareData.isHit){ //if bad guess
            return [false, "InvalidGuess"];
        }

        // The ship was hit!
        this.maps[targetPlayer].Map[x][y].isHit = true;

        let isShipSunk = true;
        hitShipObject.Definition.forEach(coordinate => { //checks to see if a ship was sunk
            if (this.maps[targetPlayer].Map[coordinate.x][coordinate.y].isHit === false){
                isShipSunk = false;
            }
        });

        this.maps[targetPlayer].Ships[mapSquareData.shipId].IsSunk = isShipSunk;

        if (isShipSunk){ //if it is sunk, check to see if the whole ship if sunk. if so, check win condition.
            let didSourcePlayerWinGame = true;
            for (let shipID in this.maps[targetPlayer].Ships) {
                if (this.maps[targetPlayer].Ships.hasOwnProperty(shipID)) {
                    let shipObject = this.maps[targetPlayer].Ships[shipID];
                    if (shipObject.IsSunk === false){
                        didSourcePlayerWinGame = false;
                    }
                }
            }

            if (didSourcePlayerWinGame){
                return [true, "GameWin"]
            }
        }

        return [true, "TrueHit", isShipSunk, hitShipObject]

    }

}

module.exports = [ BattleshipRound ];