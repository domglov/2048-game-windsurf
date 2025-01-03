let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
const gridContainer = document.querySelector('.grid-container');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const gameOverDisplay = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');

// Initialize high score display
highScoreDisplay.textContent = highScore;

// Helper function to compare arrays
const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
};

function createBoard() {
    // Reset the game
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile';
    });
    score = 0;
    scoreDisplay.textContent = '0';
    gameOverDisplay.classList.add('hidden');
    
    // Generate initial tiles
    generateTile();
    generateTile();
}

function generateTile() {
    const tiles = document.querySelectorAll('.tile');
    const emptyTiles = Array.from(tiles).filter(tile => !tile.textContent);
    
    if (emptyTiles.length > 0) {
        const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        randomTile.textContent = value;
        randomTile.className = `tile tile-${value}`;
    }
    
    // Check for game over after generating a new tile
    if (isGameOver()) {
        finalScoreDisplay.textContent = score;
        gameOverDisplay.classList.remove('hidden');
        
        // Update high score if current score is higher
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = highScore;
            
            // Add animation to high score
            highScoreDisplay.classList.add('new-high-score');
            setTimeout(() => {
                highScoreDisplay.classList.remove('new-high-score');
            }, 1500);
        }
    }
}

function isGameOver() {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    
    // Check if there are any empty tiles
    if (tiles.some(tile => !tile.textContent)) {
        return false;
    }
    
    // Check for possible merges horizontally
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            if (tiles[i * 4 + j].textContent === tiles[i * 4 + j + 1].textContent) {
                return false;
            }
        }
    }
    
    // Check for possible merges vertically
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            if (tiles[i * 4 + j].textContent === tiles[(i + 1) * 4 + j].textContent) {
                return false;
            }
        }
    }
    
    return true;
}

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = score;
    
    // Check for new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
}

function moveTiles(direction) {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    let moved = false;

    // Helper function to get row
    const getRow = (rowIndex) => {
        return tiles.slice(rowIndex * 4, rowIndex * 4 + 4);
    };

    // Helper function to get column
    const getColumn = (colIndex) => {
        return tiles.filter((_, index) => index % 4 === colIndex);
    };

    // Helper function to merge tiles
    const mergeTiles = (line) => {
        let mergedLine = line.filter(tile => tile.textContent !== '');
        
        // Compare positions before and after filtering empty tiles
        const originalValues = line.map(tile => tile.textContent);
        const newValues = [...originalValues].filter(val => val !== '');
        
        // Check if the tiles would actually move in the current direction
        const wouldMove = direction === 'right' || direction === 'down' 
            ? !arraysEqual(originalValues.slice(-newValues.length), newValues)
            : !arraysEqual(originalValues.slice(0, newValues.length), newValues);

        if (wouldMove) {
            moved = true;
        }

        for (let i = 0; i < mergedLine.length - 1; i++) {
            if (mergedLine[i].textContent === mergedLine[i + 1].textContent) {
                const value = parseInt(mergedLine[i].textContent) * 2;
                mergedLine[i].textContent = value;
                mergedLine[i].className = `tile tile-${value} merged`;
                mergedLine.splice(i + 1, 1);
                moved = true;
                updateScore(value);
                
                setTimeout(() => {
                    mergedLine[i].className = `tile tile-${value}`;
                }, 300);
            }
        }
        return mergedLine;
    };

    const moveLine = (line, reverse = false) => {
        let mergedLine = mergeTiles(reverse ? line.reverse() : line);
        const result = Array(4).fill(null).map(() => ({
            textContent: '',
            className: 'tile'
        }));

        mergedLine.forEach((tile, index) => {
            const newPosition = reverse ? 3 - index : index;
            result[newPosition] = {
                textContent: tile.textContent,
                className: tile.className
            };
        });

        return result;
    };

    // Process the move based on direction
    for (let i = 0; i < 4; i++) {
        let line;
        let positions;

        if (direction === 'left' || direction === 'right') {
            line = getRow(i);
            positions = line.map((_, index) => i * 4 + index);
        } else {
            line = getColumn(i);
            positions = line.map((_, index) => index * 4 + i);
        }

        const newLine = moveLine(line, direction === 'right' || direction === 'down');

        positions.forEach((pos, index) => {
            tiles[pos].textContent = newLine[index].textContent;
            tiles[pos].className = newLine[index].className;
        });
    }

    if (moved) {
        generateTile();
    }
}

let touchStartX = null;
let touchStartY = null;
const MIN_SWIPE_DISTANCE = 50; // minimum distance for a swipe

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, false);

document.addEventListener('touchmove', function(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }
    e.preventDefault(); // Prevent scrolling while swiping
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Reset touch start points
    touchStartX = null;
    touchStartY = null;

    // Determine if it's a swipe based on minimum distance
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < MIN_SWIPE_DISTANCE) {
        return;
    }

    // Determine swipe direction based on larger delta
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            moveTiles('right');
        } else {
            moveTiles('left');
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            moveTiles('down');
        } else {
            moveTiles('up');
        }
    }
}, false);

document.addEventListener('keydown', function handleKey(e) {
    switch (e.key) {
        case 'ArrowLeft':
            moveTiles('left');
            break;
        case 'ArrowRight':
            moveTiles('right');
            break;
        case 'ArrowUp':
            moveTiles('up');
            break;
        case 'ArrowDown':
            moveTiles('down');
            break;
    }
});

createBoard();
