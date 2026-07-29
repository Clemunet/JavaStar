function createBullet(x, y, speedX, speedY) {

    const bullet = {

        x: x,
        y: y,

        width: 6,
        height: 15,
        speedX: speedX,
        speedY: speedY,

        hitboxWidth: 6,
        hitboxHeight: 15,

        alive: true
    };

    bullets.push(bullet);
}
    function createMissile(ship) {

        const rotated = rotatePoint(
        ship.missileLauncher,
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

            alive: true
    };
    missiles.push(missile);

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

        const speedX = dx / distance * speed;

        const speedY = dy / distance * speed;

        const bullet = {
        x: enemy.x + enemy.width / 2 - 3,
        y: enemy.y + enemy.height,
        width: 6,
        height: 15,
        hitboxWidth: 6,
        hitboxHeight: 15,
        speedX: speedX,
        speedY: speedY,
            type: "frigate",
        alive: true
    };
    enemyBullets.push(bullet);
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
        type: "battleship",
        alive: true
    };

    enemyBullets.push(bullet);

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
