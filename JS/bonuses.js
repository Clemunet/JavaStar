const BONUS_TYPES = { HEALTH: "health", RAPID_FIRE: "rapid-fire", MISSILE: "missile", SUPER_SHIELD: "super-shield", SPEED: "speed" };
const bonusImages = {};
bonusImages[BONUS_TYPES.HEALTH] = new Image();
bonusImages[BONUS_TYPES.HEALTH].src = "IMAGES/bonuses/health-capsule.png";
bonusImages[BONUS_TYPES.RAPID_FIRE] = new Image();
bonusImages[BONUS_TYPES.RAPID_FIRE].src = "IMAGES/bonuses/rapid-fire-capsule.png";
bonusImages[BONUS_TYPES.MISSILE] = new Image();
bonusImages[BONUS_TYPES.MISSILE].src = "IMAGES/bonuses/missile-capsule.png";
bonusImages[BONUS_TYPES.SUPER_SHIELD] = new Image();
bonusImages[BONUS_TYPES.SUPER_SHIELD].src = "IMAGES/bonuses/super-shield-capsule.png";
bonusImages[BONUS_TYPES.SPEED] = new Image();
bonusImages[BONUS_TYPES.SPEED].src = "IMAGES/bonuses/speed-capsule.png";
let bonuses = [];
let bonusDriftCooldown = 720;

function getRandomBonusType() {
    const types = Object.values(BONUS_TYPES);
    return types[Math.floor(Math.random() * types.length)];
}

function createBonusCapsule(type, x, y, speedY = 2.1) {
    bonuses.push({
        type, image: bonusImages[type], x, y,
        width: 68, height: 96, hitboxWidth: 50, hitboxHeight: 76,
        speedY, rotation: (Math.random() - 0.5) * 0.22,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        pulse: Math.random() * Math.PI * 2, alive: true
    });
}

function resetBonuses() {
    bonuses = [];
    leMichShip.rapidFireTimer = 0;
    leMichShip.superShieldTimer = 0;
    leMichShip.bonusMissileSalvos = 0;
    leMichShip.turboTimer = 0;
    leMichShip.speedBonusTimer = 0;
    bonusDriftCooldown = 720 + Math.floor(Math.random() * 780);
}

function trySpawnBonus(enemy) {
    if (enemy.isLevelBoss) return;

    if (enemy.name === "Battleship") {
        const availableTypes = Object.values(BONUS_TYPES);
        for (let index = availableTypes.length - 1; index > 0; index--) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [availableTypes[index], availableTypes[randomIndex]] =
                [availableTypes[randomIndex], availableTypes[index]];
        }
        for (let index = 0; index < 3; index++) {
            createBonusCapsule(
                availableTypes[index],
                enemy.x + enemy.width / 2 - 34 + (index - 1) * 82,
                enemy.y + enemy.height / 2 - 48 + Math.abs(index - 1) * 22,
                1.8 + index * 0.18
            );
        }
        return;
    }

    if (Math.random() < 0.18) {
        createBonusCapsule(
            getRandomBonusType(),
            enemy.x + enemy.width / 2 - 34,
            enemy.y + enemy.height / 2 - 48
        );
    }
}

function updateBonuses() {
    bonusDriftCooldown--;
    if (bonusDriftCooldown <= 0) {
        createBonusCapsule(
            getRandomBonusType(),
            20 + Math.random() * Math.max(1, viewport.width - 108),
            -110,
            1.7 + Math.random() * 0.8
        );
        bonusDriftCooldown = 1500 + Math.floor(Math.random() * 1200);
    }

    for (const bonus of bonuses) {
        bonus.y += bonus.speedY; bonus.rotation += bonus.rotationSpeed; bonus.pulse += 0.06;
        if (bonus.y > viewport.height + bonus.height) bonus.alive = false;
    }
}

