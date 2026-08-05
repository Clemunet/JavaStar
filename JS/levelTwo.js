const LEVEL_TWO_TIME_LIMIT = 85 * 60;
const LEVEL_TWO_COURSE_LENGTH = 21450;
const LEVEL_TWO_SCROLL_SPEED = 5;
const stationDeckImage = new Image();
stationDeckImage.src = "IMAGES/level2/station-deck.png";
const stationTurretImage = new Image();
stationTurretImage.src = "IMAGES/level2/station-turret.png";
const forceFieldImage = new Image();
forceFieldImage.src = "IMAGES/level2/force-field.png";
const maintenanceDroneImage = new Image();
maintenanceDroneImage.src = "IMAGES/level2/maintenance-drone.png";

const levelTwoPlayer = {
    x: 0, y: 0, width: 76, height: 76,
    speed: 8.2, rotation: 0, image: clemImage,
    damageTimer: 0, hitboxWidth: 44, hitboxHeight: 52
};

const levelTwo = {
    distance: 0,
    timeLeft: LEVEL_TWO_TIME_LIMIT,
    finishTime: 0,
    anchorY: 0,
    failureReason: "",
    fireCooldown: 0,
    bullets: [],
    turretBullets: [],
    obstacles: [],
    turrets: [],
    drones: []
};

const LEVEL_TWO_OBSTACLE_DISTANCES = [1900, 3250, 4700, 6250, 7900, 9600, 11300, 13050, 14600, 16450, 18300, 20200];
const LEVEL_TWO_TURRET_DISTANCES = [1350, 2750, 4100, 5450, 7000, 8550, 10150, 11850, 13650, 15100, 17150, 19100, 20700];
const LEVEL_TWO_DRONE_DISTANCES = [2350, 3900, 5200, 6750, 8250, 9900, 11550, 13250, 14950, 16650, 18150, 19650, 20900];

function skipToNextLevelForDevelopment() {
    cancelLevelOneVictoryTransition();
    const levelTwoStates = [
        GAMESTATE.LEVELTWO_INTRO,
        GAMESTATE.LEVELTWO,
        GAMESTATE.LEVELTWO_PAUSE,
        GAMESTATE.LEVELTWO_FAILED
    ];
    if (levelTwoStates.includes(gameState)) {
        beginLevelThreeIntro();
        updateMusicState();
        return;
    }
    const levelThreeStates = [GAMESTATE.LEVELTHREE_INTRO, GAMESTATE.LEVELTHREE,
        GAMESTATE.LEVELTHREE_PAUSE, GAMESTATE.LEVELTHREE_FAILED];
    if (levelThreeStates.includes(gameState)) {
        gameState = GAMESTATE.LEVELTHREE_COMPLETE;
        updateMusicState();
        return;
    }
    const levelFourStates = [GAMESTATE.LEVELFOUR_INTRO, GAMESTATE.LEVELFOUR,
        GAMESTATE.LEVELFOUR_PAUSE, GAMESTATE.LEVELFOUR_FAILED];
    if (levelFourStates.includes(gameState)) {
        gameState = GAMESTATE.LEVELFOUR_COMPLETE;
        updateMusicState();
        return;
    }
    if (gameState === GAMESTATE.LEVELTHREE_COMPLETE) {
        beginLevelFourIntro();
        return;
    }
    if (gameState !== GAMESTATE.LEVELTWO_COMPLETE) {
        beginLevelTwoIntro();
        updateMusicState();
    }
}

function beginLevelTwoIntro() {
    levelTwo.distance = 0;
    levelTwo.timeLeft = LEVEL_TWO_TIME_LIMIT;
    levelTwo.failureReason = "";
    gameState = GAMESTATE.LEVELTWO_INTRO;
}

