const canvas = document.querySelector('#gameCanvas'); //recup le canvas dans le html

const ctx = canvas.getContext("2d"); // recup le context


const enemyImage = new Image();
enemyImage.src = "IMAGES/ufo.png";
const leMichImage = new Image();
leMichImage.src = "IMAGES/leMich2.png";
const clemImage = new Image();
clemImage.src = "IMAGES/clemship.png";

const LASERSPEED = 10;

const GAMESTATE = {

    MENU: "menu",
    GAME: "game"
};
let gameState = GAMESTATE.MENU;



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", function () {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});

// Vaisseau LeMich et ClemShip--------------------------------------------------

const leMichShip = {

    x: 300,
    y: 600,
    width: 400,
    height: 400,
    speed: 2,
    rotation: 0,
    rotationSpeed: 2,
    image: leMichImage,
    fireCooldown: 10,
    lives: 3,
    score: 0,
    frontCannons: [

        { x: 192, y: 5 },
        { x: 200, y: 5 }
    ],
        leftCannons: [

        { x: 70, y: 170 },
        { x: 35, y: 182 },

        { x: 70, y: 230 },
        { x: 35, y: 240 }

    ],

    rightCannons: [

        { x: 320, y: 170 },
        { x: 355, y: 182 },

        { x: 320, y: 230 },
        { x: 355, y: 240 }

    ],

    missileLauncher: {

        x: 196,
        y: 260

    }
}

let bullets = [];
let enemies = [];
let enemySpawnCooldown = 30;



const ClemShip = {

    x: 600, y: 600, width: 60, height: 60,speed: 5,image: clemImage, fireCooldown: 10, lives: 3, score: 0
};

//clavier----------------------------
const keys = {

};

document.addEventListener("keydown", function (event) {

    keys[event.code] = true;
    keys[event.key] = true;
    if (event.code === "Enter" && gameState === GAMESTATE.MENU) {
        gameState = GAMESTATE.GAME;
    }
});

document.addEventListener("keyup", function (event) {

    keys[event.code] = false;
    keys[event.key] = false;
})


// fond --------------------------------------------------

function drawBackground() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


/*ctx.fillStyle = "black"; //couleur de remplissage
ctx.fillRect(0, 0, canvas.width, canvas.height); //rect noir pour remplissage canvas*/

function drawMenu() {

    drawBackground();

    ctx.fillStyle = "white";

    ctx.textAlign = "center";

    ctx.font = "80px Arial";

    ctx.fillText(
        "JAVA STAR",
        canvas.width / 2,
        canvas.height / 2 - 100
    );

    ctx.font = "40px Arial";

    ctx.fillText(
        "Appuie sur Entrée",
        canvas.width / 2,
        canvas.height / 2
    );

}





// draw vaisseaux---------------------------------------------------------------------

function drawShip(ship) {

    if (!ship.image.complete) {
        return;
    }

    ctx.save();

    ctx.translate(
        ship.x + ship.width / 2,
        ship.y + ship.height / 2
    );

    ctx.rotate(ship.rotation * Math.PI / 180);

    ctx.drawImage(
        ship.image,
        -ship.width / 2,
        -ship.height / 2,
        ship.width,
        ship.height
    );

    ctx.restore();
}

function drawBullet(bullet) {
    ctx.fillStyle = "green";

        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

}
function drawBullets() {
    for (const bullet of bullets) {
        drawBullet(bullet);
    }
}
    //draw enemy
