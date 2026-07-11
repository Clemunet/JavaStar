const canvas = document.querySelector('#gameCanvas'); //recup le canvas dans le html

const ctx = canvas.getContext("2d"); // recup le context

const enemyImage = new Image();
enemyImage.src = "IMAGES/ufo.png";
const leMichImage = new Image();
leMichImage.src = "IMAGES/leMich1.png";
const clemImage = new Image();
clemImage.src = "IMAGES/clemship.png";

canvas.width = (2000);
canvas.height = (1200);


// Vaisseau LeMich et ClemShip--------------------------------------------------

const leMichShip = {

    x: 300, y: 600, width: 300, height: 300, speed: 3, image: leMichImage, fireCooldown: 10, lives: 3, score: 0
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

// draw vaisseaux---------------------------------------------------------------------

function drawShip(ship) {

    if (ship.image.complete) {

        ctx.drawImage(
            ship.image,
            ship.x,
            ship.y,
            ship.width,
            ship.height
        );

    }

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
    function shoot(ship) {
        const bullet = {

            x: ship.x + ship.width / 2 - 3,
            y: ship.y,

            width: 6,
            height: 15,

            speed: 10,

            alive: true
        };

        bullets.push(bullet);
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

    function updatePlayer() {


        //cooldown lemich
        if (leMichShip.fireCooldown > 0) {
            leMichShip.fireCooldown--;
        }


        //leMichShip controls
        if (keys["ArrowLeft"]) {

            leMichShip.x -= leMichShip.speed;
        }
        if (keys["ArrowRight"]) {

            leMichShip.x += leMichShip.speed;
        }
        if (keys["ArrowUp"]) {

            leMichShip.y -= leMichShip.speed;
        }
        if (keys["ArrowDown"]) {

            leMichShip.y += leMichShip.speed;
        }

        if (keys["Space"] && leMichShip.fireCooldown === 0) {

            shoot(leMichShip);
            leMichShip.fireCooldown = 10;
        }

//cooldown clemship

        if (ClemShip.fireCooldown > 0) {
            ClemShip.fireCooldown--;
        }


// clemShip controls

        if (keys["q"]) {

            ClemShip.x -= ClemShip.speed;
        }
        if (keys["d"]) {

            ClemShip.x += ClemShip.speed;
        }
        if (keys["z"]) {

            ClemShip.y -= ClemShip.speed;
        }
        if (keys["s"]) {

            ClemShip.y += ClemShip.speed;
        }
        if (keys["CapsLock"] && ClemShip.fireCooldown === 0) {

            shoot(ClemShip);
            ClemShip.fireCooldown = 10;
        }
    }


    function updateBullets() {
        for (const bullet of bullets) {
            bullet.y -= bullet.speed;
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

        update();

        // shoot(leMichShip); //test

        drawBackground();

        drawBullets();

        drawEnemies()

        drawShip(leMichShip);
        drawShip(ClemShip);


        requestAnimationFrame(gameLoop);
    }

    gameLoop();
