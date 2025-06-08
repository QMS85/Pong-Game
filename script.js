// --- Pong Game Variables ---
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const paddleWidth = 15, paddleHeight = 100;
const playerX = 10, aiX = WIDTH - paddleWidth - 10;
let playerY = HEIGHT/2 - paddleHeight/2;
let aiY = HEIGHT/2 - paddleHeight/2;
const paddleSpeed = 6;

// Ball settings
let ballX = WIDTH/2, ballY = HEIGHT/2;
let ballRadius = 12;
let ballSpeed = 6;
let ballVelX = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = ballSpeed * (Math.random() * 2 - 1);

// Score
let playerScore = 0, aiScore = 0;

// --- Drawing Functions ---
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "40px Arial";
    ctx.fillText(text, x, y);
}

// --- Game Mechanics ---
function resetBall() {
    ballX = WIDTH/2;
    ballY = HEIGHT/2;
    ballVelX = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = ballSpeed * (Math.random() * 2 - 1);
}

function collisionDetect(px, py) {
    // Paddle collision
    return (
        ballX - ballRadius < px + paddleWidth &&
        ballX + ballRadius > px &&
        ballY + ballRadius > py &&
        ballY - ballRadius < py + paddleHeight
    );
}

// --- Mouse Event for Player Paddle ---
canvas.addEventListener('mousemove', evt => {
    const rect = canvas.getBoundingClientRect();
    // Move paddle center to mouse Y
    playerY = evt.clientY - rect.top - paddleHeight/2;
    // Clamp within the canvas
    playerY = Math.max(0, Math.min(HEIGHT - paddleHeight, playerY));
});

// --- AI Movement ---
function moveAI() {
    // Basic AI: follow the ball with some smoothing
    const aiCenter = aiY + paddleHeight/2;
    if (aiCenter < ballY - 20) {
        aiY += paddleSpeed * 0.85;
    } else if (aiCenter > ballY + 20) {
        aiY -= paddleSpeed * 0.85;
    }
    // Clamp AI paddle within canvas
    aiY = Math.max(0, Math.min(HEIGHT - paddleHeight, aiY));
}

// --- Update Game State ---
function update() {
    // Move the ball
    ballX += ballVelX;
    ballY += ballVelY;

    // Top/bottom wall collision
    if (ballY - ballRadius < 0) {
        ballY = ballRadius;
        ballVelY *= -1;
    } else if (ballY + ballRadius > HEIGHT) {
        ballY = HEIGHT - ballRadius;
        ballVelY *= -1;
    }

    // Paddle collision detection
    // Player
    if (collisionDetect(playerX, playerY)) {
        ballX = playerX + paddleWidth + ballRadius;
        ballVelX *= -1;
        // Add some control
        let collidePoint = (ballY - (playerY + paddleHeight/2)) / (paddleHeight/2);
        let angleRad = collidePoint * Math.PI/4;
        let direction = ballVelX > 0 ? 1 : -1;
        ballVelX = direction * ballSpeed * Math.cos(angleRad);
        ballVelY = ballSpeed * Math.sin(angleRad);
    }
    // AI
    if (collisionDetect(aiX, aiY)) {
        ballX = aiX - ballRadius;
        ballVelX *= -1;
        // Add some randomness
        let collidePoint = (ballY - (aiY + paddleHeight/2)) / (paddleHeight/2);
        let angleRad = collidePoint * Math.PI/4;
        let direction = ballVelX > 0 ? 1 : -1;
        ballVelX = direction * ballSpeed * Math.cos(angleRad);
        ballVelY = ballSpeed * Math.sin(angleRad) + (Math.random() - 0.5);
    }

    // Score
    if (ballX - ballRadius < 0) {
        aiScore++;
        resetBall();
    } else if (ballX + ballRadius > WIDTH) {
        playerScore++;
        resetBall();
    }

    // Move AI paddle
    moveAI();
}

// --- Render Everything ---
function render() {
    // Clear
    drawRect(0, 0, WIDTH, HEIGHT, "#222");

    // Middle net
    for (let i = 0; i < HEIGHT; i += 32) {
        drawRect(WIDTH/2 - 2, i, 4, 20, "#fff");
    }

    // Player paddle
    drawRect(playerX, playerY, paddleWidth, paddleHeight, "#fff");
    // AI paddle
    drawRect(aiX, aiY, paddleWidth, paddleHeight, "#fff");
    // Ball
    drawCircle(ballX, ballY, ballRadius, "#fff");
    // Scores
    drawText(playerScore, WIDTH/4, 60, "#0ff");
    drawText(aiScore, 3*WIDTH/4, 60, "#ff0");
}

// --- Game Loop ---
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();
