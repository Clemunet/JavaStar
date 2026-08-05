    function spawnEnemy(x, y, type) {

        if (!type.isLevelBoss
            && typeof canSpawnStandardEnemy === "function"
            && !canSpawnStandardEnemy()) return null;

        const enemy = {

            x: x,

            y: y,

            name: type.name,

            image: type.image,

            width: type.width,

            height: type.height,

            hitboxWidth: type.hitboxWidth,
            hitboxHeight: type.hitboxHeight,

            speed: type.speed,

            offset: Math.random() * Math.PI * 2,

            moveType: type.moveType,
            state: "entering",
            aimTimer: 0,
            attackPhase: 0,
            phaseTimer: 0,
            barrageRotation: 0,
            patrolTimer: Math.random() * Math.PI * 2,
            health: type.health,
            hitFlash: 0,
            fireCooldown: 120,

            leftBattery: [

                { x: 60, y: 260 },
                { x: 60, y: 350 }

            ],

            frontBattery: [

                { x: 145, y: 170 },
                { x: 175, y: 170 }

            ],

            rightBattery: [

                { x: 260, y: 260 },
                { x: 260, y: 350 }

            ],

            maxHealth: type.health,

            score: type.score,

            alive: true

        };
        enemy.isLevelBoss = Boolean(type.isLevelBoss);
        enemies.push(enemy);
        return enemy;
}
function spawnBattleship() {

    showAlert(
        "⚠ CUIRASSÉ ENNEMI DÉTECTÉ ⚠",
        180
    );

    spawnEnemy(

        viewport.width / 2 - ENEMY_TYPES.BATTLESHIP.width / 2,
        -750,
        ENEMY_TYPES.BATTLESHIP

    );

}


function spawnLineWave() {             // enemies en formation ligne

    const enemyCount = 8;
    const spacing = 100 + Math.random() * 20;
    const formationWidth = (enemyCount - 1) * spacing + ENEMY_TYPES.SCOUT.width;
    const startX = (viewport.width - formationWidth) / 2;
    for (let i = 0; i < enemyCount; i++) {
        spawnEnemy(
            startX + i * spacing,
            -180,
            ENEMY_TYPES.SCOUT
        );
    }
}
function spawnDiagonalWave() {

    const startX = viewport.width * 0.25;
    const startY = -180;
    const spacingX = viewport.width * 0.1;
    const spacingY = 220;
    for (let i = 0; i < 3; i++) {
        spawnEnemy(
            startX + i * spacingX,
            startY - i * spacingY,
            ENEMY_TYPES.FRIGATE
        );
    }
}
function spawnReverseDiagonalWave() {

    const startX = viewport.width * 0.75;
    const startY = -180;

    const spacingX = viewport.width * 0.1;
    const spacingY = 220;

    for (let i = 0; i < 3; i++) {

        spawnEnemy(

            startX - i * spacingX,
            startY - i * spacingY,
            ENEMY_TYPES.FRIGATE

        );
    }
}

function spawnLevelBoss() {
    showAlert("⚠ VAISSEAU AMIRAL ECLIPSE DÉTECTÉ ⚠", 240);
    playTone(42, 1.4, 0.09, "sawtooth");
    const boss = spawnEnemy(
        viewport.width / 2 - ENEMY_TYPES.DREADNOUGHT.width / 2,
        -ENEMY_TYPES.DREADNOUGHT.height - 80,
        ENEMY_TYPES.DREADNOUGHT
    );
    if (!boss) return;
    boss.leftBattery = [
        { x: 70, y: 310 }, { x: 115, y: 430 }, { x: 165, y: 500 }
    ];
    boss.frontBattery = [
        { x: 210, y: 500 }, { x: 250, y: 525 }, { x: 290, y: 500 }
    ];
    boss.rightBattery = [
        { x: 430, y: 310 }, { x: 385, y: 430 }, { x: 335, y: 500 }
    ];
    boss.phaseTimer = 90;
}
let lastFrigateFormation = -1;

function spawnFrigateAt(relativeX, y) {
    const width = ENEMY_TYPES.FRIGATE.width;
    const x = Math.max(0, Math.min(
        viewport.width - width,
        viewport.width * relativeX - width / 2
    ));
    spawnEnemy(x, y, ENEMY_TYPES.FRIGATE);
}

function spawnFrigateChevronWave() {
    spawnFrigateAt(0.5, -180);
    spawnFrigateAt(0.36, -390);
    spawnFrigateAt(0.64, -390);
    spawnFrigateAt(0.22, -600);
    spawnFrigateAt(0.78, -600);
}

function spawnFrigateDiamondWave() {
    spawnFrigateAt(0.5, -180);
    spawnFrigateAt(0.35, -390);
    spawnFrigateAt(0.65, -390);
    spawnFrigateAt(0.5, -600);
}

function spawnFrigateTwinColumnsWave() {
    spawnFrigateAt(0.34, -180);
    spawnFrigateAt(0.66, -180);
    spawnFrigateAt(0.34, -430);
    spawnFrigateAt(0.66, -430);
}

function spawnFrigatePincerWave() {
    spawnFrigateAt(0.16, -180);
    spawnFrigateAt(0.84, -180);
    spawnFrigateAt(0.3, -430);
    spawnFrigateAt(0.7, -430);
    spawnFrigateAt(0.5, -680);
}

function spawnRandomFrigateWave() {
    const formations = [
        spawnDiagonalWave,
        spawnReverseDiagonalWave,
        spawnFrigateChevronWave,
        spawnFrigateDiamondWave,
        spawnFrigateTwinColumnsWave,
        spawnFrigatePincerWave
    ];
    let formationIndex = Math.floor(Math.random() * formations.length);
    if (formations.length > 1 && formationIndex === lastFrigateFormation) {
        formationIndex = (formationIndex + 1
            + Math.floor(Math.random() * (formations.length - 1)))
            % formations.length;
    }
    lastFrigateFormation = formationIndex;
    formations[formationIndex]();
}
function spawnVWave() {     // enemies en formation V

    const centerX = viewport.width / 2 - ENEMY_TYPES.SCOUT.width / 2;
    const horizontalStep = viewport.width * 0.1;

    spawnEnemy(centerX, -180, ENEMY_TYPES.SCOUT);
    spawnEnemy(centerX - horizontalStep, -350, ENEMY_TYPES.SCOUT);
    spawnEnemy(centerX + horizontalStep, -350, ENEMY_TYPES.SCOUT);
    spawnEnemy(centerX - horizontalStep * 2, -520, ENEMY_TYPES.SCOUT);
    spawnEnemy(centerX + horizontalStep * 2, -520, ENEMY_TYPES.SCOUT);

}
function spawnWave() {

    if (currentWave >= nextBattleshipWave) {
        spawnBattleship();
        nextBattleshipWave = currentWave + 8 + Math.floor(Math.random() * 5);
        return;
    }

    const wavePattern = (currentWave - 1) % 3 + 1;

    switch (wavePattern) {

        case 1:
            spawnLineWave();
            break;

        case 2:
            spawnRandomFrigateWave();
            break;

        case 3:
            spawnVWave();
            break;

    }

}

//etoiles
