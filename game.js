// Space Invaders Game - JavaScript Implementation
class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        // Load player image
        this.playerImage = new Image();
        this.playerImage.src = 'ASSETS/AcssShip.png';
        this.ctx = this.canvas.getContext('2d');
        this.gameOverlay = document.getElementById('gameOverlay');
        
        // Load enemy images
        this.enemyImages = {
            basic: new Image(),
            fast: new Image(),
            boss: new Image(),
            ufo: new Image()
        };

        this.enemyImages.basic.src = "ASSETS/enemiesVioletfront.png";
        this.enemyImages.fast.src = "ASSETS/enemiesYellowFront.png";
        this.enemyImages.boss.src = "ASSETS/enemiesGreenfront.png";
        this.enemyImages.ufo.src = "ASSETS/enemiesBlueFront.png";
        
        // Load powerup images
        this.powerupImages = {
            rapidFire: new Image(),
            multiShot: new Image(),
            shield: new Image(),
            extraLife: new Image()
        };

        this.powerupImages.rapidFire.src = "ASSETS/rapidFire.png";       
        this.powerupImages.multiShot.src = "ASSETS/multishots.png";  
        this.powerupImages.shield.src = "ASSETS/shield.png";      
        this.powerupImages.extraLife.src = "ASSETS/goldheart.png"; 

        // Game state
        this.gameState = 'menu'; 
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.highScore = 0; // Removed localStorage usage
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerups = [];
        this.particles = [];
        
        // FIXED: Reset game settings to base values (no more speed accumulation bug)
        this.baseEnemySpeed = 1; // Base speed that never changes
        this.baseBulletSpeed = 5;
        this.baseEnemyBulletSpeed = 3;
        this.baseShootCooldown = 200;
        
        // Current game speeds (these get calculated from base values)
        this.enemySpeed = this.baseEnemySpeed;
        this.bulletSpeed = this.baseBulletSpeed;
        this.enemyBulletSpeed = this.baseEnemyBulletSpeed;
        this.shootCooldown = this.baseShootCooldown;
        
        // Input handling
        this.keys = {};
        this.lastShot = 0;
        
        // Stats
        this.enemiesKilled = 0;
        this.shotsFired = 0;
        this.gameStartTime = null;

        // ADDED: Mobile controls
        this.isMobile = this.detectMobile();
        this.touchControls = {
            leftPressed: false,
            rightPressed: false,
            shootPressed: false
        };
        
        this.init();
    }

    // ADDED: Mobile detection
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createPlayer();
        this.updateUI();
        
        // ADDED: Setup mobile controls if on mobile
        if (this.isMobile) {
            this.setupMobileControls();
        }
        
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
        
        // ADDED: Recreate mobile controls on resize
        if (this.isMobile) {
            this.setupMobileControls();
        }
    }

    // ADDED: Mobile controls setup
    setupMobileControls() {
        // Remove existing mobile controls
        const existingControls = document.querySelector('.mobile-controls');
        if (existingControls) {
            existingControls.remove();
        }

        // Create mobile controls container
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="mobile-analog">
                <div class="analog-stick">
                    <div class="analog-knob"></div>
                </div>
            </div>
            <div class="mobile-shoot-btn">FIRE</div>
        `;

        // Add to game area
        this.canvas.parentElement.appendChild(mobileControls);

        // Setup analog stick
        this.setupAnalogStick();
        
        // Setup shoot button
        this.setupShootButton();
    }

    // ADDED: Analog stick functionality
    setupAnalogStick() {
        const analogStick = document.querySelector('.analog-stick');
        const analogKnob = document.querySelector('.analog-knob');
        
        if (!analogStick || !analogKnob) return;

        let isDragging = false;
        let centerX = 0;
        let centerY = 0;
        const maxDistance = 30;

        const startDrag = (e) => {
            isDragging = true;
            const rect = analogStick.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
            
            // Prevent default to avoid scrolling on mobile
            e.preventDefault();
        };

        const updateDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            let clientX, clientY;
            if (e.touches) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const deltaX = clientX - centerX;
            const deltaY = clientY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            let knobX = deltaX;
            let knobY = deltaY;

            if (distance > maxDistance) {
                knobX = (deltaX / distance) * maxDistance;
                knobY = (deltaY / distance) * maxDistance;
            }

            analogKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

            // Update movement based on analog position
            const moveThreshold = 10;
            this.touchControls.leftPressed = knobX < -moveThreshold;
            this.touchControls.rightPressed = knobX > moveThreshold;
        };

        const endDrag = () => {
            isDragging = false;
            analogKnob.style.transform = 'translate(0, 0)';
            this.touchControls.leftPressed = false;
            this.touchControls.rightPressed = false;
        };

        // Touch events
        analogStick.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', updateDrag);
        document.addEventListener('touchend', endDrag);

        // Mouse events for testing on desktop
        analogStick.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', updateDrag);
        document.addEventListener('mouseup', endDrag);
    }

    // ADDED: Shoot button functionality
    setupShootButton() {
        const shootBtn = document.querySelector('.mobile-shoot-btn');
        if (!shootBtn) return;

        const startShoot = (e) => {
            e.preventDefault();
            this.touchControls.shootPressed = true;
            shootBtn.classList.add('active');
        };

        const endShoot = (e) => {
            e.preventDefault();
            this.touchControls.shootPressed = false;
            shootBtn.classList.remove('active');
        };

        shootBtn.addEventListener('touchstart', startShoot);
        shootBtn.addEventListener('touchend', endShoot);
        shootBtn.addEventListener('mousedown', startShoot);
        shootBtn.addEventListener('mouseup', endShoot);
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
        document.getElementById('homeBtn').addEventListener('click', () => this.goToHome());

        // MODIFIED: Removed mouse movement controls (as requested)
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                this.shoot();
            }
        });

        // MODIFIED: Removed mouse movement (only keeping touch for mobile)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.shoot();
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
            speed: 7, // INCREASED: Made player movement faster
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
                let type;
                if (row === 0) type = "ufo";      
                else if (row === 1) type = "boss"; 
                else if (row === 2) type = "fast"; 
                else type = "basic"; 

                this.enemies.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: enemyWidth,
                    height: enemyHeight,
                    type: type,
                    speed: this.enemySpeed, // FIXED: Use current enemy speed, not accumulating
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
        
        // FIXED: Reset all speeds to base values (no more speed accumulation)
        this.enemySpeed = this.baseEnemySpeed;
        this.bulletSpeed = this.baseBulletSpeed;
        this.enemyBulletSpeed = this.baseEnemyBulletSpeed;
        this.shootCooldown = this.baseShootCooldown;
        
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

    goToHome() {
        if (this.gameState === 'playing' && this.score > 0) {
            const confirmation = confirm('Are you sure you want to return to home? Your current progress will be lost.');
            if (!confirmation) {
                return;
            }
        }

        document.body.style.transition = 'opacity 0.5s ease-out';
        document.body.style.opacity = '0';

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
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
            this.shootCooldown = this.baseShootCooldown * cooldownMultiplier;
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

        // MODIFIED: Keyboard movement (A/D and Arrow Keys) - Made responsive
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += this.player.speed;
        }

        // ADDED: Mobile controls
        if (this.touchControls.leftPressed) {
            this.player.x -= this.player.speed;
        }
        if (this.touchControls.rightPressed) {
            this.player.x += this.player.speed;
        }
        
        // Mobile shooting
        if (this.touchControls.shootPressed) {
            this.shoot();
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
                this.shootCooldown = this.baseShootCooldown; // FIXED: Reset to base cooldown
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
            
            // FIXED: Calculate speeds from base values, not accumulating
            this.enemySpeed = this.baseEnemySpeed + (this.level * 0.2);
            this.enemyBulletSpeed = this.baseEnemyBulletSpeed + (this.level * 0.1);
            
            this.createEnemies();
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
            let img;

            switch (enemy.type) {
                case 'boss': img = this.enemyImages.boss; break;
                case 'fast': img = this.enemyImages.fast; break;
                case 'ufo':  img = this.enemyImages.ufo; break;
                default:     img = this.enemyImages.basic;
            }

            if (img && img.complete && img.naturalWidth > 0) {
                this.ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                // fallback 
                this.ctx.fillStyle = '#90ff60';
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
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
            const img = this.powerupImages[powerup.type];
            if (img && img.complete && img.naturalWidth !== 0) {
                this.ctx.save();
                this.ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
                this.ctx.rotate(powerup.rotation);
                this.ctx.drawImage(img, -powerup.width / 2, -powerup.height / 2, powerup.width, powerup.height);
                this.ctx.restore();
            } else {
                // Fallback if image not loaded yet
                this.ctx.fillStyle = "yellow";
                this.ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
            }
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
    
    // FIXED: Audio integration with proper controls
    let audioInitialized = false;
    
    const initializeAudio = () => {
        if (!audioInitialized) {
            audio.playBackgroundMusic();
            audioInitialized = true;
        }
    };

    // Override shoot method to play shoot sound
    const originalShoot = game.shoot.bind(game);
    game.shoot = function() {
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown && this.player) {
            initializeAudio();
            audio.playShoot();
        }
        originalShoot();
    };

    // Override createExplosion to play explosion sound
    const originalExplosion = game.createExplosion.bind(game);
    game.createExplosion = function(x, y, color) {
        audio.playExplosion();
        originalExplosion(x, y, color);
    };

    // Override applyPowerup to play powerup sound
    const originalApplyPowerup = game.applyPowerup.bind(game);
    game.applyPowerup = function(type) {
        audio.playPowerup();
        originalApplyPowerup(type);
    };

    // Start button triggers music
    document.getElementById('startBtn').addEventListener('click', initializeAudio);
    document.getElementById('startGameBtn').addEventListener('click', initializeAudio);
});

// FIXED: AudioManager with better control
class AudioManager {
    constructor() {
        this.enabled = true;
        this.musicPlaying = false;

        // Link to HTML audio elements
        this.shootSound = document.getElementById('shootSound');
        this.explosionSound = document.getElementById('explosionSound');
        this.powerupSound = document.getElementById('powerupSound');
        this.backgroundMusic = document.getElementById('backgroundMusic');

        if (this.backgroundMusic) {
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.3; // Lower volume for background music
        }

        // Set volumes for sound effects
        if (this.shootSound) this.shootSound.volume = 0.2;
        if (this.explosionSound) this.explosionSound.volume = 0.3;
        if (this.powerupSound) this.powerupSound.volume = 0.4;
    }

    playShoot() {
        if (this.enabled && this.shootSound) {
            this.shootSound.currentTime = 0;
            this.shootSound.play().catch(() => {});
        }
    }

    playExplosion() {
        if (this.enabled && this.explosionSound) {
            this.explosionSound.currentTime = 0;
            this.explosionSound.play().catch(() => {});
        }
    }

    playPowerup() {
        if (this.enabled && this.powerupSound) {
            this.powerupSound.currentTime = 0;
            this.powerupSound.play().catch(() => {});
        }
    }

    playBackgroundMusic() {
        if (this.enabled && this.backgroundMusic && !this.musicPlaying) {
            this.backgroundMusic.play().catch(() => {
                console.log("Background music will start after user input");
            });
            this.musicPlaying = true;
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic && this.musicPlaying) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.musicPlaying = false;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopBackgroundMusic();
        } else if (!this.musicPlaying) {
            this.playBackgroundMusic();
        }
    }
}

// Particle effects manager
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

// Input manager for better control
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