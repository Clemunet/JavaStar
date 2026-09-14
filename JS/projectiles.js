function createBullet(x, y, speedX, speedY) {

    const bullet = {

        x: x,
        y: y,

        width: 6,
        height: 15,
        speedX: speedX,
        speedY: speedY,
        damage: 1,

        hitboxWidth: 6,
        hitboxHeight: 15,

        alive: true
    };

    bullets.push(bullet);
}
function createMissile(ship, launcherOffset, target) {

        const launcher = {
            x: ship.missileLauncher.x + launcherOffset.x,
            y: ship.missileLauncher.y + launcherOffset.y
        };

        const rotated = rotatePoint(
            launcher,
            ship
        );

        const direction = getDirectionVector(ship, 0);

        const missile = {

            x: ship.x + rotated.x,
            y: ship.y + rotated.y,
            width: 24,
            height: 48,

            image: missileImage,
            rotation: ship.rotation,

            hitboxWidth: 12,
            hitboxHeight: 32,

            speedX: direction.x * 6,
            speedY: direction.y * 6,
            damage: 20,
            target: target,
            turnSpeed: 0.055,

            alive: true
    };
    missiles.push(missile);

}

function createMissileSalvo(ship, missileCount = 3) {
    const availableTargets = enemies
        .filter(enemy => enemy.alive)
        .sort(function (enemyA, enemyB) {
            const shipCenterX = ship.x + ship.width / 2;
            const shipCenterY = ship.y + ship.height / 2;
            const distanceA = (enemyA.x - shipCenterX) ** 2
                + (enemyA.y - shipCenterY) ** 2;
            const distanceB = (enemyB.x - shipCenterX) ** 2
                + (enemyB.y - shipCenterY) ** 2;
            return distanceA - distanceB;
        });
    const launcherOffsets = Array.from({ length: missileCount }, function (_, index) {
        const centerOffset = index - (missileCount - 1) / 2;
        const normalizedOffset = missileCount > 1
            ? centerOffset / ((missileCount - 1) / 2)
            : 0;
        return { x: normalizedOffset * 90, y: Math.abs(normalizedOffset) * 24 };
    });

    launcherOffsets.forEach(function (offset, index) {
        const target = availableTargets.length > 0
            ? availableTargets[index % availableTargets.length]
            : null;
        createMissile(ship, offset, target);
    });
}
function createEnemyBullet(enemy) {

        const dx =
            (leMichShip.x + leMichShip.width / 2) -
            (enemy.x + enemy.width / 2);

        const dy =
            (leMichShip.y + leMichShip.height / 2) -
            (enemy.y + enemy.height / 2);

        const distance = Math.sqrt(dx * dx + dy * dy);

        const speed = 6;

        const baseAngle = Math.atan2(dy, dx);
        const spreadAngles = [-0.14, 0, 0.14];
        const muzzleOffsets = [-18, 0, 18];

        spreadAngles.forEach(function (spreadAngle, index) {
            const angle = baseAngle + spreadAngle;
            enemyBullets.push({
                x: enemy.x + enemy.width / 2 - 3 + muzzleOffsets[index],
                y: enemy.y + enemy.height,
                width: 6,
                height: 15,
                hitboxWidth: 6,
                hitboxHeight: 15,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                damage: 10,
                type: "frigate",
                alive: true
            });
        });
}
function fireBattery(enemy, battery, speedX, speedY) {
    for (const cannon of battery) {
        createBattleshipBullet(enemy, cannon, speedX, speedY);
    }
}

function createBattleshipBullet(enemy, cannon, speedX, speedY) {

    const bullet = {
        x: enemy.x + cannon.x,
        y: enemy.y + cannon.y,
        width: 12,
        height: 24,
        hitboxWidth: 12,
        hitboxHeight: 24,
        speedX: speedX,
        speedY: speedY,
        damage: enemy.isLevelBoss ? 12.75 : 15,
        type: "battleship",
        alive: true
    };

    enemyBullets.push(bullet);

}

function fireRadialBarrage(enemy, projectileCount, speed) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;
    const radiusX = enemy.hitboxWidth * 0.55;
    const radiusY = enemy.hitboxHeight * 0.48;

    for (let index = 0; index < projectileCount; index++) {
        const angle = index / projectileCount * Math.PI * 2
            + enemy.barrageRotation;
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);

        enemyBullets.push({
            x: centerX + directionX * radiusX - 6,
            y: centerY + directionY * radiusY - 6,
            width: 12,
            height: 12,
            hitboxWidth: 10,
            hitboxHeight: 10,
            speedX: directionX * speed,
            speedY: directionY * speed,
            damage: enemy.isLevelBoss ? 12.75 : 15,
            type: "battleship-radial",
            alive: true
        });
    }

    enemy.barrageRotation += Math.PI / projectileCount;
    playTone(105, 0.28, 0.04, "sawtooth");
}




function rotatePoint(point, ship) {

    const angle = ship.rotation * Math.PI / 180;

    const centerX = ship.width / 2;
    const centerY = ship.height / 2;

    const x = point.x - centerX;
    const y = point.y - centerY;

    return {

        x: x * Math.cos(angle) - y * Math.sin(angle) + centerX,

        y: x * Math.sin(angle) + y * Math.cos(angle) + centerY

    };

}

    function shoot(ship, cannons, angleOffset) {

        for (const cannon of cannons) {

            const rotated = rotatePoint(cannon, ship);

            const direction = getDirectionVector(ship, angleOffset);
            createBullet(
                ship.x + rotated.x,
                ship.y + rotated.y,
                direction.x * LASERSPEED,
                direction.y * LASERSPEED
            );
        }
    }

function drawHitbox(object) {

    if (!DEBUG) {
        return;
    }

    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    ctx.strokeRect(
        object.x + (object.width - object.hitboxWidth) / 2,
        object.y + (object.height - object.hitboxHeight) / 2,
        object.hitboxWidth,
        object.hitboxHeight
    );
    const centerX = object.x + object.width / 2;
    const centerY = object.y + object.height / 2;

    ctx.fillStyle = "red";

    ctx.beginPath();
    ctx.arc(
        centerX,
        centerY,
        4,
        0,
        Math.PI * 2
    );
    ctx.fill();

}

// Enemies-------------------------------------------------------
