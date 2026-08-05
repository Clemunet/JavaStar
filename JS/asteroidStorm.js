const ASTEROID_STORM_STATE = {
    WAITING: "waiting",
    WARNING: "warning",
    ACTIVE: "active"
};

let hazardAsteroids = [];
const asteroidStorm = {
    state: ASTEROID_STORM_STATE.WAITING,
    cooldown: 900,
    warningTimer: 0,
    spawnCooldown: 0,
    remainingAsteroids: 0,
    pattern: 1,
    horizontalEntrySide: "left"
};

function resetAsteroidStorm() {
    hazardAsteroids = [];
    asteroidStorm.state = ASTEROID_STORM_STATE.WAITING;
    asteroidStorm.cooldown = 900 + Math.floor(Math.random() * 600);
    asteroidStorm.warningTimer = 0;
    asteroidStorm.spawnCooldown = 0;
    asteroidStorm.remainingAsteroids = 0;
    asteroidStorm.pattern = 1;
    asteroidStorm.horizontalEntrySide = "left";
}

function startAsteroidStormWarning() {
    asteroidStorm.state = ASTEROID_STORM_STATE.WARNING;
    asteroidStorm.warningTimer = 180;
    asteroidStorm.pattern = 1 + Math.floor(Math.random() * 4);
    asteroidStorm.horizontalEntrySide = Math.random() < 0.5 ? "left" : "right";
    showAlert("⚠ TEMPÊTE D'ASTÉROÏDES DÉTECTÉE ⚠", 180);
    playTone(75, 0.8, 0.065, "sawtooth");
}

function spawnHazardAsteroid() {
    const size = 45 + Math.random() * 65;
    const health = Math.max(3, Math.ceil(size / 15));
    const entrySides = ["top", "left", "right"];
    let entrySide;
    let x;
    let y;
    let targetX;
    let targetY;

    if (asteroidStorm.pattern === 2) {
        entrySide = "top-right";
        x = viewport.width + size + Math.random() * 180;
        y = -size - Math.random() * 180;
        targetX = -size - Math.random() * 100;
        targetY = viewport.height + size + Math.random() * 100;
    }
    else if (asteroidStorm.pattern === 3) {
        entrySide = "top-left";
        x = -size - Math.random() * 180;
        y = -size - Math.random() * 180;
        targetX = viewport.width + size + Math.random() * 100;
        targetY = viewport.height + size + Math.random() * 100;
    }
    else if (asteroidStorm.pattern === 4) {
        entrySide = asteroidStorm.horizontalEntrySide;
        y = Math.random() * viewport.height * 0.9;
        targetY = Math.max(
            0,
            Math.min(viewport.height, y + (Math.random() - 0.5) * 300)
        );
        if (entrySide === "left") {
            x = -size - Math.random() * 120;
            targetX = viewport.width + size;
        } else {
            x = viewport.width + size + Math.random() * 120;
            targetX = -size;
        }
    }
    else {
        entrySide = entrySides[Math.floor(Math.random() * entrySides.length)];
        if (entrySide === "top") {
            x = Math.random() * viewport.width;
            y = -size - Math.random() * 120;
            targetX = Math.random() * viewport.width;
            targetY = viewport.height + size;
        }
        else if (entrySide === "left") {
            x = -size - Math.random() * 120;
            y = Math.random() * viewport.height * 0.85;
            targetX = viewport.width + size;
            targetY = Math.random() * viewport.height;
        }
        else {
            x = viewport.width + size + Math.random() * 120;
            y = Math.random() * viewport.height * 0.85;
            targetX = -size;
            targetY = Math.random() * viewport.height;
        }
    }

    const directionX = targetX - x;
    const directionY = targetY - y;
    const directionLength = Math.hypot(directionX, directionY);
    const speed = 5 + Math.random() * 2.5;

    hazardAsteroids.push({
        x,
        y,
        width: size,
        height: size,
        hitboxWidth: size * 0.72,
        hitboxHeight: size * 0.72,
        speedX: directionX / directionLength * speed,
        speedY: directionY / directionLength * speed,
        entrySide,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        damage: 25,
        health,
        maxHealth: health,
        hitFlash: 0,
        alive: true
    });
}

