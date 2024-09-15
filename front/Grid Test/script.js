// Ship details
const ships = [
    { name: 'Carrier', length: 5, placed: false },
    { name: 'Battleship', length: 4, placed: false },
    { name: 'Cruiser', length: 3, placed: false },
    { name: 'Submarine', length: 2, placed: false },
    { name: 'Destroyer', length: 1, placed: false }
];

let selectedShip = ships[4];
let isHorizontal = true;
let placedShips = 0;
let isAttackMode = false;
let numShips = 0;

// Store player ships' coordinates in this object
const playerShips = {
    Carrier: [],
    Battleship: [],
    Cruiser: [],
    Submarine: [],
    Destroyer: []
};

// Grids for player ship placement and opponent guessing
const playerShipGrid = Array(10).fill(null).map(() => Array(10).fill(null));

// Get references to HTML elements
const grid = document.getElementById('grid');
const shipSelect = document.getElementById('shipSelect');
const toggleOrientationButton = document.getElementById('toggleOrientation');
const startGameButton = document.getElementById('startGame');
const removeShipButton = document.getElementById('removeShip');
const playerBoard = document.getElementById('playerBoard');
const opponentBoard = document.getElementById('opponentBoard');
const gameBoardContainer = document.getElementById('gameBoardContainer');


