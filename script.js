// Level configurations
const LEVELS = {
    1: { rows: 2, cols: 2, timeLimit: 30, flipTime: 1000, symbols: ['🌟', '🎮'] },
    2: { rows: 3, cols: 4, timeLimit: 60, flipTime: 800, symbols: ['🌟', '🎮', '🎨', '🎵', '🚀', '🌈'] },
    3: { rows: 4, cols: 4, timeLimit: 90, flipTime: 600, symbols: ['🌟', '🎮', '🎨', '🎵', '🚀', '🌈', '🎪', '🎯'] },
    4: { rows: 4, cols: 5, timeLimit: 120, flipTime: 400, symbols: ['🌟', '🎮', '🎨', '🎵', '🚀', '🌈', '🎪', '🎯', '🎲', '🎭'] },
    5: { rows: 4, cols: 6, timeLimit: 150, flipTime: 200, symbols: ['🌟', '🎮', '🎨', '🎵', '🚀', '🌈', '🎪', '🎯', '🎲', '🎭', '🎩', '🎬'] }
};

// Game state
let currentLevel = 1;
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let score = 0;
let gameStarted = false;
let timerInterval;
let seconds = 0;

// DOM elements
const levelSelect = document.getElementById('level-select');
const gameContainer = document.getElementById('game-container');
const gameBoard = document.querySelector('.game-board');
const movesCount = document.getElementById('moves-count');
const timeElement = document.getElementById('time');
const scoreElement = document.getElementById('score');
const currentLevelElement = document.getElementById('current-level');
const restartButton = document.getElementById('restart');
const backToLevelsButton = document.getElementById('back-to-levels');

// Initialize level buttons
document.querySelectorAll('.level-btn').forEach(button => {
    button.addEventListener('click', () => {
        currentLevel = parseInt(button.dataset.level);
        startLevel(currentLevel);
    });
});

// Start level
function startLevel(level) {
    levelSelect.style.display = 'none';
    gameContainer.style.display = 'block';
    currentLevelElement.textContent = level;
    initializeGame();
}

// Initialize game
function initializeGame() {
    // Reset game state
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    score = 0;
    seconds = 0;
    gameStarted = false;
    
    // Update display
    movesCount.textContent = moves;
    timeElement.textContent = '00:00';
    scoreElement.textContent = score;
    clearInterval(timerInterval);
    
    // Clear game board
    gameBoard.innerHTML = '';
    gameBoard.className = 'game-board level-' + currentLevel;
    
    // Create and shuffle cards for current level
    const levelConfig = LEVELS[currentLevel];
    const cardPairs = levelConfig.symbols.slice(0, (levelConfig.rows * levelConfig.cols) / 2);
    const cardData = [...cardPairs, ...cardPairs];
    const shuffledCards = cardData.sort(() => Math.random() - 0.5);
    
    // Generate card elements
    shuffledCards.forEach((symbol, index) => {
        const cardElement = createCard(symbol, index);
        gameBoard.appendChild(cardElement);
    });
}

// Create card element
function createCard(symbol, index) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.index = index;
    
    cardElement.innerHTML = `
        <div class="card-front">${symbol}</div>
        <div class="card-back"></div>
    `;
    
    cardElement.addEventListener('click', () => flipCard(cardElement, symbol));
    return cardElement;
}

// Flip card
function flipCard(cardElement, symbol) {
    const levelConfig = LEVELS[currentLevel];
    
    // Prevent flipping if card is already flipped or matched
    if (cardElement.classList.contains('flipped') || 
        cardElement.classList.contains('matched') ||
        flippedCards.length >= 2) {
        return;
    }
    
    // Start timer on first move
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }
    
    // Flip card
    cardElement.classList.add('flipped');
    flippedCards.push({ element: cardElement, symbol: symbol });
    
    // Check for match if two cards are flipped
    if (flippedCards.length === 2) {
        moves++;
        movesCount.textContent = moves;
        checkForMatch(levelConfig.flipTime);
    }
}

// Check for match
function checkForMatch(flipTime) {
    const [firstCard, secondCard] = flippedCards;
    const match = firstCard.symbol === secondCard.symbol;
    
    if (match) {
        firstCard.element.classList.add('matched');
        secondCard.element.classList.add('matched');
        matchedPairs++;
        
        // Calculate score based on level and time taken
        const timeBonus = Math.max(0, LEVELS[currentLevel].timeLimit - seconds);
        const levelBonus = currentLevel * 100;
        score += 1000 + timeBonus + levelBonus;
        scoreElement.textContent = score;
        
        if (matchedPairs === LEVELS[currentLevel].rows * LEVELS[currentLevel].cols / 2) {
            setTimeout(endGame, 500);
        }
    } else {
        setTimeout(() => {
            firstCard.element.classList.remove('flipped');
            secondCard.element.classList.remove('flipped');
        }, flipTime);
    }
    
    flippedCards = [];
}

// Start timer
function startTimer() {
    const levelConfig = LEVELS[currentLevel];
    timerInterval = setInterval(() => {
        seconds++;
        const timeLeft = levelConfig.timeLimit - seconds;
        
        if (timeLeft <= 0) {
            endGame(true);
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const remainingSeconds = timeLeft % 60;
        timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// End game
function endGame(timeUp = false) {
    clearInterval(timerInterval);
    if (timeUp) {
        alert('Time\'s up! Try again!');
        initializeGame();
    } else {
        const message = `Congratulations! Level ${currentLevel} completed!\nScore: ${score}\nMoves: ${moves}\nTime: ${timeElement.textContent}`;
        alert(message);
        
        if (currentLevel < 5) {
            if (confirm('Continue to next level?')) {
                currentLevel++;
                startLevel(currentLevel);
            } else {
                showLevelSelect();
            }
        } else {
            alert('Congratulations! You\'ve completed all levels!');
            showLevelSelect();
        }
    }
}

// Show level select screen
function showLevelSelect() {
    gameContainer.style.display = 'none';
    levelSelect.style.display = 'block';
}

// Event listeners
restartButton.addEventListener('click', initializeGame);
backToLevelsButton.addEventListener('click', showLevelSelect); 