
function move(ship, angleOffset) {

    const angle = (ship.rotation + angleOffset) * Math.PI / 180;

    const speedMultiplier = ship === leMichShip ? getPlayerSpeedMultiplier() : 1;
    ship.x += Math.sin(angle) * ship.speed * speedMultiplier;

    ship.y -= Math.cos(angle) * ship.speed * speedMultiplier;

}
function getDirectionVector(ship, angleOffset) {

    const angle = (ship.rotation + angleOffset) * Math.PI / 180;

    return {

        x: Math.sin(angle),

        y: -Math.cos(angle)

    };

}

function useEnergy(amount) {
    if (leMichShip.energy >= amount) {
        leMichShip.energy -= amount;
        return true;
    }

    if (leMichShip.energyWarningCooldown <= 0) {
        showAlert("ÉNERGIE INSUFFISANTE", 45);
        leMichShip.energyWarningCooldown = 60;
    }
    return false;
}

function findClosestEnemy(ship) {
    let closestEnemy = null;
    let closestDistanceSquared = Infinity;
    const shipCenterX = ship.x + ship.width / 2;
    const shipCenterY = ship.y + ship.height / 2;

    for (const enemy of enemies) {
        if (!enemy.alive) continue;

        const dx = enemy.x + enemy.width / 2 - shipCenterX;
        const dy = enemy.y + enemy.height / 2 - shipCenterY;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < closestDistanceSquared) {
            closestDistanceSquared = distanceSquared;
            closestEnemy = enemy;
        }
    }

    return { enemy: closestEnemy, distanceSquared: closestDistanceSquared };
}

