const gameContainer = document.getElementById('game-container');
const playerContainer = document.getElementById('player-container');
const player = document.getElementById('player');
const playerNumberDisplay = document.getElementById('player-number-display');
let playerNumber = 5; // 초기 플레이어 숫자
let playerX = 0;
let playerY = 0;
const circles = [];
const numberOfCircles = 20;
const playerSpeed = 5;
const keysPressed = {};
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
let gameActive = true;
let invincible = false;
let invincibleEndTime = 0;
let gameStartTime = 0;
let invincibleItem = null;
let invincibleItemTimer = null;

const PLAYER_SAFE_RADIUS = 100;
const MIN_CIRCLE_SPEED = 0.5;
const SIZE_MULTIPLIER = 2; // 크기 변화 배수

function updatePlayerDisplay() {
    playerNumberDisplay.textContent = playerNumber;
    const playerWidth = parseFloat(player.offsetWidth);
    playerNumberDisplay.style.left = `${playerWidth / 2}px`;
    playerNumberDisplay.style.transform = `translateX(-50%)`;
}

function setPlayerSize() {
    const newPlayerSize = 20 + playerNumber * 0.3 * SIZE_MULTIPLIER; // 원 크기 공식과 동일
    player.style.width = `${newPlayerSize}px`;
    player.style.height = `${newPlayerSize}px`;
    playerContainer.style.width = `${newPlayerSize}px`;
    playerContainer.style.height = `${newPlayerSize}px`;
    updatePlayerDisplay();
}

function createCircle(initialX = null, initialY = null) {
    if (!gameActive || circles.length >= numberOfCircles) return;

    const circle = document.createElement('div');
    circle.classList.add('circle');
    const minCircleNumber = Math.floor(playerNumber / 2);
    const maxCircleNumber = playerNumber * 3;
    let randomNumber = Math.floor(Math.random() * (maxCircleNumber - minCircleNumber + 1)) + minCircleNumber;
    circle.textContent = randomNumber;
    circle.dataset.number = randomNumber;

    const initialSize = 20 + randomNumber * 0.3 * SIZE_MULTIPLIER; // 크기 변화 2배 적용
    circle.style.width = `${initialSize}px`;
    circle.style.height = `${initialSize}px`;
    circle.dataset.size = initialSize;

    let x, y;
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
    const circleRadius = initialSize / 2;

    // 테두리에서 랜덤 위치 결정
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    switch (side) {
        case 0: // top
            x = Math.random() * (containerWidth - initialSize);
            y = -circleRadius;
            break;
        case 1: // right
            x = containerWidth + circleRadius;
            y = Math.random() * (containerHeight - initialSize);
            break;
        case 2: // bottom
            x = Math.random() * (containerWidth - initialSize);
            y = containerHeight + circleRadius;
            break;
        case 3: // left
            x = -circleRadius;
            y = Math.random() * (containerHeight - initialSize);
            break;
    }

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    gameContainer.appendChild(circle);
    circles.push(circle);

    // 이동 벡터 초기화
    const targetX = Math.random() * (containerWidth - initialSize);
    const targetY = Math.random() * (containerHeight - initialSize);

    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let speed = MIN_CIRCLE_SPEED + Math.random() * 1.5; // 최소 속도 이상으로 설정
    circle.speedX = (dx / distance) * speed;
    circle.speedY = (dy / distance) * speed;

    moveCircle(circle);

    circle.intervalId = setInterval(() => {
        let currentNumber = parseInt(circle.dataset.number);
        if (currentNumber > 1) {
            randomNumber -= 1;
            circle.textContent = randomNumber;
            circle.dataset.number = randomNumber;

            const newSize = 20 + randomNumber * 0.3 * SIZE_MULTIPLIER; // 크기 변화 2배 적용
            circle.style.width = `${newSize}px`;
            circle.style.height = `${newSize}px`;
            circle.dataset.size = newSize;
        } else if (currentNumber === 1) {
            circle.textContent = 0;
            circle.dataset.number = 0;
            circle.style.backgroundColor = '#888';
            circle.style.width = '20px';
            circle.style.height = '20px';
            circle.dataset.size = 20;
        } else if (currentNumber === 0) {
            const index = circles.indexOf(circle);
            if (index > -1) {
                gameContainer.removeChild(circle);
                clearInterval(circle.intervalId);
                cancelAnimationFrame(circle.animationFrameId);
                circles.splice(index, 1);
                if (gameActive) {
                    createCircle();
                }
            }
        }
    }, 1000);
}

