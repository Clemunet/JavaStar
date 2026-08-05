let planets = [];
let asteroids = [];
let shootingStars = [];
let shootingStarCooldown = 180;
let planetSpawnCooldown = 60;
let lastPlanetIndex = -1;

const backgroundImages = {
    planets: [
        Object.assign(new Image(), { src: "IMAGES/background/planet-blue.png" }),
        Object.assign(new Image(), { src: "IMAGES/background/planet-ringed.png" }),
        Object.assign(new Image(), { src: "IMAGES/background/planet-violet.png" })
    ],
    asteroid: Object.assign(new Image(), { src: "IMAGES/background/asteroid.png" }),
    shootingStar: Object.assign(new Image(), { src: "IMAGES/background/shooting-star.png" })
};

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

function createSpaceDecorations() {
    const planetColors = [
        ["#3566A8", "#15213F"],
        ["#B66A45", "#3A1D2B"],
        ["#6D4CA8", "#24183D"]
    ];
    planets = planetColors.map(function (colors, index) {
        return {
            x: 0,
            y: 0,
            radius: 80,
            speed: 0.5,
            colors,
            image: backgroundImages.planets[index],
            hasRing: index === 1,
            phase: Math.random() * Math.PI * 2,
            active: false,
            index
        };
    });
    planetSpawnCooldown = 60;
    lastPlanetIndex = -1;

    const asteroidCount = Math.max(10, Math.round(viewport.width / 130));
    asteroids = Array.from({ length: asteroidCount }, function () {
        const size = 7 + Math.random() * 20;
        return {
            x: Math.random() * viewport.width,
            y: Math.random() * viewport.height,
            size,
            speed: 0.18 + Math.random() * 0.55,
            drift: (Math.random() - 0.5) * 0.25,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.012,
            points: Array.from({ length: 8 }, () => 0.72 + Math.random() * 0.28)
        };
    });
    shootingStars = [];
}

function resizeSpaceDecorations(scaleX, scaleY) {
    for (const planet of planets) {
        if (planet.active) {
            planet.x *= scaleX;
            planet.y *= scaleY;
        }
    }
    for (const asteroid of asteroids) {
        asteroid.x *= scaleX;
        asteroid.y *= scaleY;
    }
    for (const shootingStar of shootingStars) {
        shootingStar.x *= scaleX;
        shootingStar.y *= scaleY;
    }
}

