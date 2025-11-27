// TF2 Characters Sound System with custom sounds
const characterSounds = {
    scout: document.getElementById('scoutSound'),
    soldier: document.getElementById('soldierSound'),
    pyro: document.getElementById('pyroSound'),
    demoman: document.getElementById('demomanSound'),
    heavy: document.getElementById('heavySound'),
    spy: document.getElementById('spySound')
};

// Character quotes (for display)
const characterQuotes = {
    scout: "BONK!",
    soldier: "SCREAMING DICK!",
    pyro: "GO FUCK!",
    demoman: "KA-BOOM!",
    heavy: "MEDIC!",
    spy: "YOU SUCK!"
};

// Sound volume settings
const SOUND_VOLUME = 0.7;

// Light Fire Particles System
function createFireParticle() {
    let container = document.getElementById('fireParticles');
    if (!container) {
        container = document.createElement('div');
        container.id = 'fireParticles';
        document.body.appendChild(container);
    }
    
    const particle = document.createElement('div');
    particle.className = 'fire-particle';
    
    const left = Math.random() * 100;
    const top = 50 + Math.random() * 50;
    particle.style.left = left + 'vw';
    particle.style.top = top + 'vh';
    
    const size = 4 + Math.random() * 6;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    const duration = 3 + Math.random() * 4;
    particle.style.animationDuration = duration + 's';
    
    const horizontalMove = (Math.random() - 0.5) * 80;
    particle.style.setProperty('--move-x', horizontalMove + 'px');
    
    const opacity = 0.6 + Math.random() * 0.4;
    particle.style.opacity = opacity;
    
    container.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
        }
    }, duration * 1000);
}

function startFireParticleSystem() {
    console.log('🔥 Starting fire particles...');
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createFireParticle(), i * 200);
    }
    
    setInterval(() => {
        createFireParticle();
    }, 200);
}

// УЛУЧШЕННАЯ ФУНКЦИЯ ПЛАВНОГО СКРОЛЛА
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    
    const targetPosition = target.offsetTop - 80; // Учитываем высоту навбара
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000; // 1 секунда
    let start = null;
    
    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // easing function для более плавного эффекта
        const easeInOutCubic = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + distance * easeInOutCubic);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Initialize character click handlers
function initializeCharacters() {
    const characters = document.querySelectorAll('.character');
    
    Object.values(characterSounds).forEach(sound => {
        if (sound) {
            sound.volume = SOUND_VOLUME;
        }
    });
    
    characters.forEach(character => {
        const characterImage = character.querySelector('.character-image');
        if (characterImage) {
            characterImage.onerror = function() {
                this.style.display = 'none';
                const characterType = character.getAttribute('data-character');
                character.innerHTML = `<div class="character-fallback">${characterType.charAt(0).toUpperCase()}</div>`;
            };
        }
        
        character.addEventListener('click', function() {
            const characterType = this.getAttribute('data-character');
            playCharacterSound(characterType);
            showCharacterQuote(characterType, this);
        });
    });
}

// Play character sound with improved error handling
function playCharacterSound(character) {
    Object.values(characterSounds).forEach(sound => {
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    });
    
    const sound = characterSounds[character];
    if (sound) {
        sound.play().catch(e => {
            console.log(`Audio play failed for ${character}:`, e);
            showSoundError(character);
            createFallbackSound(character);
        });
    } else {
        console.log(`Sound element not found for ${character}`);
        createFallbackSound(character);
    }
}

// Show error message if sound fails to load
function showSoundError(character) {
    const errorBubble = document.createElement('div');
    errorBubble.className = 'quote-bubble error-bubble';
    errorBubble.textContent = `Sound not loaded: ${character}.mp3`;
    errorBubble.style.background = 'rgba(255, 100, 100, 0.9)';
    
    document.body.appendChild(errorBubble);
    
    const characters = document.querySelectorAll(`.character[data-character="${character}"]`);
    if (characters.length > 0) {
        const rect = characters[0].getBoundingClientRect();
        errorBubble.style.position = 'fixed';
        errorBubble.style.left = rect.left + rect.width / 2 + 'px';
        errorBubble.style.top = rect.top - 60 + 'px';
        errorBubble.style.transform = 'translateX(-50%)';
    }
    
    setTimeout(() => {
        errorBubble.remove();
    }, 3000);
}

// Fallback sound system using Web Audio API
function createFallbackSound(character) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        const soundSettings = {
            scout: { frequency: 800, type: 'sine', duration: 0.2 },
            soldier: { frequency: 400, type: 'square', duration: 0.3 },
            pyro: { frequency: 600, type: 'sawtooth', duration: 0.5 },
            demoman: { frequency: 200, type: 'square', duration: 0.4 },
            heavy: { frequency: 300, type: 'sawtooth', duration: 0.6 },
            spy: { frequency: 500, type: 'triangle', duration: 0.2 }
        };
        
        const settings = soundSettings[character] || soundSettings.scout;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(settings.frequency, audioContext.currentTime);
        oscillator.type = settings.type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + settings.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + settings.duration);
        
    } catch (e) {
        console.log('Web Audio API not supported:', e);
    }
}

