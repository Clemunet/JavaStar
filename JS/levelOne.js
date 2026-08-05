const LEVEL_ONE_TARGET = 30;
const crossPortrait = new Image();
crossPortrait.src = "IMAGES/characters/general-cross.png";
const astrisPortrait = new Image();
astrisPortrait.src = "IMAGES/characters/captain-astris.png";

const levelOneBriefing = [
    { speaker: "GÉNÉRAL CROSS", portrait: crossPortrait, text: "Capitaine Astris, le corridor d'Orion ne répond plus. Nos balises ont détecté une force ennemie en approche de la frontière terrestre." },
    { speaker: "CAPITAINE ASTRIS", portrait: astrisPortrait, text: "L'USS LeMich est prêt, Général. Quelle est notre priorité ?" },
    { speaker: "GÉNÉRAL CROSS", portrait: crossPortrait, text: "Brisez leur avant-garde. Trente appareils protègent une signature énergétique inconnue. Vos ClemShip vous accompagneront." },
    { speaker: "CAPITAINE ASTRIS", portrait: astrisPortrait, text: "Et lorsque cette signature se montrera ?" },
    { speaker: "GÉNÉRAL CROSS", portrait: crossPortrait, text: "Vous l'identifiez, puis vous l'éliminez. Si cette flotte atteint nos colonies, nous perdrons tout le secteur." },
    { speaker: "CAPITAINE ASTRIS", portrait: astrisPortrait, text: "Alors elle n'atteindra pas les colonies. Astris, terminé." },
    { speaker: "GÉNÉRAL CROSS", portrait: crossPortrait, text: "Bonne chasse, Capitaine. L'Alliance compte sur vous." }
];

const levelOneDebriefing = [
    { speaker: "CAPITAINE ASTRIS", portrait: astrisPortrait, text: "L'Eclipse est détruit. Le corridor d'Orion est de nouveau sous contrôle de l'Alliance." },
    { speaker: "GÉNÉRAL CROSS", portrait: crossPortrait, text: "Mission accomplie, Capitaine. Mais les données récupérées indiquent que ce vaisseau n'était qu'un éclaireur." },
    { speaker: "CAPITAINE ASTRIS", portrait: astrisPortrait, text: "Alors nous serons prêts quand le reste de leur flotte arrivera." }
];

const levelOne = {
    standardKills: 0,
    bossSpawned: false,
    bossDefeated: false,
    phase: "briefing",
    dialogue: levelOneBriefing,
    dialogueIndex: 0,
    victoryTimer: null
};

function beginLevelOneBriefing() {
    levelOne.phase = "briefing";
    levelOne.dialogue = levelOneBriefing;
    levelOne.dialogueIndex = 0;
    gameState = GAMESTATE.DIALOGUE;
}

function resetLevelOneMission() {
    if (levelOne.victoryTimer !== null) clearTimeout(levelOne.victoryTimer);
    levelOne.victoryTimer = null;
    levelOne.standardKills = 0;
    levelOne.bossSpawned = false;
    levelOne.bossDefeated = false;
    levelOne.phase = "combat";
}

function advanceLevelDialogue() {
    levelOne.dialogueIndex++;
    if (levelOne.dialogueIndex < levelOne.dialogue.length) return;
    if (levelOne.phase === "briefing") {
        startNewGame();
    } else {
        gameState = GAMESTATE.LEVELCOMPLETE;
    }
}

function beginLevelOneDebriefing() {
    levelOne.phase = "debriefing";
    levelOne.dialogue = levelOneDebriefing;
    levelOne.dialogueIndex = 0;
    enemyBullets = [];
    bullets = [];
    missiles = [];
    gameState = GAMESTATE.DIALOGUE;
}

function canSpawnStandardEnemy() {
    const livingStandardEnemies = enemies.filter(enemy => enemy.alive && !enemy.isLevelBoss).length;
    return levelOne.phase === "combat"
        && levelOne.standardKills + livingStandardEnemies < LEVEL_ONE_TARGET;
}

