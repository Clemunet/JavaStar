const canvas = document.querySelector('#gameCanvas'); //recup le canvas dans le html

const ctx = canvas.getContext("2d"); // recup le context


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

const DEBUG = true;

const GAMESTATE = {

    MENU: "menu",
    GAME: "game",
    GAMEOVER: "game-over",
    PAUSE: "pause"
};

let gameState = GAMESTATE.MENU;
let alertMessage = "";
let alertTimer = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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

    x: canvas.width / 1.3,

    y: canvas.height / 4.4,

    radius: 500,

    color: "rgba(70,120,255,0.10)"

};

const ClemShip = {

    x: 600, y: 600, width: 60, height: 60,speed: 5,image: clemImage, fireCooldown: 10, lives: 3, score: 0
};

//clavier----------------------------
const keys = {

};

document.addEventListener("keydown", function (event) {

    keys[event.code] = true;
    keys[event.key] = true;

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

function drawBackground() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function drawNebuleuse() {

    const gradient = ctx.createRadialGradient(
        nebuleuse.x,
        nebuleuse.y,
        0,

        nebuleuse.x,
        nebuleuse.y,
        nebuleuse.radius

    );
    gradient.addColorStop(0, nebuleuse.color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
        nebuleuse.x,
        nebuleuse.y,
        nebuleuse.radius,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawMenu() {

    drawBackground();

    ctx.fillStyle = "white";

    ctx.textAlign = "center";

    ctx.font = "80px Arial";

    ctx.fillText(
        "JAVA STAR",
        canvas.width / 2,
        canvas.height / 2 - 100
    );

    ctx.font = "40px Arial";

    ctx.fillText(
        "Appuie sur Entrée",
        canvas.width / 2,
        canvas.height / 2
    );

}
function drawGameOver() {

    drawBackground();

    ctx.fillStyle = "red";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2 - 80
    );

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";

    ctx.fillText(
        "Score : " + leMichShip.score,
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.fillText(
        "Appuie sur Entrée pour recommencer",
        canvas.width / 2,
        canvas.height / 2 + 80
    );

}
function startNewGame() {

    bullets = [];
    enemies = [];
    enemyBullets = [];

    leMichShip.lives = 40;
    leMichShip.score = 0;
    leMichShip.fireCooldown = 10;
    leMichShip.missileCooldown = 0;

    leMichShip.x = canvas.width / 2 - leMichShip.width / 2;
    leMichShip.y = canvas.height - leMichShip.height - 50;

    leMichShip.rotation = 0;

    waveCooldown = 30;

    gameState = GAMESTATE.GAME;
}
//ALERTE BOSS
function showAlert(message, duration) {

    alertMessage = message;

    alertTimer = duration;

}

// draw vaisseaux---------------------------------------------------------------------

function drawShip(ship) {

    if (!ship.image.complete) {
        return;
    }

    ctx.save();

    ctx.translate(
        ship.x + ship.width / 2,
        ship.y + ship.height / 2
    );

    ctx.rotate(ship.rotation * Math.PI / 180);

    if (ship.damageTimer > 0) {
        ctx.globalAlpha = 0.4;
    }

    ctx.drawImage(
        ship.image,
        -ship.width / 2,
        -ship.height / 2,
        ship.width,
        ship.height
    );

    ctx.globalAlpha = 1;

    ctx.restore();
}

function drawBullet(bullet) {
    ctx.fillStyle = "blue";

        ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );

    if (DEBUG) {
        drawHitbox(bullet);
    }
}
function drawBullets() {
    for (const bullet of bullets) {
        drawBullet(bullet);
    }
}
function drawMissiles() {

    for (const missile of missiles) {

        ctx.save();
        ctx.translate(
            missile.x + missile.width / 2,
            missile.y + missile.height / 2
        );
        const angle = Math.atan2(
            missile.speedY,
            missile.speedX
        );
        ctx.rotate(angle + Math.PI / 2);

        ctx.drawImage(
            missile.image,
            -missile.width / 2,
            -missile.height / 2,
            missile.width,
            missile.height
        );
        ctx.restore();

        if (DEBUG) {
            drawHitbox(missile);
        }
    }
}
function drawExplosions() {

    const columns = 4;
    const scale = 0.45;

    for (const explosion of explosions) {

        if (!explosionImage.complete) {
            continue;
        }

        const frameX =
            (explosion.frame % columns) * explosion.frameWidth;

        const frameY =
            Math.floor(explosion.frame / columns) * explosion.frameHeight;

        const drawWidth = explosion.frameWidth * scale;
        const drawHeight = explosion.frameHeight * scale;

        ctx.drawImage(
            explosionImage,

            frameX,
            frameY,

            explosion.frameWidth,
            explosion.frameHeight,

            explosion.x - drawWidth / 2,
            explosion.y - drawHeight / 2,

            drawWidth,
            drawHeight
        );

        if (DEBUG) {

            ctx.strokeStyle = "orange";

            ctx.strokeRect(
                explosion.x - drawWidth / 2,
                explosion.y - drawHeight / 2,
                drawWidth,
                drawHeight
            );
        }
    }
}

function createExplosion(x, y, damage, radius) {

    const explosion = {

        x: x,
        y: y,
        damage: damage,
        radius: radius,
        animationTimer: 0,
        frame: 0,
        frameWidth: 384,
        frameHeight: 384,

        hasDamaged: false,

        alive: true

    };
    explosions.push(explosion);
}



function drawEnemyBullets() {

    for (const bullet of enemyBullets) {

        if (bullet.type === "frigate") {
            ctx.fillStyle = "#FF3333";
        }
        else {
            ctx.fillStyle = "#FFAA00";
        }

        ctx.fillRect(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height
        );

        if (DEBUG) {
            drawHitbox(bullet);
        }

    }

}


    //draw enemy---------------------------------------------------------------------------------------------------------------
function drawEnemies() {
    for (const enemy of enemies) {
        drawEnemy(enemy);
        drawHitbox(enemy);
    }
}
function drawEnemy(enemy) {
    if (enemy.image.complete) {
        ctx.drawImage(
            enemy.image,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
        ctx.fillStyle = "#333333";
        ctx.fillRect(
            enemy.x,
            enemy.y - 12,
            enemy.width,
            6
        );
        ctx.fillStyle = "#FF3333";
        ctx.fillRect(
            enemy.x,
            enemy.y - 12,
            enemy.width * (enemy.health / enemy.maxHealth),
            6
        );
    }
}
function drawAlert() {

    if (alertTimer <= 0) {
        return;
    }

    ctx.textAlign = "center";

    ctx.font = "40px Consolas";

    ctx.fillStyle = "#FF4444";

    ctx.fillText(

        alertMessage,

        canvas.width / 2,

        70

    );

}



function createBullet(x, y, speedX, speedY) {

    const bullet = {

        x: x,
        y: y,

        width: 6,
        height: 15,
        speedX: speedX,
        speedY: speedY,

        hitboxWidth: 6,
        hitboxHeight: 15,

        alive: true
    };

    bullets.push(bullet);
}
    function createMissile(ship) {

        const rotated = rotatePoint(
        ship.missileLauncher,
        ship
        );

        const direction = getDirectionVector(ship, 0);

        const missile = {

            x: ship.x + rotated.x,
            y: ship.y + rotated.y,
            width: 24,
            height: 48,

            image: missileImage,
            rotation: ship.rotation,

            hitboxWidth: 12,
            hitboxHeight: 32,

            speedX: direction.x * 6,
            speedY: direction.y * 6,
            damage: 20,

            alive: true
    };
    missiles.push(missile);

}
function createEnemyBullet(enemy) {

        const dx =
            (leMichShip.x + leMichShip.width / 2) -
            (enemy.x + enemy.width / 2);

        const dy =
            (leMichShip.y + leMichShip.height / 2) -
            (enemy.y + enemy.height / 2);

        const distance = Math.sqrt(dx * dx + dy * dy);

        const speed = 6;

        const speedX = dx / distance * speed;

        const speedY = dy / distance * speed;

        const bullet = {
        x: enemy.x + enemy.width / 2 - 3,
        y: enemy.y + enemy.height,
        width: 6,
        height: 15,
        hitboxWidth: 6,
        hitboxHeight: 15,
        speedX: speedX,
        speedY: speedY,
            type: "frigate",
        alive: true
    };
    enemyBullets.push(bullet);
}
function fireBattery(enemy, battery, speedX, speedY) {
    for (const cannon of battery) {
        createBattleshipBullet(enemy, cannon, speedX, speedY);
    }
}

function createBattleshipBullet(enemy, cannon, speedX, speedY) {

    const bullet = {
        x: enemy.x + cannon.x,
        y: enemy.y + cannon.y,
        width: 12,
        height: 24,
        hitboxWidth: 12,
        hitboxHeight: 24,
        speedX: speedX,
        speedY: speedY,
        type: "battleship",
        alive: true
    };

    enemyBullets.push(bullet);

}




function rotatePoint(point, ship) {

    const angle = ship.rotation * Math.PI / 180;

    const centerX = ship.width / 2;
    const centerY = ship.height / 2;

    const x = point.x - centerX;
    const y = point.y - centerY;

    return {

        x: x * Math.cos(angle) - y * Math.sin(angle) + centerX,

        y: x * Math.sin(angle) + y * Math.cos(angle) + centerY

    };

}

    function shoot(ship, cannons, angleOffset) {

        for (const cannon of cannons) {

            const rotated = rotatePoint(cannon, ship);

            const direction = getDirectionVector(ship, angleOffset);
            createBullet(
                ship.x + rotated.x,
                ship.y + rotated.y,
                direction.x * LASERSPEED,
                direction.y * LASERSPEED
            );
        }
    }

function drawHitbox(object) {

    if (!DEBUG) {
        return;
    }

    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    ctx.strokeRect(
        object.x + (object.width - object.hitboxWidth) / 2,
        object.y + (object.height - object.hitboxHeight) / 2,
        object.hitboxWidth,
        object.hitboxHeight
    );
    const centerX = object.x + object.width / 2;
    const centerY = object.y + object.height / 2;

    ctx.fillStyle = "red";

    ctx.beginPath();
    ctx.arc(
        centerX,
        centerY,
        4,
        0,
        Math.PI * 2
    );
    ctx.fill();

}

// Enemies-------------------------------------------------------
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

        canvas.width / 2 - 140,
        -750,
        ENEMY_TYPES.BATTLESHIP

    );

}


function spawnLineWave() {             // enemies en formation ligne

    const startX = canvas.width * 0.5;
    const spacing = 100 + Math.random() * 20;
    for (let i = 0; i < 8; i++) {
        spawnEnemy(
            startX + i * spacing,
            -180,
            ENEMY_TYPES.SCOUT
        );
    }
}
function spawnDiagonalWave() {

    const startX = canvas.width * 0.25;
    const startY = -180;
    const spacingX = 180;
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

    const startX = canvas.width * 0.75;
    const startY = -180;

    const spacingX = 180;
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

    spawnEnemy(900, -180, ENEMY_TYPES.SCOUT);
    spawnEnemy(700, -350, ENEMY_TYPES.SCOUT);
    spawnEnemy(1100, -350, ENEMY_TYPES.SCOUT);
    spawnEnemy(500, -520, ENEMY_TYPES.SCOUT);
    spawnEnemy(1300, -520, ENEMY_TYPES.SCOUT);

}
function spawnWave() {

    switch (currentWave) {

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


        default:
            currentWave = 1;
            spawnLineWave();
    }

}

//etoiles
function createStars() {

    for (let i = 0; i < 200; i++) {

        let size;
        let speed;

        const random = Math.random();

        if (random < 0.70) {
            size = 1;
            speed = 0.4;
        }
        else if (random < 0.95) {
            size = 2;
            speed = 1.2;
        }
        else {
            size = 3;
            speed = 2.5;
        }
        let color;
        if (size === 1) {
            color = "#BBBBBB";
        }
        else if (size === 2) {
            color = "#FFFFFF";
        }
        else {
            color = "#DDEEFF";
        }
        const star = {

            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: size,
            speed: speed,
            color: color

        };
        stars.push(star);
    }
}
function drawStars() {

    for (const star of stars) {

        ctx.fillStyle = star.color;

        ctx.beginPath();
        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function updateStars() {

    for (const star of stars) {

        star.y += star.speed;

        if (star.y > canvas.height) {

            star.y = -10;

            star.x = Math.random() * canvas.width;

        }
    }
}

function move(ship, angleOffset) {

    const angle = (ship.rotation + angleOffset) * Math.PI / 180;

    ship.x += Math.sin(angle) * ship.speed;

    ship.y -= Math.cos(angle) * ship.speed;

}
function getDirectionVector(ship, angleOffset) {

    const angle = (ship.rotation + angleOffset) * Math.PI / 180;

    return {

        x: Math.sin(angle),

        y: -Math.cos(angle)

    };

}

    function updatePlayer() {

        if (leMichShip.damageTimer > 0) {
            leMichShip.damageTimer--;
        }

        //cooldown lemich CANONS
        if (leMichShip.fireCooldown > 0) {
            leMichShip.fireCooldown--;
        }
        // cooldown missiles
        if (leMichShip.missileCooldown > 0) {
            leMichShip.missileCooldown--;
        }



        //leMichShip controls
        if (keys["q"]) {
            move(leMichShip, -90);
        }
        if (keys["d"]) {
            move(leMichShip, 90);
        }
        if (keys["z"]) {
            move(leMichShip, 0);
        }
        if (keys["s"]) {
            move(leMichShip, 180);
        }
        if (keys["Space"] && leMichShip.fireCooldown === 0) {

            shoot(
                leMichShip,
                leMichShip.frontCannons,
                0
            );
            leMichShip.fireCooldown = 10;
        }
        if (keys["a"]) {
            leMichShip.rotation -= leMichShip.rotationSpeed;
        }
        if (keys["e"]) {
            leMichShip.rotation += leMichShip.rotationSpeed;
        }
        if (keys["1"] && leMichShip.fireCooldown === 0) {

            shoot(
                leMichShip,
                leMichShip.leftCannons,
                -90
            );

            leMichShip.fireCooldown = 10;
        }

        if (keys["3"] && leMichShip.fireCooldown === 0) {

            shoot(
                leMichShip,
                leMichShip.rightCannons,
                90
            );

            leMichShip.fireCooldown = 10;
        }
        if (keys["2"] && leMichShip.missileCooldown === 0) {

            createMissile(
                leMichShip
            );
            leMichShip.missileCooldown = 180;

        }

//cooldown clemship

        if (ClemShip.fireCooldown > 0) {
            ClemShip.fireCooldown--;
        }


// clemShip controls

        if (keys[""]) {

            ClemShip.x -= ClemShip.speed;
        }
        if (keys[""]) {

            ClemShip.x += ClemShip.speed;
        }
        if (keys[""]) {

            ClemShip.y -= ClemShip.speed;
        }
        if (keys[""]) {

            ClemShip.y += ClemShip.speed;
        }
       // if (keys[""] && ClemShip.fireCooldown === 0) {

           // shoot(ClemShip);
           // {
               // ClemShip.fireCooldown = 10;
           // }
       // }
    }
    function updateBullets() {
            for (const bullet of bullets) {
                bullet.x += bullet.speedX;
                bullet.y += bullet.speedY;
            }
            //bullets = bullets.filter(function (bullet) {
            // return bullet.alive && bullet.y + bullet.height > 0;
            //});
        }
    function updateMissiles() {

        for (const missile of missiles) {
            missile.x += missile.speedX;
            missile.y += missile.speedY;
        }
    }
function updateExplosions() {

    for (const explosion of explosions) {

        explosion.animationTimer++;

        if (explosion.animationTimer >= 5) {
            explosion.frame++;22222

            explosion.animationTimer = 0;
        }

        if (explosion.frame >= 12) {
            explosion.alive = false;
        }
    }
}

    function updateEnemyBullets() {

        for (const bullet of enemyBullets) {

            bullet.x += bullet.speedX;
            bullet.y += bullet.speedY;
        }
    }

//-----------------------------------------------------------------------------------------------------------------ENEMY
function updateScout(enemy) {  //------------------------------------scoot

    enemy.y += enemy.speed;
    enemy.x += Math.sin(enemy.y * 0.03 + enemy.offset) * 2;
}

function updateFrigate(enemy) { //------------------------------------fregate

    if (enemy.state === "entering") {
        enemy.y += enemy.speed;

        if (enemy.y >= 250) {
            enemy.state = "aiming";
            enemy.aimTimer = 60;
        }
    }

    else if (enemy.state === "aiming") {
        enemy.aimTimer--;
        if (enemy.aimTimer <= 0) {
            enemy.state = "firing";
        }
    }
    else if (enemy.state === "firing") {
        enemy.fireCooldown--;
        if (enemy.fireCooldown <= 0) {
            createEnemyBullet(enemy);
            enemy.fireCooldown = 120;
        }
    }
}
function updateBattleship(enemy) {  //---------------------------------------------------------croisseur

    if (enemy.state === "entering") {
        enemy.y += enemy.speed;

        if (enemy.y >= 120) {
            enemy.state = "aiming";
            enemy.aimTimer = 120;
        }
    }
    else if (enemy.state === "aiming") {
        enemy.aimTimer--;

        if (enemy.aimTimer <= 0) {
            enemy.state = "firing";
            enemy.attackPhase = 0;
            enemy.phaseTimer = 30;
        }

    }
    else if (enemy.state === "firing") {

        enemy.phaseTimer--;
        if (enemy.phaseTimer <= 0) {
            if (enemy.attackPhase === 0) {
                fireBattery(enemy, enemy.frontBattery, 0, 8);
            }
            else if (enemy.attackPhase === 1) {
                fireBattery(enemy, enemy.leftBattery, -2, 8);
            }
            else if (enemy.attackPhase === 2) {
                fireBattery(enemy, enemy.rightBattery, 2, 8);
            }

            enemy.attackPhase++;

            if (enemy.attackPhase > 2) {
                enemy.attackPhase = 0;
                enemy.phaseTimer = 120; // recharge entre 2 salves
            } else {
                enemy.phaseTimer = 20; // délai tourelle
            }
        }
    }
}

function updateEnemies() {

    for (const enemy of enemies) {

        if (enemy.moveType === "zigzag") {
            updateScout(enemy);
        }

        else if (enemy.name === "Frigate") {
            updateFrigate(enemy);
        }

        else if (enemy.name === "Battleship") {
            updateBattleship(enemy);
        }
    }
}
//-------------------------------------------------------------------------------------------------------------------------
        function cleanObjects() {

            bullets = bullets.filter(function (bullet) {

                return bullet.alive && bullet.y + bullet.height > 0;
            });

            missiles = missiles.filter(function (missile) {

                return missile.alive &&
                    missile.x > -100 &&
                    missile.x < canvas.width + 100 &&
                    missile.y > -100 &&
                    missile.y < canvas.height + 100;
            });

            enemies = enemies.filter(function (enemy) {

                return enemy.alive && enemy.y < canvas.height;
            });

            enemyBullets = enemyBullets.filter(function (bullet) {

                return bullet.alive && bullet.y < canvas.height;
            });
            explosions = explosions.filter(function(explosion){

                return explosion.alive;
            });

        }


function checkCollision(a, b) {

    const leftA =
        a.x + (a.width - a.hitboxWidth) / 2;
    const rightA =
        leftA + a.hitboxWidth;
    const topA =
        a.y + (a.height - a.hitboxHeight) / 2;
    const bottomA =
        topA + a.hitboxHeight;


    const leftB =
        b.x + (b.width - b.hitboxWidth) / 2;
    const rightB =
        leftB + b.hitboxWidth;
    const topB =
        b.y + (b.height - b.hitboxHeight) / 2;
    const bottomB =
        topB + b.hitboxHeight;



    return !(

        rightA < leftB ||
        leftA > rightB ||
        bottomA < topB ||
        topA > bottomB
    );

}

        function checkBulletHits() {

            for (const bullet of bullets) {
                for (const enemy of enemies) {
                    if (checkCollision(bullet, enemy)) {

                        bullet.alive = false;
                        enemy.health--;
                        if (enemy.health <= 0) {

                            enemy.alive = false;

                            leMichShip.score += enemy.score;

                        }
                    }
                }
            }
        }
function checkMissileHits() {

    for (const missile of missiles) {
        for (const enemy of enemies) {
            if (checkCollision(missile, enemy)) {
                missile.alive = false;
                createExplosion(
                    missile.x + missile.width / 2,
                    missile.y + missile.height / 2,
                    20,
                    200
                );
                break;
            }
        }
    }
}
function checkExplosionDamage() {

    for (const explosion of explosions) {

        if (explosion.hasDamaged) {

            continue;

        }

        for (const enemy of enemies) {

            const centerX = enemy.x + enemy.width / 2;
            const centerY = enemy.y + enemy.height / 2;
            const dx = centerX - explosion.x;
            const dy = centerY - explosion.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= explosion.radius) {
                enemy.health -= explosion.damage;
            }
            if (enemy.health <= 0) {

                enemy.alive = false;

                leMichShip.score += enemy.score;
            }
        }
        explosion.hasDamaged = true;
    }
}
function checkEnemyHits() {
    for (const enemy of enemies) {
        if (checkCollision(enemy, leMichShip)) {

            enemy.alive = false;
            leMichShip.lives = leMichShip.lives -1;
        } if (leMichShip.lives <= 0) {

            gameState = GAMESTATE.GAMEOVER;

        }
    }
}
function checkEnemyBulletHits() {

    for (const bullet of enemyBullets) {

        if (checkCollision(bullet, leMichShip)) {
            bullet.alive = false;
            leMichShip.lives-= 1;
            leMichShip.damageTimer = 15;

            if (leMichShip.lives <= 0) {
                gameState = GAMESTATE.GAMEOVER;

            }
        }
    }
}

        function update() {

            if (alertTimer > 0) {
                alertTimer--;
            }

            updateStars();
            updatePlayer();
            updateBullets();
            updateMissiles();
            updateExplosions();
            updateEnemyBullets();
            updateEnemies();
            checkBulletHits();
            checkEnemyBulletHits();
            checkEnemyHits();
            checkMissileHits();
            checkExplosionDamage();
            cleanObjects();


            if (enemies.length === 0) {
                waveCooldown--;
                if (waveCooldown <= 0) {
                    spawnWave();
                    currentWave++;
                    waveCooldown = 120;
                }
            }
        }

function drawShipInformations() {

    ctx.textAlign = "left";

    ctx.fillStyle = "#D8D8D8";

    ctx.font = "24px Consolas";

    ctx.fillText(
        "USS LEMICH",
        30,
        40
    );

    ctx.fillStyle = "#59B5FF";

    ctx.fillText(
        "CONFÉDÉRATION TERRIENNE",
        30,
        70
    );

}

function drawBar(x, y, width, height, value, maxValue, color) {
    ctx.fillStyle = "#303030";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );
    ctx.fillStyle = color;

    ctx.fillRect(
        x,
        y,
        width * value / maxValue,
        height
    );
    ctx.strokeStyle = "#FFFFFF";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        x,
        y,
        width,
        height
    );

}

function drawShipBars() {

    ctx.fillStyle = "white";
    ctx.font = "20px Consolas";

    ctx.fillText(
        "COQUE",
        30,
        115
    );

    drawBar(
        150,
        100,
        250,
        20,
        leMichShip.lives,
        40,
        "#00CC44"
    );
    ctx.fillText(
        "BOUCLIER",
        30,
        165
    );

    drawBar(
        150,
        150,
        250,
        20,
        100,
        100,
        "#00AAFF"
    );
    ctx.fillText(
        "ÉNERGIE",
        30,
        215
    );

    drawBar(
        150,
        200,
        250,
        20,
        100,
        100,
        "#FFD700"
    );
}

function drawScore() {

    ctx.fillStyle = "white";

    ctx.font = "24px Consolas";

    ctx.fillText(
        "SCORE : " +
        leMichShip.score.toString().padStart(7, "0"),
        30,
        280
    );
}


function drawHUD() {

    // panneau

    ctx.fillStyle = "rgba(15,20,30,0.55)";
    ctx.fillRect(15,15,420,300);

    // cadre lumineux

    ctx.shadowColor = "#4BA3FF";
    ctx.shadowBlur = 10;

    ctx.strokeStyle = "#4BA3FF";
    ctx.lineWidth = 2;

    ctx.strokeRect(15,15,420,300);

    ctx.strokeStyle = "#1E6CB8";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        20,
        20,
        410,
        290
    );
    ctx.shadowBlur = 0;

    // séparateurs

    ctx.strokeStyle = "#3A4E66";

    ctx.beginPath();

    ctx.moveTo(25,90);
    ctx.lineTo(425,90);

    ctx.moveTo(25,240);
    ctx.lineTo(425,240);

    ctx.stroke();

    // contenu

    drawShipInformations();

    drawShipBars();

    drawScore();

}



// draw elements du jeu
function drawGame() {

    drawBackground();

    drawNebuleuse();

    drawStars();

    drawBullets();
    drawMissiles();
    drawEnemyBullets();
    drawExplosions();

    drawEnemies();

    drawShip(leMichShip);
    drawHitbox(leMichShip); //wip collision

    drawShip(ClemShip);
    drawHitbox(ClemShip); //wip collision

    drawHUD();
    drawAlert();
}

// boucle du jeu--------------------------------------------------------------------------
function gameLoop() {

    if (gameState === GAMESTATE.MENU) {
        drawMenu();
    }

    else if (gameState === GAMESTATE.GAME) {
        update();
        drawGame();
    }
    else if (gameState === GAMESTATE.GAMEOVER) {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}
createStars();
gameLoop();