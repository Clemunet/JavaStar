const LEVEL_FOUR_DURATION = 75 * 60;
const LEVEL_FOUR_LAUNCH_DURATION = 9 * 60;

const levelFourPlayer = {
    x: 0, y: 0, width: 118, height: 132, speed: 9.2,
    health: 100, shield: 120, maxShield: 120, damageTimer: 0,
    shieldDelay: 0, fireCooldown: 0, rotation: 0
};

const levelFour = {
    elapsed: 0, spawnTimer: 0, bullets: [], enemyBullets: [], enemies: [],
    particles: [], destroyed: 0, failureReason: ""
};

function beginLevelFourIntro() {
    gameState = GAMESTATE.LEVELFOUR_INTRO;
    updateMusicState();
}

function startLevelFour() {
    Object.assign(levelFourPlayer, {
        x: viewport.width / 2 - 59, y: viewport.height - 235,
        health: 100, shield: 120, damageTimer: 0, shieldDelay: 0,
        fireCooldown: 0, rotation: 0
    });
    levelFour.elapsed = 0;
    levelFour.spawnTimer = 75;
    levelFour.bullets = [];
    levelFour.enemyBullets = [];
    levelFour.enemies = [];
    levelFour.destroyed = 0;
    levelFour.failureReason = "";
    levelFour.particles = Array.from({ length: 150 }, function () {
        return {
            x: Math.random() * viewport.width,
            y: Math.random() * viewport.height,
            size: 1 + Math.random() * 3,
            speed: 3 + Math.random() * 9
        };
    });
    gameState = GAMESTATE.LEVELFOUR;
    startMusic();
}

function levelFourOverlap(a, b) {
    const paddingA = a === levelFourPlayer ? 28 : 0;
    return a.x + paddingA < b.x + b.width && a.x + a.width - paddingA > b.x
        && a.y + paddingA < b.y + b.height && a.y + a.height - paddingA > b.y;
}

// Les sprites de vaisseaux existants regardent vers le bas à 0 degré.
function getLevelFourShipRotation(vx, vy) {
    return Math.atan2(-vx, vy) * 180 / Math.PI;
}

function spawnLevelFourEnemy() {
    const progress = levelFour.elapsed / LEVEL_FOUR_DURATION;
    const roll = Math.random();
    const type = roll < 0.68 ? "scout" : roll < 0.92 ? "frigate" : "cruiser";
    const stats = type === "scout"
        ? { width: 74, height: 74, health: 3, image: scoutImage, speed: 8.5 }
        : type === "frigate"
            ? { width: 150, height: 150, health: 12, image: frigateImage, speed: 5.2 }
            : { width: 205, height: 300, health: 32, image: battleshipImage, speed: 3.7 };
    const fromSide = Math.random() < 0.25 + progress * 0.2;
    let x, y, vx, vy;
    if (fromSide) {
        const left = Math.random() < 0.5;
        x = left ? -stats.width - 30 : viewport.width + 30;
        y = 120 + Math.random() * (viewport.height * 0.62);
        vx = (left ? 1 : -1) * (stats.speed + Math.random() * 3);
        vy = 1.8 + Math.random() * 4.5;
    } else {
        x = 40 + Math.random() * (viewport.width - stats.width - 80);
        y = -stats.height - 30;
        vx = (Math.random() - 0.5) * (3 + progress * 4);
        vy = stats.speed + Math.random() * 3 + progress * 2;
    }
    levelFour.enemies.push({
        x, y, vx, vy, width: stats.width, height: stats.height,
        health: stats.health, maxHealth: stats.health, image: stats.image,
        type, alive: true, fireTimer: 30 + Math.floor(Math.random() * 100),
        rotation: getLevelFourShipRotation(vx, vy)
    });
}

