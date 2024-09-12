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

// Create a 10x10 grid with labels for columns (A-J) and rows (1-10)
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

// Function to check if a ship can be placed at the given position
function canPlaceShip(row, col, shipLength, isHorizontal) {
    if (isHorizontal) {
        if (col + shipLength > 10) return false; // Check boundary horizontally
        for (let i = 0; i < shipLength; i++) {
            if (playerShipGrid[row][col + i] !== null) return false; // Check for overlap
        }
    } else {
        if (row + shipLength > 10) return false; // Check boundary vertically
        for (let i = 0; i < shipLength; i++) {
            if (playerShipGrid[row + i][col] !== null) return false; // Check for overlap
        }
    }
    return true;
}

// Function to place a ship on the grid
function placeShip(row, col) {
    const ship = selectedShip;

    if (ship.placed) {
        alert(`${ship.name} is already placed.`);
        return;
    }

    if (canPlaceShip(row, col, ship.length, isHorizontal)) {
        // Place the ship
        if (isHorizontal) {
            for (let i = 0; i < ship.length; i++) {
                playerShipGrid[row][col + i] = ship.name;
                document.querySelector(`[data-row="${row + 1}"][data-col="${col + i + 1}"]`).classList.add('ship-placed');
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                playerShipGrid[row + i][col] = ship.name;
                document.querySelector(`[data-row="${row + i + 1}"][data-col="${col + 1}"]`).classList.add('ship-placed');
            }
        }

        ship.placed = true;
        placedShips++;

        if (placedShips === ships.length) {
            alert('All ships have been placed. Ready to start the game!');
        }
    } else {
        alert('Ship cannot be placed here.');
    }
}

// Initial grid creation for the player
createGrid(grid, 'player');

// Example to toggle ship orientation
toggleOrientationButton.addEventListener('click', () => {
    isHorizontal = !isHorizontal;
    toggleOrientationButton.textContent = isHorizontal ? 'Switch to Vertical' : 'Switch to Horizontal';
});

