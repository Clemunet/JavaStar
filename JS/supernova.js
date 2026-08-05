const SUPERNOVA_STATE = {
    WAITING: "waiting",
    WARNING: "warning",
    ACTIVE: "active"
};

const supernovaImage = new Image();
supernovaImage.src = "IMAGES/events/supernova.png";

const supernovaEvent = {
    state: SUPERNOVA_STATE.WAITING,
    cooldown: 3600 + Math.floor(Math.random() * 1800),
    warningTimer: 0,
    star: null
};

function isSupernovaEventBusy() {
    return supernovaEvent.state !== SUPERNOVA_STATE.WAITING;
}

function resetSupernovaEvent() {
    supernovaEvent.state = SUPERNOVA_STATE.WAITING;
    supernovaEvent.cooldown = 3600 + Math.floor(Math.random() * 1800);
    supernovaEvent.warningTimer = 0;
    supernovaEvent.star = null;
}

function startSupernovaWarning() {
    supernovaEvent.state = SUPERNOVA_STATE.WARNING;
    supernovaEvent.warningTimer = 240;
    showAlert("⚠ SUPERNOVA DÉTECTÉE — ÉVACUEZ LA TRAJECTOIRE ⚠", 240);
    playTone(48, 1.1, 0.075, "sawtooth");
}

function createSupernova() {
    const size = 220 + Math.random() * 100;
    const entrySide = ["top", "left", "right"][Math.floor(Math.random() * 3)];
    let x;
    let y;
    let targetX;
    let targetY;

    if (entrySide === "top") {
        x = Math.random() * Math.max(1, viewport.width - size);
        y = -size;
        targetX = Math.random() * viewport.width;
        targetY = viewport.height + size;
    } else if (entrySide === "left") {
        x = -size;
        y = Math.random() * viewport.height * 0.8;
        targetX = viewport.width + size;
        targetY = Math.random() * viewport.height;
    } else {
        x = viewport.width + size;
        y = Math.random() * viewport.height * 0.8;
        targetX = -size;
        targetY = Math.random() * viewport.height;
    }

    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.hypot(dx, dy);
    const speed = 3.2 + Math.random() * 1.4;
    supernovaEvent.star = {
        x, y, width: size, height: size,
        hitboxWidth: size * 0.58,
        hitboxHeight: size * 0.58,
        speedX: dx / distance * speed,
        speedY: dy / distance * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0.008 + Math.random() * 0.012,
        pulse: Math.random() * Math.PI * 2,
        entrySide,
        hitTargets: new Set()
    };
}

function updateSupernovaEvent() {
    if (supernovaEvent.state === SUPERNOVA_STATE.WAITING) {
        supernovaEvent.cooldown--;
        if (supernovaEvent.cooldown <= 0
            && asteroidStorm.state === ASTEROID_STORM_STATE.WAITING
            && hazardAsteroids.length === 0) {
            startSupernovaWarning();
        }
        return;
    }

    if (supernovaEvent.state === SUPERNOVA_STATE.WARNING) {
        supernovaEvent.warningTimer--;
        if (supernovaEvent.warningTimer <= 0) {
            supernovaEvent.state = SUPERNOVA_STATE.ACTIVE;
            createSupernova();
            showAlert("SUPERNOVA IMMINENTE", 90);
        }
        return;
    }

    const star = supernovaEvent.star;
    if (!star) return;
    star.x += star.speedX;
    star.y += star.speedY;
    star.rotation += star.rotationSpeed;
    star.pulse += 0.06;

    const margin = star.width * 1.5;
    if (star.x + star.width < -margin || star.x > viewport.width + margin
        || star.y + star.height < -margin || star.y > viewport.height + margin) {
        supernovaEvent.star = null;
        supernovaEvent.state = SUPERNOVA_STATE.WAITING;
        supernovaEvent.cooldown = 5400 + Math.floor(Math.random() * 3600);
    }
}

function drawSupernovaEvent() {
    const star = supernovaEvent.star;
    if (!star || !supernovaImage.complete || !supernovaImage.naturalWidth) return;
    const pulseScale = 1 + Math.sin(star.pulse) * 0.045;
    ctx.save();
    ctx.translate(star.x + star.width / 2, star.y + star.height / 2);
    ctx.rotate(star.rotation);
    ctx.scale(pulseScale, pulseScale);
    ctx.shadowColor = "rgba(255, 75, 180, 0.95)";
    ctx.shadowBlur = 45 + Math.sin(star.pulse) * 15;
    ctx.drawImage(supernovaImage, -star.width / 2, -star.height / 2, star.width, star.height);
    ctx.restore();
    drawHitbox(star);
}

function checkSupernovaHits() {
    const star = supernovaEvent.star;
    if (!star) return;

    if (!star.hitTargets.has(leMichShip) && checkCollision(star, leMichShip)) {
        star.hitTargets.add(leMichShip);
        damagePlayer(75);
        screenShake = Math.max(screenShake, 22);
    }

    for (const companion of companions) {
        if (companion.active && !star.hitTargets.has(companion)
            && checkCollision(star, companion)) {
            star.hitTargets.add(companion);
            damageCompanion(companion, 2);
        }
    }

    for (const enemy of enemies) {
        if (!enemy.alive || star.hitTargets.has(enemy) || !checkCollision(star, enemy)) continue;
        star.hitTargets.add(enemy);
        enemy.health -= 150;
        enemy.hitFlash = 12;
        if (enemy.health <= 0) destroyEnemy(enemy, false);
    }
}