function startLevelTwo() {
    levelTwo.distance = 0;
    levelTwo.timeLeft = LEVEL_TWO_TIME_LIMIT;
    levelTwo.finishTime = 0;
    levelTwo.failureReason = "";
    levelTwo.fireCooldown = 0;
    levelTwo.bullets = [];
    levelTwo.turretBullets = [];
    levelTwo.obstacles = LEVEL_TWO_OBSTACLE_DISTANCES.map(function (distance, index) {
        return {
            worldDistance: distance,
            offset: ((index % 3) - 1) * 35,
            width: 510,
            height: 92,
            health: 5,
            alive: true
        };
    });
    levelTwo.turrets = LEVEL_TWO_TURRET_DISTANCES.map(function (distance, index) {
        return {
            worldDistance: distance,
            side: index % 2 === 0 ? -1 : 1,
            width: 86,
            height: 86,
            health: 7,
            cooldown: 40 + index * 9,
            alive: true
        };
    });
    levelTwo.drones = LEVEL_TWO_DRONE_DISTANCES.map(function (distance, index) {
        return {
            worldDistance: distance,
            direction: index % 2 === 0 ? 1 : -1,
            width: 96,
            height: 82,
            health: 3,
            alive: true
        };
    });
    levelTwo.anchorY = viewport.height * 0.76;
    levelTwoPlayer.y = levelTwo.anchorY - levelTwoPlayer.height / 2;
    levelTwoPlayer.x = getLevelTwoCourseCenter(0) - levelTwoPlayer.width / 2;
    levelTwoPlayer.rotation = 0;
    gameState = GAMESTATE.LEVELTWO;
    startMusic();
}

function resizeLevelTwo(scaleX, scaleY) {
    levelTwo.anchorY = viewport.height * 0.76;
    levelTwoPlayer.x *= scaleX;
    levelTwoPlayer.y *= scaleY;
}

function getLevelTwoCourseCenter(worldDistance) {
    const amplitude = Math.min(620, viewport.width * 0.25);
    const bend = Math.sin(worldDistance / 850) * 0.53
        + Math.sin(worldDistance / 315 + 0.7) * 0.19
        + Math.sin(worldDistance / 1770 + 1.5) * 0.28;
    const tightTurns = [3600, 7600, 10900, 13900, 17400, 20100].reduce(function (total, start, index) {
        const local = worldDistance - start;
        const direction = index % 2 === 0 ? 1 : -1;
        return total + direction * 0.38 * Math.sin(local / 155)
            * Math.exp(-(local * local) / (2 * 470 * 470));
    }, 0);
    return viewport.width / 2 + amplitude * (bend + tightTurns);
}

function getLevelTwoCourseHalfWidth(worldDistance) {
    return (350 + Math.sin(worldDistance / 470) * 45
        + Math.sin(worldDistance / 1250 + 0.6) * 25) * 0.7;
}

function getLevelTwoWorldAtY(screenY) {
    return levelTwo.distance + levelTwo.anchorY - screenY;
}

function failLevelTwo(reason) {
    if (gameState !== GAMESTATE.LEVELTWO) return;
    levelTwo.failureReason = reason;
    gameState = GAMESTATE.LEVELTWO_FAILED;
    playTone(85, 0.55, 0.08, "sawtooth");
}

function updateLevelTwo() {
    if (gameState !== GAMESTATE.LEVELTWO) return;
    let moveX = 0;
    let moveY = 0;
    if (keys["q"] || keys["Q"] || keys["KeyQ"] || keys["ArrowLeft"]) moveX--;
    if (keys["d"] || keys["D"] || keys["KeyD"] || keys["ArrowRight"]) moveX++;
    if (keys["z"] || keys["Z"] || keys["KeyZ"] || keys["ArrowUp"]) moveY--;
    if (keys["s"] || keys["S"] || keys["KeyS"] || keys["ArrowDown"]) moveY++;
    moveX += gamepadState.moveX;
    moveY += gamepadState.moveY;
    const magnitude = Math.hypot(moveX, moveY);
    if (magnitude > 1) { moveX /= magnitude; moveY /= magnitude; }

    levelTwoPlayer.x += moveX * levelTwoPlayer.speed;
    levelTwoPlayer.y += moveY * levelTwoPlayer.speed;
    levelTwoPlayer.y = Math.max(viewport.height * 0.18, Math.min(
        viewport.height - levelTwoPlayer.height - 45,
        levelTwoPlayer.y
    ));
    levelTwoPlayer.rotation += (moveX * 14 - levelTwoPlayer.rotation) * 0.16;

    if (levelTwo.fireCooldown > 0) levelTwo.fireCooldown--;
    const wantsToFire = keys["Space"] || gamepadState.frontFire;
    if (wantsToFire && levelTwo.fireCooldown <= 0) {
        levelTwo.bullets.push({
            x: levelTwoPlayer.x + levelTwoPlayer.width / 2 - 7,
            y: levelTwoPlayer.y - 20,
            width: 14,
            height: 34,
            speedY: -18,
            alive: true
        });
        levelTwo.fireCooldown = 9;
        playPlayerLaserSound("front");
    }

    levelTwo.distance += LEVEL_TWO_SCROLL_SPEED;
    levelTwo.timeLeft--;
    updateLevelTwoCombat();
    if (gameState !== GAMESTATE.LEVELTWO) return;
    const playerCenterX = levelTwoPlayer.x + levelTwoPlayer.width / 2;
    const playerCenterY = levelTwoPlayer.y + levelTwoPlayer.height / 2;
    const worldDistance = getLevelTwoWorldAtY(playerCenterY);
    const safeHalfWidth = getLevelTwoCourseHalfWidth(worldDistance)
        - levelTwoPlayer.hitboxWidth / 2 - 10;

    if (Math.abs(playerCenterX - getLevelTwoCourseCenter(worldDistance)) > safeHalfWidth) {
        failLevelTwo("LE CLEMSHIP A HEURTÉ LA STRUCTURE");
        return;
    }
    if (levelTwo.timeLeft <= 0) {
        failLevelTwo("LES SAS SE SONT REFERMÉS");
        return;
    }
    if (levelTwo.distance >= LEVEL_TWO_COURSE_LENGTH) {
        levelTwo.finishTime = LEVEL_TWO_TIME_LIMIT - levelTwo.timeLeft;
        gameState = GAMESTATE.LEVELTWO_COMPLETE;
    }
}

