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
            if (!missile.target || !missile.target.alive) {
                missile.target = findClosestEnemy(missile).enemy;
            }

            if (missile.target) {
                const targetX = missile.target.x + missile.target.width / 2;
                const targetY = missile.target.y + missile.target.height / 2;
                const missileX = missile.x + missile.width / 2;
                const missileY = missile.y + missile.height / 2;
                const dx = targetX - missileX;
                const dy = targetY - missileY;
                const distance = Math.hypot(dx, dy);

                if (distance > 0) {
                    const speed = Math.hypot(missile.speedX, missile.speedY);
                    let directionX = missile.speedX / speed * (1 - missile.turnSpeed)
                        + dx / distance * missile.turnSpeed;
                    let directionY = missile.speedY / speed * (1 - missile.turnSpeed)
                        + dy / distance * missile.turnSpeed;
                    const directionLength = Math.hypot(directionX, directionY);
                    directionX /= directionLength;
                    directionY /= directionLength;
                    missile.speedX = directionX * speed;
                    missile.speedY = directionY * speed;
                }
            }

            missile.x += missile.speedX;
            missile.y += missile.speedY;
        }
    }
function updateExplosions() {

    for (const explosion of explosions) {

        explosion.animationTimer++;

        if (explosion.animationTimer >= explosion.frameDuration) {
            explosion.frame++;

            explosion.animationTimer -= explosion.frameDuration;
        }

        if (explosion.frame >= explosion.frameCount) {
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
            enemy.y = 250;
            enemy.state = "firing";
        }
    }

    if (enemy.state === "firing") {
        enemy.patrolTimer += 0.025;
        enemy.x += Math.sin(enemy.patrolTimer) * 1.4;
        enemy.x = Math.max(0, Math.min(viewport.width - enemy.width, enemy.x));
    }

    if (enemy.y + enemy.height / 2 > 0) {
        enemy.fireCooldown--;
        if (enemy.fireCooldown <= 0) {
            createEnemyBullet(enemy);
            enemy.fireCooldown = 100;
        }
    }
}
function updateBattleshipWeapons(enemy) {
    enemy.phaseTimer--;
    if (enemy.phaseTimer > 0) return;

    if (enemy.attackPhase === 0) {
        fireBattery(enemy, enemy.frontBattery, 0, 8);
    }
    else if (enemy.attackPhase === 1) {
        fireRadialBarrage(enemy, 20, 5);
    }
    else if (enemy.attackPhase === 2) {
        fireBattery(enemy, enemy.leftBattery, -3, 7);
        fireBattery(enemy, enemy.rightBattery, 3, 7);
    }

    enemy.attackPhase++;
    if (enemy.attackPhase > 2) {
        enemy.attackPhase = 0;
        enemy.phaseTimer = 72;
    } else {
        enemy.phaseTimer = 24;
    }
}

function updateBattleship(enemy) {  //---------------------------------------------------------croisseur

    if (enemy.state === "entering") {
        enemy.y += enemy.speed;

        if (enemy.y >= 120) {
            enemy.y = 120;
            enemy.state = "firing";
        }
    }

    if (enemy.state === "firing") {
        enemy.patrolTimer += 0.012;
        enemy.x += Math.sin(enemy.patrolTimer) * 0.8;
        enemy.x = Math.max(0, Math.min(viewport.width - enemy.width, enemy.x));
    }

    if (enemy.y + enemy.height / 2 > 0) {
        updateBattleshipWeapons(enemy);
    }
}

function updateEnemies() {

    for (const enemy of enemies) {

        if (enemy.hitFlash > 0) {
            enemy.hitFlash--;
        }

        if (enemy.moveType === "zigzag") {
            updateScout(enemy);
        }

        else if (enemy.name === "Frigate") {
            updateFrigate(enemy);
        }

        else if (enemy.name === "Battleship" || enemy.isLevelBoss) {
            updateBattleship(enemy);
        }
    }
}
//-------------------------------------------------------------------------------------------------------------------------
