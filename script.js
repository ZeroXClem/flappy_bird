// script.js

document.addEventListener('DOMContentLoaded', function() {
    // -----------------------------
    // Game Variables and Constants
    // -----------------------------

    // Get Canvas and Context
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Canvas Dimensions
    const GAME_WIDTH = 400;
    const GAME_HEIGHT = 600;

    // Game State
    let gameState = 'start'; // 'start', 'playing', 'gameover', 'paused'

    // Gravity
    let gravity = 1;

    // Score and Level
    let score = 0;
    let level = 1;
    let pipeSpeed = 5;
    const gravityIncrease = 0.1;

    // Timing for Pipes
    let pipeInterval = 2000; // 2 seconds
    let pipeTimer = 0;

    // Arrays for Pipes
    let pipes = [];

    // Image and Sound Assets
    const assets = {
        images: {},
        sounds: {}
    };

    // Player Preferences
    let birdSkin = 'yellow';
    let backgroundTheme = 'day';
    let difficulty = 'medium';

    // Power-Up Message (Removed as Star is not available)
    let powerUpMessage = '';
    let powerUpMessageTimer = 0;

    // High Score
    let highScore = 0;

    // Bird Flap Animation Variables
    let birdFlapFrame = 0;
    const flapSpeed = 10; // Determines how fast the bird flaps

    // -----------------
    // Asset Loading
    // -----------------

    // Load Images
    function loadImages() {
        // Load Score Digits
        for (let i = 0; i <= 9; i++) {
            assets.images[i] = new Image();
            assets.images[i].src = `assets/images/${i}.png`;
        }

        // Load Backgrounds
        assets.images['background-day'] = new Image();
        assets.images['background-day'].src = 'assets/images/background-day.png';

        assets.images['background-night'] = new Image();
        assets.images['background-night'].src = 'assets/images/background-night.png';

        // Load Base (Ground)
        assets.images['base'] = new Image();
        assets.images['base'].src = 'assets/images/base.png';

        // Load Birds
        const birdColors = ['blue', 'red', 'yellow'];
        birdColors.forEach(color => {
            assets.images[`${color}bird-downflap`] = new Image();
            assets.images[`${color}bird-downflap`].src = `assets/images/${color}bird-downflap.png`;

            assets.images[`${color}bird-midflap`] = new Image();
            assets.images[`${color}bird-midflap`].src = `assets/images/${color}bird-midflap.png`;

            assets.images[`${color}bird-upflap`] = new Image();
            assets.images[`${color}bird-upflap`].src = `assets/images/${color}bird-upflap.png`;
        });

        // Load Game Over Image
        assets.images['gameover'] = new Image();
        assets.images['gameover'].src = 'assets/images/gameover.png';

        // Load Message Image
        assets.images['message'] = new Image();
        assets.images['message'].src = 'assets/images/message.png';

        // Load Pipes
        assets.images['pipe-green'] = new Image();
        assets.images['pipe-green'].src = 'assets/images/pipe-green.png';

        assets.images['pipe-red'] = new Image();
        assets.images['pipe-red'].src = 'assets/images/pipe-red.png';
    }

    // Load Sounds
    function loadSounds() {
        // Helper function to create a sound object with multiple formats
        function createSound(name, formats) {
            const sound = {};
            sound[name] = new Audio();
            // Attach sources
            formats.forEach(format => {
                const source = document.createElement('source');
                source.src = `assets/sounds/${name}.${format}`;
                sound[name].appendChild(source);
            });
            return sound;
        }

        // Load Wing Flap Sound
        Object.assign(assets.sounds, createSound('wing', ['ogg', 'wav']));

        // Load Hit Sound
        Object.assign(assets.sounds, createSound('hit', ['ogg', 'wav']));

        // Load Point Sound
        Object.assign(assets.sounds, createSound('point', ['ogg', 'wav']));

        // Load Swoosh Sound
        Object.assign(assets.sounds, createSound('swoosh', ['ogg', 'wav']));

        // Load Die Sound
        Object.assign(assets.sounds, createSound('die', ['ogg', 'wav']));

        // Load Game Over Sound
        Object.assign(assets.sounds, createSound('gameover', ['ogg', 'wav']));

        // Load Level Up Sound
        Object.assign(assets.sounds, createSound('levelup', ['ogg', 'wav']));

        // Background Music (Removed as assets are not available)
        // Commented out to prevent errors
        /*
        Object.assign(assets.sounds, createSound('background', ['ogg', 'wav']));
        assets.sounds['background'].loop = true;
        */
    }

    // Call Asset Loading Functions
    loadImages();
    loadSounds();

    // -----------------------
    // Classes and Objects
    // -----------------------

    // Bird Class
    class Bird {
        constructor() {
            this.width = 34; // Adjusted based on asset dimensions
            this.height = 24;
            this.x = GAME_WIDTH / 2 - this.width / 2;
            this.y = 200;
            this.speed = 0;
            this.flapFrame = 0;
            this.image = this.getCurrentImage();
            this.goldGlow = false;
            this.goldGlowTimer = 0;
        }

        flap() {
            this.speed = -10;
            if (assets.sounds['wing']) {
                assets.sounds['wing'].currentTime = 0;
                assets.sounds['wing'].play();
            }
        }

        getCurrentImage() {
            // Cycle through flap frames: downflap -> midflap -> upflap
            const color = `${birdSkin}`;
            let image;
            if (birdFlapFrame < flapSpeed) {
                image = assets.images[`${color}bird-downflap`];
            } else if (birdFlapFrame < flapSpeed * 2) {
                image = assets.images[`${color}bird-midflap`];
            } else {
                image = assets.images[`${color}bird-upflap`];
            }
            return image;
        }

        update() {
            this.speed += gravity;
            this.y += this.speed;

            // Update flap frame
            birdFlapFrame = (birdFlapFrame + 1) % (flapSpeed * 3);
            this.image = this.getCurrentImage();

            // Gold Glow Effect (Removed as Star is not available)
            /*
            if (this.goldGlow) {
                this.goldGlowTimer--;
                if (this.goldGlowTimer <= 0) {
                    this.goldGlow = false;
                }
            }
            */

            // Collision with Ground
            if (this.y + this.height >= GAME_HEIGHT - assets.images['base'].height) {
                gameOver();
            }

            // Collision with Ceiling
            if (this.y <= 0) {
                this.y = 0;
                this.speed = 0;
            }
        }

        draw() {
            /*
            if (this.goldGlow) {
                ctx.save();
                ctx.shadowColor = 'gold';
                ctx.shadowBlur = 20;
            }
            */

            if (this.image.complete && this.image.naturalHeight !== 0) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            } else {
                console.warn(`Image not loaded: ${this.image.src}`);
                // Draw a placeholder rectangle if image fails to load
                ctx.fillStyle = 'red';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }

            /*
            if (this.goldGlow) {
                ctx.restore();
            }
            */
        }

        reset() {
            this.y = 200;
            this.speed = 0;
            /* 
            this.goldGlow = false;
            this.goldGlowTimer = 0;
            */
            birdFlapFrame = 0;
            this.image = this.getCurrentImage();
        }

        collectStar() {
            // Removed as Star is not available
        }
    }

    // Create a new Bird instance
    let bird = new Bird();

    // Pipe Class
    class Pipe {
        constructor(color = 'green') {
            this.width = 60;
            this.gap = 150;
            this.x = GAME_WIDTH;
            this.speed = pipeSpeed;
            this.color = color; // 'green' or 'red'
            this.image = assets.images[`pipe-${color}`];
            this.topHeight = Math.floor(Math.random() * (GAME_HEIGHT - this.gap - assets.images['base'].height - 100)) + 50;
            this.passed = false;
        }

        update() {
            this.x -= this.speed;
        }

        draw() {
            // Top Pipe
            if (this.image.complete && this.image.naturalHeight !== 0) {
                ctx.drawImage(this.image, this.x, 0, this.width, this.topHeight);
            } else {
                console.warn(`Image not loaded: ${this.image.src}`);
                // Draw a placeholder rectangle if image fails to load
                ctx.fillStyle = 'green';
                ctx.fillRect(this.x, 0, this.width, this.topHeight);
            }

            // Bottom Pipe
            const bottomY = this.topHeight + this.gap;
            const bottomHeight = GAME_HEIGHT - bottomY - assets.images['base'].height;
            if (this.image.complete && this.image.naturalHeight !== 0) {
                ctx.drawImage(this.image, this.x, bottomY, this.width, bottomHeight);
            } else {
                console.warn(`Image not loaded: ${this.image.src}`);
                // Draw a placeholder rectangle if image fails to load
                ctx.fillStyle = 'green';
                ctx.fillRect(this.x, bottomY, this.width, bottomHeight);
            }
        }

        isOffScreen() {
            return this.x + this.width < 0;
        }

        collidesWith(bird) {
            // Bird boundaries
            const birdLeft = bird.x;
            const birdRight = bird.x + bird.width;
            const birdTop = bird.y;
            const birdBottom = bird.y + bird.height;

            // Top Pipe boundaries
            const pipeTopLeft = this.x;
            const pipeTopRight = this.x + this.width;
            const pipeTopTop = 0;
            const pipeTopBottom = this.topHeight;

            // Bottom Pipe boundaries
            const pipeBottomLeft = this.x;
            const pipeBottomRight = this.x + this.width;
            const pipeBottomTop = this.topHeight + this.gap;
            const pipeBottomBottom = GAME_HEIGHT - assets.images['base'].height;

            // Check collision with top pipe
            if (
                birdRight > pipeTopLeft &&
                birdLeft < pipeTopRight &&
                birdTop < pipeTopBottom
            ) {
                return true;
            }

            // Check collision with bottom pipe
            if (
                birdRight > pipeBottomLeft &&
                birdLeft < pipeBottomRight &&
                birdBottom > pipeBottomTop
            ) {
                return true;
            }

            return false;
        }
    }

    // MovingPipe Class (Advanced Obstacle - Removed as it requires dynamic pipe behavior)
    // For simplicity, we'll use standard pipes only

    // Function to create a new Pipe
    function createPipe() {
        // Determine pipe color randomly
        const color = Math.random() < 0.5 ? 'green' : 'red';
        pipes.push(new Pipe(color));
    }

    // Input Handling
    function handleInput() {
        if (gameState === 'playing') {
            bird.flap();
        } else if (gameState === 'gameover') {
            restartGame();
        } else if (gameState === 'paused') {
            togglePause();
        }
    }

    // Add Event Listeners for Keyboard and Touch
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            handleInput();
        } else if (event.code === 'KeyP') {
            togglePause();
        }
    });

    document.addEventListener('touchstart', function(event) {
        event.preventDefault();
        handleInput();
    });

    // Collision Detection
    function checkCollisions() {
        // Check collision with Pipes
        for (let pipe of pipes) {
            if (pipe.collidesWith(bird)) {
                if (assets.sounds['hit']) {
                    assets.sounds['hit'].currentTime = 0;
                    assets.sounds['hit'].play();
                }
                gameOver();
            }
        }

        // Removed Star Collision
    }

    // Game Over Function
    function gameOver() {
        if (gameState !== 'gameover') {
            gameState = 'gameover';
            /*
            if (assets.sounds['background']) {
                assets.sounds['background'].pause();
            }
            */
            if (assets.sounds['gameover']) {
                assets.sounds['gameover'].currentTime = 0;
                assets.sounds['gameover'].play();
            }
            saveHighScore();
            displayGameOverScreen();
        }
    }

    // Display Game Over Screen
    function displayGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over');
        const finalScore = document.getElementById('final-score');
        const finalLevel = document.getElementById('final-level');
        const highScoreDisplay = document.getElementById('high-score');
        const scoreDisplayOver = document.getElementById('score-display-over');

        finalScore.innerText = `Score: ${score}`;
        finalLevel.innerText = `Level: ${level}`;
        highScoreDisplay.innerText = `High Score: ${highScore}`;

        // Display Score Using Digit Images
        scoreDisplayOver.innerHTML = '';
        const scoreString = score.toString();
        for (let char of scoreString) {
            const digitImg = document.createElement('img');
            digitImg.src = `assets/images/${char}.png`;
            scoreDisplayOver.appendChild(digitImg);
        }

        gameOverScreen.style.display = 'flex';
    }

    // Level Up Function
    function levelUp() {
        level += 1;
        pipeSpeed += 1;
        gravity += gravityIncrease;

        // Optionally, adjust pipe gap or other parameters for increased difficulty
        // For simplicity, we'll keep the pipe gap constant

        if (assets.sounds['levelup']) {
            assets.sounds['levelup'].currentTime = 0;
            assets.sounds['levelup'].play();
        }

        // Display Level Up Message (Optional - Removed as no star power-up)
        /*
        powerUpMessage = `Level ${level}!`;
        powerUpMessageTimer = 120; // 2 seconds at 60fps
        */
    }

    // Restart Function
    function restartGame() {
        // Reset Game State
        gameState = 'playing';
        document.getElementById('game-over').style.display = 'none';

        // Reset Variables
        score = 0;
        level = 1;
        pipeSpeed = initialPipeSpeed(); // Based on difficulty
        gravity = initialGravity(); // Based on difficulty
        pipeTimer = 0;
        pipes = [];
        /*
        stars = [];
        powerUpMessage = '';
        powerUpMessageTimer = 0;
        */

        // Reset Bird
        bird.reset();

        // Create Initial Pipes
        createPipe();

        // Play Background Music (Removed as assets are not available)
        /*
        if (assets.sounds['background']) {
            assets.sounds['background'].currentTime = 0;
            assets.sounds['background'].play();
        }
        */
    }

    // Initialize Pipe Speed and Gravity based on Difficulty
    function initialPipeSpeed() {
        switch(difficulty) {
            case 'easy':
                return 4;
            case 'medium':
                return 5;
            case 'hard':
                return 6;
            default:
                return 5;
        }
    }

    function initialGravity() {
        switch(difficulty) {
            case 'easy':
                return 0.8;
            case 'medium':
                return 1;
            case 'hard':
                return 1.2;
            default:
                return 1;
        }
    }

    // Save High Score
    function saveHighScore() {
        highScore = localStorage.getItem('flappyBirdHighScore') || 0;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyBirdHighScore', highScore);
        }
    }

    // Load High Score
    function loadHighScore() {
        highScore = localStorage.getItem('flappyBirdHighScore') || 0;
    }

    // Toggle Pause Functionality
    function togglePause() {
        if (gameState === 'playing') {
            gameState = 'paused';
            /*
            if (assets.sounds['background']) {
                assets.sounds['background'].pause();
            }
            */
        } else if (gameState === 'paused') {
            gameState = 'playing';
            /*
            if (assets.sounds['background']) {
                assets.sounds['background'].play();
            }
            */
        }
    }

    // Game Loop
    let lastTime = 0;

    function gameLoop(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (gameState === 'playing') {
            update(deltaTime);
            render();
        } else if (gameState === 'paused') {
            renderPauseScreen();
        }

        requestAnimationFrame(gameLoop);
    }

    function update(deltaTime) {
        // Update Bird
        bird.update();

        // Update Pipes
        for (let pipe of pipes) {
            pipe.update();
        }

        // Remove Off-Screen Pipes
        pipes = pipes.filter(pipe => !pipe.isOffScreen());

        // Check Collisions
        checkCollisions();

        // Handle Scoring
        for (let pipe of pipes) {
            if (!pipe.passed && pipe.x + pipe.width < bird.x) {
                pipe.passed = true;
                score += 1;
                if (assets.sounds['point']) {
                    assets.sounds['point'].currentTime = 0;
                    assets.sounds['point'].play();
                }

                // Level Up
                if (score % 10 === 0) {
                    levelUp();
                }
            }
        }

        // Update Pipe Timer
        pipeTimer += deltaTime;
        if (pipeTimer > pipeInterval) {
            createPipe();
            pipeTimer = 0;
        }

        // Update Power-Up Message Timer (Removed as Star is not available)
        /*
        if (powerUpMessageTimer > 0) {
            powerUpMessageTimer--;
        } else {
            powerUpMessage = '';
        }
        */
    }

    function render() {
        // Clear Canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw Background
        if (backgroundTheme === 'day') {
            if (assets.images['background-day'].complete && assets.images['background-day'].naturalHeight !== 0) {
                ctx.drawImage(assets.images['background-day'], 0, 0, GAME_WIDTH, GAME_HEIGHT);
            } else {
                console.warn('Background day image not loaded.');
                ctx.fillStyle = '#70c5ce'; // Fallback color
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            }
        } else {
            if (assets.images['background-night'].complete && assets.images['background-night'].naturalHeight !== 0) {
                ctx.drawImage(assets.images['background-night'], 0, 0, GAME_WIDTH, GAME_HEIGHT);
            } else {
                console.warn('Background night image not loaded.');
                ctx.fillStyle = '#303030'; // Fallback color for night
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            }
        }

        // Draw Pipes
        for (let pipe of pipes) {
            pipe.draw();
        }

        // Draw Base (Ground)
        if (assets.images['base'].complete && assets.images['base'].naturalHeight !== 0) {
            ctx.drawImage(assets.images['base'], 0, GAME_HEIGHT - assets.images['base'].height, GAME_WIDTH, assets.images['base'].height);
        } else {
            console.warn('Base image not loaded.');
            // Draw a placeholder rectangle for the base
            ctx.fillStyle = '#DEB887'; // Brown color
            ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);
        }

        // Draw Bird
        bird.draw();

        // Draw Score Using Digit Images
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.innerHTML = '';
            const scoreString = score.toString();
            for (let char of scoreString) {
                const digitImg = document.createElement('img');
                digitImg.src = `assets/images/${char}.png`;
                scoreDisplay.appendChild(digitImg);
            }
        }

        // Draw Level
        const levelDisplay = document.getElementById('level');
        if (levelDisplay) {
            levelDisplay.innerText = `Level: ${level}`;
        }

        // Draw Power-Up Message (Removed as Star is not available)
        /*
        if (powerUpMessage) {
            ctx.font = '20px Arial';
            ctx.fillStyle = 'yellow';
            ctx.textAlign = 'center';
            ctx.fillText(powerUpMessage, GAME_WIDTH / 2, 80);
        }
        */
    }

    // Render Pause Screen
    function renderPauseScreen() {
        // Draw current game state
        renderGameState();

        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw Pause Text
        ctx.font = '36px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }

    // Function to Render Current Game State (Used in Pause Screen)
    function renderGameState() {
        // Clear Canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw Background
        if (backgroundTheme === 'day') {
            if (assets.images['background-day'].complete && assets.images['background-day'].naturalHeight !== 0) {
                ctx.drawImage(assets.images['background-day'], 0, 0, GAME_WIDTH, GAME_HEIGHT);
            } else {
                console.warn('Background day image not loaded.');
                ctx.fillStyle = '#70c5ce'; // Fallback color
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            }
        } else {
            if (assets.images['background-night'].complete && assets.images['background-night'].naturalHeight !== 0) {
                ctx.drawImage(assets.images['background-night'], 0, 0, GAME_WIDTH, GAME_HEIGHT);
            } else {
                console.warn('Background night image not loaded.');
                ctx.fillStyle = '#303030'; // Fallback color for night
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            }
        }

        // Draw Pipes
        for (let pipe of pipes) {
            pipe.draw();
        }

        // Draw Base (Ground)
        if (assets.images['base'].complete && assets.images['base'].naturalHeight !== 0) {
            ctx.drawImage(assets.images['base'], 0, GAME_HEIGHT - assets.images['base'].height, GAME_WIDTH, assets.images['base'].height);
        } else {
            console.warn('Base image not loaded.');
            // Draw a placeholder rectangle for the base
            ctx.fillStyle = '#DEB887'; // Brown color
            ctx.fillRect(0, GAME_HEIGHT - 50, GAME_WIDTH, 50);
        }

        // Draw Bird
        bird.draw();

        // Draw Score Using Digit Images
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.innerHTML = '';
            const scoreString = score.toString();
            for (let char of scoreString) {
                const digitImg = document.createElement('img');
                digitImg.src = `assets/images/${char}.png`;
                scoreDisplay.appendChild(digitImg);
            }
        }

        // Draw Level
        const levelDisplay = document.getElementById('level');
        if (levelDisplay) {
            levelDisplay.innerText = `Level: ${level}`;
        }

        // Draw Power-Up Message (Removed as Star is not available)
        /*
        if (powerUpMessage) {
            ctx.font = '20px Arial';
            ctx.fillStyle = 'yellow';
            ctx.textAlign = 'center';
            ctx.fillText(powerUpMessage, GAME_WIDTH / 2, 80);
        }
        */
    }

    // ------------------------
    // Event Listeners
    // ------------------------

    // Start Button
    document.getElementById('start-button').addEventListener('click', function() {
        // Get Player Preferences
        birdSkin = document.getElementById('bird-skin').value;
        backgroundTheme = document.getElementById('background-theme').value;
        difficulty = document.getElementById('difficulty').value;

        // Update Bird Image
        bird.image = getCurrentBirdImage();

        // Hide Start Menu and Start Game
        document.getElementById('start-menu').style.display = 'none';
        gameState = 'playing';
        loadHighScore();
        restartGame();
    });

    // Replay Button
    document.getElementById('replay-button').addEventListener('click', function() {
        restartGame();
    });

    // Get Current Bird Image Based on Skin and Flap Frame
    function getCurrentBirdImage() {
        const color = `${birdSkin}`;
        if (birdFlapFrame < flapSpeed) {
            return assets.images[`${color}bird-downflap`];
        } else if (birdFlapFrame < flapSpeed * 2) {
            return assets.images[`${color}bird-midflap`];
        } else {
            return assets.images[`${color}bird-upflap`];
        }
    }

    // ------------------------
    // Start the Game Loop
    // ------------------------

    requestAnimationFrame(gameLoop);
});