function drawBonuses() {
    for (const bonus of bonuses) {
        if (!bonus.alive || !bonus.image.complete || !bonus.image.naturalWidth) continue;
        const glow = bonus.type === BONUS_TYPES.HEALTH ? "#37FF70"
            : bonus.type === BONUS_TYPES.RAPID_FIRE ? "#35CBFF"
            : bonus.type === BONUS_TYPES.SUPER_SHIELD ? "#C66CFF"
            : bonus.type === BONUS_TYPES.SPEED ? "#FF4FB4" : "#FFAA28";
        const pulseScale = 1 + Math.sin(bonus.pulse) * 0.04;
        ctx.save();ctx.translate(bonus.x + bonus.width / 2, bonus.y + bonus.height / 2);ctx.rotate(bonus.rotation);ctx.scale(pulseScale,pulseScale);
        ctx.shadowColor=glow;ctx.shadowBlur=15+Math.sin(bonus.pulse)*5;
        ctx.drawImage(bonus.image,-bonus.width/2,-bonus.height/2,bonus.width,bonus.height);ctx.restore();drawHitbox(bonus);
    }
}

function collectBonus(bonus) {
    bonus.alive = false;
    if (bonus.type === BONUS_TYPES.HEALTH) {
        leMichShip.lives = Math.min(leMichShip.maxLives, leMichShip.lives + 10);
        showAlert("CAPSULE DE RÉPARATION  +10 COQUE",100);playTone(620,0.3,0.045,"sine");
    } else if (bonus.type === BONUS_TYPES.RAPID_FIRE) {
        leMichShip.rapidFireTimer = Math.max(leMichShip.rapidFireTimer,1620);
        showAlert("SURCADENCE ACTIVÉE — 27 SECONDES",100);playTone(920,0.22,0.04,"square");
    } else if (bonus.type === BONUS_TYPES.MISSILE) {
        leMichShip.bonusMissileSalvos += 3;
        leMichShip.missileCooldown = 0;
        showAlert("CAPSULE MISSILE — 3 SALVES DE 8",100);
        playTone(760,0.28,0.045,"square");
    } else if (bonus.type === BONUS_TYPES.SUPER_SHIELD) {
        leMichShip.superShieldTimer = Math.max(leMichShip.superShieldTimer,900);
        leMichShip.shield = leMichShip.maxShield;
        showAlert("SUPERBOUCLIER ACTIVÉ — 15 SECONDES",100);playTone(480,0.5,0.05,"sine");
    } else {
        leMichShip.speedBonusTimer = Math.max(leMichShip.speedBonusTimer,900);
        showAlert("VITESSE AUGMENTÉE — 15 SECONDES",100);playTone(1040,0.3,0.045,"sawtooth");
    }
}

function checkBonusPickups(){for(const bonus of bonuses){if(bonus.alive&&checkCollision(bonus,leMichShip))collectBonus(bonus);}}
function cleanBonuses(){bonuses=bonuses.filter(bonus=>bonus.alive);}
function getPlayerFireCooldown(){return leMichShip.rapidFireTimer>0?5:10;}
function getPlayerSpeedMultiplier(){
    if(leMichShip.turboTimer>0)return 2.5;
    if(leMichShip.speedBonusTimer>0)return 1.75;
    return 1;
}
function activateTurbo(){
    leMichShip.turboTimer=240;
    showAlert("TURBO ACTIVÉ — 4 SECONDES",60);
    playTone(220,0.35,0.04,"sawtooth");
}

function drawSuperShield() {
    if (leMichShip.superShieldTimer <= 0) return;
    const centerX=leMichShip.x+leMichShip.width/2,centerY=leMichShip.y+leMichShip.height/2;
    const pulse=1+Math.sin(leMichShip.superShieldTimer*0.08)*0.04;
    ctx.save();ctx.translate(centerX,centerY);ctx.scale(pulse,pulse);
    ctx.strokeStyle="rgba(200,105,255,0.9)";ctx.fillStyle="rgba(155,70,255,0.09)";ctx.lineWidth=5;ctx.shadowColor="#C56CFF";ctx.shadowBlur=24;
    ctx.beginPath();ctx.ellipse(0,0,leMichShip.hitboxWidth*0.72,leMichShip.hitboxHeight*0.62,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
}
