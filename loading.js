// ===== LOADING PAGE CONTROLLER =====
class LoadingPageController {
    constructor() {
        this.loadingDuration = 5000; // 5 seconds
        this.startTime = Date.now();
        this.isComplete = false;
        
        // DOM elements
        this.progressFill = document.querySelector('.progress-fill');
        this.percentage = document.querySelector('.percentage');
        this.loadingContainer = document.querySelector('.loading-container');
        
        // Initialize loading page
        this.init();
    }

    init() {
        // Start loading animations
        this.startProgressAnimation();
        this.startPercentageCounter();
        this.createMatrixRain();
        this.addInteractiveEffects();
        this.startSoundSimulation();
        
        // Auto-redirect after loading
        setTimeout(() => {
            this.completeLoading();
        }, this.loadingDuration);

        // Add manual skip functionality (hidden feature)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                this.completeLoading();
            }
        });

        document.addEventListener('click', () => {
            if (Date.now() - this.startTime > 2000) { // Allow skip after 2 seconds
                this.completeLoading();
            }
        });
    }

    startProgressAnimation() {
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 3 + 1; // Random increment between 1-4
            progress = Math.min(progress, 100);
            
            this.progressFill.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 50);
    }

    startPercentageCounter() {
        let currentPercentage = 0;
        const percentageInterval = setInterval(() => {
            const elapsedTime = Date.now() - this.startTime;
            const targetPercentage = Math.min((elapsedTime / this.loadingDuration) * 100, 100);
            
            if (currentPercentage < targetPercentage) {
                currentPercentage = Math.min(currentPercentage + Math.random() * 2 + 0.5, targetPercentage);
                this.percentage.textContent = `${Math.floor(currentPercentage)}%`;
            }
            
            if (currentPercentage >= 100) {
                this.percentage.textContent = '100%';
                clearInterval(percentageInterval);
            }
        }, 30);
    }

    createMatrixRain() {
        const matrixChars = '01アカサタナハマヤラワガザダバパイキシチニヒミリヰギジヂビピウクスツヌフムユルグズヅブプエケセテネヘメレヱゲゼデベペオコソトノホモヨロヲゴゾドボポヴッン';
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'matrix-container';
        matrixContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 3;
            overflow: hidden;
        `;
        document.body.appendChild(matrixContainer);

        // Create matrix rain characters
        setInterval(() => {
            if (Math.random() < 0.3 && !this.isComplete) {
                const char = document.createElement('div');
                char.className = 'matrix-char';
                char.textContent = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                char.style.left = Math.random() * 100 + '%';
                char.style.animationDuration = (Math.random() * 2 + 2) + 's';
                char.style.fontSize = (Math.random() * 8 + 8) + 'px';
                char.style.opacity = Math.random() * 0.5 + 0.2;
                
                matrixContainer.appendChild(char);
                
                // Remove character after animation
                setTimeout(() => {
                    if (char.parentNode) {
                        char.parentNode.removeChild(char);
                    }
                }, 4000);
            }
        }, 200);
    }

    addInteractiveEffects() {
        const logo = document.querySelector('.logo');
        const powerButton = document.querySelector('.power-button');
        
        // Logo click effect
        logo.addEventListener('click', () => {
            logo.style.animation = 'none';
            logo.offsetHeight; // Trigger reflow
            logo.style.animation = 'logoPulse 0.3s ease-out, logoRotate 1s linear';
            this.createSparkleEffect(logo);
        });

        // Power button interaction
        powerButton.addEventListener('mouseenter', () => {
            powerButton.style.transform = 'scale(1.1)';
            powerButton.style.filter = 'brightness(1.3)';
        });

        powerButton.addEventListener('mouseleave', () => {
            powerButton.style.transform = 'scale(1)';
            powerButton.style.filter = 'brightness(1)';
        });

        // Hover effects for text
        const textLines = document.querySelectorAll('.text-line');
        textLines.forEach(line => {
            line.addEventListener('mouseenter', () => {
                line.style.textShadow = '0 0 20px rgba(144, 255, 144, 1), 0 0 40px rgba(144, 255, 144, 0.8)';
                line.style.transform = 'scale(1.05)';
                line.style.transition = 'all 0.3s ease';
            });

            line.addEventListener('mouseleave', () => {
                line.style.textShadow = '';
                line.style.transform = 'scale(1)';
            });
        });
    }

    createSparkleEffect(element) {
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < 10; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: #90ff90;
                border-radius: 50%;
                pointer-events: none;
                z-index: 100;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                box-shadow: 0 0 10px rgba(144, 255, 144, 0.8);
            `;
            
            document.body.appendChild(sparkle);
            
            const angle = (Math.PI * 2 * i) / 10;
            const distance = 50 + Math.random() * 50;
            const duration = 800 + Math.random() * 400;
            
            sparkle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, 
                    opacity: 0 
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                sparkle.remove();
            };
        }
    }

    startSoundSimulation() {
        // Simulate loading sounds with visual feedback
        const soundWaves = document.querySelectorAll('.wave');
        let soundPhase = 0;
        
        const soundInterval = setInterval(() => {
            if (this.isComplete) {
                clearInterval(soundInterval);
                return;
            }
            
            soundPhase += 0.1;
            soundWaves.forEach((wave, index) => {
                const intensity = Math.sin(soundPhase + index * 0.5) * 0.5 + 0.5;
                wave.style.transform = `scaleY(${0.3 + intensity * 0.7})`;
                wave.style.opacity = 0.6 + intensity * 0.4;
            });
        }, 50);

        // Simulate different loading phases
        const phases = [
            { time: 1000, message: 'Initializing systems...' },
            { time: 2000, message: 'Loading assets...' },
            { time: 3500, message: 'Preparing battlefield...' },
            { time: 4500, message: 'Ready to launch!' }
        ];

        phases.forEach(phase => {
            setTimeout(() => {
                if (!this.isComplete) {
                    this.showLoadingMessage(phase.message);
                }
            }, phase.time);
        });
    }

    showLoadingMessage(message) {
        const existingMessage = document.querySelector('.loading-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'loading-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: absolute;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
            color: #70d070;
            text-align: center;
            z-index: 20;
            opacity: 0;
            animation: messageSlide 2s ease-out forwards;
        `;

        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes messageSlide {
                0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);

        this.loadingContainer.appendChild(messageElement);

        // Remove message after animation
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 2000);
    }

    completeLoading() {
        if (this.isComplete) return;
        
        this.isComplete = true;
        
        // Add completion effects
        this.showCompletionEffect();
        
        // Redirect to main game after effect
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 1000);
    }

    showCompletionEffect() {
        // Flash effect
        const flashOverlay = document.createElement('div');
        flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(144, 255, 144, 0.3);
            z-index: 1000;
            pointer-events: none;
            animation: completionFlash 0.5s ease-out;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes completionFlash {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(flashOverlay);

        // Add loading complete class
        this.loadingContainer.classList.add('loading-complete');

        // Show completion message
        this.showLoadingMessage('Launch successful! Entering space...');

        // Create final explosion effect
        this.createFinalExplosion();

        // Remove flash overlay
        setTimeout(() => {
            flashOverlay.remove();
        }, 500);
    }

    createFinalExplosion() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: ${Math.random() < 0.5 ? '#90ff90' : '#60ff60'};
                border-radius: 50%;
                pointer-events: none;
                z-index: 999;
                left: ${centerX}px;
                top: ${centerY}px;
                box-shadow: 0 0 10px rgba(144, 255, 144, 0.8);
            `;

            document.body.appendChild(particle);

            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            const duration = 800 + Math.random() * 600;

            particle.animate([
                { 
                    transform: 'translate(-50%, -50%) scale(1)', 
                    opacity: 1 
                },
                { 
                    transform: `translate(${Math.cos(angle) * distance - 50}px, ${Math.sin(angle) * distance - 50}px) scale(0)`, 
                    opacity: 0 
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }
}

// ===== ENHANCED PARTICLE SYSTEM =====
class EnhancedParticleSystem {
    constructor() {
        this.particles = [];
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.animate();
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 4;
        `;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        return canvas;
    }

    addParticle(x, y, type = 'default') {
        this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 100,
            maxLife: 100,
            size: Math.random() * 3 + 1,
            color: type === 'spark' ? '#ffff90' : '#90ff90',
            type: type
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ===== AUDIO SIMULATION =====
class AudioSimulator {
    constructor() {
        this.isEnabled = true;
        this.simulateLoadingSounds();
    }

    simulateLoadingSounds() {
        // Simulate different loading sound phases
        const soundEvents = [
            { time: 500, type: 'beep', intensity: 0.3 },
            { time: 1500, type: 'processing', intensity: 0.5 },
            { time: 2500, type: 'beep', intensity: 0.4 },
            { time: 3500, type: 'charging', intensity: 0.7 },
            { time: 4500, type: 'ready', intensity: 1.0 }
        ];

        soundEvents.forEach(event => {
            setTimeout(() => {
                this.playVisualSound(event.type, event.intensity);
            }, event.time);
        });
    }

    playVisualSound(type, intensity) {
        if (!this.isEnabled) return;

        // Create visual sound feedback
        const soundIndicator = document.createElement('div');
        soundIndicator.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 40px;
            width: 20px;
            height: 20px;
            background: rgba(144, 255, 144, ${intensity});
            border-radius: 50%;
            pointer-events: none;
            z-index: 50;
            box-shadow: 0 0 ${20 * intensity}px rgba(144, 255, 144, 0.8);
            animation: soundPulse 0.5s ease-out;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes soundPulse {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.5); opacity: 1; }
                100% { transform: scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(soundIndicator);

        setTimeout(() => {
            soundIndicator.remove();
        }, 500);
    }
}

// ===== INITIALIZE LOADING PAGE =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all systems
    const loadingController = new LoadingPageController();
    const particleSystem = new EnhancedParticleSystem();
    const audioSimulator = new AudioSimulator();

    // Add mouse interaction for particle effects
    document.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.1) {
            particleSystem.addParticle(e.clientX, e.clientY, 'spark');
        }
    });

    // Add resize handler
    window.addEventListener('resize', () => {
        particleSystem.canvas.width = window.innerWidth;
        particleSystem.canvas.height = window.innerHeight;
    });

    // Add visibility change handler
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause animations when tab is not visible
            document.body.style.animationPlayState = 'paused';
        } else {
            // Resume animations when tab becomes visible
            document.body.style.animationPlayState = 'running';
        }
    });

    console.log('🚀 ACSS Space Invaders Loading...');
    console.log('⭐ Made by Dave Punzalan | ACSS Business Manager');
    console.log('🎮 Press SPACE or ENTER to skip loading');
});