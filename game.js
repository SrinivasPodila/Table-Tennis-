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

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') player.moveUp = true;
    if (e.key === 'ArrowDown') player.moveDown = true;
    if (e.key === ' ' && !gameRunning && !gameOver) {
        gameRunning = true;
        ball.reset();
    }
    if (e.key === 'r' && gameOver) {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') player.moveUp = false;
    if (e.key === 'ArrowDown') player.moveDown = false;
});

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

    // Check for winner
    if (player.score >= winningScore || computer.score >= winningScore) {
        gameOver = true;
        gameRunning = false;
        const winner = player.score > computer.score ? 'Player' : 'Computer';
        alert(`${winner} wins! Press R to restart.`);
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
    player.score = 0;
    computer.score = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    gameOver = false;
    resetBall();
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
