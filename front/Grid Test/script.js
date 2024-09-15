//details of the ships
const ships = [
    { name: 'Carrier', length: 5, placed: false },
    { name: 'Battleship', length: 4, placed: false },
    { name: 'Cruiser', length: 3, placed: false },
    { name: 'Submarine', length: 2, placed: false },
    { name: 'Destroyer', length: 1, placed: false }
];
//selected ships
let selectedShip = ships[4];
let isHorizontal = true;
let placedShips = 0;
let isAttackMode = false;
let numShips = 0;

//storing coordinates of the player ships
const playerShips = {
    Carrier: [],
    Battleship: [],
    Cruiser: [],
    Submarine: [],
    Destroyer: []
};

//player ship placement and opponent guessing grids
const playerShipGrid = Array(10).fill(null).map(() => Array(10).fill(null));

//html elements
const grid = document.getElementById('grid');
const shipSelect = document.getElementById('shipSelect');
const toggleOrientationButton = document.getElementById('toggleOrientation');
const startGameButton = document.getElementById('startGame');
const removeShipButton = document.getElementById('removeShip');
const playerBoard = document.getElementById('playerBoard');
const opponentBoard = document.getElementById('opponentBoard');
const gameBoardContainer = document.getElementById('gameBoardContainer');

//makes sure function inside html is loaded and executed
document.addEventListener("DOMContentLoaded", function () {
    function waitForSocket(callback) {
        if (window.socket) {
            callback();
        } else {
            setTimeout(() => waitForSocket(callback), 100);
        }
    }

    waitForSocket(() => {
        //handle shots fired by player
        function handlePlayerShot(row, col) {
            console.log(`Player shot at: Row ${row + 1}, Col ${col + 1}`);
            window.socket.emit("tryHit", { x: row, y: col });
        }

        //drop down of ship options
        function addShipOptions(){
            shipSelect.innerHTML = "";
            options = ['<option value="Destroyer">Destroyer (1)</option>', '<option value="Submarine">Submarine (2)</option>', '<option value="Cruiser">Cruiser (3)</option>', '<option value="Battleship">Battleship (4)</option>', '<option value="Carrier">Carrier (5)</option>'];
            for (let i = 0; i < numShips; i++){
                shipSelect.innerHTML += options[i];
            }
        }   

        //creates 10x10 grid
        function createGrid(container, gridType) {
            container.innerHTML = ''; //clear existing content

            //wrapper created
            const gridWrapper = document.createElement('div');
            gridWrapper.classList.add('grid-wrapper');

            //label columns as letters A-J
            const headerRow = document.createElement('div');
            headerRow.classList.add('header-row');

            //dummy cell for grid labels
            const dummyCell = document.createElement('div');
            dummyCell.classList.add('dummy-cell');
            headerRow.appendChild(dummyCell);

            for (let col = 0; col < 10; col++) { //labeling columns
                const label = document.createElement('div');
                label.classList.add('header-item');
                label.textContent = String.fromCharCode(65 + col); //letters A-J
                headerRow.appendChild(label);
            }
            gridWrapper.appendChild(headerRow); //append to wrapper

            //label rows as number 1-10
            for (let row = 0; row < 10; row++) {
                const rowDiv = document.createElement('div');
                rowDiv.classList.add('row');

                //labeling
                const rowLabel = document.createElement('div');
                rowLabel.classList.add('row-label');
                rowLabel.textContent = row + 1; //numbers 1-10
                rowDiv.appendChild(rowLabel);

                //cells created
                for (let col = 0; col < 10; col++) {
                    const cell = document.createElement('div');
                    cell.classList.add('grid-item');
                    cell.dataset.row = row + 1;
                    cell.dataset.col = col + 1;
                    rowDiv.appendChild(cell);

                    // add eventlistener click
                    cell.addEventListener('click', function() {
                        const clickedRow = parseInt(this.dataset.row) - 1;
                        const clickedCol = parseInt(this.dataset.col) - 1;
                        
                        //if player or opponent is in attack mode
                        if (gridType === 'player' && !isAttackMode) { 
                            placeShip(clickedRow, clickedCol);
                        } else if (gridType === 'opponent' && isAttackMode) {
                            handlePlayerShot(clickedRow, clickedCol);
                        }
                    });
                }
                gridWrapper.appendChild(rowDiv);
            }

            //add the labeled grid to the container
            container.appendChild(gridWrapper);
        }

        createGrid(grid, 'player'); //create grid 

        //placing ships function
        function placeShip(row, col) {
            if (selectedShip.placed) {
                alert(`${selectedShip.name} has already been placed.`); 
                return;
            }

            if (canPlaceShip(row, col, selectedShip.length, isHorizontal)) {
                let coordinates = []; //store placed ship coordinates

                for (let i = 0; i < selectedShip.length; i++) {
                    if (isHorizontal) { //horizontal
                        playerShipGrid[row][col + i] = selectedShip.name;
                        markCellAsShip(row, col + i);
                        coordinates.push({ x: row, y: col + i }); //store coordinates
                    } else { //vertical
                        playerShipGrid[row + i][col] = selectedShip.name;
                        markCellAsShip(row + i, col);
                        coordinates.push({ x: row + i, y: col }); //store coordinates
                    }
                }
                selectedShip.placed = true;
                placedShips++;
                //store ship coordinates in player's ships
                playerShips[selectedShip.name] = coordinates; 
                checkAllShipsPlaced();
            } else {
                alert('Cannot place ship here.');
            }
        }

        //mark cells as part of ship function
        function markCellAsShip(row, col) {
            const cell = document.querySelector(`[data-row="${row + 1}"][data-col="${col + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'gray'; //visuals/color for ships
            }
        }

        //function to check if ship can be placed
        function canPlaceShip(row, col, length, isHorizontal) {
            if (isHorizontal) {
                if (col + length > 10) return false; //horizonal out of bounds
                for (let i = 0; i < length; i++) {
                    if (playerShipGrid[row][col + i] !== null) return false; //collided
                }
            } else {
                if (row + length > 10) return false; //vertical out of bounds
                for (let i = 0; i < length; i++) {
                    if (playerShipGrid[row + i][col] !== null) return false; //collided
                }
            }
            return true;
        }

        //function to check if all ships are placed
        function checkAllShipsPlaced() {
            let count = 5;
            const curShips = Object.keys(playerShips);
            for (let ship in Object.values(curShips)){
                if (count > numShips && playerShips[curShips[ship]].length != 0){
                    return false;
                }
                else if (count <= numShips && playerShips[curShips[ship]].length != count){
                    return false;
                }
                count--;
            }
            startGameButton.disabled = false;
            return true;
        }

        //function when the ship selected is changed
        shipSelect.addEventListener('change', function() {
            const shipName = this.value;
            selectedShip = ships.find(ship => ship.name === shipName);
        });

        //ship orientation: horizontal or vertical
        toggleOrientationButton.addEventListener('click', function() {
            isHorizontal = !isHorizontal;
            toggleOrientationButton.textContent = isHorizontal ? 'Horizontal' : 'Vertical';
        });

        //remove the ship selected
        removeShipButton.addEventListener('click', function() {
            if (!selectedShip.placed) {
                console.log(`${selectedShip.name} is not placed yet.`);
                return;
            }

            //clear ship coordinated on grid
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    if (playerShipGrid[row][col] === selectedShip.name) {
                        playerShipGrid[row][col] = null;
                        const cell = document.querySelector(`[data-row="${row + 1}"][data-col="${col + 1}"]`);
                        if (cell) {
                            cell.style.backgroundColor = 'lightblue';
                        }
                    }
                }
            }
            
            //reset ship placement
            selectedShip.placed = false;
            placedShips--;
            playerShips[selectedShip.name] = []; // clear coordinates
            startGameButton.disabled = true; //cannot start game if ships are not placed
        });

        //more html elements
        const gridHeader = document.getElementById('gridHeader');
        const setupControls = document.getElementById('setupControls');
        const turnLabel = document.getElementById('turnIndicatorLabel');
        const waitingForPlayers = document.getElementById('waitingForAllPlayers');
        const errorFooterArea = document.getElementById("errorFooter");
        const errorLabel = document.getElementById("errorLabel");
        const statusLabel = document.getElementById("statusLabel");

        //display ships on grid
        function displayPlayerShips() {
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    if (playerShipGrid[row][col] !== null) {
                        const cell = document.querySelector(`#playerBoard [data-row="${row + 1}"][data-col="${col + 1}"]`);
                        if (cell) {
                            cell.style.backgroundColor = 'gray'; //color is gray
                        }
                    }
                }
            }
        }

        //eventlistener click if attack mdoe is on
        startGameButton.addEventListener('click', function() {
            if (isAttackMode) return;
            isAttackMode = true;
            
            setupControls.style.display = 'none';
            errorFooterArea.style.display = "none";
            let filledships = {};
            for (let [name, positions] of Object.entries(playerShips)){
                if (positions.length != 0){
                    filledships[name] = positions;
                }
            }
            window.socket.emit("registerShipPlacements", filledships); //if registered, data sent to server
        });
        //ships are registered
        window.socket.on("registerShips", (data) => {
            if (data.status == "Success"){
                //sucess, wating for players
                waitingForPlayers.style.display = 'block';
            } else {
                //failed, error message displayed to player
                errorLabel.textContent = "Failed to Register Ship Placements: " + data.reason;
                errorFooterArea.style.display = "block";
            }
        });
        // waiting for players
        window.socket.on("playersReady", (data) => {
             //display game board container and header
             gameBoardContainer.style.display = 'flex';
             gridHeader.style.display = 'block';
 
             //grid/control buttons are hidden
             grid.style.display = 'none';
             waitingForPlayers.style.display = 'none';
             turnLabel.textContent = "It's " + (data.firstPlayer === window.clientId ? "your" : "your opponent's") + " turn!";
             turnLabel.style.display = "block";
 
             //both player and opponent has grids
             createGrid(playerBoard, 'player'); //players'
             createGrid(opponentBoard, 'opponent'); //opponents'
 
             displayPlayerShips(); //only shows player's ships on their grid
             console.log('Game started! Now in attack mode.');
 
             startGameButton.disabled = true; //start game button is disabled
             statusLabel.textContent = "";
             statusLabel.style.display = "block";
        });

        window.socket.on("setTurn", (data) => { //taking turns after each hit/miss
            turnLabel.textContent = "It's " + (data.whosTurn === window.clientId ? "your" : "your opponent's") + " turn!";
        });

        window.socket.on("hitTarget", (data) => { //player hitting target ship
            const cell = document.querySelector(`#opponentBoard [data-row="${data.coordinates.x + 1}"][data-col="${data.coordinates.y + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'red'; //visual indicator for hitting target
            }
            statusLabel.textContent = "You hit one of their ships!"; //message
        });

        window.socket.on("missedTarget", (data) => { //player missed target ship
            const cell = document.querySelector(`#opponentBoard [data-row="${data.coordinates.x + 1}"][data-col="${data.coordinates.y + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'white'; //visual indicator for not hitting
            }
            statusLabel.textContent = "Oops... that was a miss!"; //message
        });

        window.socket.on("gotHit", (data) => { //if player ship got hit
            const cell = document.querySelector(`#playerBoard [data-row="${data.coordinates.x + 1}"][data-col="${data.coordinates.y + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'red'; //visual for getting hit
            }
            statusLabel.textContent = "They hit one of your ships!"; //message
        });

        window.socket.on("theyMissed", (data) => { //if player ship did not get hip
            const cell = document.querySelector(`#playerBoard [data-row="${data.coordinates.x + 1}"][data-col="${data.coordinates.y + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'white'; //visual for not getting hit
            }
            statusLabel.textContent = "They missed that shot..."; //message
        });

        window.socket.on("sunkShip", (data) => { //ships getting sunked
            const targetBoard = (data.attackedPlayer === window.clientId ? "#playerBoard" : "#opponentBoard");
            data.shipObject.Definition.forEach(coordinate => {
                const cell = document.querySelector(`${targetBoard} [data-row="${coordinate.x + 1}"][data-col="${coordinate.y + 1}"]`);
                if (cell) {
                    cell.style.backgroundColor = 'DarkRed'; //visual sunk ship
                }
            });
            statusLabel.textContent = (data.attackedPlayer === window.clientId ? "Oh no! They sunk one of your ships!" : "You sunk one of their ships!");
        });

        //winning or losing screens
        //navigates to the html page accordingly
        window.socket.on("youWon", (data) => {
            window.electronAPI.navigateToPage("./gameOver/winner.html");
        });

        window.socket.on("youLost", (data) => {
            window.electronAPI.navigateToPage("./gameOver/looser.html");
        });

        //handles communicate between server and client on how many ships allowed in game
        window.socket.on("setNumberOfShips", (data) => {
            if (data.status != "Success"){
                errorLabel.textContent = "Failed to fetch number of ships: " + data.reason;
                errorFooterArea.style.display = "block";
                return;
            }
            numShips = data.numShips;
            addShipOptions();
        });

        window.socket.emit("fetchNumberOfShips", {});
    });
});
