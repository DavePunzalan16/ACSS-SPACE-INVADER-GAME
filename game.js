// Space Invaders Game - JavaScript Implementation
class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        // Load player image
        this.playerImage = new Image();
        this.playerImage.src = 'ASSETS/AcssShip.png';
        this.ctx = this.canvas.getContext('2d');
        this.gameOverlay = document.getElementById('gameOverlay');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.highScore = localStorage.getItem('spaceInvadersHighScore') || 0;
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerups = [];
        this.particles = [];
        
        // Game settings
        this.gameSpeed = 60; // FPS
        this.enemySpeed = 1;
        this.bulletSpeed = 5;
        this.enemyBulletSpeed = 3;
        
        // Input handling
        this.keys = {};
        this.lastShot = 0;
        this.shootCooldown = 200; // milliseconds
        
        // Stats
        this.enemiesKilled = 0;
        this.shotsFired = 0;
        this.gameStartTime = null;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createPlayer();
        this.updateUI();
        this.gameLoop();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const gameArea = this.canvas.parentElement;
        this.canvas.width = gameArea.clientWidth;
        this.canvas.height = gameArea.clientHeight;
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());

        // Mouse events for mobile support
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                this.shoot();
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing' && this.player) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                this.player.targetX = mouseX;
            }
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.shoot();
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing' && this.player) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                const touchX = touch.clientX - rect.left;
                this.player.targetX = touchX;
            }
        });
    }

    handleKeyDown(e) {
        switch(e.code) {
            case 'Enter':
                if (this.gameState === 'menu' || this.gameState === 'gameOver') {
                    this.startGame();
                }
                break;
            case 'KeyP':
                this.togglePause();
                break;
            case 'KeyF':
                this.toggleFullscreen();
                break;
            case 'Space':
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.shoot();
                }
                break;
        }
    }

    createPlayer() {
        this.player = {
            x: this.canvas.width / 2 - 25, 
            y: this.canvas.height - 95,      
            width: 70,
            height: 80,
            speed: 5,
            targetX: this.canvas.width / 2 - 15,
            powerup: null,
            powerupTime: 0
        };
    }

    createEnemies() {
        this.enemies = [];
        const rows = 5;
        const cols = 10;
        const enemyWidth = 30;
        const enemyHeight = 25;
        const spacing = 50;
        const startX = (this.canvas.width - (cols * spacing)) / 2;
        const startY = 60;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let type = 'basic';
                if (row === 0) type = 'boss';
                else if (row === 1) type = 'fast';
                else if (row === 2) type = 'medium';

                this.enemies.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: enemyWidth,
                    height: enemyHeight,
                    type: type,
                    speed: this.enemySpeed + (this.level * 0.2),
                    direction: 1,
                    shootChance: 0.001 + (this.level * 0.0002),
                    points: type === 'boss' ? 50 : type === 'fast' ? 20 : 10
                });
            }
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.bullets = [];
        this.enemyBullets = [];
        this.powerups = [];
        this.particles = [];
        this.enemiesKilled = 0;
        this.shotsFired = 0;
        this.gameStartTime = Date.now();
        
        this.createPlayer();
        this.createEnemies();
        this.hideOverlay();
        this.updateUI();
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showOverlay('Game Paused', 'Press P to continue');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown && this.player) {
            this.shotsFired++;
            
            if (this.player.powerup === 'multiShot') {
                // Create 3 bullets
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: this.bulletSpeed,
                    dx: -1
                });
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: this.bulletSpeed,
                    dx: 0
                });
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: this.bulletSpeed,
                    dx: 1
                });
            } else {
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 2,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: this.bulletSpeed,
                    dx: 0
                });
            }
            
            this.lastShot = now;
            
            // Adjust cooldown for rapid fire powerup
            const cooldownMultiplier = this.player.powerup === 'rapidFire' ? 0.3 : 1;
            this.shootCooldown = 200 * cooldownMultiplier;
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateEnemyBullets();
        this.updatePowerups();
        this.updateParticles();
        this.updatePowerupTimers();
        this.checkCollisions();
        this.checkGameState();
    }

    updatePlayer() {
        if (!this.player) return;

        // Keyboard movement
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += this.player.speed;
        }

        // Mouse/touch movement
        const dx = this.player.targetX - this.player.x;
        if (Math.abs(dx) > 2) {
            this.player.x += dx * 0.1;
        }

        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            bullet.x += bullet.dx;
            return bullet.y > -bullet.height && bullet.x > -bullet.width && bullet.x < this.canvas.width + bullet.width;
        });
    }

    updateEnemies() {
        let moveDown = false;
        let changeDirection = false;

        // Check if any enemy hits the edge
        for (let enemy of this.enemies) {
            if ((enemy.x <= 0 && enemy.direction === -1) || 
                (enemy.x >= this.canvas.width - enemy.width && enemy.direction === 1)) {
                changeDirection = true;
                moveDown = true;
                break;
            }
        }

        // Update enemy positions
        for (let enemy of this.enemies) {
            if (moveDown) {
                enemy.y += 20;
                if (changeDirection) {
                    enemy.direction *= -1;
                }
            }
            enemy.x += enemy.speed * enemy.direction;

            // Enemy shooting
            if (Math.random() < enemy.shootChance) {
                this.enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 8,
                    speed: this.enemyBulletSpeed
                });
            }
        }
    }

    updateEnemyBullets() {
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.canvas.height + bullet.height;
        });
    }

    updatePowerups() {
        this.powerups = this.powerups.filter(powerup => {
            powerup.y += 2;
            powerup.rotation += 0.1;
            return powerup.y < this.canvas.height + powerup.height;
        });
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.alpha -= particle.decay;
            particle.life--;
            return particle.alpha > 0 && particle.life > 0;
        });
    }

    updatePowerupTimers() {
        if (this.player && this.player.powerup) {
            this.player.powerupTime--;
            if (this.player.powerupTime <= 0) {
                this.player.powerup = null;
                this.shootCooldown = 200; // Reset to normal
            }
        }
    }

    checkCollisions() {
        // Bullet vs Enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.isColliding(bullet, enemy)) {
                    // Create explosion particles
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#90ff90');
                    
                    // Add score
                    this.score += enemy.points;
                    this.enemiesKilled++;
                    
                    // Chance for powerup
                    if (Math.random() < 0.1) {
                        this.createPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    }
                    
                    // Remove bullet and enemy
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    break;
                }
            }
        }

        // Enemy bullet vs Player collision
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            if (this.player && this.isColliding(bullet, this.player) && this.player.powerup !== 'shield') {
                this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff6b6b');
                this.lives--;
                this.enemyBullets.splice(i, 1);
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
                break;
            }
        }

        // Player vs Powerup collision
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            if (this.player && this.isColliding(powerup, this.player)) {
                this.applyPowerup(powerup.type);
                this.powerups.splice(i, 1);
                break;
            }
        }

        // Enemy vs Player collision
        if (this.player && this.player.powerup !== 'shield') {
            for (let enemy of this.enemies) {
                if (this.isColliding(enemy, this.player)) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                    break;
                }
            }
        }
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                alpha: 1,
                decay: 0.02,
                color: color,
                size: Math.random() * 4 + 2,
                life: 50
            });
        }
    }

    createPowerup(x, y) {
        const types = ['rapidFire', 'multiShot', 'shield', 'extraLife'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerups.push({
            x: x - 15,
            y: y,
            width: 30,
            height: 30,
            type: type,
            rotation: 0
        });
    }

    applyPowerup(type) {
        if (!this.player) return;

        switch(type) {
            case 'rapidFire':
                this.player.powerup = 'rapidFire';
                this.player.powerupTime = 600; // 10 seconds at 60fps
                break;
            case 'multiShot':
                this.player.powerup = 'multiShot';
                this.player.powerupTime = 600;
                break;
            case 'shield':
                this.player.powerup = 'shield';
                this.player.powerupTime = 900; // 15 seconds
                break;
            case 'extraLife':
                this.lives++;
                break;
        }
    }

    checkGameState() {
        // Check if all enemies are destroyed
        if (this.enemies.length === 0) {
            this.level++;
            this.createEnemies();
            this.enemySpeed += 0.2;
        }

        // Check if enemies reached the bottom
        for (let enemy of this.enemies) {
            if (enemy.y + enemy.height >= this.canvas.height - 80) {
                this.gameOver();
                break;
            }
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceInvadersHighScore', this.highScore);
        }
        
        this.showOverlay('Game Over', `Final Score: ${this.score}<br>Press Enter to restart`);
        this.updateUI();
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background grid
        this.drawBackground();
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.renderPlayer();
            this.renderBullets();
            this.renderEnemies();
            this.renderEnemyBullets();
            this.renderPowerups();
            this.renderParticles();
            this.renderUI();
        }
    }

    drawBackground() {
        // Draw moving grid pattern
        this.ctx.strokeStyle = 'rgba(144, 255, 144, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        const offset = (Date.now() * 0.02) % gridSize;
        
        // Vertical lines
        for (let x = -offset; x < this.canvas.width + gridSize; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = -offset; y < this.canvas.height + gridSize; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    renderPlayer() {
        if (!this.player) return;

        // Draw shield effect if active
        if (this.player.powerup === 'shield') {
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width / 2, 
                this.player.y + this.player.height / 2, 
                this.player.width / 2 + 10, 
                0, 
                2 * Math.PI
            );
            this.ctx.stroke();
        }

        // Draw player image if loaded
        if (this.playerImage.complete && this.playerImage.naturalWidth !== 0) {
            this.ctx.drawImage(
                this.playerImage,
                this.player.x,
                this.player.y,
                this.player.width,
                this.player.height
            );
        } else {
            // Fallback rectangle while image loads
            this.ctx.fillStyle = '#90ff90';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
    }


    renderBullets() {
        this.ctx.fillStyle = '#ffff90';
        for (let bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Add bullet trail
            this.ctx.fillStyle = 'rgba(255, 255, 144, 0.5)';
            this.ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 10);
            this.ctx.fillStyle = '#ffff90';
        }
    }

    renderEnemies() {
        for (let enemy of this.enemies) {
            // Set color based on enemy type
            switch(enemy.type) {
                case 'boss':
                    this.ctx.fillStyle = '#ff6090';
                    break;
                case 'fast':
                    this.ctx.fillStyle = '#ff9060';
                    break;
                case 'medium':
                    this.ctx.fillStyle = '#60ff90';
                    break;
                default:
                    this.ctx.fillStyle = '#90ff60';
            }
            
            // Draw enemy body
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Draw enemy details based on type
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            if (enemy.type === 'boss') {
                // Boss pattern
                this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 20, 5);
                this.ctx.fillRect(enemy.x + 10, enemy.y + 15, 10, 5);
            } else {
                // Regular enemy pattern
                this.ctx.fillRect(enemy.x + 8, enemy.y + 8, 14, 4);
                this.ctx.fillRect(enemy.x + 12, enemy.y + 16, 6, 4);
            }
            
            // Draw eyes/sensors
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x + 8, enemy.y + 6, 3, 3);
            this.ctx.fillRect(enemy.x + 19, enemy.y + 6, 3, 3);
        }
    }

    renderEnemyBullets() {
        this.ctx.fillStyle = '#ff6060';
        for (let bullet of this.enemyBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Add bullet trail
            this.ctx.fillStyle = 'rgba(255, 96, 96, 0.5)';
            this.ctx.fillRect(bullet.x, bullet.y - 8, bullet.width, 8);
            this.ctx.fillStyle = '#ff6060';
        }
    }

    renderPowerups() {
        for (let powerup of this.powerups) {
            this.ctx.save();
            this.ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
            this.ctx.rotate(powerup.rotation);
            
            // Set color based on powerup type
            switch(powerup.type) {
                case 'rapidFire':
                    this.ctx.fillStyle = '#ff6b6b';
                    break;
                case 'multiShot':
                    this.ctx.fillStyle = '#4834d4';
                    break;
                case 'shield':
                    this.ctx.fillStyle = '#00d2d3';
                    break;
                case 'extraLife':
                    this.ctx.fillStyle = '#feca57';
                    break;
            }
            
            // Draw powerup shape
            this.ctx.fillRect(-powerup.width / 2, -powerup.height / 2, powerup.width, powerup.height);
            
            // Draw powerup symbol
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            let symbol = '';
            switch(powerup.type) {
                case 'rapidFire': symbol = '⚡'; break;
                case 'multiShot': symbol = '⊕'; break;
                case 'shield': symbol = '⬟'; break;
                case 'extraLife': symbol = '♥'; break;
            }
            
            this.ctx.fillText(symbol, 0, 0);
            this.ctx.restore();
        }
    }

    renderParticles() {
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
            this.ctx.restore();
        }
    }

    renderUI() {
        // Draw powerup timer
        if (this.player && this.player.powerup && this.player.powerupTime > 0) {
            const barWidth = 200;
            const barHeight = 10;
            const x = this.canvas.width / 2 - barWidth / 2;
            const y = 30;
            
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x, y, barWidth, barHeight);
            
            // Progress
            const progress = this.player.powerupTime / 600; // Assuming 600 is max time
            this.ctx.fillStyle = this.getPowerupColor(this.player.powerup);
            this.ctx.fillRect(x, y, barWidth * progress, barHeight);
            
            // Border
            this.ctx.strokeStyle = '#90ff90';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Label
            this.ctx.fillStyle = '#90ff90';
            this.ctx.font = '14px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.player.powerup.toUpperCase(), this.canvas.width / 2, y - 5);
        }
    }

    getPowerupColor(type) {
        switch(type) {
            case 'rapidFire': return '#ff6b6b';
            case 'multiShot': return '#4834d4';
            case 'shield': return '#00d2d3';
            case 'extraLife': return '#feca57';
            default: return '#90ff90';
        }
    }

    showOverlay(title, message) {
        const overlay = this.gameOverlay;
        const startScreen = overlay.querySelector('.start-screen');
        
        startScreen.querySelector('h2').textContent = title;
        startScreen.querySelector('p').innerHTML = message;
        
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }

    hideOverlay() {
        this.gameOverlay.style.display = 'none';
    }

    updateUI() {
        // Update score, lives, level displays
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('livesValue').textContent = this.lives;
        document.getElementById('levelValue').textContent = this.level;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('enemiesKilled').textContent = this.enemiesKilled;
        
        // Update accuracy
        const accuracy = this.shotsFired > 0 ? Math.round((this.enemiesKilled / this.shotsFired) * 100) : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';
        
        // Update time played
        if (this.gameStartTime) {
            const timeElapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const minutes = Math.floor(timeElapsed / 60);
            const seconds = timeElapsed % 60;
            document.getElementById('timePlayed').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    gameLoop() {
        this.update();
        this.render();
        this.updateUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SpaceInvadersGame();
    const audio = new AudioManager();
    const particleSystem = new ParticleSystem(game.canvas, game.ctx);
    const inputManager = new InputManager();
    inputManager.init(game.canvas);
    particleSystem.createStarfield();
    // Override shoot method to play shoot sound
    const originalShoot = game.shoot.bind(game);
    game.shoot = function() {
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown && this.player) {
            audio.playShoot(); // 🔊 play shoot sound
        }
        originalShoot();
    };

    // Override createExplosion to play explosion sound
    const originalExplosion = game.createExplosion.bind(game);
    game.createExplosion = function(x, y, color) {
        audio.playExplosion(); // 🔊 play explosion sound
        originalExplosion(x, y, color);
    };

    // Override applyPowerup to play powerup sound
    const originalApplyPowerup = game.applyPowerup.bind(game);
    game.applyPowerup = function(type) {
        audio.playPowerup(); // 🔊 play powerup sound
        originalApplyPowerup(type);
    };

    // Start button triggers music
    document.getElementById('startBtn').addEventListener('click', () => {
        audio.playBackgroundMusic();
    });
    document.getElementById('startGameBtn').addEventListener('click', () => {
        audio.playBackgroundMusic();
    });

    // Start background music on load (will only play after user interaction in most browsers, including Brave)
    audio.playBackgroundMusic();
});

