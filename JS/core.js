const canvas = document.querySelector('#gameCanvas'); //recup le canvas dans le html

const ctx = canvas.getContext("2d"); // recup le context

const BASE_WIDTH = 2400;
const BASE_HEIGHT = 1350;
const viewport = {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    pixelRatio: 1,
    scale: 1
};

function resizeCanvas(adaptWorld = true) {
    const oldWidth = viewport.width;
    const oldHeight = viewport.height;

    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;
    viewport.scale = Math.min(
        displayWidth / BASE_WIDTH,
        displayHeight / BASE_HEIGHT
    );
    viewport.width = displayWidth / viewport.scale;
    viewport.height = displayHeight / viewport.scale;
    viewport.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";
    canvas.width = Math.round(displayWidth * viewport.pixelRatio);
    canvas.height = Math.round(displayHeight * viewport.pixelRatio);
    const renderScale = viewport.pixelRatio * viewport.scale;
    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);

    if (!adaptWorld || oldWidth <= 0 || oldHeight <= 0) {
        return;
    }

    const scaleX = viewport.width / oldWidth;
    const scaleY = viewport.height / oldHeight;

    leMichShip.x = Math.max(0, Math.min(
        viewport.width - leMichShip.width,
        leMichShip.x * scaleX
    ));
    leMichShip.y = Math.max(0, Math.min(
        viewport.height - leMichShip.height,
        leMichShip.y * scaleY
    ));
    if (typeof resizeLevelTwo === "function") {
        resizeLevelTwo(scaleX, scaleY);
    }
    for (const companion of companions) {
        companion.x *= scaleX;
        companion.y *= scaleY;
    }

    for (const enemy of enemies) {
        enemy.x *= scaleX;
        enemy.y *= scaleY;
    }

    nebuleuse.x = viewport.width / 1.3;
    nebuleuse.y = viewport.height / 4.4;
    nebuleuse.radius = Math.max(viewport.width, viewport.height) * 0.3;
    resizeStars(scaleX, scaleY);
    resizeSpaceDecorations(scaleX, scaleY);
}


const scoutImage = new Image();
scoutImage.src = "IMAGES/Chasseur.png";
const frigateImage = new Image();
frigateImage.src = "IMAGES/fregate.png";
const battleshipImage = new Image();
battleshipImage.src = "IMAGES/croiseur.png";
const eclipseImage = new Image();
eclipseImage.src = "IMAGES/enemies/eclipse.png";
const leMichImage = new Image();
leMichImage.src = "IMAGES/leMich2.png";
const clemImage = new Image();
clemImage.src = "IMAGES/clemship.png";
const missileImage = new Image();
missileImage.src = "IMAGES/missile.png";
const playerLaserImage = new Image();
playerLaserImage.src = "IMAGES/projectiles/player-laser.png";
const enemyLaserImage = new Image();
enemyLaserImage.src = "IMAGES/projectiles/enemy-laser.png";
const explosionImage = new Image();
explosionImage.src = "IMAGES/explosion.png";

const LASERSPEED = 10;

const DEBUG = false;

const FIXED_TIMESTEP = 1000 / 60;

const GAMESTATE = {

    MENU: "menu",
    DIALOGUE: "dialogue",
    GAME: "game",
    GAMEOVER: "game-over",
    PAUSE: "pause",
    LEVELCOMPLETE: "level-complete",
    LEVELTWO_INTRO: "level-two-intro",
    LEVELTWO: "level-two",
    LEVELTWO_PAUSE: "level-two-pause",
    LEVELTWO_FAILED: "level-two-failed",
    LEVELTWO_COMPLETE: "level-two-complete",
    LEVELTHREE_INTRO: "level-three-intro",
    LEVELTHREE: "level-three",
    LEVELTHREE_PAUSE: "level-three-pause",
    LEVELTHREE_FAILED: "level-three-failed",
    LEVELTHREE_COMPLETE: "level-three-complete",
    LEVELFOUR_INTRO: "level-four-intro",
    LEVELFOUR: "level-four",
    LEVELFOUR_PAUSE: "level-four-pause",
    LEVELFOUR_FAILED: "level-four-failed",
    LEVELFOUR_COMPLETE: "level-four-complete"
};

