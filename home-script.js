// Home Page JavaScript for ACSS Space Invaders

document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
});

function initializeHomePage() {
    // Start loading sequence
    showLoadingScreen();
    
    // Create floating particles
    createFloatingParticles();
    
    // Add keyboard shortcuts
    setupKeyboardControls();
    
    // Start background animations
    initializeBackgroundEffects();
    
    // Simulate loading process
    simulateLoading();
}

// ===== LOADING SCREEN FUNCTIONS =====
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const homeScreen = document.getElementById('homeScreen');
    
    loadingScreen.style.display = 'flex';
    homeScreen.classList.add('hidden');
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const homeScreen = document.getElementById('homeScreen');
    
    // Add fade out effect
    loadingScreen.style.animation = 'fadeOut 0.5s ease-out forwards';
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        homeScreen.classList.remove('hidden');
        
        startHomeScreenAnimations();
    }, 500);
}

function simulateLoading() {
    const progressBar = document.querySelector('.loading-progress');
    const loadingText = document.querySelector('.loading-text');
    
    const loadingSteps = [
        { progress: 20, text: "Loading Game Assets..." },
        { progress: 40, text: "Initializing Graphics..." },
        { progress: 60, text: "Loading Sounds..." },
        { progress: 80, text: "Preparing Game World..." },
        { progress: 100, text: "Ready to Launch!" }
    ];
    
    let currentStep = 0;
    
    const loadingInterval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
            const step = loadingSteps[currentStep];
            progressBar.style.width = step.progress + '%';
            loadingText.textContent = step.text;
            currentStep++;
        } else {
            clearInterval(loadingInterval);
            setTimeout(() => {
                hideLoadingScreen();
            }, 500);
        }
    }, 600);
}

// ===== HOME SCREEN ANIMATIONS =====
function startHomeScreenAnimations() {
    const titleWords = document.querySelectorAll('.title-word');
    titleWords.forEach((word, index) => {
        setTimeout(() => {
            word.style.animation = 'titleBounce 2s ease-in-out infinite';
            word.style.animationDelay = (index * 0.3) + 's';
        }, index * 200);
    });
    
    // Animate menu buttons with stagger epeks
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach((button, index) => {
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, 1000 + (index * 200));
        
        // Set initial state
        button.style.opacity = '0';
        button.style.transform = 'translateY(30px)';
        button.style.transition = 'all 0.5s ease-out';
    });
    
    // Start typewriter effects
    setTimeout(() => {
        startTypewriterEffect('.welcome-text', 2000);
        startTypewriterEffect('.creator-text', 3000);
    }, 1500);
}

function startTypewriterEffect(selector, delay) {
    setTimeout(() => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.animation = 'none';
            element.style.width = '0';
            element.style.overflow = 'hidden';
            element.style.whiteSpace = 'nowrap';
            element.style.margin = '0 auto';
            
            // Trigger typewriter animation
            setTimeout(() => {
                element.style.animation = selector.includes('welcome') ? 
                    'welcomeTypewriter 3s steps(30) forwards' : 
                    'creatorTypewriter 3s steps(40) forwards';
            }, 100);
        }
    }, delay);
}

// ===== PARTICLE SYSTEM =====
function createFloatingParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer, i);
    }
}

function createParticle(container, index) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    
    // Random properties
    const size = Math.random() * 4 + 2;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const opacity = Math.random() * 0.5 + 0.2;
    const duration = Math.random() * 20 + 15;
    
    // Style the particle
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(144, 255, 144, ${opacity});
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: particleFloat ${duration}s linear infinite;
        animation-delay: ${index * 0.5}s;
        box-shadow: 0 0 ${size * 2}px rgba(144, 255, 144, 0.3);
    `;
    
    container.appendChild(particle);
    
    // Add CSS animation if not exists
    if (!document.querySelector('#particleAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'particleAnimationStyle';
        style.textContent = `
            @keyframes particleFloat {
                0% {
                    transform: translateY(100vh) translateX(0) rotate(0deg);
                    opacity: 0;
                }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% {
                    transform: translateY(-10px) translateX(${Math.random() * 100 - 50}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== BACKGROUND EFFECTS =====
function initializeBackgroundEffects() {
    // Add dynamic star twinkling
    createTwinklingStars();
    
    // Add parallax effect to mouse movement
    setupParallaxEffect();
}

function createTwinklingStars() {
    const starsBackground = document.querySelector('.stars-background');
    
    // Add additional twinkling layer
    const twinkleLayer = document.createElement('div');
    twinkleLayer.className = 'twinkle-layer';
    twinkleLayer.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: 
            radial-gradient(1px 1px at 25px 15px, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(1px 1px at 75px 45px, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(1px 1px at 125px 25px, rgba(255, 255, 255, 0.8), transparent);
        background-repeat: repeat;
        background-size: 150px 80px;
        animation: twinkle 3s ease-in-out infinite alternate;
    `;
    
    starsBackground.appendChild(twinkleLayer);
    
    // Add twinkle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0% { opacity: 0.3; }
            100% { opacity: 0.8; }
        }
    `;
    document.head.appendChild(style);
}

function setupParallaxEffect() {
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        // Move background elements based on mouse position
        const movingSpaceship = document.querySelector('.moving-spaceship');
        const dinosaur = document.querySelector('.dinosaur-container');
        const mainLogo = document.querySelector('.main-logo');
        
        if (movingSpaceship) {
            movingSpaceship.style.transform = `translate(${mouseX * 10}px, ${mouseY * 5}px)`;
        }
        
        if (dinosaur) {
            dinosaur.style.transform = `translate(${mouseX * -15}px, ${mouseY * -8}px)`;
        }
        
        if (mainLogo) {
            mainLogo.style.transform = `translate(${mouseX * 3}px, ${mouseY * 2}px) scale(1.05)`;
        }
    });
}

// ===== KEYBOARD CONTROLS =====
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                startGame();
                break;
            case 'Escape':
                e.preventDefault();
                if (!document.getElementById('settingsModal').classList.contains('hidden')) {
                    closeSettings();
                } else {
                    exitGame();
                }
                break;
            case 's':
            case 'S':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    openSettings();
                }
                break;
        }
    });
}

