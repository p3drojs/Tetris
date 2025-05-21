const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const tetrominos = [
    { matrix: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "#00f0f0" }, // I
    { matrix: [[2,2],[2,2]], color: "#f0f000" },                            // O
    { matrix: [[0,3,0],[3,3,3],[0,0,0]], color: "#a000f0" },                // T
    { matrix: [[0,4,4],[4,4,0],[0,0,0]], color: "#00f000" },                // S
    { matrix: [[5,5,0],[0,5,5],[0,0,0]], color: "#f00000" },                // Z
    { matrix: [[6,0,0],[6,6,6],[0,0,0]], color: "#0000f0" },                // J
    { matrix: [[0,0,7],[7,7,7],[0,0,0]], color: "#f0a000" }                 // L
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

const colorMap = {
    1: "#00f0f0", 2: "#f0f000", 3: "#a000f0",
    4: "#00f000", 5: "#f00000", 6: "#0000f0", 7: "#f0a000"
};

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colorMap[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.lineWidth = 0.12;
                context.strokeStyle = "#fff";
                context.strokeRect(x + offset.x + 0.05, y + offset.y + 0.05, 0.9, 0.9);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (y + player.pos.y >= 0 && y + player.pos.y < arena.length
                    && x + player.pos.x >= 0 && x + player.pos.x < arena[0].length) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            }
        });
    });
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0) {
                if (
                    y + o.y < 0 ||
                    y + o.y >= arena.length ||
                    x + o.x < 0 ||
                    x + o.x >= arena[0].length ||
                    arena[y + o.y][x + o.x] !== 0
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        playerReset();
        updateSpeed();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function rotateMatrix(matrix) {
    const N = matrix.length;
    const result = createMatrix(N, N);
    for (let y = 0; y < N; ++y)
        for (let x = 0; x < N; ++x)
            result[x][N - 1 - y] = matrix[y][x];
    return result;
}

function playerRotate() {
    const oldMatrix = player.matrix.map(row => [...row]);
    let offset = 1;
    player.matrix = rotateMatrix(player.matrix);
    while (collide(arena, player)) {
        player.pos.x += offset;
        if (collide(arena, player)) {
            player.pos.x -= offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (Math.abs(offset) > player.matrix[0].length) {
                player.matrix = oldMatrix;
                break;
            }
        }
    }
}

let lastPieces = [];
let pieceCount = 0;
let lastIForce = -6; 

function randomTetrominoIndex() {
    pieceCount++;
    let forceI = false;
    if (pieceCount % 6 === 0) {
        let appeared = false;
        for (let i = lastPieces.length - 5; i < lastPieces.length; i++) {
            if (lastPieces[i] === 0) appeared = true;
        }
        if (!appeared && lastIForce !== pieceCount) forceI = true;
    }
    let idx;
    if (forceI) {
        idx = 0;
        lastIForce = pieceCount;
    } else {
        let tries = 0;
        do {
            idx = Math.floor(Math.random() * tetrominos.length);
            tries++;
        } while (
            (lastPieces.length >= 2 && lastPieces[lastPieces.length - 1] === idx && lastPieces[lastPieces.length - 2] === idx)
            || (forceI && idx !== 0)
        );
    }
    lastPieces.push(idx);
    if (lastPieces.length > 12) lastPieces.shift();
    return idx;
}

function randomTetromino() {
    const idx = randomTetrominoIndex();
    return {
        matrix: tetrominos[idx].matrix.map(row => [...row]),
        color: tetrominos[idx].color
    };
}

function playerReset() {
    const next = randomTetromino();
    player.matrix = next.matrix;
    player.color = next.color;
    player.pos.y = 0;
    player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        score = 0;
        dropInterval = 1000;
        updateScore();
        alert("Game Over!");
    }
}

let score = 0;
function arenaSweep() {
    let lines = 0;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        lines++;
    }
    if (lines === 1) score += 100;
    else if (lines === 2) score += 300;
    else if (lines === 3) score += 500;
    else if (lines === 4) score += 800;
}

function updateScore() {
    document.getElementById('score').innerText = 'Score: ' + score;
}

let dropInterval = 1000;
function updateSpeed() {
    dropInterval = Math.max(1000 - Math.floor(score / 50) * 100, 100);
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
    updateScore();
}

let dropCounter = 0;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    color: "#fff"
};

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') playerMove(-1);
    else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') playerMove(1);
    else if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') playerDrop();
    else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') playerRotate();
});

playerReset();
update();