let gameState = GAMESTATE.MENU;
let alertMessage = "";
let alertTimer = 0;
let screenShake = 0;
let audioContext = null;
let soundEffectsEnabled = true;

function getAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return null;
    }

    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    return audioContext;
}

function playTone(frequency, duration, volume, waveType = "sine") {
    if (!soundEffectsEnabled) return;
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
}

function toggleSoundEffects() {
    soundEffectsEnabled = !soundEffectsEnabled;
    showAlert(
        soundEffectsEnabled ? "SONS ACTIVÉS" : "SONS COUPÉS",
        60
    );
}

resizeCanvas(false);
window.addEventListener("resize", function () {
    resizeCanvas(true);
});

const ENEMY_TYPES = {
    SCOUT: {

        name: "Scout",
        image: scoutImage,
        width: 50,
        height: 50,
        speed: 5,
        moveType: "zigzag",
        health: 3,
        score: 50,

        hitboxWidth: 38,
        hitboxHeight: 42

    },
    FRIGATE: {
        name: "Frigate",

        image: frigateImage,

        width: 160,
        height: 160,
        speed: 2,
        moveType: "straight",
        health: 40,
        score: 300,

        hitboxWidth: 95,
        hitboxHeight: 140

    },
    BATTLESHIP: {

        name: "Battleship",

        image: battleshipImage,

        width: 320,
        height: 700,
        speed: 0.8,
        moveType: "straight",
        health: 420,
        score: 1000,

        hitboxWidth: 150,
        hitboxHeight: 610
    },
    DREADNOUGHT: {
        name: "Eclipse",
        image: eclipseImage,
        width: 500,
        height: 650,
        speed: 1,
        moveType: "boss",
        health: 1190,
        score: 10000,
        hitboxWidth: 420,
        hitboxHeight: 590,
        isLevelBoss: true
    }
};
// Vaisseau LeMich et ClemShip--------------------------------------------------
const leMichShip = {

    x: 1000,
    y: 600,
    width: 400,
    height: 400,
    speed: 2.2,
    rotation: 0,
    rotationSpeed: 2,
    image: leMichImage,
    fireCooldown: 10,
    missileCooldown: 0,
    rapidFireTimer: 0,
    superShieldTimer: 0,
    bonusMissileSalvos: 0,
    turboTimer: 0,
    speedBonusTimer: 0,
    damageTimer: 0,
    lives: 88,
    maxLives: 88,
    shield: 130,
    maxShield: 130,
    shieldRegenDelay: 0,
    shieldRegenRate: 0.26,
    energy: 100,
    maxEnergy: 100,
    energyRegenRate: 0.35,
    energyWarningCooldown: 0,
    score: 0,

    hitboxWidth:170,
    hitboxHeight:270,

    frontCannons: [
        { x: 192, y: 5 },
        { x: 200, y: 5 }
    ],
        leftCannons: [
        { x: 70, y: 170 },
        { x: 35, y: 182 },
        { x: 70, y: 230 },
        { x: 35, y: 240 }
    ],

    rightCannons: [
        { x: 320, y: 170 },
        { x: 355, y: 182 },
        { x: 320, y: 230 },
        { x: 355, y: 240 }
    ],

    missileLauncher: {
        x: 196,
        y: 260
    }
}
let bullets = [];
let enemyBullets = [];
let missiles = [];
let explosions = [];
let enemies = [];
let waveCooldown = 120;
let currentWave = 1;
let nextBattleshipWave = 8 + Math.floor(Math.random() * 5);
let stars = [];
const nebuleuse = {

    x: viewport.width / 1.3,

    y: viewport.height / 4.4,

    radius: Math.max(viewport.width, viewport.height) * 0.3,

    color: "rgba(70,120,255,0.10)"

};