function getLevelTwoEntityRect(entity) {
    const center = getLevelTwoCourseCenter(entity.worldDistance);
    const halfWidth = getLevelTwoCourseHalfWidth(entity.worldDistance);
    let x = center + (entity.offset || 0) - entity.width / 2;
    if (entity.side) {
        x = center + entity.side * (halfWidth - entity.width * 0.25) - entity.width / 2;
    }
    return {
        x,
        y: levelTwo.anchorY - (entity.worldDistance - levelTwo.distance) - entity.height / 2,
        width: entity.width,
        height: entity.height
    };
}

function getLevelTwoDroneRect(drone) {
    const center = getLevelTwoCourseCenter(drone.worldDistance);
    const halfWidth = getLevelTwoCourseHalfWidth(drone.worldDistance);
    const entryDistance = drone.worldDistance - levelTwo.anchorY;
    const travelDistance = viewport.height + drone.height;
    const progress = Math.max(0, Math.min(1, (levelTwo.distance - entryDistance) / travelDistance));
    const leftX = center - halfWidth + drone.width * 0.5;
    const rightX = center + halfWidth - drone.width * 0.5;
    const directedProgress = drone.direction > 0 ? progress : 1 - progress;
    return {
        x: leftX + (rightX - leftX) * directedProgress - drone.width / 2,
        y: levelTwo.anchorY - (drone.worldDistance - levelTwo.distance) - drone.height / 2,
        width: drone.width,
        height: drone.height
    };
}

function levelTwoRectsOverlap(a, b, insetA = 0, insetB = 0) {
    return a.x + insetA < b.x + b.width - insetB
        && a.x + a.width - insetA > b.x + insetB
        && a.y + insetA < b.y + b.height - insetB
        && a.y + a.height - insetA > b.y + insetB;
}

