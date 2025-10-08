// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 500;

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    dx: 5,
    dy: 5,
    speed: 5,
    reset: function() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() * 2 - 1) * this.speed;
    }
};

const paddleHeight = 100;
const paddleWidth = 10;

const player = {
    x: 50,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 8,
    score: 0,
    moveUp: false,
    moveDown: false
};

const computer = {
    x: canvas.width - 50 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 4,
    score: 0
};

// Game state
let gameRunning = false;
const winningScore = 5;
let gameOver = false;
let gameTimeLeft = 5 * 60; // 5 minutes in seconds
let gameTimer;
let computerWins = false;
let gameEndedByTime = false; // Track if game ended by time

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') player.moveUp = true;
    if (e.key === 'ArrowDown') player.moveDown = true;
    if (e.key === ' ' && !gameRunning && !gameOver) {
        startGame();
    }
    // Only allow R to work when the game is actually over
    if (e.key.toLowerCase() === 'r' && gameOver && computerWins) {
        resetGame();
    } else if (e.key.toLowerCase() === 'r' && !computerWins) {
        // Prevent default R key behavior during game
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') player.moveUp = false;
    if (e.key === 'ArrowDown') player.moveDown = false;
});

// Mobile controls
const startBtn = document.getElementById('startBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');

// Touch and mouse events for mobile controls
function addMobileButtonListeners(button, action) {
    // Touch events
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        action(true);
    }, { passive: false });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        action(false);
    }, { passive: false });
    
    // Mouse events for testing on desktop
    button.addEventListener('mousedown', () => action(true));
    button.addEventListener('mouseup', () => action(false));
    button.addEventListener('mouseleave', () => action(false));
}

// Add event listeners to mobile buttons
addMobileButtonListeners(upBtn, (isActive) => player.moveUp = isActive);
addMobileButtonListeners(downBtn, (isActive) => player.moveDown = isActive);

// Start button functionality
startBtn.addEventListener('click', () => {
    if (!gameRunning && !gameOver) {
        startGame();
    }
});

// Function to show a message with animation
function showMessage(text, duration = 2000) {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 2rem;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 0 30px rgba(255, 107, 107, 0.7);
        animation: fadeInOut 2s ease-in-out;
        white-space: nowrap;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;
    
    // Add animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            15% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            30% { transform: translate(-50%, -50%) scale(0.95); }
            50% { transform: translate(-50%, -50%) scale(1); }
            85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(msg);
    
    // Remove message after duration
    setTimeout(() => {
        msg.remove();
        style.remove();
    }, duration);
}

// Start game function
function startGame() {
    if (!gameRunning && !gameOver) {
        // Show challenge message
        showMessage('DARE TO PLAY WITH ME AND WIN AGAINST ME!');
        
        // Reset scores and game state
        player.score = 0;
        computer.score = 0;
        document.getElementById('playerScore').textContent = '0';
        document.getElementById('computerScore').textContent = '0';
        
        gameRunning = true;
        gameOver = false;
        computerWins = false;
        gameEndedByTime = false;
        gameTimeLeft = 5 * 60; // Reset timer to 5 minutes
        updateTimerDisplay();
        
        // Start the game timer
        clearInterval(gameTimer);
        gameTimer = setInterval(updateGameTimer, 1000);
        
        // Reset ball
        ball.speed = 5;
        ball.reset();
        
        // Reset paddles to center
        player.y = canvas.height / 2 - player.height / 2;
        computer.y = canvas.height / 2 - computer.height / 2;
    }
}

function updateGameTimer() {
    if (!gameRunning || gameOver) return;
    
    gameTimeLeft--;
    updateTimerDisplay();
    
    if (gameTimeLeft <= 0) {
        // Time's up! Computer wins
        clearInterval(gameTimer);
        gameOver = true;
        computerWins = true;
        computer.score = Math.max(computer.score, player.score + 1); // Ensure computer has higher score
        document.getElementById('computerScore').textContent = computer.score;
        
        // Show game over message and enable restart
        const gameOverMsg = document.createElement('div');
        gameOverMsg.id = 'gameOverMessage';
        gameOverMsg.textContent = 'Game Over! Computer wins! Press R to restart';
        gameOverMsg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.5rem;
            text-align: center;
            z-index: 1000;
        `;
        document.body.appendChild(gameOverMsg);
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameTimeLeft / 60);
    const seconds = gameTimeLeft % 60;
    document.getElementById('gameTimer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Game functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 20) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, 'rgba(255, 255, 255, 0.5)');
    }
}

function update() {
    if (!gameRunning || gameOver) return;

    // Move player paddle
    if (player.moveUp && player.y > 0) {
        player.y -= player.dy;
    }
    if (player.moveDown && player.y + player.height < canvas.height) {
        player.y += player.dy;
    }

    // Simple AI for computer paddle
    const computerPaddleCenter = computer.y + computer.height / 2;
    if (computerPaddleCenter < ball.y - 35) {
        computer.y += computer.dy;
    }
    if (computerPaddleCenter > ball.y + 35) {
        computer.y -= computer.dy;
    }

    // Keep computer paddle in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) computer.y = canvas.height - computer.height;

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
    }

    // Ball collision with paddles
    // Player paddle
    if (ball.dx < 0 && 
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y && 
        ball.y < player.y + player.height) {
        const collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        const angle = (Math.PI / 4) * collidePoint;
        
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
        
        // Increase speed slightly
        ball.speed += 0.2;
    }

    // Computer paddle
    if (ball.dx > 0 && 
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y && 
        ball.y < computer.y + computer.height) {
        const collidePoint = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        const angle = (Math.PI / 4) * collidePoint;
        
        ball.dx = -Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
        
        // Increase speed slightly
        ball.speed += 0.2;
    }

    // Score points
    if (ball.x - ball.radius < 0) {
        computer.score++;
        document.getElementById('computerScore').textContent = computer.score;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        document.getElementById('playerScore').textContent = player.score;
        resetBall();
    }

        // Only check for winner if game hasn't ended by time
    if (!gameEndedByTime && (player.score >= winningScore || computer.score >= winningScore)) {
        gameOver = true;
        gameRunning = false;
        clearInterval(gameTimer);
        // Don't show any alert, just end the game
    }
}

function resetBall() {
    gameRunning = false;
    ball.speed = 5;
    setTimeout(() => {
        ball.reset();
        gameRunning = true;
    }, 1000);
}

function resetGame() {
    // Only allow reset if game is over (time's up)
    if (!gameOver) return;
    
    // Remove game over message if it exists
    const gameOverMsg = document.getElementById('gameOverMessage');
    if (gameOverMsg) {
        gameOverMsg.remove();
    }
    
    // Reset game state
    player.score = 0;
    computer.score = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    gameOver = false;
    gameRunning = false;
    computerWins = false;
    gameEndedByTime = false;
    gameTimeLeft = 5 * 60;
    updateTimerDisplay();
    clearInterval(gameTimer);
    resetBall();
    
    // Reset ball position
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game objects
    drawRect(player.x, player.y, player.width, player.height, '#fff');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#fff');
    drawCircle(ball.x, ball.y, ball.radius, '#ff0');
    drawNet();
    
    // Draw start/game over message
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        
        if (gameOver) {
            const winner = player.score > computer.score ? 'You Win!' : 'Computer Wins!';
            ctx.fillText(winner, canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '20px Arial';
            ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 20);
        } else {
            ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2);
        }
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
ball.reset();
gameLoop();
