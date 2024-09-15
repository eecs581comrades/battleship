class Map {
    constructor(dimensions){
        console.log(dimensions[0]);
        this.Map = {};
        this.Ships = {};

        for (let i = 0; i < dimensions[0]; i++) {
            const row = {};
            for (let j = 0; j < dimensions[1]; j++) {
                row[j] = { shipId: null, isHit: false };
            }
            this.Map[i] = row;
        }
    }

    addShip(shipId, shipDefinition){
        this.Ships[shipId] = {}
        this.Ships[shipId].Definition = shipDefinition;
        this.Ships[shipId].IsSunk = false;
        
        shipDefinition.forEach(coordinate => {
            if (this.Map[coordinate.x] === undefined){
                this.Map[coordinate.x] = {};
            }
            this.Map[coordinate.x][coordinate.y] = { shipId: shipId, isHit: false };
        });
    }
}

class BattleshipRound {

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

    addPlayer(clientId){
        this.players.push(clientId);
        this.maps[clientId] = new Map(this.gridDimensions);
    }

    attemptFire(x, y, targetPlayer, sourcePlayer){
        if (this.maps[targetPlayer] == undefined) {
            return [false, "UndefinedPlayer"];
        } 

        if (x < 0 || y < 0 || x >= this.gridDimensions || y >= this.gridDimensions){
            return [false, "BoundsRejection"];
        }

        if (!this.guessHistory[sourcePlayer]) {
            this.guessHistory[sourcePlayer] = [];
        }

        this.guessHistory[sourcePlayer].push({ targetPlayer: targetPlayer, x: x, y: y });

        const mapSquareData = this.maps[targetPlayer].Map[x][y];

        if (mapSquareData === undefined || mapSquareData.shipId === null || mapSquareData.shipId === undefined){
            mapSquareData.isHit = true;
            return [false, "TrueMiss"];
        }

        const hitShipObject = this.maps[targetPlayer].Ships[mapSquareData.shipId];

        if (hitShipObject === null || hitShipObject.IsSunk || mapSquareData.isHit){
            return [false, "InvalidGuess"];
        }

        // The ship was hit!
        this.maps[targetPlayer].Map[x][y].isHit = true;

        let isShipSunk = true;
        hitShipObject.Definition.forEach(coordinate => {
            if (this.maps[targetPlayer].Map[coordinate.x][coordinate.y].isHit === false){
                isShipSunk = false;
            }
        });

        this.maps[targetPlayer].Ships[mapSquareData.shipId].IsSunk = isShipSunk;

        if (isShipSunk){
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