function fireLevelFourEnemy(enemy) {
    const dx = levelFourPlayer.x + levelFourPlayer.width / 2 - (enemy.x + enemy.width / 2);
    const dy = levelFourPlayer.y + levelFourPlayer.height / 2 - (enemy.y + enemy.height / 2);
    const length = Math.max(1, Math.hypot(dx, dy));
    const speed = enemy.type === "scout" ? 8 : 6;
    levelFour.enemyBullets.push({
        x: enemy.x + enemy.width / 2 - 6, y: enemy.y + enemy.height / 2 - 6,
        width: 12, height: 24,
        vx: dx / length * speed, vy: dy / length * speed,
        speedX: dx / length * speed, speedY: dy / length * speed,
        damage: enemy.type === "cruiser" ? 18 : 12,
        type: enemy.type === "cruiser" ? "battleship" : "frigate", alive: true
    });
}

function damageLevelFourPlayer(amount) {
    if (levelFourPlayer.damageTimer > 0) return;
    const absorbed = Math.min(levelFourPlayer.shield, amount);
    levelFourPlayer.shield -= absorbed;
    levelFourPlayer.health -= amount - absorbed;
    levelFourPlayer.damageTimer = 45;
    levelFourPlayer.shieldDelay = 150;
    screenShake = Math.max(screenShake, 9);
    playTone(85, .2, .05, "sawtooth");
    if (levelFourPlayer.health <= 0) {
        levelFourPlayer.health = 0;
        levelFour.failureReason = "LE PROTOTYPE A ÉTÉ DÉTRUIT";
        gameState = GAMESTATE.LEVELFOUR_FAILED;
        updateMusicState();
    }
}