function moveCircle(circle) {
    function animate() {
        if (!gameActive) return;
        let x = parseFloat(circle.style.left);
        let y = parseFloat(circle.style.top);
        const size = parseFloat(circle.style.width);
        const radius = size / 2;

        x += circle.speedX;
        y += circle.speedY;

        let shouldRemove = false;
        if (x < -radius || x > gameContainer.offsetWidth + radius || y < -radius || y > gameContainer.offsetHeight + radius) {
            shouldRemove = true;
        }

        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;

        if (shouldRemove) {
            const index = circles.indexOf(circle);
            if (index > -1) {
                gameContainer.removeChild(circle);
                clearInterval(circle.intervalId);
                cancelAnimationFrame(circle.animationFrameId);
                circles.splice(index, 1);
                if (gameActive) {
                    createCircle();
                }
            }
        } else {
            circle.animationFrameId = requestAnimationFrame(animate);
        }
    }
    animate();
}

function updatePlayerPosition() {
    if (!gameActive) return;
    const containerRect = gameContainer.getBoundingClientRect();
    const currentPlayerWidth = parseFloat(playerContainer.offsetWidth);
    const currentPlayerHeight = parseFloat(playerContainer.offsetHeight);

    if (keysPressed['ArrowLeft']) {
        playerX = Math.max(0, playerX - playerSpeed);
    }
    if (keysPressed['ArrowRight']) {
        playerX = Math.min(containerRect.width - currentPlayerWidth, playerX + playerSpeed);
    }
    if (keysPressed['ArrowUp']) {
        playerY = Math.max(0, playerY - playerSpeed);
    }
    if (keysPressed['ArrowDown']) {
        playerY = Math.min(containerRect.height - currentPlayerHeight, playerY + playerSpeed);
    }

    playerContainer.style.left = `${playerX}px`;
    playerContainer.style.top = `${playerY}px`;

    updatePlayerDisplay();

    requestAnimationFrame(updatePlayerPosition);
}

function handleKeyDown(event) {
    if (!gameActive) return;
    keysPressed[event.key] = true;
}

function handleKeyUp(event) {
    if (!gameActive) return;
    delete keysPressed[event.key];
}

function checkCollision() {
    if (!gameActive) return;
    const playerRect = player.getBoundingClientRect();
    const currentTime = Date.now();

    if (currentTime < gameStartTime + 2000) {
        invincible = true;
    }

    if (invincible) {
        player.classList.add('invincible');
    } else {
        player.classList.remove('invincible');
    }

    if (invincible && currentTime > invincibleEndTime) {
        invincible = false;
    }

    for (let i = circles.length - 1; i >= 0; i--) {
        const circle = circles[i];
        const circleRect = circle.getBoundingClientRect();
        const circleNumber = parseInt(circle.dataset.number);

        if (playerRect.left < circleRect.right &&
            playerRect.right > circleRect.left &&
            playerRect.top < circleRect.bottom &&
            playerRect.bottom > circleRect.top) {

            if (invincible && circleNumber > 0) {
                playerNumber += 2;
                setPlayerSize(); // 플레이어 크기 업데이트

                gameContainer.removeChild(circle);
                clearInterval(circle.intervalId);
                cancelAnimationFrame(circle.animationFrameId);
                circles.splice(i, 1);
                createCircle();
            } else if (playerNumber > circleNumber && circleNumber > 0) {
                playerNumber += 1;
                setPlayerSize(); // 플레이어 크기 업데이트

                gameContainer.removeChild(circle);
                clearInterval(circle.intervalId);
                cancelAnimationFrame(circle.animationFrameId);
                circles.splice(i, 1);
                createCircle();
            } else if (playerNumber < circleNumber && !invincible) {
                gameOver();
                return;
            }
        }
    }

    // 무적 아이템 충돌 체크
    if (invincibleItem) {
        const itemRect = invincibleItem.getBoundingClientRect();
        if (playerRect.left < itemRect.right &&
            playerRect.right > itemRect.left &&
            playerRect.top < itemRect.bottom &&
            playerRect.bottom > itemRect.top) {
            invincible = true;
            invincibleEndTime = Date.now() + 2000;
            gameContainer.removeChild(invincibleItem);
            clearInterval(invincibleItemTimer);
            invincibleItem = null;
        }
    }

    requestAnimationFrame(checkCollision);
}

