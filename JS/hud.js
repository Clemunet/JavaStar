function drawShipInformations() {

    ctx.textAlign = "left";

    ctx.fillStyle = "#D8D8D8";

    ctx.font = "24px Consolas";

    ctx.fillText(
        "USS LEMICH",
        30,
        40
    );

    ctx.fillStyle = "#59B5FF";

    ctx.fillText(
        "CONFÉDÉRATION TERRIENNE",
        30,
        70
    );

}

function drawBar(x, y, width, height, value, maxValue, color) {
    ctx.fillStyle = "#303030";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );
    ctx.fillStyle = color;

    ctx.fillRect(
        x,
        y,
        width * value / maxValue,
        height
    );
    ctx.strokeStyle = "#FFFFFF";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        x,
        y,
        width,
        height
    );

}

function drawShipBars() {

    ctx.fillStyle = "white";
    ctx.font = "20px Consolas";

    ctx.fillText(
        "COQUE",
        30,
        115
    );

    drawBar(
        150,
        100,
        250,
        20,
        leMichShip.lives,
        leMichShip.maxLives,
        "#00CC44"
    );
    ctx.fillText(
        "BOUCLIER",
        30,
        165
    );

    drawBar(
        150,
        150,
        250,
        20,
        leMichShip.shield,
        leMichShip.maxShield,
        "#00AAFF"
    );
    ctx.fillText(
        "ÉNERGIE",
        30,
        215
    );

    drawBar(
        150,
        200,
        250,
        20,
        leMichShip.energy,
        leMichShip.maxEnergy,
        "#FFD700"
    );
}

function drawScore() {

    ctx.fillStyle = "white";

    ctx.font = "24px Consolas";

    ctx.fillText(
        "SCORE : " +
        leMichShip.score.toString().padStart(7, "0"),
        30,
        280
    );
}

function drawWave() {
    ctx.fillStyle = "white";
    ctx.font = "24px Consolas";
    ctx.textAlign = "right";
    const displayedWave = Math.max(1, currentWave - 1);
    ctx.fillText("VAGUE " + displayedWave, viewport.width - 30, 40);
}

function drawLevelObjective() {
    ctx.textAlign = "center";
    const boss = enemies.find(enemy => enemy.alive && enemy.isLevelBoss);
    if (boss) {
        const barWidth = Math.min(700, viewport.width * 0.42);
        const x = (viewport.width - barWidth) / 2;
        ctx.fillStyle = "#FF6655";
        ctx.font = "bold 24px Consolas";
        ctx.fillText("ECLIPSE — VAISSEAU AMIRAL", viewport.width / 2, 38);
        drawBar(x, 52, barWidth, 18, boss.health, boss.maxHealth, "#D52B2B");
    } else {
        ctx.fillStyle = levelOne.standardKills >= LEVEL_ONE_TARGET ? "#FFAA44" : "#D8E8FF";
        ctx.font = "22px Consolas";
        const objective = levelOne.standardKills >= LEVEL_ONE_TARGET
            ? "OBJECTIF : INTERCEPTER LA SIGNATURE ENNEMIE"
            : "OBJECTIF : AVANT-GARDE  " + levelOne.standardKills + " / " + LEVEL_ONE_TARGET;
        ctx.fillText(objective, viewport.width / 2, 38);
    }
}

function drawCompanionStatus() {
    ctx.textAlign = "right";
    ctx.font = "20px Consolas";

    companions.forEach(function (companion, index) {
        const label = "CLEMSHIP " + (index + 1);
        const y = 72 + index * 30;

        if (companion.active) {
            ctx.fillStyle = "#65D8FF";
            ctx.fillText(
                label + "  " + "◆".repeat(companion.lives)
                    + "◇".repeat(companion.maxLives - companion.lives),
                viewport.width - 30,
                y
            );
        } else {
            ctx.fillStyle = "#FFAA44";
            ctx.fillText(
                label + "  RETOUR " + Math.ceil(companion.respawnTimer / 60) + " s",
                viewport.width - 30,
                y
            );
        }
    });
}

function drawMusicStatus() {
    ctx.textAlign = "right";
    ctx.font = "16px Consolas";
    ctx.fillStyle = musicEnabled ? "#8FA8C8" : "#666B75";
    ctx.fillText(
        "M  MUSIQUE " + (musicEnabled ? "ON" : "OFF"),
        viewport.width - 30,
        viewport.height - 25
    );
}