function updateLevelFour() {
    if (gameState !== GAMESTATE.LEVELFOUR) return;
    levelFour.elapsed++;
    let mx = 0, my = 0;
    if (keys.KeyQ || keys.q || keys.ArrowLeft) mx--;
    if (keys.KeyD || keys.d || keys.ArrowRight) mx++;
    if (keys.KeyZ || keys.z || keys.ArrowUp) my--;
    if (keys.KeyS || keys.s || keys.ArrowDown) my++;
    mx += gamepadState.moveX;
    my += gamepadState.moveY;
    const magnitude = Math.max(1, Math.hypot(mx, my));
    levelFourPlayer.x += mx / magnitude * levelFourPlayer.speed;
    levelFourPlayer.y += my / magnitude * levelFourPlayer.speed;
    levelFourPlayer.x = Math.max(18, Math.min(viewport.width - levelFourPlayer.width - 18, levelFourPlayer.x));
    levelFourPlayer.y = Math.max(85, Math.min(viewport.height - levelFourPlayer.height - 25, levelFourPlayer.y));
    // Le prototype fuit vers le haut de l'écran ; l'inclinaison accompagne
    // les déplacements latéraux sans retourner le vaisseau.
    levelFourPlayer.rotation = 180 - mx * 8;

    if (levelFourPlayer.fireCooldown > 0) levelFourPlayer.fireCooldown--;
    if ((keys.KeyF || keys.f || keys.Space || gamepadState.frontFire) && levelFourPlayer.fireCooldown <= 0) {
        for (const offset of [-29, 29]) levelFour.bullets.push({
            x: levelFourPlayer.x + levelFourPlayer.width / 2 + offset - 5,
            y: levelFourPlayer.y + 12, width: 10, height: 30,
            speedX: 0, speedY: -18, alive: true
        });
        levelFourPlayer.fireCooldown = 8;
        playPlayerLaserSound("front");
    }
    if (levelFourPlayer.damageTimer > 0) levelFourPlayer.damageTimer--;
    if (levelFourPlayer.shieldDelay > 0) levelFourPlayer.shieldDelay--;
    else levelFourPlayer.shield = Math.min(levelFourPlayer.maxShield, levelFourPlayer.shield + .18);

    const launchFactor = levelFour.elapsed < LEVEL_FOUR_LAUNCH_DURATION ? .55 : 1;
    for (const particle of levelFour.particles) {
        particle.y += particle.speed * launchFactor;
        if (particle.y > viewport.height) { particle.y = -5; particle.x = Math.random() * viewport.width; }
    }
    levelFour.spawnTimer--;
    if (levelFour.spawnTimer <= 0 && levelFour.elapsed > 180) {
        const progress = levelFour.elapsed / LEVEL_FOUR_DURATION;
        const count = Math.random() < .12 + progress * .28 ? 2 : 1;
        for (let i = 0; i < count; i++) spawnLevelFourEnemy();
        levelFour.spawnTimer = Math.max(20, 65 - progress * 32 + Math.random() * 28);
    }

    for (const bullet of levelFour.bullets) {
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;
        if (bullet.y < -50) bullet.alive = false;
        for (const enemy of levelFour.enemies) {
            if (!bullet.alive || !enemy.alive || !levelFourOverlap(bullet, enemy)) continue;
            bullet.alive = false;
            enemy.health--;
            if (enemy.health <= 0) {
                enemy.alive = false;
                levelFour.destroyed++;
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 0, 0, Math.min(1.8, enemy.width / 100));
            }
        }
    }
    for (const enemy of levelFour.enemies) {
        if (!enemy.alive) continue;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        enemy.fireTimer--;
        if (enemy.fireTimer <= 0 && enemy.y > 0 && enemy.y < viewport.height * .72) {
            fireLevelFourEnemy(enemy);
            enemy.fireTimer = enemy.type === "scout" ? 135 : 85;
        }
        if (levelFourOverlap(levelFourPlayer, enemy)) {
            damageLevelFourPlayer(enemy.type === "cruiser" ? 35 : 22);
            enemy.alive = false;
        }
        if (enemy.y > viewport.height + enemy.height + 80 || enemy.x < -enemy.width - 180
            || enemy.x > viewport.width + enemy.width + 180) enemy.alive = false;
    }
    for (const bullet of levelFour.enemyBullets) {
        bullet.x += bullet.vx; bullet.y += bullet.vy;
        if (levelFourOverlap(levelFourPlayer, bullet)) { bullet.alive = false; damageLevelFourPlayer(bullet.damage); }
        if (bullet.x < -80 || bullet.x > viewport.width + 80 || bullet.y < -80 || bullet.y > viewport.height + 80) bullet.alive = false;
    }
    levelFour.bullets = levelFour.bullets.filter(b => b.alive);
    levelFour.enemyBullets = levelFour.enemyBullets.filter(b => b.alive);
    levelFour.enemies = levelFour.enemies.filter(e => e.alive);
    updateExplosions();
    explosions = explosions.filter(explosion => explosion.alive);

    if (levelFour.elapsed >= LEVEL_FOUR_DURATION) {
        gameState = GAMESTATE.LEVELFOUR_COMPLETE;
        updateMusicState();
        playTone(660, .35, .05, "sine");
    }
}

function drawLevelFourBackground() {
    const launch = levelFour.elapsed < LEVEL_FOUR_LAUNCH_DURATION;
    const gradient = ctx.createLinearGradient(0, 0, 0, viewport.height);
    gradient.addColorStop(0, launch ? "#160E1D" : "#020615");
    gradient.addColorStop(1, "#07172B");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    if (launch) {
        const opening = 500 + levelFour.elapsed / LEVEL_FOUR_LAUNCH_DURATION * 520;
        ctx.fillStyle = "#1D232B";
        ctx.fillRect(0, 0, viewport.width / 2 - opening, viewport.height);
        ctx.fillRect(viewport.width / 2 + opening, 0, viewport.width, viewport.height);
        ctx.strokeStyle = "#E04D35"; ctx.lineWidth = 12;
        ctx.strokeRect(viewport.width / 2 - opening, -20, opening * 2, viewport.height + 40);
    }
    for (const p of levelFour.particles) {
        ctx.fillStyle = `rgba(185,225,255,${.35 + p.size / 5})`;
        ctx.fillRect(p.x, p.y, p.size, p.size * (1 + p.speed / 3));
    }
}

