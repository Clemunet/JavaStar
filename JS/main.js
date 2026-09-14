// boucle du jeu--------------------------------------------------------------------------
let previousTime = performance.now();
let updateAccumulator = 0;

function gameLoop(currentTime) {

    const elapsedTime = Math.min(currentTime - previousTime, 250);
    previousTime = currentTime;
    updateGamepadInput();
    updateMusicState();

    if (gameState === GAMESTATE.MENU) {
        drawMenu();
    }

    else if (gameState === GAMESTATE.DIALOGUE) {
        updateAccumulator = 0;
        drawLevelDialogue();
    }

    else if (gameState === GAMESTATE.GAME) {
        updateAccumulator += elapsedTime;
        while (updateAccumulator >= FIXED_TIMESTEP) {
            update();
            updateAccumulator -= FIXED_TIMESTEP;
        }
        drawGame();
    }
    else if (gameState === GAMESTATE.PAUSE) {
        updateAccumulator = 0;
        drawGame();
        drawPause();
    }
    else if (gameState === GAMESTATE.GAMEOVER) {
        drawGameOver();
    }
    else if (gameState === GAMESTATE.LEVELCOMPLETE) {
        updateAccumulator = 0;
        drawLevelComplete();
    }
    else if (gameState === GAMESTATE.LEVELTWO_INTRO) {
        updateAccumulator = 0;
        drawLevelTwoIntro();
    }
    else if (gameState === GAMESTATE.LEVELTWO) {
        updateAccumulator += elapsedTime;
        while (updateAccumulator >= FIXED_TIMESTEP) {
            updateLevelTwo();
            updateAccumulator -= FIXED_TIMESTEP;
        }
        drawLevelTwo();
    }
    else if (gameState === GAMESTATE.LEVELTWO_PAUSE) {
        updateAccumulator = 0;
        drawLevelTwo();
        drawPause();
    }
    else if (gameState === GAMESTATE.LEVELTWO_FAILED) {
        updateAccumulator = 0;
        drawLevelTwo();
        drawLevelTwoFailed();
    }
    else if (gameState === GAMESTATE.LEVELTWO_COMPLETE) {
        updateAccumulator = 0;
        drawLevelTwoComplete();
    }
    else if (gameState === GAMESTATE.LEVELTHREE_INTRO) { updateAccumulator = 0; drawLevelThreeIntro(); }
    else if (gameState === GAMESTATE.LEVELTHREE) {
        updateAccumulator += elapsedTime;
        while (updateAccumulator >= FIXED_TIMESTEP) { updateLevelThree(); updateAccumulator -= FIXED_TIMESTEP; }
        drawLevelThree();
    }
    else if (gameState === GAMESTATE.LEVELTHREE_PAUSE) { updateAccumulator = 0; drawLevelThree(); drawPause(); }
    else if (gameState === GAMESTATE.LEVELTHREE_FAILED) { updateAccumulator = 0; drawLevelThree(); drawLevelThreeFailed(); }
    else if (gameState === GAMESTATE.LEVELTHREE_COMPLETE) { updateAccumulator = 0; drawLevelThreeComplete(); }
    else if (gameState === GAMESTATE.LEVELFOUR_INTRO) { updateAccumulator = 0; drawLevelFourIntro(); }
    else if (gameState === GAMESTATE.LEVELFOUR) {
        updateAccumulator += elapsedTime;
        while (updateAccumulator >= FIXED_TIMESTEP) { updateLevelFour(); updateAccumulator -= FIXED_TIMESTEP; }
        drawLevelFour();
    }
    else if (gameState === GAMESTATE.LEVELFOUR_PAUSE) { updateAccumulator = 0; drawLevelFour(); drawPause(); }
    else if (gameState === GAMESTATE.LEVELFOUR_FAILED) { updateAccumulator = 0; drawLevelFour(); drawLevelFourFailed(); }
    else if (gameState === GAMESTATE.LEVELFOUR_COMPLETE) { updateAccumulator = 0; drawLevelFourComplete(); }

    requestAnimationFrame(gameLoop);
}
createStars();
createSpaceDecorations();
requestAnimationFrame(gameLoop);