document.addEventListener("DOMContentLoaded", function () {
    function waitForSocket(callback) {
        if (window.socket) {
            callback();
        } else {
            setTimeout(() => waitForSocket(callback), 100);
        }
    }

    waitForSocket(() => {
        // Handle player's shot during attack mode
        function handlePlayerShot(row, col) {
            console.log(`Player shot at: Row ${row + 1}, Col ${col + 1}`);
            window.socket.emit("tryHit", { x: row, y: col });
        }

        function addShipOptions(){
            shipSelect.innerHTML = "";
            options = ['<option value="Destroyer">Destroyer (1)</option>', '<option value="Submarine">Submarine (2)</option>', '<option value="Cruiser">Cruiser (3)</option>', '<option value="Battleship">Battleship (4)</option>', '<option value="Carrier">Carrier (5)</option>'];
            for (let i = 0; i < numShips; i++){
                shipSelect.innerHTML += options[i];
            }
        }   

        // Create 10x10 grid for placing ships
        function createGrid(container, gridType) {
            container.innerHTML = ''; // Clear any existing content

            // Create a wrapper for the grid
            const gridWrapper = document.createElement('div');
            gridWrapper.classList.add('grid-wrapper');

            // Create column labels
            const headerRow = document.createElement('div');
            headerRow.classList.add('header-row');

            // Dummy cell for top-left corner
            const dummyCell = document.createElement('div');
            dummyCell.classList.add('dummy-cell');
            headerRow.appendChild(dummyCell);

            for (let col = 0; col < 10; col++) {
                const label = document.createElement('div');
                label.classList.add('header-item');
                label.textContent = String.fromCharCode(65 + col); // A-J
                headerRow.appendChild(label);
            }
            gridWrapper.appendChild(headerRow);

            // Create grid rows with row labels
            for (let row = 0; row < 10; row++) {
                const rowDiv = document.createElement('div');
                rowDiv.classList.add('row');

                // Row label
                const rowLabel = document.createElement('div');
                rowLabel.classList.add('row-label');
                rowLabel.textContent = row + 1; // 1-10
                rowDiv.appendChild(rowLabel);

                // Create cells
                for (let col = 0; col < 10; col++) {
                    const cell = document.createElement('div');
                    cell.classList.add('grid-item');
                    cell.dataset.row = row + 1;
                    cell.dataset.col = col + 1;
                    rowDiv.appendChild(cell);

                    // Attach click event listener
                    cell.addEventListener('click', function() {
                        const clickedRow = parseInt(this.dataset.row) - 1;
                        const clickedCol = parseInt(this.dataset.col) - 1;

                        if (gridType === 'player' && !isAttackMode) {
                            placeShip(clickedRow, clickedCol);
                        } else if (gridType === 'opponent' && isAttackMode) {
                            handlePlayerShot(clickedRow, clickedCol);
                        }
                    });
                }
                gridWrapper.appendChild(rowDiv);
            }

            // Append the entire grid with headers to the container
            container.appendChild(gridWrapper);
        }

        createGrid(grid, 'player');

        // Function to place a ship
        function placeShip(row, col) {
            if (selectedShip.placed) {
                alert(`${selectedShip.name} has already been placed.`);
                return;
            }

            if (canPlaceShip(row, col, selectedShip.length, isHorizontal)) {
                let coordinates = []; // To store the coordinates of the placed ship

                for (let i = 0; i < selectedShip.length; i++) {
                    if (isHorizontal) {
                        playerShipGrid[row][col + i] = selectedShip.name;
                        markCellAsShip(row, col + i);
                        coordinates.push({ x: row, y: col + i }); // Store coordinates
                    } else {
                        playerShipGrid[row + i][col] = selectedShip.name;
                        markCellAsShip(row + i, col);
                        coordinates.push({ x: row + i, y: col }); // Store coordinates
                    }
                }
                selectedShip.placed = true;
                placedShips++;
                playerShips[selectedShip.name] = coordinates; // Store ship coordinates in the playerShips object
                checkAllShipsPlaced();
            } else {
                alert('Cannot place ship here.');
            }
        }

        // Function to mark cells as part of a ship
        function markCellAsShip(row, col) {
            const cell = document.querySelector(`[data-row="${row + 1}"][data-col="${col + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'gray'; // Visual indicator for ships
            }
        }

        // Helper function to check if the ship can be placed
        function canPlaceShip(row, col, length, isHorizontal) {
            if (isHorizontal) {
                if (col + length > 10) return false; // Out of bounds horizontally
                for (let i = 0; i < length; i++) {
                    if (playerShipGrid[row][col + i] !== null) return false; // Collision
                }
            } else {
                if (row + length > 10) return false; // Out of bounds vertically
                for (let i = 0; i < length; i++) {
                    if (playerShipGrid[row + i][col] !== null) return false; // Collision
                }
            }
            return true;
        }

        // Check if all ships are placed
        function checkAllShipsPlaced() {
            let count = 5;
            const curShips = Object.keys(ships);
            for (let ship in curShips){
                if (count > numShips && ships[ship].length != 0){
                    return false;
                }
                else if (count <= numShips && ships[ship].length != count){
                    return false;
                }
            }
            return true;
        }

        // Handle ship selection change
        shipSelect.addEventListener('change', function() {
            const shipName = this.value;
            selectedShip = ships.find(ship => ship.name === shipName);
        });

        // Toggle ship orientation
        toggleOrientationButton.addEventListener('click', function() {
            isHorizontal = !isHorizontal;
            toggleOrientationButton.textContent = isHorizontal ? 'Horizontal' : 'Vertical';
        });

        // Remove selected ship
        removeShipButton.addEventListener('click', function() {
            if (!selectedShip.placed) {
                console.log(`${selectedShip.name} is not placed yet.`);
                return;
            }

            // Clear the ship's coordinates from the grid
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
            
            // Reset ship placement
            selectedShip.placed = false;
            placedShips--;
            playerShips[selectedShip.name] = []; // Clear ship's coordinates
            startGameButton.disabled = true; // Disable start game button if all ships are not placed
        });

        // Get references to additional HTML elements
        const gridHeader = document.getElementById('gridHeader');
        const setupControls = document.getElementById('setupControls');
        const turnLabel = document.getElementById('turnIndicatorLabel');
        const waitingForPlayers = document.getElementById('waitingForAllPlayers');
        const errorFooterArea = document.getElementById("errorFooter");
        const errorLabel = document.getElementById("errorLabel");
        const statusLabel = document.getElementById("statusLabel");

        // Display player's placed ships on the reference grid
        function displayPlayerShips() {
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    if (playerShipGrid[row][col] !== null) {
                        const cell = document.querySelector(`#playerBoard [data-row="${row + 1}"][data-col="${col + 1}"]`);
                        if (cell) {
                            cell.style.backgroundColor = 'gray'; // Color player's ships on the reference grid
                        }
                    }
                }
            }
        }

        startGameButton.addEventListener('click', function() {
            if (isAttackMode) return;
            isAttackMode = true;
            
            setupControls.style.display = 'none';
            errorFooterArea.style.display = "none";

            window.socket.emit("registerShipPlacements", playerShips);
        });

        window.socket.on("registerShips", (data) => {
            if (data.status == "Success"){
                waitingForPlayers.style.display = 'block';
            } else {
                errorLabel.textContent = "Failed to Register Ship Placements: " + data.reason;
                errorFooterArea.style.display = "block";
            }
        });

        window.socket.on("playersReady", (data) => {
             // Show game board container and header
             gameBoardContainer.style.display = 'flex';
             gridHeader.style.display = 'block';
 
             // Hide grid and control buttons
             grid.style.display = 'none';
             waitingForPlayers.style.display = 'none';
             turnLabel.textContent = "It's " + (data.firstPlayer === window.clientId ? "your" : "your opponent's") + " turn!";
             turnLabel.style.display = "block";
 
             // Create grids for both player and opponent
             createGrid(playerBoard, 'player'); // Player's placed grid
             createGrid(opponentBoard, 'opponent'); // Opponent's grid
 
             displayPlayerShips(); // Show player's ships on their reference grid
             console.log('Game started! Now in attack mode.');
 
             startGameButton.disabled = true; // Disable the "Start Game" button after it's clicked once
             statusLabel.textContent = "";
             statusLabel.style.display = "block";
        });

        window.socket.on("setTurn", (data) => {
            turnLabel.textContent = "It's " + (data.whosTurn === window.clientId ? "your" : "your opponent's") + " turn!";
        });

        window.socket.on("hitTarget", (data) => {
            const cell = document.querySelector(`#opponentBoard [data-row="${data.coordinates.x + 1}"][data-col="${data.coordinates.y + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'red'; // Visual indicator for hit
            }
            statusLabel.textContent = "You hit one of their ships!";
        });

        window.socket.on("missedTarget", (data) => {
            const cell = document.querySelector(`#opponentBoard [data-row="${data.coordinates.x + 1}"][data-col="${data.coordinates.y + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'white'; // Visual indicator for hit
            }
            statusLabel.textContent = "Oops... that was a miss!";
        });

        window.socket.on("gotHit", (data) => {
            const cell = document.querySelector(`#playerBoard [data-row="${data.coordinates.x + 1}"][data-col="${data.coordinates.y + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'red'; // Visual indicator for hit
            }
            statusLabel.textContent = "They hit one of your ships!";
        });

        window.socket.on("theyMissed", (data) => {
            const cell = document.querySelector(`#playerBoard [data-row="${data.coordinates.x + 1}"][data-col="${data.coordinates.y + 1}"]`);
            if (cell) {
                cell.style.backgroundColor = 'white'; // Visual indicator for hit
            }
            statusLabel.textContent = "They missed that shot...";
        });

        window.socket.on("sunkShip", (data) => {
            const targetBoard = (data.attackedPlayer === window.clientId ? "#playerBoard" : "#opponentBoard");
            data.shipObject.Definition.forEach(coordinate => {
                const cell = document.querySelector(`${targetBoard} [data-row="${coordinate.x + 1}"][data-col="${coordinate.y + 1}"]`);
                if (cell) {
                    cell.style.backgroundColor = 'DarkRed'; // Visual indicator for sunk ship.
                }
            });
            statusLabel.textContent = (data.attackedPlayer === window.clientId ? "Oh no! They sunk one of your ships!" : "You sunk one of their ships!");
        });

        window.socket.on("youWon", (data) => {
            window.electronAPI.navigateToPage("./gameOver/winner.html");
        });

        window.socket.on("youLost", (data) => {
            window.electronAPI.navigateToPage("./gameOver/looser.html");
        });

        window.socket.on("setNumberOfShips", (data) => {
            if (data.status != "Success"){
                errorLabel.textContent = "Failed to fetch number of ships: " + data.reason;
                errorFooterArea.style.display = "block";
                return;
            }
            numShips = data.numShips;
        });

        window.socket.emit("fetchNumberOfShips", {});
    });
});