function updateCompanion(companion) {
    if (!companion.active) {
        companion.respawnTimer--;
        if (companion.respawnTimer <= 0) {
            companion.active = true;
            companion.lives = companion.maxLives;
            companion.damageTimer = 90;
            companion.x = leMichShip.x + leMichShip.width / 2;
            companion.y = leMichShip.y + leMichShip.height / 2;
            showAlert("CLEMSHIP DE NOUVEAU OPÉRATIONNEL", 120);
        }
        return;
    }

    if (companion.damageTimer > 0) companion.damageTimer--;
    if (companion.fireCooldown > 0) companion.fireCooldown--;

    const formationPositions = [
        { x: 300, y: 80 },
        { x: 220, y: -250 },
        { x: -300, y: 80 },
        { x: -220, y: -250 }
    ];

    companion.maneuverTimer--;
    if (companion.maneuverTimer <= 0) {
        const occupiedPositions = companions
            .filter(other => other !== companion && other.active)
            .map(other => other.formationIndex);
        do {
            companion.formationIndex =
                (companion.formationIndex + 1) % formationPositions.length;
        } while (occupiedPositions.includes(companion.formationIndex));
        companion.maneuverTimer = 240 + Math.floor(Math.random() * 120);
    }

    const formation = formationPositions[companion.formationIndex];
    const targetX = leMichShip.x + leMichShip.width / 2
        + formation.x - companion.width / 2;
    const targetY = leMichShip.y + leMichShip.height / 2
        + formation.y - companion.height / 2;
    const followDx = targetX - companion.x;
    const followDy = targetY - companion.y;
    const followDistance = Math.hypot(followDx, followDy);

    if (followDistance > 1) {
        const step = Math.min(companion.speed, followDistance);
        companion.x += followDx / followDistance * step;
        companion.y += followDy / followDistance * step;
    }

    const target = findClosestEnemy(companion);
    if (target.enemy) {
        const dx = target.enemy.x + target.enemy.width / 2
            - (companion.x + companion.width / 2);
        const dy = target.enemy.y + target.enemy.height / 2
            - (companion.y + companion.height / 2);
        companion.rotation = Math.atan2(dx, -dy) * 180 / Math.PI;

        if (target.distanceSquared <= companion.attackRange ** 2
            && companion.fireCooldown <= 0) {
            shoot(companion, companion.frontCannons, 0);
            companion.fireCooldown = 24;
            playTone(820, 0.04, 0.012, "square");
        }
    }

    companion.x = Math.max(0, Math.min(viewport.width - companion.width, companion.x));
    companion.y = Math.max(0, Math.min(viewport.height - companion.height, companion.y));
}

    function updatePlayer() {

        if (leMichShip.damageTimer > 0) {
            leMichShip.damageTimer--;
        }

        if (leMichShip.shieldRegenDelay > 0) {
            leMichShip.shieldRegenDelay--;
        } else if (leMichShip.shield < leMichShip.maxShield) {
            leMichShip.shield = Math.min(
                leMichShip.maxShield,
                leMichShip.shield + leMichShip.shieldRegenRate
            );
        }

        leMichShip.energy = Math.min(
            leMichShip.maxEnergy,
            leMichShip.energy + leMichShip.energyRegenRate
        );
        if (leMichShip.energyWarningCooldown > 0) {
            leMichShip.energyWarningCooldown--;
        }

        //cooldown lemich CANONS
        if (leMichShip.fireCooldown > 0) {
            leMichShip.fireCooldown--;
        }
        // cooldown missiles
        if (leMichShip.missileCooldown > 0) {
            leMichShip.missileCooldown--;
        }
        if (leMichShip.rapidFireTimer > 0) {
            leMichShip.rapidFireTimer--;
        }
        if (leMichShip.superShieldTimer > 0) {
            leMichShip.superShieldTimer--;
        }
        if (leMichShip.turboTimer > 0) leMichShip.turboTimer--;
        if (leMichShip.speedBonusTimer > 0) leMichShip.speedBonusTimer--;



        //leMichShip controls
        if (gamepadState.connected) {
            applyGamepadMovement(leMichShip);
        }
        if (keys["q"]) {
            move(leMichShip, -90);
        }
        if (keys["d"]) {
            move(leMichShip, 90);
        }
        if (keys["z"]) {
            move(leMichShip, 0);
        }
        if (keys["s"]) {
            move(leMichShip, 180);
        }
        if ((keys["Space"] || gamepadState.frontFire)
            && leMichShip.fireCooldown <= 0 && useEnergy(1.4)) {

            shoot(
                leMichShip,
                leMichShip.frontCannons,
                0
            );
            leMichShip.fireCooldown = getPlayerFireCooldown();
            playPlayerLaserSound("front");
        }
        if (keys["a"]) {
            leMichShip.rotation -= leMichShip.rotationSpeed;
        }
        if (keys["e"]) {
            leMichShip.rotation += leMichShip.rotationSpeed;
        }
        if ((keys["1"] || gamepadState.leftFire)
            && leMichShip.fireCooldown <= 0 && useEnergy(4.2)) {

            shoot(
                leMichShip,
                leMichShip.leftCannons,
                -90
            );

            leMichShip.fireCooldown = getPlayerFireCooldown();
            playPlayerLaserSound("side");
        }

        if ((keys["3"] || gamepadState.rightFire)
            && leMichShip.fireCooldown <= 0 && useEnergy(4.2)) {

            shoot(
                leMichShip,
                leMichShip.rightCannons,
                90
            );

            leMichShip.fireCooldown = getPlayerFireCooldown();
            playPlayerLaserSound("side");
        }
        if ((keys["2"] || gamepadState.missile)
            && leMichShip.missileCooldown <= 0) {
            const usesBonusSalvo = leMichShip.bonusMissileSalvos > 0;
            if (usesBonusSalvo || useEnergy(17.5)) {
                createMissileSalvo(leMichShip, usesBonusSalvo ? 8 : 3);
                if (usesBonusSalvo) leMichShip.bonusMissileSalvos--;
                leMichShip.missileCooldown = 180;
                playMissileLaunchSound();
            }
        }

        leMichShip.x = Math.max(0, Math.min(
            viewport.width - leMichShip.width,
            leMichShip.x
        ));
        leMichShip.y = Math.max(0, Math.min(
            viewport.height - leMichShip.height,
            leMichShip.y
        ));

        for (const companion of companions) {
            updateCompanion(companion);
        }
    }