function updateLevelTwoCombat() {
    const playerRect = {
        x: levelTwoPlayer.x + (levelTwoPlayer.width - levelTwoPlayer.hitboxWidth) / 2,
        y: levelTwoPlayer.y + (levelTwoPlayer.height - levelTwoPlayer.hitboxHeight) / 2,
        width: levelTwoPlayer.hitboxWidth,
        height: levelTwoPlayer.hitboxHeight
    };

    for (const bullet of levelTwo.bullets) {
        bullet.y += bullet.speedY;
        if (bullet.y + bullet.height < 0) bullet.alive = false;
        for (const target of [...levelTwo.obstacles, ...levelTwo.turrets, ...levelTwo.drones]) {
            if (!bullet.alive || !target.alive) continue;
            const targetRect = target.direction
                ? getLevelTwoDroneRect(target)
                : getLevelTwoEntityRect(target);
            if (levelTwoRectsOverlap(bullet, targetRect, 0, 10)) {
                bullet.alive = false;
                target.health--;
                playTone(target.health <= 0 ? 95 : 220, 0.1, 0.025, "square");
                if (target.health <= 0) target.alive = false;
            }
        }
    }
    levelTwo.bullets = levelTwo.bullets.filter(bullet => bullet.alive);

    for (const obstacle of levelTwo.obstacles) {
        if (!obstacle.alive) continue;
        const rect = getLevelTwoEntityRect(obstacle);
        if (levelTwoRectsOverlap(playerRect, rect, 3, 14)) {
            failLevelTwo("LE CLEMSHIP A PERCUTÉ UN OBSTACLE");
            return;
        }
    }

    for (const drone of levelTwo.drones) {
        if (!drone.alive) continue;
        const rect = getLevelTwoDroneRect(drone);
        if (levelTwoRectsOverlap(playerRect, rect, 3, 12)) {
            failLevelTwo("LE CLEMSHIP A PERCUTÉ UN DRONE DE MAINTENANCE");
            return;
        }
    }

    for (const turret of levelTwo.turrets) {
        if (!turret.alive) continue;
        const rect = getLevelTwoEntityRect(turret);
        if (rect.y > -150 && rect.y < viewport.height + 150) {
            turret.cooldown--;
            if (turret.cooldown <= 0) {
                const sourceX = rect.x + rect.width / 2;
                const sourceY = rect.y + rect.height / 2;
                const dx = playerRect.x + playerRect.width / 2 - sourceX;
                const dy = playerRect.y + playerRect.height / 2 - sourceY;
                const distance = Math.max(1, Math.hypot(dx, dy));
                levelTwo.turretBullets.push({
                    x: sourceX - 8, y: sourceY - 8, width: 16, height: 16,
                    speedX: dx / distance * 8.5,
                    speedY: dy / distance * 8.5,
                    alive: true
                });
                turret.cooldown = 82 + Math.floor(Math.random() * 35);
                playTone(160, 0.12, 0.022, "sawtooth");
            }
        }
    }

    for (const bullet of levelTwo.turretBullets) {
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY + LEVEL_TWO_SCROLL_SPEED;
        if (levelTwoRectsOverlap(playerRect, bullet, 2, 0)) {
            bullet.alive = false;
            failLevelTwo("LE CLEMSHIP A ÉTÉ TOUCHÉ PAR UNE TOURELLE");
            return;
        }
        if (bullet.x < -40 || bullet.x > viewport.width + 40
            || bullet.y < -40 || bullet.y > viewport.height + 40) bullet.alive = false;
    }
    levelTwo.turretBullets = levelTwo.turretBullets.filter(bullet => bullet.alive);
}

function buildLevelTwoEdges() {
    const left = [];
    const right = [];
    for (let y = -80; y <= viewport.height + 80; y += 32) {
        const worldDistance = getLevelTwoWorldAtY(y);
        const center = getLevelTwoCourseCenter(worldDistance);
        const halfWidth = getLevelTwoCourseHalfWidth(worldDistance);
        left.push({ x: center - halfWidth, y });
        right.push({ x: center + halfWidth, y });
    }
    return { left, right };
}

function traceLevelTwoLine(points) {
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
}

function drawLevelTwoStation() {
    ctx.fillStyle = "#070B12";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    if (!stationDeckImage.complete || !stationDeckImage.naturalWidth) return;
    const tileSize = 768;
    const offsetY = (levelTwo.distance * 0.72) % tileSize;
    ctx.save();
    ctx.globalAlpha = 0.8;
    for (let x = 0; x < viewport.width; x += tileSize) {
        for (let y = -tileSize + offsetY; y < viewport.height; y += tileSize) {
            ctx.drawImage(stationDeckImage, x, y, tileSize, tileSize);
        }
    }
    ctx.restore();
}

