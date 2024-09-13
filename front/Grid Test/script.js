// Ship details
const ships = [
    { name: 'Carrier', length: 5, placed: false },
    { name: 'Battleship', length: 4, placed: false },
    { name: 'Cruiser', length: 3, placed: false },
    { name: 'Submarine', length: 2, placed: false },
    { name: 'Destroyer', length: 1, placed: false }
];

let selectedShip = ships[0];
let isHorizontal = true;
let placedShips = 0;
let isAttackMode = false;

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
                coordinates.push({ x: row + 1, y: col + 1 + i }); // Store coordinates
            } else {
                playerShipGrid[row + i][col] = selectedShip.name;
                markCellAsShip(row + i, col);
                coordinates.push({ x: row + 1 + i, y: col + 1 }); // Store coordinates
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

// Switch to attack mode
startGameButton.addEventListener('click', function() {
    if (isAttackMode) return; // Prevent further clicks if game already started
    
    isAttackMode = true;
    gameBoardContainer.style.display = 'flex';
    grid.style.display = 'none';
    
    createGrid(playerBoard, 'player'); // Display player's placed grid
    createGrid(opponentBoard, 'opponent'); // Create grid for guessing opponent's ships
    
    displayPlayerShips(); // Show player's ships on their reference grid
    console.log('Game started! Now in attack mode.');
    
    startGameButton.disabled = true; // Disable the "Start Game" button after it's clicked once
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
