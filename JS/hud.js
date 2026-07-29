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

function drawPause() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "64px Arial";
    ctx.fillText("PAUSE", viewport.width / 2, viewport.height / 2 - 20);
    ctx.font = "24px Arial";
    ctx.fillText("Échap pour reprendre", viewport.width / 2, viewport.height / 2 + 40);
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

    drawStars();

    drawBullets();
    drawMissiles();
    drawEnemyBullets();
    drawExplosions();

    drawEnemies();

    drawShip(leMichShip);
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