function drawLevelTwoCourse() {
    const edges = buildLevelTwoEdges();
    ctx.beginPath();
    edges.left.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    [...edges.right].reverse().forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    const corridor = ctx.createLinearGradient(0, 0, viewport.width, 0);
    corridor.addColorStop(0, "rgba(4, 10, 20, 0.95)");
    corridor.addColorStop(0.5, "rgba(13, 24, 38, 0.84)");
    corridor.addColorStop(1, "rgba(4, 10, 20, 0.95)");
    ctx.fillStyle = corridor;
    ctx.fill();

    for (const edge of [edges.left, edges.right]) {
        traceLevelTwoLine(edge);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
        ctx.lineWidth = 34;
        ctx.stroke();
        traceLevelTwoLine(edge);
        ctx.shadowColor = "#48DFFF";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "#55DFFF";
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    const finishWorld = LEVEL_TWO_COURSE_LENGTH;
    const finishY = levelTwo.anchorY - (finishWorld - levelTwo.distance);
    if (finishY > -80 && finishY < viewport.height + 80) {
        const center = getLevelTwoCourseCenter(finishWorld);
        const halfWidth = getLevelTwoCourseHalfWidth(finishWorld);
        ctx.fillStyle = "#F3C742";
        for (let x = center - halfWidth; x < center + halfWidth; x += 70) {
            ctx.fillRect(x, finishY - 14, 35, 28);
        }
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Consolas";
        ctx.textAlign = "center";
        ctx.fillText("SORTIE", center, finishY - 28);
    }
}

function drawLevelTwoHud() {
    const seconds = Math.max(0, Math.ceil(levelTwo.timeLeft / 60));
    const progress = Math.min(1, levelTwo.distance / LEVEL_TWO_COURSE_LENGTH);
    ctx.fillStyle = "rgba(3, 9, 18, 0.85)";
    ctx.fillRect(35, 30, 430, 118);
    ctx.strokeStyle = seconds <= 10 ? "#FF4D4D" : "#55DFFF";
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 30, 430, 118);
    ctx.textAlign = "left";
    ctx.fillStyle = seconds <= 10 ? "#FF6464" : "white";
    ctx.font = "bold 38px Consolas";
    ctx.fillText("TEMPS  " + seconds.toString().padStart(2, "0"), 58, 78);
    ctx.fillStyle = "#17283A";
    ctx.fillRect(58, 105, 382, 18);
    ctx.fillStyle = "#55DFFF";
    ctx.fillRect(58, 105, 382 * progress, 18);
    ctx.fillStyle = "#9DB6CC";
    ctx.font = "18px Consolas";
    ctx.fillText("SORTIE  " + Math.round(progress * 100) + "%", 58, 143);
}

