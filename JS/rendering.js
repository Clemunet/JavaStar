
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
        "Appuie sur Entrée ou A",
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
        "Appuie sur Entrée ou A pour recommencer",
        viewport.width / 2,
        viewport.height / 2 + 80
    );

}
function startNewGame() {

    bullets = [];
    enemies = [];
    enemyBullets = [];

    leMichShip.lives = leMichShip.maxLives;
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
    nextBattleshipWave = 8 + Math.floor(Math.random() * 5);
    lastFrigateFormation = -1;
    resetAsteroidStorm();
    resetSupernovaEvent();
    resetLevelOneMission();
    resetBonuses();

    gameState = GAMESTATE.GAME;
    startMusic();
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
    const visualWidth = 18;
    const visualHeight = 42;
    ctx.save();
    ctx.translate(
        bullet.x + bullet.width / 2,
        bullet.y + bullet.height / 2
    );
    ctx.rotate(Math.atan2(bullet.speedY, bullet.speedX) + Math.PI / 2);
    ctx.shadowColor = "rgba(50, 190, 255, 0.9)";
    ctx.shadowBlur = 9;
    if (playerLaserImage.complete && playerLaserImage.naturalWidth) {
        ctx.drawImage(
            playerLaserImage,
            -visualWidth / 2,
            -visualHeight / 2,
            visualWidth,
            visualHeight
        );
    } else {
        ctx.fillStyle = "#56DFFF";
        ctx.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
    }
    ctx.restore();

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
let processedExplosionFrames = null;

function getProcessedExplosionFrames() {
    if (processedExplosionFrames) {
        return processedExplosionFrames;
    }
    if (!explosionImage.complete || !explosionImage.naturalWidth) {
        return null;
    }

    const columns = 4;
    const rows = 3;
    const frameWidth = explosionImage.naturalWidth / columns;
    const frameHeight = explosionImage.naturalHeight / rows;
    processedExplosionFrames = [];

    for (let frame = 0; frame < columns * rows; frame++) {
        const frameCanvas = document.createElement("canvas");
        frameCanvas.width = Math.round(frameWidth);
        frameCanvas.height = Math.round(frameHeight);
        const frameContext = frameCanvas.getContext("2d", { willReadFrequently: true });

        frameContext.drawImage(
            explosionImage,
            frame % columns * frameWidth,
            Math.floor(frame / columns) * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            frameCanvas.width,
            frameCanvas.height
        );

        const imageData = frameContext.getImageData(
            0,
            0,
            frameCanvas.width,
            frameCanvas.height
        );
        const pixels = imageData.data;
        const centerX = frameCanvas.width / 2;
        const centerY = frameCanvas.height / 2;
        const maxRadius = Math.min(centerX, centerY);

        for (let y = 0; y < frameCanvas.height; y++) {
            for (let x = 0; x < frameCanvas.width; x++) {
                const index = (y * frameCanvas.width + x) * 4;
                const brightness = Math.max(
                    pixels[index],
                    pixels[index + 1],
                    pixels[index + 2]
                );
                const backgroundRemoval = Math.max(
                    0,
                    Math.min(1, (brightness - 42) / 70)
                );
                const distance = Math.hypot(x - centerX, y - centerY);
                const edgeFade = Math.max(
                    0,
                    Math.min(1, (maxRadius - distance) / (maxRadius * 0.28))
                );

                pixels[index + 3] = Math.round(
                    pixels[index + 3] * backgroundRemoval * edgeFade
                );
            }
        }

        frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
        frameContext.putImageData(imageData, 0, 0);
        processedExplosionFrames.push(frameCanvas);
    }

    return processedExplosionFrames;
}

function drawExplosions() {

    const frames = getProcessedExplosionFrames();
    if (!frames) {
        return;
    }

    for (const explosion of explosions) {

        if (!explosion.alive) continue;

        const animationProgress = explosion.frame / explosion.frameCount;
        const scale = (0.48 + Math.sin(animationProgress * Math.PI) * 0.12)
            * explosion.visualScale;
        const fadeOut = animationProgress > 0.75
            ? (1 - animationProgress) / 0.25
            : 1;

        const frameImage = frames[explosion.frame];
        if (!frameImage) continue;
        const drawWidth = frameImage.width * scale;
        const drawHeight = frameImage.height * scale;

        ctx.save();
        ctx.globalAlpha = Math.max(0, fadeOut);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(
            frameImage,
            explosion.x - drawWidth / 2,
            explosion.y - drawHeight / 2,
            drawWidth,
            drawHeight
        );
        ctx.restore();

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

function createExplosion(x, y, damage, radius, visualScale = 1) {

    const explosion = {

        x: x,
        y: y,
        damage: damage,
        radius: radius,
        visualScale: visualScale,
        animationTimer: 0,
        frame: 0,
        frameCount: 12,
        frameDuration: 3,

        hasDamaged: false,

        alive: true

    };
    explosions.push(explosion);
    screenShake = Math.max(screenShake, 8);
    playTone(70, 0.35, 0.06, "sawtooth");
}



function drawEnemyBullets() {

    for (const bullet of enemyBullets) {

        ctx.save();
        const isRadial = bullet.type === "battleship-radial";
        const isBattleship = bullet.type === "battleship" || isRadial;
        const visualWidth = isRadial ? 20 : (isBattleship ? 26 : 16);
        const visualHeight = isRadial ? 34 : (isBattleship ? 52 : 36);
        ctx.translate(
            bullet.x + bullet.width / 2,
            bullet.y + bullet.height / 2
        );
        ctx.rotate(Math.atan2(bullet.speedY, bullet.speedX) + Math.PI / 2);
        ctx.shadowColor = isRadial
            ? "rgba(255, 190, 35, 0.95)"
            : "rgba(255, 45, 20, 0.9)";
        ctx.shadowBlur = isBattleship ? 14 : 9;
        if (isRadial) ctx.filter = "hue-rotate(18deg) brightness(1.18)";

        if (enemyLaserImage.complete && enemyLaserImage.naturalWidth) {
            ctx.drawImage(
                enemyLaserImage,
                -visualWidth / 2,
                -visualHeight / 2,
                visualWidth,
                visualHeight
            );
        } else {
            ctx.fillStyle = isRadial ? "#FFCC33" : "#FF4422";
            ctx.fillRect(
                -bullet.width / 2,
                -bullet.height / 2,
                bullet.width,
                bullet.height
            );
        }

        ctx.restore();

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