function drawBonusStatus() {
    ctx.textAlign = "right";
    ctx.font = "18px Consolas";
    if (leMichShip.rapidFireTimer > 0) {
        ctx.fillStyle = "#45DFFF";
        ctx.fillText("SURCADENCE  " + Math.ceil(leMichShip.rapidFireTimer / 60) + " s", viewport.width - 30, 145);
    }
    if (leMichShip.superShieldTimer > 0) {
        ctx.fillStyle = "#D083FF";
        ctx.fillText("SUPERBOUCLIER  " + Math.ceil(leMichShip.superShieldTimer / 60) + " s", viewport.width - 30, 173);
    }
    if (leMichShip.bonusMissileSalvos > 0) {
        ctx.fillStyle = "#FFB347";
        ctx.fillText("SALVES x8  × " + leMichShip.bonusMissileSalvos, viewport.width - 30, 201);
    }
    if (leMichShip.speedBonusTimer > 0) {
        ctx.fillStyle = "#FF69BC";
        ctx.fillText("VITESSE +  " + Math.ceil(leMichShip.speedBonusTimer / 60) + " s", viewport.width - 30, 229);
    }
    if (leMichShip.turboTimer > 0) {
        ctx.fillStyle = "#FFF16B";
        ctx.fillText("TURBO  " + Math.ceil(leMichShip.turboTimer / 60) + " s", viewport.width - 30, 257);
    }
}

function drawPause() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "64px Arial";
    ctx.fillText("PAUSE", viewport.width / 2, viewport.height / 2 - 20);
    ctx.font = "24px Arial";
    ctx.fillText("Échap ou Start pour reprendre", viewport.width / 2, viewport.height / 2 + 40);
    ctx.font = "19px Consolas";
    ctx.fillStyle = "#9CCBFF";
    ctx.fillText("Stick G : déplacement   Stick D : visée   RT : tir   LT : missiles", viewport.width / 2, viewport.height / 2 + 90);
    ctx.fillText("LB / X : batterie gauche   RB / B : batterie droite", viewport.width / 2, viewport.height / 2 + 125);
    ctx.fillText("Pavé numérique 5 / Y : turbo pendant 4 secondes", viewport.width / 2, viewport.height / 2 + 160);
}


function drawHUD() {

    // panneau

    ctx.fillStyle = "rgba(15,20,30,0.55)";
    ctx.fillRect(15,15,420,300);

    // cadre lumineux

    ctx.shadowColor = "#4BA3FF";
    ctx.shadowBlur = 10;

    ctx.strokeStyle = "#4BA3FF";
    ctx.lineWidth = 2;

    ctx.strokeRect(15,15,420,300);

    ctx.strokeStyle = "#1E6CB8";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        20,
        20,
        410,
        290
    );
    ctx.shadowBlur = 0;

    // séparateurs

    ctx.strokeStyle = "#3A4E66";

    ctx.beginPath();

    ctx.moveTo(25,90);
    ctx.lineTo(425,90);

    ctx.moveTo(25,240);
    ctx.lineTo(425,240);

    ctx.stroke();

    // contenu

    drawShipInformations();

    drawShipBars();

    drawScore();

    drawWave();

    drawCompanionStatus();

    drawMusicStatus();
    drawBonusStatus();

    drawLevelObjective();

}



// draw elements du jeu
function drawGame() {

    ctx.save();
    if (screenShake > 0) {
        const shakeStrength = Math.min(screenShake, 8);
        ctx.translate(
            (Math.random() - 0.5) * shakeStrength,
            (Math.random() - 0.5) * shakeStrength
        );
    }

    drawBackground();

    drawNebuleuse();

    drawSpaceDecorations();

    drawStars();

    drawAsteroidStorm();
    drawSupernovaEvent();

    drawBullets();
    drawMissiles();
    drawEnemyBullets();
    drawExplosions();

    drawEnemies();

    drawBonuses();

    drawShip(leMichShip);
    drawSuperShield();
    drawHitbox(leMichShip); //wip collision

    for (const companion of companions) {
        if (companion.active) {
            drawShip(companion);
            drawHitbox(companion);
        }
    }

    ctx.restore();

    drawHUD();
    drawAlert();
}