function drawLevelTwoHazards() {
    for (const drone of levelTwo.drones) {
        if (!drone.alive) continue;
        const rect = getLevelTwoDroneRect(drone);
        if (rect.y < -rect.height || rect.y > viewport.height) continue;
        ctx.save();
        ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
        ctx.rotate(drone.direction > 0 ? Math.PI / 2 : -Math.PI / 2);
        ctx.shadowColor = "#FF9B24";
        ctx.shadowBlur = 9;
        if (maintenanceDroneImage.complete && maintenanceDroneImage.naturalWidth) {
            ctx.drawImage(
                maintenanceDroneImage,
                -rect.width / 2,
                -rect.height / 2,
                rect.width,
                rect.height
            );
        } else {
            ctx.fillStyle = "#E98222";
            ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
        }
        ctx.restore();
    }

    for (const obstacle of levelTwo.obstacles) {
        if (!obstacle.alive) continue;
        const rect = getLevelTwoEntityRect(obstacle);
        if (rect.y < -rect.height || rect.y > viewport.height) continue;
        ctx.save();
        ctx.globalAlpha = 0.88 + Math.sin(levelTwo.distance * 0.08 + obstacle.worldDistance) * 0.12;
        ctx.shadowColor = "#27CFFF";
        ctx.shadowBlur = 18;
        if (forceFieldImage.complete && forceFieldImage.naturalWidth) {
            ctx.drawImage(forceFieldImage, rect.x, rect.y, rect.width, rect.height);
        } else {
            ctx.fillStyle = "#28BFE8";
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        ctx.restore();
    }

    for (const turret of levelTwo.turrets) {
        if (!turret.alive) continue;
        const rect = getLevelTwoEntityRect(turret);
        if (rect.y < -rect.height || rect.y > viewport.height) continue;
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const aimAngle = Math.atan2(
            levelTwoPlayer.y + levelTwoPlayer.height / 2 - centerY,
            levelTwoPlayer.x + levelTwoPlayer.width / 2 - centerX
        );
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(aimAngle + Math.PI / 2);
        ctx.shadowColor = "#FF2B1C";
        ctx.shadowBlur = 10;
        if (stationTurretImage.complete && stationTurretImage.naturalWidth) {
            ctx.drawImage(stationTurretImage, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
        } else {
            ctx.fillStyle = "#4A2020";
            ctx.beginPath();
            ctx.arc(0, 0, rect.width * 0.43, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    for (const bullet of levelTwo.bullets) {
        ctx.save();
        ctx.shadowColor = "#55DFFF";
        ctx.shadowBlur = 12;
        if (playerLaserImage.complete && playerLaserImage.naturalWidth) {
            ctx.drawImage(playerLaserImage, bullet.x, bullet.y, bullet.width, bullet.height);
        } else {
            ctx.fillStyle = "#55DFFF";
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        ctx.restore();
    }

    for (const bullet of levelTwo.turretBullets) {
        ctx.save();
        ctx.fillStyle = "#FF493A";
        ctx.shadowColor = "#FF2018";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawLevelTwo() {
    drawLevelTwoStation();
    drawLevelTwoCourse();
    drawLevelTwoHazards();
    drawShip(levelTwoPlayer);
    drawLevelTwoHud();
}

function drawLevelTwoIntro() {
    levelTwo.anchorY = viewport.height * 0.76;
    drawLevelTwoStation();
    ctx.fillStyle = "rgba(3, 8, 18, 0.9)";
    ctx.fillRect(viewport.width / 2 - 680, viewport.height / 2 - 400, 1360, 800);
    ctx.strokeStyle = "#55DFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(viewport.width / 2 - 680, viewport.height / 2 - 400, 1360, 800);
    ctx.textAlign = "center";
    ctx.fillStyle = "#55DFFF";
    ctx.font = "bold 64px Consolas";
    ctx.fillText("NIVEAU 2", viewport.width / 2, viewport.height / 2 - 285);
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Consolas";
    ctx.fillText("LA BRÈCHE DE TITAN", viewport.width / 2, viewport.height / 2 - 220);
    ctx.font = "26px Consolas";
    const lines = [
        "Les données de l'Eclipse ont révélé une voie de maintenance",
        "au cœur d'une station ennemie gigantesque.",
        "Pilotez un ClemShip jusqu'à la sortie avant la fermeture des sas.",
        "Détruisez les obstacles et les tourelles qui verrouillent le passage.",
        "Évitez les drones de maintenance qui traversent le corridor.",
        "Une seule collision ou un tir ennemi suffit à interrompre la mission."
    ];
    lines.forEach((line, index) => ctx.fillText(line, viewport.width / 2, viewport.height / 2 - 145 + index * 40));
    ctx.fillStyle = "#F3C742";
    ctx.font = "bold 28px Consolas";
    ctx.fillText("OBJECTIF : ATTEINDRE LA SORTIE EN 85 SECONDES", viewport.width / 2, viewport.height / 2 + 145);
    ctx.fillStyle = "#A7BDD0";
    ctx.font = "22px Consolas";
    ctx.fillText("ZQSD / FLÈCHES / STICK GAUCHE — PILOTER", viewport.width / 2, viewport.height / 2 + 220);
    ctx.fillText("ESPACE / GÂCHETTE DROITE — TIRER", viewport.width / 2, viewport.height / 2 + 258);
    ctx.fillText("ENTRÉE / A — LANCER LA COURSE", viewport.width / 2, viewport.height / 2 + 325);
}

function drawLevelTwoFailed() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#FF5555";
    ctx.font = "bold 68px Consolas";
    ctx.fillText("ÉCHEC DE LA COURSE", viewport.width / 2, viewport.height / 2 - 90);
    ctx.fillStyle = "white";
    ctx.font = "30px Consolas";
    ctx.fillText(levelTwo.failureReason, viewport.width / 2, viewport.height / 2);
    ctx.fillStyle = "#A7BDD0";
    ctx.font = "22px Consolas";
    ctx.fillText("ENTRÉE / A — RÉESSAYER", viewport.width / 2, viewport.height / 2 + 100);
}

function drawLevelTwoComplete() {
    drawLevelTwoStation();
    const elapsedSeconds = (levelTwo.finishTime / 60).toFixed(1);
    ctx.fillStyle = "rgba(3, 8, 18, 0.88)";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#62E7FF";
    ctx.font = "bold 72px Consolas";
    ctx.fillText("CIRCUIT TERMINÉ", viewport.width / 2, viewport.height / 2 - 120);
    ctx.fillStyle = "white";
    ctx.font = "34px Consolas";
    ctx.fillText("Le ClemShip a franchi la station en " + elapsedSeconds + " secondes", viewport.width / 2, viewport.height / 2 - 30);
    ctx.fillStyle = "#F3C742";
    ctx.fillText("NIVEAU 2 — LA BRÈCHE DE TITAN", viewport.width / 2, viewport.height / 2 + 50);
    ctx.fillStyle = "#A7BDD0";
    ctx.font = "22px Consolas";
    ctx.fillText("ENTRÉE / A — LANCER LE NIVEAU 3", viewport.width / 2, viewport.height / 2 + 145);
}
