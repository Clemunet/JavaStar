const canvas = document.querySelector('#gameCanvas'); //recup le canvas dans le html

const ctx = canvas.getContext("2d"); // recup le context

canvas.width = 1000;
canvas.height = 700;


// Vaisseau LeMich et ClemShip--------------------------------------------------

const leMichShip = {

    x: 300, y: 600, width: 60, height: 60, speed: 5, lives: 3, score: 0
}
const ClemShip = {

    x: 600, y: 600, width: 60, height: 60,speed: 5, lives: 3, score: 0
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

// draw vaisseau---------------------------------------------------------------------

function drawShip(ship)  {
    ctx.fillStyle = "violet";
    ctx.beginPath();
    ctx.moveTo(ship.x + ship.width / 2, ship.y);
    ctx.lineTo(ship.x, ship.y + ship.height);
    ctx.lineTo(ship.x + ship.width, ship.y + ship.height);
    ctx.closePath();
    ctx.fill();
}

function updatePlayer() {


 //leMichShip
    if (keys["ArrowLeft"]) {

        leMichShip.x -= 5;
    }
    if (keys["ArrowRight"]) {

        leMichShip.x += 5;
    }
    if (keys["ArrowUp"]) {

        leMichShip.y -= 5;
    }
    if (keys["ArrowDown"]) {

        leMichShip.y += 5;
    }
// clemShip

    if (keys["q"]) {

        ClemShip.x -= 5;
    }
    if (keys["d"]) {

        ClemShip.x += 5;
    }
    if (keys["z"]) {

        ClemShip.y -= 5;
    }
    if (keys["s"]) {

        ClemShip.y += 5;
    }

}

function update() {

    updatePlayer();
}

// boucle du jeu--------------------------------------------------------------------------
function gameLoop() {

    update();
    drawBackground();

    drawShip(leMichShip);
    drawShip(ClemShip);

    requestAnimationFrame(gameLoop);
}
gameLoop();