function registerStandardEnemyDestroyed() {
    if (levelOne.phase !== "combat") return;
    levelOne.standardKills = Math.min(LEVEL_ONE_TARGET, levelOne.standardKills + 1);
    if (levelOne.standardKills === LEVEL_ONE_TARGET) {
        showAlert("AVANT-GARDE DÉTRUITE — SIGNATURE MASSIVE EN APPROCHE", 210);
    }
}

function registerLevelBossDestroyed() {
    if (levelOne.bossDefeated) return;
    levelOne.bossDefeated = true;
    levelOne.phase = "victory-delay";
    levelOne.victoryTimer = setTimeout(function () {
        levelOne.victoryTimer = null;
        beginLevelOneDebriefing();
    }, 1800);
}

function cancelLevelOneVictoryTransition() {
    if (levelOne.victoryTimer === null) return;
    clearTimeout(levelOne.victoryTimer);
    levelOne.victoryTimer = null;
}

function updateLevelOneProgress() {
    if (levelOne.phase !== "combat") return true;
    if (levelOne.standardKills < LEVEL_ONE_TARGET) return false;
    if (!levelOne.bossSpawned && enemies.length === 0) {
        levelOne.bossSpawned = true;
        spawnLevelBoss();
    }
    return true;
}

function wrapDialogueText(textValue, maxWidth) {
    const words = textValue.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
        const candidate = line ? line + " " + word : word;
        if (ctx.measureText(candidate).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else line = candidate;
    }
    if (line) lines.push(line);
    return lines;
}

function drawLevelDialogue() {
    drawBackground();
    drawNebuleuse();
    drawStars();
    const entry = levelOne.dialogue[levelOne.dialogueIndex];
    const isAstris = entry.speaker === "CAPITAINE ASTRIS";
    const panelWidth = Math.min(1500, viewport.width - 160);
    const panelHeight = Math.min(650, viewport.height - 180);
    const panelX = (viewport.width - panelWidth) / 2;
    const panelY = (viewport.height - panelHeight) / 2;
    const portraitSize = Math.min(520, panelHeight - 60);
    const portraitX = isAstris ? panelX + panelWidth - portraitSize - 30 : panelX + 30;
    const textX = isAstris ? panelX + 55 : panelX + portraitSize + 75;
    const textWidth = panelWidth - portraitSize - 130;

    ctx.fillStyle = "rgba(5, 12, 28, 0.94)";
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = isAstris ? "#45D5FF" : "#7AA7FF";
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    if (entry.portrait.complete) {
        ctx.drawImage(entry.portrait, portraitX, panelY + 30, portraitSize, portraitSize);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = isAstris ? "#65E3FF" : "#9AB9FF";
    ctx.font = "bold 34px Consolas";
    ctx.fillText(entry.speaker, textX, panelY + 100);
    ctx.fillStyle = "#F0F5FF";
    ctx.font = "28px Consolas";
    const lines = wrapDialogueText(entry.text, textWidth);
    lines.forEach((line, index) => ctx.fillText(line, textX, panelY + 175 + index * 44));
    ctx.fillStyle = "#8AA0BC";
    ctx.font = "20px Consolas";
    ctx.fillText("ENTRÉE / A  —  CONTINUER", textX, panelY + panelHeight - 45);
}

function drawLevelComplete() {
    drawBackground();
    drawNebuleuse();
    drawStars();
    ctx.textAlign = "center";
    ctx.fillStyle = "#62E7FF";
    ctx.font = "72px Consolas";
    ctx.fillText("MISSION ACCOMPLIE", viewport.width / 2, viewport.height / 2 - 100);
    ctx.fillStyle = "white";
    ctx.font = "32px Consolas";
    ctx.fillText("NIVEAU 1 — LE CORRIDOR D'ORION", viewport.width / 2, viewport.height / 2 - 25);
    ctx.fillText("Score : " + leMichShip.score, viewport.width / 2, viewport.height / 2 + 45);
    ctx.fillStyle = "#8AA0BC";
    ctx.font = "22px Consolas";
    ctx.fillText("Entrée ou A pour lancer le niveau 2", viewport.width / 2, viewport.height / 2 + 125);
}
