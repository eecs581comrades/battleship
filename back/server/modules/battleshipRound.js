class Map {
    constructor(dimenstions){
        this.Map = [];
        this.Ships = {};

        for (let i = 0; i < dimenstions; i++) {
            const row = [];
            for (let j = 0; j < dimenstions; j++) {
                row.push(null);
            }
            this.push(row);
        }
    }

    addShip(shipId, shipDefinition){
        this.Ships[shipId] = {}
        this.Ships[shipId].Definition = shipDefinition;
        this.Ships[shipId].IsSunk = false;
        
        shipDefinition.forEach(coordinate => {
            this.Map[coordinate.x][coordinate.y] = { shipId: shipId, isHit: false };
        });
    }
}

class BattleshipRound {

    constructor(host, numberOfShips, gridDimensions){
        this.host = host;
        this.players = [ host ];
        this.numberOfShips = numberOfShips;
        this.maps = {};
        this.guessHistory = {};
        this.gridDimensions = gridDimensions;
        
        this.maps[host] = new Map(gridDimensions);
    }

    attemptFire(x, y, targetPlayer, sourcePlayer){
        if (this.maps[targetPlayer] == undefined) {
            return false, "UndefinedPlayer";
        } 

        if (x <= 0 || y <= 0 || x > this.gridDimensions || y > this.gridDimensions){
            return false, "BoundsRejection";
        }

        if (!this.guessHistory[sourcePlayer]) {
            this.guessHistory[sourcePlayer] = [];
        }

        this.guessHistory[sourcePlayer].push({ targetPlayer: targetPlayer, x: x, y: y });

        const mapSquareData = this.maps[targetPlayer].Map[x][y];

        if (mapSquareData === null){
            return false, "TrueMiss";
        }

        const hitShipObject = this.maps[targetPlayer].Ships[mapSquareData.shipId];

        if (hitShipObject === null || hitShipObject.IsSunk){
            console.warn("This ship has already been sunk. Invalid guess.");
            return false, "InvalidGuess";
        }

        // The ship was hit!
        this.maps[targetPlayer].Map[x][y].isHit = true;

        let isShipSunk = true;
        hitShipObject.forEach(coordinate => {
            if (this.Map[coordinate.x][coordinate.y].isHit === false){
                isShipSunk = false;
            }
        });

        this.maps[targetPlayer].Ships[mapSquareData.shipId].IsSunk = isShipSunk;

        if (isShipSunk){
            let didSourcePlayerWinGame = true;
            this.maps[targetPlayer].Ships.forEach(ship => {
                if (ship.IsSunk === false){
                    didSourcePlayerWinGame = false;
                }
            });

            if (didSourcePlayerWinGame){
                return true, "GameWin"
            }
        }

        return true, "TrueHit"

    }

}