function updateAsteroidStorm() {
    if (asteroidStorm.state === ASTEROID_STORM_STATE.WAITING) {
        asteroidStorm.cooldown--;
        if (asteroidStorm.cooldown <= 0
            && (typeof isSupernovaEventBusy !== "function"
                || !isSupernovaEventBusy())) {
            startAsteroidStormWarning();
        }
    }
    else if (asteroidStorm.state === ASTEROID_STORM_STATE.WARNING) {
        asteroidStorm.warningTimer--;
        if (asteroidStorm.warningTimer <= 0) {
            asteroidStorm.state = ASTEROID_STORM_STATE.ACTIVE;
            asteroidStorm.remainingAsteroids = 24;
            asteroidStorm.spawnCooldown = 0;
            showAlert("IMPACT IMMINENT", 75);
        }
    }
    else if (asteroidStorm.state === ASTEROID_STORM_STATE.ACTIVE) {
        asteroidStorm.spawnCooldown--;
        if (asteroidStorm.remainingAsteroids > 0
            && asteroidStorm.spawnCooldown <= 0) {
            spawnHazardAsteroid();
            asteroidStorm.remainingAsteroids--;
            asteroidStorm.spawnCooldown = 10 + Math.floor(Math.random() * 9);
        }

        if (asteroidStorm.remainingAsteroids === 0
            && hazardAsteroids.length === 0) {
            asteroidStorm.state = ASTEROID_STORM_STATE.WAITING;
            asteroidStorm.cooldown = 1800 + Math.floor(Math.random() * 1200);
        }
    }

    for (const asteroid of hazardAsteroids) {
        asteroid.x += asteroid.speedX;
        asteroid.y += asteroid.speedY;
        asteroid.rotation += asteroid.rotationSpeed;
        if (asteroid.hitFlash > 0) asteroid.hitFlash--;
    }
}

function drawAsteroidStorm() {
    if (!backgroundImages.asteroid.complete
        || !backgroundImages.asteroid.naturalWidth) return;

    for (const asteroid of hazardAsteroids) {
        ctx.save();
        ctx.translate(
            asteroid.x + asteroid.width / 2,
            asteroid.y + asteroid.height / 2
        );
        ctx.rotate(asteroid.rotation);
        ctx.shadowColor = asteroid.hitFlash > 0
            ? "rgba(255, 255, 255, 0.9)"
            : "rgba(255, 150, 70, 0.45)";
        ctx.shadowBlur = asteroid.hitFlash > 0 ? 24 : 8;
        if (asteroid.hitFlash > 0) {
            ctx.globalAlpha = 0.55;
        }
        ctx.drawImage(
            backgroundImages.asteroid,
            -asteroid.width / 2,
            -asteroid.height / 2,
            asteroid.width,
            asteroid.height
        );
        ctx.restore();
        drawHitbox(asteroid);
    }
}

function destroyHazardAsteroid(asteroid) {
    if (!asteroid.alive) return;
    asteroid.alive = false;
    createExplosion(
        asteroid.x + asteroid.width / 2,
        asteroid.y + asteroid.height / 2,
        0,
        0,
        Math.max(0.45, asteroid.width / 130)
    );
}

function damageHazardAsteroid(asteroid, damage) {
    if (!asteroid.alive) return;

    asteroid.health -= damage;
    asteroid.hitFlash = 5;
    playTone(180, 0.045, 0.012, "square");
    if (asteroid.health <= 0) {
        destroyHazardAsteroid(asteroid);
    }
}

function checkAsteroidStormHits() {
    for (const bullet of bullets) {
        if (!bullet.alive) continue;
        for (const asteroid of hazardAsteroids) {
            if (!asteroid.alive || !checkCollision(bullet, asteroid)) continue;

            bullet.alive = false;
            damageHazardAsteroid(asteroid, bullet.damage ?? 1);
            break;
        }
    }

    for (const missile of missiles) {
        if (!missile.alive) continue;
        for (const asteroid of hazardAsteroids) {
            if (!asteroid.alive || !checkCollision(missile, asteroid)) continue;

            missile.alive = false;
            damageHazardAsteroid(asteroid, missile.damage);
            createExplosion(
                missile.x + missile.width / 2,
                missile.y + missile.height / 2,
                0,
                0,
                0.75
            );
            break;
        }
    }

    for (const asteroid of hazardAsteroids) {
        if (!asteroid.alive) continue;

        if (checkCollision(asteroid, leMichShip)) {
            damagePlayer(asteroid.damage);
            destroyHazardAsteroid(asteroid);
            continue;
        }

        for (const companion of companions) {
            if (companion.active && checkCollision(asteroid, companion)) {
                damageCompanion(companion, 1);
                destroyHazardAsteroid(asteroid);
                break;
            }
        }
        if (!asteroid.alive) continue;

        for (const enemy of enemies) {
            if (!enemy.alive || !checkCollision(asteroid, enemy)) continue;

            enemy.health -= asteroid.damage;
            enemy.hitFlash = 8;
            if (enemy.health <= 0) {
                destroyEnemy(enemy, false);
            }
            destroyHazardAsteroid(asteroid);
            break;
        }
    }
}

function cleanAsteroidStorm() {
    hazardAsteroids = hazardAsteroids.filter(function (asteroid) {
        return asteroid.alive
            && asteroid.x + asteroid.width > -200
            && asteroid.x < viewport.width + 200
            && asteroid.y + asteroid.height > -200
            && asteroid.y < viewport.height + 200;
    });
}
