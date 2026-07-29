
function drawBackground() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
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
        viewport.width / 2,
        viewport.height / 2 - 100
    );

    ctx.font = "40px Arial";

    ctx.fillText(
        "Appuie sur Entrée",
        viewport.width / 2,
        viewport.height / 2
    );

}
function drawGameOver() {

    drawBackground();

    ctx.fillStyle = "red";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "GAME OVER",
        viewport.width / 2,
        viewport.height / 2 - 80
    );

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";

    ctx.fillText(
        "Score : " + leMichShip.score,
        viewport.width / 2,
        viewport.height / 2
    );

    ctx.fillText(
        "Appuie sur Entrée pour recommencer",
        viewport.width / 2,
        viewport.height / 2 + 80
    );

}
function startNewGame() {

    bullets = [];
    enemies = [];
    enemyBullets = [];

    leMichShip.lives = 40;
    leMichShip.shield = leMichShip.maxShield;
    leMichShip.shieldRegenDelay = 0;
    leMichShip.damageTimer = 0;
    leMichShip.energy = leMichShip.maxEnergy;
    leMichShip.energyWarningCooldown = 0;
    leMichShip.score = 0;
    leMichShip.fireCooldown = 10;
    leMichShip.missileCooldown = 0;

    leMichShip.x = viewport.width / 2 - leMichShip.width / 2;
    leMichShip.y = viewport.height - leMichShip.height - 50;

    leMichShip.rotation = 0;

    companions.forEach(function (companion, index) {
        companion.x = leMichShip.x + leMichShip.width / 2
            + (index === 0 ? 300 : -300);
        companion.y = leMichShip.y + leMichShip.height / 2;
        companion.rotation = 0;
        companion.fireCooldown = index * 12;
        companion.lives = companion.maxLives;
        companion.damageTimer = 0;
        companion.respawnTimer = 0;
        companion.active = true;
        companion.formationIndex = index * 2;
        companion.maneuverTimer = 240 + index * 60;
    });

    waveCooldown = 30;
    currentWave = 1;

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
    screenShake = Math.max(screenShake, 8);
    playTone(70, 0.35, 0.06, "sawtooth");
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
        ctx.save();
        if (enemy.hitFlash > 0) {
            ctx.globalAlpha = 0.45;
            ctx.shadowColor = "white";
            ctx.shadowBlur = 25;
        }
        ctx.drawImage(
            enemy.image,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
        ctx.restore();
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

        viewport.width / 2,

        70

    );

}



