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
            explosion.frame++;

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

        if (enemy.hitFlash > 0) {
            enemy.hitFlash--;
        }

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
