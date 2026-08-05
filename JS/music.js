const backgroundMusic = new Audio("SOUNDS/Neon Horizon.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;
backgroundMusic.preload = "auto";
const levelTwoMusic = new Audio("SOUNDS/Orbite en Feu.mp3");
levelTwoMusic.loop = true;
levelTwoMusic.volume = 0.38;
levelTwoMusic.preload = "auto";
const levelThreeMusic = new Audio("SOUNDS/infiltration.mp3");
levelThreeMusic.loop = true;
levelThreeMusic.volume = 0.38;
levelThreeMusic.preload = "auto";
const levelFourMusic = new Audio("SOUNDS/escape.mp3");
levelFourMusic.loop = true;
levelFourMusic.volume = 0.4;
levelFourMusic.preload = "auto";

const musicTracks = [backgroundMusic, levelTwoMusic, levelThreeMusic, levelFourMusic];

let musicEnabled = true;
let musicStarted = false;

function playBackgroundMusic() {
    if (!musicEnabled || !musicStarted || !isMusicGameplayState()) {
        return;
    }

    const activeMusic = getActiveMusic();
    musicTracks.forEach(function (track) {
        if (track !== activeMusic) track.pause();
    });
    const playRequest = activeMusic.play();
    if (playRequest) {
        playRequest.catch(function () {
            // Le navigateur autorisera la lecture à la prochaine interaction.
        });
    }
}

function startMusic() {
    const activeMusic = getActiveMusic();
    musicTracks.forEach(function (track) { track.pause(); });
    activeMusic.currentTime = 0;
    musicStarted = true;
    playBackgroundMusic();
}

function getActiveMusic() {
    if (gameState === GAMESTATE.LEVELTWO) return levelTwoMusic;
    if (gameState === GAMESTATE.LEVELTHREE) return levelThreeMusic;
    if (gameState === GAMESTATE.LEVELFOUR) return levelFourMusic;
    return backgroundMusic;
}

function isMusicGameplayState() {
    return gameState === GAMESTATE.GAME || gameState === GAMESTATE.LEVELTWO
        || gameState === GAMESTATE.LEVELTHREE || gameState === GAMESTATE.LEVELFOUR;
}

function updateMusicState() {
    if (musicEnabled && musicStarted && isMusicGameplayState()) {
        if (getActiveMusic().paused) {
            playBackgroundMusic();
        }
    } else {
        musicTracks.forEach(function (track) { track.pause(); });
    }
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    updateMusicState();
    showAlert(
        musicEnabled ? "MUSIQUE ACTIVÉE" : "MUSIQUE COUPÉE",
        60
    );
}