function drawLevelFourShip(image, object, rotation, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(object.x + object.width / 2, object.y + object.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    if (image.complete && image.naturalWidth) ctx.drawImage(image, -object.width / 2, -object.height / 2, object.width, object.height);
    else { ctx.fillStyle = "#8CA4B5"; ctx.fillRect(-object.width / 2, -object.height / 2, object.width, object.height); }
    ctx.restore();
}

function drawLevelFour() {
    drawLevelFourBackground();
    for (const enemy of levelFour.enemies) drawLevelFourShip(enemy.image, enemy, enemy.rotation);
    ctx.save(); ctx.shadowColor = "#54E8FF"; ctx.shadowBlur = 28;
    drawLevelFourShip(scoutImage, levelFourPlayer, levelFourPlayer.rotation, levelFourPlayer.damageTimer > 0 ? .45 : 1);
    ctx.restore();
    for (const bullet of levelFour.bullets) drawBullet(bullet);
    for (const bullet of levelFour.enemyBullets) {
        drawLevelFourEnemyLaser(bullet);
    }
    drawExplosions();
    drawLevelFourHud();
}

function drawLevelFourEnemyLaser(bullet) {
    const cruiserShot = bullet.type === "battleship";
    const visualWidth = cruiserShot ? 26 : 16;
    const visualHeight = cruiserShot ? 52 : 36;
    ctx.save();
    ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
    ctx.rotate(Math.atan2(bullet.speedY, bullet.speedX) + Math.PI / 2);
    ctx.shadowColor = "rgba(255,45,20,.9)";
    ctx.shadowBlur = cruiserShot ? 14 : 9;
    if (enemyLaserImage.complete && enemyLaserImage.naturalWidth) {
        ctx.drawImage(enemyLaserImage, -visualWidth / 2, -visualHeight / 2,
            visualWidth, visualHeight);
    } else {
        ctx.fillStyle = "#FF4422";
        ctx.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
    }
    ctx.restore();
}

function drawLevelFourHud() {
    const progress = Math.min(1, levelFour.elapsed / LEVEL_FOUR_DURATION);
    ctx.fillStyle = "rgba(2,8,20,.88)"; ctx.fillRect(28, 24, 520, 150);
    ctx.fillStyle = "#14253A"; ctx.fillRect(55, 55, 450, 22);
    ctx.fillStyle = "#54DEFF"; ctx.fillRect(55, 55, 450 * levelFourPlayer.shield / levelFourPlayer.maxShield, 22);
    ctx.fillStyle = "#14253A"; ctx.fillRect(55, 105, 450, 22);
    ctx.fillStyle = "#5DDB78"; ctx.fillRect(55, 105, 450 * levelFourPlayer.health / 100, 22);
    ctx.fillStyle = "white"; ctx.font = "17px Consolas"; ctx.textAlign = "left";
    ctx.fillText("BOUCLIER DU PROTOTYPE", 56, 50); ctx.fillText("COQUE", 56, 100);
    const barWidth = Math.min(850, viewport.width * .36), bx = viewport.width - barWidth - 50;
    ctx.fillStyle = "rgba(2,8,20,.88)"; ctx.fillRect(bx - 25, 25, barWidth + 50, 105);
    ctx.fillStyle = "#152236"; ctx.fillRect(bx, 72, barWidth, 22);
    ctx.fillStyle = "#F0B93D"; ctx.fillRect(bx, 72, barWidth * progress, 22);
    ctx.textAlign = "right"; ctx.fillStyle = "white"; ctx.font = "20px Consolas";
    ctx.fillText(progress < .12 ? "SORTIE DU HANGAR" : progress < .88 ? "TRAVERSÉE DE L'ARMADA" : "PÉRIMÈTRE EXTÉRIEUR", viewport.width - 50, 58);
    ctx.fillText("EXFILTRATION  " + Math.round(progress * 100) + "%", viewport.width - 50, 120);
    ctx.textAlign = "center"; ctx.fillStyle = "#9DB5CA"; ctx.font = "18px Consolas";
    ctx.fillText("SURVIVEZ — LE COMBAT EST OPTIONNEL", viewport.width / 2, viewport.height - 32);
}

function drawLevelFourIntro() {
    drawLevelFourBackground();
    ctx.fillStyle = "rgba(2,7,17,.94)"; ctx.fillRect(viewport.width / 2 - 760, 135, 1520, 1030);
    ctx.strokeStyle = "#F05A39"; ctx.lineWidth = 3; ctx.strokeRect(viewport.width / 2 - 760, 135, 1520, 1030);
    ctx.textAlign = "center"; ctx.fillStyle = "#F06A45"; ctx.font = "bold 62px Consolas";
    ctx.fillText("NIVEAU 4 — EXFILTRATION", viewport.width / 2, 260);
    ctx.fillStyle = "white"; ctx.font = "29px Consolas";
    ["Le ClemShip est inaccessible. La station entière est en alerte.",
        "Astris vole un prototype de chasseur Eclipse lourdement armé.",
        "L'armada converge déjà vers elle : il faut franchir le périmètre.",
        "Les ennemis ne s'arrêteront pas. Esquivez, survivez et échappez-vous."].forEach((line, i) => ctx.fillText(line, viewport.width / 2, 400 + i * 60));
    ctx.fillStyle = "#F3C742"; ctx.font = "25px Consolas";
    ctx.fillText("ZQSD / FLÈCHES / STICK — PILOTER   •   F / ESPACE / GÂCHETTE — TIRER", viewport.width / 2, 760);
    ctx.fillStyle = "#8BE9FF"; ctx.font = "bold 25px Consolas";
    ctx.fillText("OBJECTIF PRIORITAIRE : SURVIVRE JUSQU'À LA SORTIE", viewport.width / 2, 850);
    ctx.fillStyle = "white"; ctx.fillText("ENTRÉE / A — VOLER LE PROTOTYPE", viewport.width / 2, 990);
}

function drawLevelFourFailed() {
    ctx.fillStyle = "rgba(0,0,0,.82)"; ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.textAlign = "center"; ctx.fillStyle = "#FF554C"; ctx.font = "bold 70px Consolas";
    ctx.fillText("EXFILTRATION ÉCHOUÉE", viewport.width / 2, viewport.height / 2 - 80);
    ctx.fillStyle = "white"; ctx.font = "27px Consolas";
    ctx.fillText(levelFour.failureReason, viewport.width / 2, viewport.height / 2 + 5);
    ctx.fillText("ENTRÉE / A — REPRENDRE LA FUITE", viewport.width / 2, viewport.height / 2 + 105);
}

function drawLevelFourComplete() {
    drawLevelFourBackground();
    ctx.fillStyle = "rgba(0,3,12,.84)"; ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.textAlign = "center"; ctx.fillStyle = "#63E9FF"; ctx.font = "bold 76px Consolas";
    ctx.fillText("STATION DISTANCÉE", viewport.width / 2, viewport.height / 2 - 135);
    ctx.fillStyle = "white"; ctx.font = "30px Consolas";
    ctx.fillText("Astris a franchi le blocus à bord du prototype Eclipse.", viewport.width / 2, viewport.height / 2 - 30);
    ctx.fillText("Chasseurs détruits : " + levelFour.destroyed + " — mais l'essentiel était de survivre.", viewport.width / 2, viewport.height / 2 + 30);
    ctx.fillStyle = "#F3C742"; ctx.fillText("LES PLANS DE L'ARMADA SONT SAUFS", viewport.width / 2, viewport.height / 2 + 105);
    ctx.fillStyle = "white"; ctx.fillText("ENTRÉE / A — REVENIR AU MENU", viewport.width / 2, viewport.height / 2 + 210);
}