function drawEnemies() {
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }
}
function drawEnemy(enemy) {
    if (enemyImage.complete) {
        ctx.drawImage(
            enemyImage,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
    }
}
function createBullet(x, y, speedX, speedY) {

    const bullet = {

        x: x,
        y: y,

        width: 6,
        height: 15,

        speedX: speedX,
        speedY: speedY,

        alive: true
    };

    bullets.push(bullet);

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

// Enemies-------------------------------------------------------
    function spawnEnemy() {

        const enemy = {
            x: Math.floor(Math.random() * (canvas.width - 50)),
            y: -50, width: 50, height: 50, speed: 2,
            alive: true
        };
        enemies.push(enemy);



}
function move(ship, angleOffset) {

    const angle = (ship.rotation + angleOffset) * Math.PI / 180;

    ship.x += Math.sin(angle) * ship.speed;

    ship.y -= Math.cos(angle) * ship.speed;

}
function getDirectionVector(ship, angleOffset) {

    const angle = (ship.rotation + angleOffset) * Math.PI / 180;

    return {

        x: Math.sin(angle),

        y: -Math.cos(angle)

    };

}

    function updatePlayer() {


        //cooldown lemich
        if (leMichShip.fireCooldown > 0) {
            leMichShip.fireCooldown--;
        }


        //leMichShip controls
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
        if (keys["Space"] && leMichShip.fireCooldown === 0) {

            shoot(
                leMichShip,
                leMichShip.frontCannons,
                0
            );
            leMichShip.fireCooldown = 10;
        }
        if (keys["a"]) {
            leMichShip.rotation -= leMichShip.rotationSpeed;
        }
        if (keys["e"]) {
            leMichShip.rotation += leMichShip.rotationSpeed;
        }
        if (keys["1"] && leMichShip.fireCooldown === 0) {

            shoot(
                leMichShip,
                leMichShip.leftCannons,
                -90
            );

            leMichShip.fireCooldown = 10;
        }

        if (keys["3"] && leMichShip.fireCooldown === 0) {

            shoot(
                leMichShip,
                leMichShip.rightCannons,
                90
            );

            leMichShip.fireCooldown = 10;
        }

//cooldown clemship

        if (ClemShip.fireCooldown > 0) {
            ClemShip.fireCooldown--;
        }


// clemShip controls

        if (keys[""]) {

            ClemShip.x -= ClemShip.speed;
        }
        if (keys[""]) {

            ClemShip.x += ClemShip.speed;
        }
        if (keys[""]) {

            ClemShip.y -= ClemShip.speed;
        }
        if (keys[""]) {

            ClemShip.y += ClemShip.speed;
        }
       // if (keys[""] && ClemShip.fireCooldown === 0) {

           // shoot(ClemShip);
           // {
               // ClemShip.fireCooldown = 10;
           // }
       // }
    }
        function updateBullets() {
            for (const bullet of bullets) {
                bullet.x += bullet.speedX;
                bullet.y += bullet.speedY;
            }
            //bullets = bullets.filter(function (bullet) {
            // return bullet.alive && bullet.y + bullet.height > 0;
            //});
        }

        function updateEnemies() {
            for (const enemy of enemies) {
                enemy.y += enemy.speed;
            }
            //enemies = enemies.filter(function (enemy) {
            // return enemy.alive && enemy.y < canvas.height;
            //});
        }

        function cleanObjects() {

            bullets = bullets.filter(function (bullet) {

                return bullet.alive && bullet.y + bullet.height > 0;

            });

            enemies = enemies.filter(function (enemy) {

                return enemy.alive && enemy.y < canvas.height;

            });

        }


        function checkCollision(bullet, enemy) {

            if (
                bullet.x + bullet.width < enemy.x ||
                bullet.x > enemy.x + enemy.width ||
                bullet.y + bullet.height < enemy.y ||
                bullet.y > enemy.y + enemy.height
            ) {
                return false;
            }
            return true;
        }

        function checkBulletHits() {

            for (const bullet of bullets) {
                for (const enemy of enemies) {
                    if (checkCollision(bullet, enemy)) {

                        bullet.alive = false;
                        enemy.alive = false;

                    }
                }
            }
        }

        function update() {

            updatePlayer();
            updateBullets()
            updateEnemies()
            checkBulletHits();
            cleanObjects();


            enemySpawnCooldown--;
            if (enemySpawnCooldown <= 0) {
                spawnEnemy();
                enemySpawnCooldown = 30;
            }
        }

// boucle du jeu--------------------------------------------------------------------------
function gameLoop() {

    if (gameState === GAMESTATE.MENU) {
        drawMenu();
    }

    else if (gameState === GAMESTATE.GAME) {
        update();
        drawBackground();
        drawBullets();
        drawEnemies();
        drawShip(leMichShip);
        drawShip(ClemShip);
    }
    requestAnimationFrame(gameLoop);
}
gameLoop();