class AudioManager {
    constructor() {
        this.enabled = true;

        // Link to HTML audio elements
        this.shootSound = document.getElementById('shootSound');
        this.explosionSound = document.getElementById('explosionSound');
        this.powerupSound = document.getElementById('powerupSound');
        this.backgroundMusic = document.getElementById('backgroundMusic');

        if (this.backgroundMusic) {
            this.backgroundMusic.loop = true;
        }
    }

    playShoot() {
        if (this.enabled && this.shootSound) {
            this.shootSound.currentTime = 0;
            this.shootSound.volume = 0.4;
            this.shootSound.play().catch(() => {});
        }
    }

    playExplosion() {
        if (this.enabled && this.explosionSound) {
            this.explosionSound.currentTime = 0;
            this.explosionSound.volume = 0.4;
            this.explosionSound.play().catch(() => {});
        }
    }

    playPowerup() {
        if (this.enabled && this.powerupSound) {
            this.powerupSound.currentTime = 0;
            this.powerupSound.volume = 0.4;
            this.powerupSound.play().catch(() => {});
        }
    }

    playBackgroundMusic() {
        if (this.enabled && this.backgroundMusic) {
            this.backgroundMusic.play().catch(() => {
                console.log("Background music will start after user input");
            });
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopBackgroundMusic();
        }
    }
}