// ===== MENU FUNCTIONS =====
function startGame() {
    // Add screen transition effect
    const homeScreen = document.getElementById('homeScreen');
    homeScreen.style.animation = 'fadeOut 0.5s ease-out forwards';
    
    // Play button click sound effect (if audio is implemented)
    playSound('buttonClick');
    
    setTimeout(() => {
        // Redirect to main game
        window.location.href = 'loading.html';
    }, 500);
}

function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hidden');
    
    // Play button click sound
    playSound('buttonClick');
    
    // Focus trap for accessibility
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.focus();
    
    // Start credits scroll animation
    const creditsContent = document.querySelector('.credits-content');
    creditsContent.style.animation = 'creditsRoll 30s linear infinite';
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.animation = 'modalSlideOut 0.3s ease-in forwards';
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.animation = '';
        
        // Stop credits animation
        const creditsContent = document.querySelector('.credits-content');
        creditsContent.style.animation = '';
    }, 300);
    
    // Add slide out animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalSlideOut {
            0% {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
            100% {
                opacity: 0;
                transform: scale(0.8) translateY(50px);
            }
        }
    `;
    document.head.appendChild(style);
}

function exitGame() {
    // Show confirmation dialog
    const confirmation = confirm('Are you sure you want to exit the game?');
    
    if (confirmation) {
        // Add exit animation
        const homeScreen = document.getElementById('homeScreen');
        homeScreen.style.animation = 'fadeOut 1s ease-out forwards';
        
        setTimeout(() => {
            // Close the window or redirect
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.close();
            }
        }, 1000);
    }
}

// ===== AUDIO FUNCTIONS =====
function playSound(soundName) {
    // Placeholder for sound system
    // In a full implementation, you would load and play actual sound files
    console.log(`Playing sound: ${soundName}`);
    
    // Create a simple beep sound using Web Audio API
    if (window.AudioContext || window.webkitAudioContext) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = soundName === 'buttonClick' ? 800 : 400;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// ===== UTILITY FUNCTIONS =====
function addButtonHoverEffects() {
    const buttons = document.querySelectorAll('.menu-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            playSound('buttonHover');
            
            // Add extra glow effect
            button.style.boxShadow = `
                0 0 30px rgba(144, 255, 144, 0.6),
                inset 0 0 30px rgba(144, 255, 144, 0.2)
            `;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.boxShadow = '';
        });
        
        button.addEventListener('click', () => {
            // Add click animation
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        });
    });
}

// ===== RESPONSIVE HANDLING =====
function handleResize() {
    // Recreate particles on resize
    const particlesContainer = document.querySelector('.particles-container');
    particlesContainer.innerHTML = '';
    createFloatingParticles();
}

window.addEventListener('resize', debounce(handleResize, 250));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== PERFORMANCE OPTIMIZATION =====
function optimizePerformance() {
    // Reduce animations if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
    
    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
        const animations = document.querySelectorAll('*');
        animations.forEach(el => {
            if (document.hidden) {
                el.style.animationPlayState = 'paused';
            } else {
                el.style.animationPlayState = 'running';
            }
        });
    });
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function setupAccessibility() {
    // Add focus indicators
    const focusableElements = document.querySelectorAll('button, [tabindex]');
    focusableElements.forEach(el => {
        el.addEventListener('focus', () => {
            el.style.outline = '2px solid rgba(144, 255, 144, 0.8)';
        });
        
        el.addEventListener('blur', () => {
            el.style.outline = '';
        });
    });
    
    // Add ARIA labels
    document.querySelector('.start-btn').setAttribute('aria-label', 'Start the Space Invaders game');
    document.querySelector('.settings-btn').setAttribute('aria-label', 'View game credits and information');
    document.querySelector('.exit-btn').setAttribute('aria-label', 'Exit the game');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
    addButtonHoverEffects();
    optimizePerformance();
    setupAccessibility();
});

// Add CSS for fade out animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.95); }
    }
`;
document.head.appendChild(fadeOutStyle);