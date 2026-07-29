const canvas = document.querySelector('#gameCanvas'); //recup le canvas dans le html

const ctx = canvas.getContext("2d"); // recup le context

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
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
}


const scoutImage = new Image();
scoutImage.src = "IMAGES/Chasseur.png";
const frigateImage = new Image();
frigateImage.src = "IMAGES/fregate.png";
const battleshipImage = new Image();
battleshipImage.src = "IMAGES/croiseur.png";
const leMichImage = new Image();
leMichImage.src = "IMAGES/leMich2.png";
const clemImage = new Image();
clemImage.src = "IMAGES/clemship.png";
const missileImage = new Image();
missileImage.src = "IMAGES/missile.png";
const explosionImage = new Image();
explosionImage.src = "IMAGES/explosion.png";

const LASERSPEED = 10;

const DEBUG = false;

const FIXED_TIMESTEP = 1000 / 60;

const GAMESTATE = {

    MENU: "menu",
    GAME: "game",
    GAMEOVER: "game-over",
    PAUSE: "pause"
};

let gameState = GAMESTATE.MENU;
let alertMessage = "";
let alertTimer = 0;
let screenShake = 0;
let audioContext = null;

function playTone(frequency, duration, volume, waveType = "sine") {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        return;
    }

    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
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
        health: 300,
        score: 1000,

        hitboxWidth: 150,
        hitboxHeight: 610
    }
};
// Vaisseau LeMich et ClemShip--------------------------------------------------
const leMichShip = {

    x: 1000,
    y: 600,
    width: 400,
    height: 400,
    speed: 2,
    rotation: 0,
    rotationSpeed: 2,
    image: leMichImage,
    fireCooldown: 10,
    missileCooldown: 0,
    damageTimer: 0,
    lives: 40,
    maxLives: 40,
    shield: 100,
    maxShield: 100,
    shieldRegenDelay: 0,
    shieldRegenRate: 0.2,
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
        }
    }

    if (event.code === "Enter") {

        if (
            gameState === GAMESTATE.MENU ||
            gameState === GAMESTATE.GAMEOVER
        ) {
            startNewGame();
        }
    }
});
document.addEventListener("keyup", function (event) {

    keys[event.code] = false;
    keys[event.key] = false;
})


// fond --------------------------------------------------