// to add particle effects manager
class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
    }
    
    createStarfield() {
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                twinkle: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    updateStarfield() {
        for (let particle of this.particles) {
            particle.y += particle.speed;
            particle.opacity += Math.sin(Date.now() * particle.twinkle) * 0.1;
            
            if (particle.y > this.canvas.height) {
                particle.y = -10;
                particle.x = Math.random() * this.canvas.width;
            }
        }
    }
    
    renderStarfield() {
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, Math.min(1, particle.opacity));
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            this.ctx.restore();
        }
    }
}

// For input manager for better control
class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        this.touch = { x: 0, y: 0, active: false };
    }
    
    init(canvas) {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mousedown', () => {
            this.mouse.clicked = true;
        });
        
        canvas.addEventListener('mouseup', () => {
            this.mouse.clicked = false;
        });
        
        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.touch.x = touch.clientX - rect.left;
            this.touch.y = touch.clientY - rect.top;
            this.touch.active = true;
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.touch.x = touch.clientX - rect.left;
            this.touch.y = touch.clientY - rect.top;
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.active = false;
        });
    }
    
    isPressed(key) {
        return this.keys[key] || false;
    }
    
    getMousePos() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    isMouseClicked() {
        return this.mouse.clicked;
    }
    
    getTouchPos() {
        return { x: this.touch.x, y: this.touch.y };
    }
    
    isTouchActive() {
        return this.touch.active;
    }
}