// Show character quote bubble
function showCharacterQuote(character, element) {
    const existingBubbles = document.querySelectorAll('.quote-bubble');
    existingBubbles.forEach(bubble => bubble.remove());
    
    const quoteBubble = document.createElement('div');
    quoteBubble.className = 'quote-bubble';
    quoteBubble.textContent = characterQuotes[character];
    
    const rect = element.getBoundingClientRect();
    quoteBubble.style.position = 'fixed';
    quoteBubble.style.left = rect.left + rect.width / 2 + 'px';
    quoteBubble.style.top = rect.top - 40 + 'px';
    quoteBubble.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(quoteBubble);
    
    setTimeout(() => {
        quoteBubble.remove();
    }, 2000);
}

// Preload sounds for better performance
function preloadSounds() {
    Object.values(characterSounds).forEach(sound => {
        if (sound) {
            sound.load();
        }
    });
}

// Sound configuration function - you can call this to change sounds dynamically
function configureSound(character, soundPath) {
    const sound = characterSounds[character];
    if (sound) {
        sound.innerHTML = '';
        
        const extension = soundPath.split('.').pop().toLowerCase();
        const source = document.createElement('source');
        source.src = soundPath;
        
        if (extension === 'mp3') {
            source.type = 'audio/mpeg';
        } else if (extension === 'ogg') {
            source.type = 'audio/ogg';
        } else if (extension === 'wav') {
            source.type = 'audio/wav';
        } else {
            source.type = 'audio/mpeg';
        }
        
        sound.appendChild(source);
        sound.load();
        
        console.log(`Sound configured for ${character}: ${soundPath}`);
    }
}

// Add CSS for quote bubbles, fallback and fire particles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .quote-bubble {
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-family: 'Orbitron', sans-serif;
        font-weight: bold;
        font-size: 0.8rem;
        text-transform: uppercase;
        border: 2px solid #ff0000ff;
        box-shadow: 0 4px 15px rgba(98, 0, 0, 0.5);
        z-index: 10000;
        white-space: nowrap;
        animation: bubblePop 0.3s ease-out;
    }
    
    .error-bubble {
        background: rgba(255, 100, 100, 0.9) !important;
        font-size: 0.7rem;
    }
    
    @keyframes bubblePop {
        0% { transform: translateX(-50%) scale(0); opacity: 0; }
        70% { transform: translateX(-50%) scale(1.1); opacity: 1; }
        100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }
    
    .character-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Orbitron', sans-serif;
        font-weight: 900;
        font-size: 1.5rem;
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .sound-debug {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #ff0000;
        padding: 10px;
        border-radius: 5px;
        font-size: 0.8rem;
        z-index: 10000;
        border: 1px solid #ff0000;
    }

    /* Плавный скролл для всего сайта */
    html {
        scroll-behavior: smooth;
    }
`;
document.head.appendChild(additionalStyles);

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// УЛУЧШЕННЫЙ ПЛАВНЫЙ СКРОЛЛ ДЛЯ НАВИГАЦИИ
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Закрываем мобильное меню если открыто
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        const targetId = this.getAttribute('href').substring(1);
        smoothScrollTo(targetId);
    });
});

// Плавный скролл для CTA кнопки
function scrollToSection(sectionId) {
    smoothScrollTo(sectionId);
}

// Subscribe button function
function subscribeChannel() {
    window.open('https://youtube.com/@madness_o5?si=vBUUD47QUoy8UUq6', '_blank');
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(255, 0, 0, 0.2)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Subscribe button function
function subscribeChannel() {
    window.open('https://youtube.com/@madness_o5?si=vBUUD47QUoy8UUq6', '_blank');
}

// Video card click handlers
document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', function() {
        const videoLinks = {
            'GO FUCK': 'https://youtu.be/dQw4w9WgXcQ?si=fjipa4BU_InKBjJI',
            'GO FUCK': 'https://youtu.be/dQw4w9WgXcQ?si=fjipa4BU_InKBjJI',
            'GO FUCK': 'https://youtu.be/dQw4w9WgXcQ?si=fjipa4BU_InKBjJI'
        };
        
        const title = this.querySelector('.video-title').textContent;
        const videoUrl = videoLinks[title];
        if (videoUrl) {
            window.open(videoUrl, '_blank');
        }
    });
});     

// Social link handlers
        /*document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.textContent.toLowerCase();
        alert(`Redirecting to ${platform}...\n\nIn a real implementation, this would link to your ${platform} profile.`);
    });
}); */


// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCharacters();
    preloadSounds();
    startFireParticleSystem();
    
    // Add sound debug info
    const debugDiv = document.createElement('div');
    debugDiv.className = 'sound-debug';
    debugDiv.innerHTML = '🔥 Fire Particles: ACTIVE';
    debugDiv.style.background = '#ff0000';
    document.body.appendChild(debugDiv);
    
    setTimeout(() => {
        debugDiv.remove();
    }, 5000);
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Export functions for external use
window.MadnessFactory = {
    configureSound,
    playCharacterSound,
    characterSounds,
    smoothScrollTo
};

// Функция для тестирования частиц
window.testParticles = function() {
    console.log('Testing particles...');
    for (let i = 0; i < 10; i++) {
        createFireParticle();
    }
};

// Typing effect for hero title (optional)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    
    // Uncomment to enable typing effect
    // typeWriter(heroTitle, originalText, 150);
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add interactive particles to hero section (optional)
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = '#ff0000ff';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        hero.appendChild(particle);
    }
}

// Add CSS for particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        50% {
            opacity: 0.3;
        }
        100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize particles when page loads
document.addEventListener('DOMContentLoaded', createParticles);