function drawPlanets() {
    for (const planet of planets) {
        if (!planet.active) continue;

        ctx.save();
        ctx.globalAlpha = 0.5;

        const halo = ctx.createRadialGradient(
            planet.x,
            planet.y,
            planet.radius * 0.7,
            planet.x,
            planet.y,
            planet.radius * 1.45
        );
        halo.addColorStop(0, planet.colors[0] + "55");
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius * 1.45, 0, Math.PI * 2);
        ctx.fill();

        if (planet.image.complete && planet.image.naturalWidth) {
            const imageSize = planet.radius * (planet.hasRing ? 4.2 : 2.8);
            ctx.drawImage(
                planet.image,
                planet.x - imageSize / 2,
                planet.y - imageSize / 2,
                imageSize,
                imageSize
            );
        } else {
            if (planet.hasRing) {
                ctx.strokeStyle = "rgba(205,190,160,0.4)";
                ctx.lineWidth = planet.radius * 0.1;
                ctx.beginPath();
                ctx.ellipse(
                    planet.x,
                    planet.y,
                    planet.radius * 1.65,
                    planet.radius * 0.42,
                    -0.18,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            }

            const surface = ctx.createRadialGradient(
                planet.x - planet.radius * 0.35,
                planet.y - planet.radius * 0.35,
                planet.radius * 0.08,
                planet.x,
                planet.y,
                planet.radius
            );
            surface.addColorStop(0, planet.colors[0]);
            surface.addColorStop(0.65, planet.colors[1]);
            surface.addColorStop(1, "#050812");
            ctx.fillStyle = surface;
            ctx.beginPath();
            ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

function drawAsteroids() {
    for (const asteroid of asteroids) {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        ctx.globalAlpha = 0.42;
        if (backgroundImages.asteroid.complete
            && backgroundImages.asteroid.naturalWidth) {
            const imageSize = asteroid.size * 3.2;
            ctx.drawImage(
                backgroundImages.asteroid,
                -imageSize / 2,
                -imageSize / 2,
                imageSize,
                imageSize
            );
        } else {
            ctx.fillStyle = "#697080";
            ctx.strokeStyle = "#9CA3AF";
            ctx.lineWidth = 1;
            ctx.beginPath();
            asteroid.points.forEach(function (factor, index) {
                const angle = index / asteroid.points.length * Math.PI * 2;
                const x = Math.cos(angle) * asteroid.size * factor;
                const y = Math.sin(angle) * asteroid.size * factor;
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
}

function drawShootingStars() {
    for (const star of shootingStars) {
        if (backgroundImages.shootingStar.complete
            && backgroundImages.shootingStar.naturalWidth) {
            ctx.save();
            ctx.translate(star.x, star.y);
            ctx.rotate(Math.PI);
            ctx.globalAlpha = star.life / star.maxLife;
            ctx.drawImage(backgroundImages.shootingStar, -140, -140, 280, 280);
            ctx.restore();
            continue;
        }

        const gradient = ctx.createLinearGradient(
            star.x,
            star.y,
            star.x - star.speedX * 9,
            star.y - star.speedY * 9
        );
        gradient.addColorStop(0, `rgba(220,240,255,${star.life / star.maxLife})`);
        gradient.addColorStop(1, "rgba(120,180,255,0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.speedX * 9, star.y - star.speedY * 9);
        ctx.stroke();
    }
}

function drawSpaceDecorations() {
    drawPlanets();
    drawAsteroids();
    drawShootingStars();
}

function updateSpaceDecorations() {
    for (const planet of planets) {
        if (!planet.active) continue;

        planet.y += planet.speed;
        planet.x += Math.sin(planet.phase + planet.y * 0.003) * 0.08;
        const verticalExtent = planet.radius * (planet.hasRing ? 2.1 : 1.4);
        if (planet.y - verticalExtent > viewport.height) {
            planet.active = false;
            planetSpawnCooldown = 240 + Math.floor(Math.random() * 360);
        }
    }

    if (!planets.some(planet => planet.active)) {
        planetSpawnCooldown--;
        if (planetSpawnCooldown <= 0) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * planets.length);
            } while (nextIndex === lastPlanetIndex && planets.length > 1);

            const planet = planets[nextIndex];
            planet.radius = 45 + Math.random() * 105;
            planet.speed = 0.38 + planet.radius / 150 * 0.5;
            const horizontalExtent = planet.radius * (planet.hasRing ? 2.1 : 1.4);
            const availableWidth = Math.max(0, viewport.width - horizontalExtent * 2);
            planet.x = horizontalExtent + Math.random() * availableWidth;
            planet.y = -planet.radius * (planet.hasRing ? 2.1 : 1.4);
            planet.phase = Math.random() * Math.PI * 2;
            planet.active = true;
            lastPlanetIndex = nextIndex;
        }
    }

    for (const asteroid of asteroids) {
        asteroid.y += asteroid.speed;
        asteroid.x += asteroid.drift;
        asteroid.rotation += asteroid.rotationSpeed;
        if (asteroid.y - asteroid.size > viewport.height) {
            asteroid.y = -asteroid.size;
            asteroid.x = Math.random() * viewport.width;
        }
        if (asteroid.x < -asteroid.size) asteroid.x = viewport.width + asteroid.size;
        if (asteroid.x > viewport.width + asteroid.size) asteroid.x = -asteroid.size;
    }

    shootingStarCooldown--;
    if (shootingStarCooldown <= 0) {
        shootingStars.push({
            x: viewport.width * (0.35 + Math.random() * 0.65),
            y: Math.random() * viewport.height * 0.35,
            speedX: -(8 + Math.random() * 5),
            speedY: 4 + Math.random() * 3,
            life: 55,
            maxLife: 55
        });
        shootingStarCooldown = 180 + Math.floor(Math.random() * 240);
    }

    for (const star of shootingStars) {
        star.x += star.speedX;
        star.y += star.speedY;
        star.life--;
    }
    shootingStars = shootingStars.filter(star => star.life > 0);
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

