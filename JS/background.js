function createStar() {
    let size;
    let speed;

    const random = Math.random();

    if (random < 0.70) {
        size = 1;
        speed = 0.4;
    }
    else if (random < 0.95) {
        size = 2;
        speed = 1.2;
    }
    else {
        size = 3;
        speed = 2.5;
    }

    const color = size === 1 ? "#BBBBBB" : size === 2 ? "#FFFFFF" : "#DDEEFF";

    return {
        x: Math.random() * viewport.width,
        y: Math.random() * viewport.height,
        size,
        speed,
        color
    };
}

function getTargetStarCount() {
    return Math.max(120, Math.ceil(viewport.width * viewport.height / 10000));
}

function createStars() {

    stars = [];
    const targetCount = getTargetStarCount();

    for (let i = 0; i < targetCount; i++) {
        stars.push(createStar());
    }
}

function resizeStars(scaleX, scaleY) {
    for (const star of stars) {
        star.x *= scaleX;
        star.y *= scaleY;
    }

    const targetCount = getTargetStarCount();
    while (stars.length < targetCount) {
        stars.push(createStar());
    }
    if (stars.length > targetCount) {
        stars.length = targetCount;
    }
}
function drawStars() {

    for (const star of stars) {

        ctx.fillStyle = star.color;

        ctx.beginPath();
        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function updateStars() {

    for (const star of stars) {

        star.y += star.speed;

        if (star.y > viewport.height) {

            star.y = -10;

            star.x = Math.random() * viewport.width;

        }
    }
}