const ClemShip = {
    x: 600,
    y: 600,
    width: 60,
    height: 60,
    speed: 7,
    image: clemImage,
    rotation: 0,
    fireCooldown: 0,
    lives: 3,
    maxLives: 3,
    damageTimer: 0,
    respawnTimer: 0,
    active: true,
    hitboxWidth: 42,
    hitboxHeight: 48,
    followDistance: 220,
    attackRange: 900,
    formationIndex: 0,
    maneuverTimer: 240,
    frontCannons: [
        { x: 30, y: 2 }
    ]
};

const ClemShip2 = {
    ...ClemShip,
    x: 1200,
    y: 600,
    formationIndex: 2,
    maneuverTimer: 300,
    frontCannons: [{ x: 30, y: 2 }]
};

const companions = [ClemShip, ClemShip2];

//clavier----------------------------
const keys = {

};

document.addEventListener("keydown", function (event) {

    keys[event.code] = true;
    keys[event.key] = true;

    if (event.code === "Escape" && !event.repeat) {
        if (gameState === GAMESTATE.GAME) {
            gameState = GAMESTATE.PAUSE;
        } else if (gameState === GAMESTATE.PAUSE) {
            gameState = GAMESTATE.GAME;
        } else if (gameState === GAMESTATE.LEVELTWO) {
            gameState = GAMESTATE.LEVELTWO_PAUSE;
        } else if (gameState === GAMESTATE.LEVELTWO_PAUSE) {
            gameState = GAMESTATE.LEVELTWO;
        } else if (gameState === GAMESTATE.LEVELTHREE) {
            gameState = GAMESTATE.LEVELTHREE_PAUSE;
        } else if (gameState === GAMESTATE.LEVELTHREE_PAUSE) {
            gameState = GAMESTATE.LEVELTHREE;
        } else if (gameState === GAMESTATE.LEVELFOUR) {
            gameState = GAMESTATE.LEVELFOUR_PAUSE;
        } else if (gameState === GAMESTATE.LEVELFOUR_PAUSE) {
            gameState = GAMESTATE.LEVELFOUR;
        }
        updateMusicState();
    }

    if (event.code === "KeyM" && !event.repeat) {
        toggleMusic();
    }

    if ((event.code === "Digit9" || event.code === "Numpad9") && !event.repeat) {
        toggleMusic();
    }

    if (event.code === "Numpad5"
        && !event.repeat && gameState === GAMESTATE.GAME) {
        activateTurbo();
    }

    if ((event.code === "Digit8" || event.code === "Numpad8") && !event.repeat) {
        skipToNextLevelForDevelopment();
    }

    if ((event.code === "Digit7" || event.code === "Numpad7") && !event.repeat) {
        toggleSoundEffects();
    }

    if (event.code === "Enter" && !event.repeat) {
        if (gameState === GAMESTATE.MENU || gameState === GAMESTATE.GAMEOVER) {
            beginLevelOneBriefing();
        } else if (gameState === GAMESTATE.DIALOGUE) {
            advanceLevelDialogue();
        } else if (gameState === GAMESTATE.LEVELCOMPLETE) {
            beginLevelTwoIntro();
        } else if (gameState === GAMESTATE.LEVELTWO_INTRO) {
            startLevelTwo();
        } else if (gameState === GAMESTATE.LEVELTWO_FAILED) {
            startLevelTwo();
        } else if (gameState === GAMESTATE.LEVELTWO_COMPLETE) {
            beginLevelThreeIntro();
        } else if (gameState === GAMESTATE.LEVELTHREE_INTRO) {
            startLevelThree();
        } else if (gameState === GAMESTATE.LEVELTHREE_FAILED) {
            startLevelThree();
        } else if (gameState === GAMESTATE.LEVELTHREE_COMPLETE) {
            beginLevelFourIntro();
        } else if (gameState === GAMESTATE.LEVELFOUR_INTRO) {
            startLevelFour();
        } else if (gameState === GAMESTATE.LEVELFOUR_FAILED) {
            startLevelFour();
        } else if (gameState === GAMESTATE.LEVELFOUR_COMPLETE) {
            gameState = GAMESTATE.MENU;
        }
    }
});
document.addEventListener("keyup", function (event) {

    keys[event.code] = false;
    keys[event.key] = false;
})


// fond --------------------------------------------------
