// Ship details
const ships = [
    { name: 'Carrier', length: 5, placed: false },
    { name: 'Battleship', length: 4, placed: false },
    { name: 'Cruiser', length: 3, placed: false },
    { name: 'Submarine', length: 3, placed: false },
    { name: 'Destroyer', length: 2, placed: false }
];

let selectedShip = ships[0];
let isHorizontal = true;
let placedShips = 0;
let isAttackMode = false;

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

// Create 10x10 grid for placing ships
function createGrid(container, gridType) {
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-item');
            cell.dataset.row = row + 1;
            cell.dataset.col = col + 1;
            container.appendChild(cell);

            // Attach click event listener
            cell.addEventListener('click', function() {
                const row = parseInt(this.dataset.row) - 1;
                const col = parseInt(this.dataset.col) - 1;

                if (!isAttackMode && gridType === 'player') {
                    placeShip(row, col);
                } else if (isAttackMode && gridType === 'opponent') {
                    handlePlayerShot(row, col);
                }
            });
        }
    }
}

createGrid(grid, 'player');

// Function to place a ship
function placeShip(row, col) {
    if (selectedShip.placed) {
        console.log(`${selectedShip.name} has already been placed.`);
        return;
    }

    if (canPlaceShip(row, col, selectedShip.length, isHorizontal)) {
        for (let i = 0; i < selectedShip.length; i++) {
            if (isHorizontal) {
                playerShipGrid[row][col + i] = selectedShip.name;
                markCellAsShip(row, col + i);
            } else {
                playerShipGrid[row + i][col] = selectedShip.name;
                markCellAsShip(row + i, col);
            }
        }
        selectedShip.placed = true;
        placedShips++;
        checkAllShipsPlaced();
    } else {
        console.log('Cannot place ship here.');
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
    if (placedShips === ships.length) {
        startGameButton.disabled = false;
    }
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
    selectedShip.placed = false;
    placedShips--;
    startGameButton.disabled = true;
});

// Switch to attack mode
startGameButton.addEventListener('click', function() {
    isAttackMode = true;
    gameBoardContainer.style.display = 'flex';
    grid.style.display = 'none';
    createGrid(playerBoard, 'player'); // Display player's placed grid
    createGrid(opponentBoard, 'opponent'); // Create grid for guessing opponent's ships
    displayPlayerShips(); // Show player's ships on their reference grid
    console.log('Game started! Now in attack mode.');
});

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

// Handle player's shot during attack mode
function handlePlayerShot(row, col) {
    console.log(`Player shot at: Row ${row + 1}, Col ${col + 1}`);
    // You can add more logic here later (e.g., handle hit or miss on opponent grid)
}
