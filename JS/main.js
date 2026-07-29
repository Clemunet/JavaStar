// boucle du jeu--------------------------------------------------------------------------
let previousTime = performance.now();
let updateAccumulator = 0;

function gameLoop(currentTime) {

    const elapsedTime = Math.min(currentTime - previousTime, 250);
    previousTime = currentTime;

    if (gameState === GAMESTATE.MENU) {
        drawMenu();
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

    requestAnimationFrame(gameLoop);
}
createStars();
requestAnimationFrame(gameLoop);