function gameOver() {
    gameActive = false;
    finalScore.textContent = playerNumber;
    gameOverScreen.classList.remove('hidden');

    circles.forEach(circle => {
        clearInterval(circle.intervalId);
        cancelAnimationFrame(circle.animationFrameId);
        gameContainer.removeChild(circle);
    });
    circles.length = 0;

    if (invincibleItem) {
        clearInterval(invincibleItemTimer);
        gameContainer.removeChild(invincibleItem);
        invincibleItem = null;
    }
}

function restartGame() {
    gameActive = true;
    playerNumber = 5;
    setPlayerSize(); // 플레이어 크기 초기화
    playerX = gameContainer.offsetWidth / 2 - playerContainer.offsetWidth / 2;
    playerY = gameContainer.offsetHeight / 2 - playerContainer.offsetHeight / 2;
    playerContainer.style.left = `${playerX}px`;
    playerContainer.style.top = `${playerY}px`;
    invincible = false;
    player.classList.remove('invincible');
    gameStartTime = Date.now();
    updatePlayerDisplay();

    for (const key in keysPressed) {
        delete keysPressed[key];
    }

    circles.forEach(circle => {
        clearInterval(circle.intervalId);
        cancelAnimationFrame(circle.animationFrameId);
        gameContainer.removeChild(circle);
    });
    circles.length = 0;

    if (invincibleItem) {
        clearInterval(invincibleItemTimer);
        gameContainer.removeChild(invincibleItem);
        invincibleItem = null;
    }

    for (let i = 0; i < numberOfCircles; i++) {
        createCircle();
    }

    gameOverScreen.classList.add('hidden');
    checkCollision();
    updatePlayerPosition();
    spawnInvincibleItem();
}

function spawnInvincibleItem() {
    if (!gameActive) return;

    const spawnDelay = Math.random() * 10000 + 20000;

    setTimeout(() => {
        if (!gameActive) return;

        invincibleItem = document.createElement('div');
        invincibleItem.classList.add('invincible-item');
        let expireTime = 3;
        invincibleItem.textContent = expireTime;

        const itemSize = 20;
        invincibleItem.style.left = `${Math.random() * (gameContainer.offsetWidth - itemSize)}px`;
        invincibleItem.style.top = `${Math.random() * (gameContainer.offsetHeight - itemSize)}px`;

        gameContainer.appendChild(invincibleItem);

        invincibleItemTimer = setInterval(() => {
            expireTime--;
            if (invincibleItem) {
                invincibleItem.textContent = expireTime;
                if (expireTime <= 0) {
                    if (invincibleItem) {
                        gameContainer.removeChild(invincibleItem);
                        invincibleItem = null;
                        clearInterval(invincibleItemTimer);
                    }
                }
            } else {
                clearInterval(invincibleItemTimer);
            }
        }, 1000);

        spawnInvincibleItem();

    }, spawnDelay);
}

// 초기 플레이어 위치 설정 및 움직임 시작
const initialPlayerSize = 20 + playerNumber * 0.3 * SIZE_MULTIPLIER; // 초기 플레이어 크기 설정
player.style.width = `${initialPlayerSize}px`;
player.style.height = `${initialPlayerSize}px`;
playerContainer.style.width = `${initialPlayerSize}px`;
playerContainer.style.height = `${initialPlayerSize}px`;
playerX = gameContainer.offsetWidth / 2 - playerContainer.offsetWidth / 2;
playerY = gameContainer.offsetHeight / 2 - playerContainer.offsetHeight / 2;
playerContainer.style.left = `${playerX}px`;
playerContainer.style.top = `${playerY}px`;
updatePlayerDisplay();
updatePlayerPosition(); // 최초 실행 시 위치 업데이트 및 움직임 시작

// 초기 원 생성
for (let i = 0; i < numberOfCircles; i++) {
    createCircle();
}

// 게임 시작 시간 기록
gameStartTime = Date.now();

// 키보드 이벤트 리스너 (DOM 로드 후 실행되도록)
window.addEventListener('load', () => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
});

// 재시작 버튼 이벤트 리스너
restartButton.addEventListener('click', restartGame);

// 충돌 감지 시작
checkCollision();

// 무적 아이템 생성 시작
spawnInvincibleItem();