const GAMEPAD_DEADZONE = 0.2;
const gamepadState = {
    connected: false, moveX: 0, moveY: 0, aimX: 0, aimY: 0,
    frontFire: false, leftFire: false, rightFire: false, missile: false, jump: false,
    previousButtons: []
};

function readGamepadButton(gamepad, index) {
    const button = gamepad.buttons[index];
    return Boolean(button && (button.pressed || button.value > 0.45));
}

function applyGamepadDeadzone(value) {
    const absoluteValue = Math.abs(value);
    if (absoluteValue < GAMEPAD_DEADZONE) return 0;
    return Math.sign(value) * (absoluteValue - GAMEPAD_DEADZONE) / (1 - GAMEPAD_DEADZONE);
}

function resetGamepadState() {
    gamepadState.connected = false;
    gamepadState.moveX = gamepadState.moveY = 0;
    gamepadState.aimX = gamepadState.aimY = 0;
    gamepadState.frontFire = gamepadState.leftFire = false;
    gamepadState.rightFire = gamepadState.missile = false;
    gamepadState.jump = false;
    gamepadState.previousButtons = [];
}

function handleGamepadConfirm() {
    if (gameState === GAMESTATE.MENU || gameState === GAMESTATE.GAMEOVER) beginLevelOneBriefing();
    else if (gameState === GAMESTATE.DIALOGUE) advanceLevelDialogue();
    else if (gameState === GAMESTATE.LEVELCOMPLETE) beginLevelTwoIntro();
    else if (gameState === GAMESTATE.LEVELTWO_INTRO) startLevelTwo();
    else if (gameState === GAMESTATE.LEVELTWO_FAILED) startLevelTwo();
    else if (gameState === GAMESTATE.LEVELTWO_COMPLETE) beginLevelThreeIntro();
    else if (gameState === GAMESTATE.LEVELTHREE_INTRO) startLevelThree();
    else if (gameState === GAMESTATE.LEVELTHREE_FAILED) startLevelThree();
    else if (gameState === GAMESTATE.LEVELTHREE_COMPLETE) beginLevelFourIntro();
    else if (gameState === GAMESTATE.LEVELFOUR_INTRO) startLevelFour();
    else if (gameState === GAMESTATE.LEVELFOUR_FAILED) startLevelFour();
    else if (gameState === GAMESTATE.LEVELFOUR_COMPLETE) gameState = GAMESTATE.MENU;
}

function handleGamepadPause() {
    if (gameState === GAMESTATE.GAME) gameState = GAMESTATE.PAUSE;
    else if (gameState === GAMESTATE.PAUSE) gameState = GAMESTATE.GAME;
    else if (gameState === GAMESTATE.LEVELTWO) gameState = GAMESTATE.LEVELTWO_PAUSE;
    else if (gameState === GAMESTATE.LEVELTWO_PAUSE) gameState = GAMESTATE.LEVELTWO;
    else if (gameState === GAMESTATE.LEVELTHREE) gameState = GAMESTATE.LEVELTHREE_PAUSE;
    else if (gameState === GAMESTATE.LEVELTHREE_PAUSE) gameState = GAMESTATE.LEVELTHREE;
    else if (gameState === GAMESTATE.LEVELFOUR) gameState = GAMESTATE.LEVELFOUR_PAUSE;
    else if (gameState === GAMESTATE.LEVELFOUR_PAUSE) gameState = GAMESTATE.LEVELFOUR;
    updateMusicState();
}

function updateGamepadInput() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = Array.from(gamepads).find(candidate => candidate && candidate.connected);
    if (!gamepad) { resetGamepadState(); return; }

    gamepadState.connected = true;
    gamepadState.moveX = applyGamepadDeadzone(gamepad.axes[0] || 0);
    gamepadState.moveY = applyGamepadDeadzone(gamepad.axes[1] || 0);
    gamepadState.aimX = applyGamepadDeadzone(gamepad.axes[2] || 0);
    gamepadState.aimY = applyGamepadDeadzone(gamepad.axes[3] || 0);
    if (readGamepadButton(gamepad,14)) gamepadState.moveX=-1;
    if (readGamepadButton(gamepad,15)) gamepadState.moveX=1;
    if (readGamepadButton(gamepad,12)) gamepadState.moveY=-1;
    if (readGamepadButton(gamepad,13)) gamepadState.moveY=1;

    gamepadState.frontFire = readGamepadButton(gamepad,7);
    gamepadState.jump = readGamepadButton(gamepad,0);
    gamepadState.missile = readGamepadButton(gamepad,6);
    gamepadState.leftFire = readGamepadButton(gamepad,4) || readGamepadButton(gamepad,2);
    gamepadState.rightFire = readGamepadButton(gamepad,5) || readGamepadButton(gamepad,1);

    const currentButtons = Array.from(
        gamepad.buttons,
        (button,index) => readGamepadButton(gamepad,index)
    );
    if (currentButtons[0] && !gamepadState.previousButtons[0]) handleGamepadConfirm();
    if (currentButtons[9] && !gamepadState.previousButtons[9]) handleGamepadPause();
    if (currentButtons[3] && !gamepadState.previousButtons[3]
        && gameState === GAMESTATE.GAME) activateTurbo();
    gamepadState.previousButtons = currentButtons;
}

function applyGamepadMovement(ship) {
    let moveX=gamepadState.moveX, moveY=gamepadState.moveY;
    const magnitude=Math.hypot(moveX,moveY);
    if(magnitude>1){moveX/=magnitude;moveY/=magnitude;}
    const speedMultiplier = getPlayerSpeedMultiplier();
    ship.x+=moveX*ship.speed*speedMultiplier;
    ship.y+=moveY*ship.speed*speedMultiplier;
    if(Math.hypot(gamepadState.aimX,gamepadState.aimY)>0.1){
        ship.rotation=Math.atan2(gamepadState.aimX,-gamepadState.aimY)*180/Math.PI;
    }
}
