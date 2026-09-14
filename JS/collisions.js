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

                return bullet.alive &&
                    bullet.x > -100 &&
                    bullet.x < viewport.width + 100 &&
                    bullet.y > -100 &&
                    bullet.y < viewport.height + 100;
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
    if (leMichShip.superShieldTimer > 0) {
        screenShake = Math.max(screenShake, 3);
        playTone(360, 0.07, 0.018, "sine");
        return;
    }
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

function destroyEnemy(enemy, awardScore = true) {
    if (!enemy.alive) return;

    enemy.alive = false;
    trySpawnBonus(enemy);
    if (awardScore) {
        leMichShip.score += enemy.score;
    }
    if (enemy.isLevelBoss) {
        registerLevelBossDestroyed();
    } else if (awardScore) {
        registerStandardEnemyDestroyed();
    }

    const visualScale = Math.max(
        0.65,
        Math.min(2.5, Math.max(enemy.width, enemy.height) / 180)
    );
    createExplosion(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        0,
        0,
        visualScale
    );
}

        function checkBulletHits() {

            for (const bullet of bullets) {
                for (const enemy of enemies) {
                    if (!bullet.alive || !enemy.alive) continue;
                    if (checkCollision(bullet, enemy)) {

                        bullet.alive = false;
                        enemy.health--;
                        enemy.hitFlash = 5;
                        screenShake = Math.max(screenShake, 2);
                        playTone(220, 0.04, 0.012, "square");
                        if (enemy.health <= 0) {
                            destroyEnemy(enemy);
                        }
                    }
                }
            }
        }
function checkMissileHits() {

    for (const missile of missiles) {
        for (const enemy of enemies) {
            if (!missile.alive || !enemy.alive) continue;
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

            if (!enemy.alive) continue;

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
                destroyEnemy(enemy);
            }
        }
        explosion.hasDamaged = true;
    }
}
function checkEnemyHits() {
    for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (checkCollision(enemy, leMichShip)) {
            if (enemy.isLevelBoss) {
                damagePlayer(29.75);
                enemy.y = Math.max(-enemy.height / 2, enemy.y - 25);
            } else {
                destroyEnemy(enemy, false);
                damagePlayer(20);
            }
        } else {
            for (const companion of companions) {
                if (companion.active && checkCollision(enemy, companion)) {
                    if (enemy.isLevelBoss) {
                        damageCompanion(companion, 3);
                        enemy.y = Math.max(-enemy.height / 2, enemy.y - 25);
                    } else {
                        destroyEnemy(enemy, false);
                        damageCompanion(companion, 1);
                    }
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
            damagePlayer(bullet.damage ?? 10);
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
            updateSpaceDecorations();
            updateAsteroidStorm();
            updateSupernovaEvent();
            updatePlayer();
            updateBullets();
            updateMissiles();
            updateExplosions();
            updateEnemyBullets();
            updateEnemies();
            updateBonuses();
            checkBulletHits();
            checkEnemyBulletHits();
            checkEnemyHits();
            checkMissileHits();
            checkExplosionDamage();
            checkAsteroidStormHits();
            checkSupernovaHits();
            checkBonusPickups();
            cleanObjects();
            cleanAsteroidStorm();
            cleanBonuses();


            const levelControlsSpawning = updateLevelOneProgress();
            if (!levelControlsSpawning && enemies.length === 0) {
                waveCooldown--;
                if (waveCooldown <= 0) {
                    spawnWave();
                    currentWave++;
                    waveCooldown = 120;
                }
            }
        }

