        function cleanObjects() {

            bullets = bullets.filter(function (bullet) {

                return bullet.alive && bullet.y + bullet.height > 0;
            });

            missiles = missiles.filter(function (missile) {

                return missile.alive &&
                    missile.x > -100 &&
                    missile.x < viewport.width + 100 &&
                    missile.y > -100 &&
                    missile.y < viewport.height + 100;
            });

            enemies = enemies.filter(function (enemy) {

                return enemy.alive && enemy.y < viewport.height;
            });

            enemyBullets = enemyBullets.filter(function (bullet) {

                return bullet.alive && bullet.y < viewport.height;
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

function damagePlayer(damage) {
    if (leMichShip.damageTimer > 0) {
        return;
    }

    const absorbedDamage = Math.min(leMichShip.shield, damage);
    leMichShip.shield -= absorbedDamage;
    leMichShip.lives -= damage - absorbedDamage;
    leMichShip.damageTimer = 60;
    leMichShip.shieldRegenDelay = 180;
    screenShake = Math.max(screenShake, 10);
    playTone(90, 0.18, 0.05, "sawtooth");

    if (leMichShip.lives <= 0) {
        leMichShip.lives = 0;
        gameState = GAMESTATE.GAMEOVER;
    }
}

function damageCompanion(companion, damage) {
    if (!companion.active || companion.damageTimer > 0) return;

    companion.lives -= damage;
    companion.damageTimer = 60;
    screenShake = Math.max(screenShake, 4);
    playTone(150, 0.12, 0.025, "square");

    if (companion.lives <= 0) {
        companion.lives = 0;
        companion.active = false;
        companion.respawnTimer = 600;
        createExplosion(
            companion.x + companion.width / 2,
            companion.y + companion.height / 2,
            0,
            0
        );
        showAlert("CLEMSHIP DÉTRUIT — RÉPARATION EN COURS", 150);
    }
}

        function checkBulletHits() {

            for (const bullet of bullets) {
                for (const enemy of enemies) {
                    if (checkCollision(bullet, enemy)) {

                        bullet.alive = false;
                        enemy.health--;
                        enemy.hitFlash = 5;
                        screenShake = Math.max(screenShake, 2);
                        playTone(220, 0.04, 0.012, "square");
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
                enemy.hitFlash = 8;
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
            damagePlayer(20);
        } else {
            for (const companion of companions) {
                if (companion.active && checkCollision(enemy, companion)) {
                    enemy.alive = false;
                    damageCompanion(companion, 1);
                    break;
                }
            }
        }
    }
}
function checkEnemyBulletHits() {

    for (const bullet of enemyBullets) {

        if (checkCollision(bullet, leMichShip)) {
            bullet.alive = false;
            damagePlayer(10);
        } else {
            for (const companion of companions) {
                if (companion.active && checkCollision(bullet, companion)) {
                    bullet.alive = false;
                    damageCompanion(companion, 1);
                    break;
                }
            }
        }
    }
}

        function update() {

            if (alertTimer > 0) {
                alertTimer--;
            }

            if (screenShake > 0) {
                screenShake--;
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

