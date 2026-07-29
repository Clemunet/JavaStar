    function spawnEnemy(x, y, type) {

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
        enemies.push(enemy);
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

    const wavePattern = (currentWave - 1) % 4 + 1;

    switch (wavePattern) {

        case 1:
            spawnLineWave();
            break;

        case 2:
            spawnDiagonalWave();
            break;

        case 3:
            spawnVWave();
            break;

        case 4:

            spawnBattleship();
            break;


    }

}

//etoiles
