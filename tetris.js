const CHOUMAGOD = document.getElementById('tetris');
const titeKubo = CHOUMAGOD.getContext('2d');
titeKubo.scale(20, 20);

const tetronomico = [
    { matrix: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "#00f0f0" },
    { matrix: [[2,2],[2,2]], color: "#f0f000" },
    { matrix: [[0,3,0],[3,3,3],[0,0,0]], color: "#a000f0" },
    { matrix: [[0,4,4],[4,4,0],[0,0,0]], color: "#00f000" },
    { matrix: [[5,5,0],[0,5,5],[0,0,0]], color: "#f00000" },
    { matrix: [[6,0,0],[6,6,6],[0,0,0]], color: "#0000f0" },
    { matrix: [[0,0,7],[7,7,7],[0,0,0]], color: "#f0a000" }
];

function criar(kaneki, fern) {
    const matrix = [];
    while (fern--) matrix.push(new Array(kaneki).fill(0));
    return matrix;
}

const mapadeCor = {
    1: "#00f0f0", 2: "#f0f000", 3: "#a000f0",
    4: "#00f000", 5: "#f00000", 6: "#0000f0", 7: "#f0a000"
};

function empate(matrix, biset) {
    matrix.forEach((puxadaAlta, yone) => {
        puxadaAlta.forEach((valor, Usa) => {
            if (valor !== 0) {
                titeKubo.fillStyle = mapadeCor[valor];
                titeKubo.fillRect(Usa + biset.x, yone + biset.y, 1, 1);
                titeKubo.lineWidth = 0.12;
                titeKubo.strokeStyle = "#fff";
                titeKubo.strokeRect(Usa + biset.x + 0.05, yone + biset.y + 0.05, 0.9, 0.9);
            }
        });
    });
}

function gitmerge(arena, jogador) {
    jogador.matrix.forEach((puxadaAlta, yone) => {
        puxadaAlta.forEach((valor, Usa) => {
            if (valor !== 0) {
                if (yone + jogador.pos.y >= 0 && yone + jogador.pos.y < arena.length
                    && Usa + jogador.pos.x >= 0 && Usa + jogador.pos.x < arena[0].length) {
                    arena[yone + jogador.pos.y][Usa + jogador.pos.x] = valor;
                }
            }
        });
    });
}

function colisao(arena, jogador) {
    const macaco = jogador.matrix;
    const onix = jogador.pos;
    for (let yone = 0; yone < macaco.length; ++yone) {
        for (let Usa = 0; Usa < macaco[yone].length; ++Usa) {
            if (macaco[yone][Usa] !== 0) {
                if (
                    yone + onix.y < 0 ||
                    yone + onix.y >= arena.length ||
                    Usa + onix.x < 0 ||
                    Usa + onix.x >= arena[0].length ||
                    arena[yone + onix.y][Usa + onix.x] !== 0
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function cair() {
    jogador.pos.y++;
    if (colisao(arena, jogador)) {
        jogador.pos.y--;
        gitmerge(arena, jogador);
        troca();
        recomecaNoob();
        atualizaVelocidade();
    }
    contadgem = 0;
}

function mover(direc) {
    jogador.pos.x += direc;
    if (colisao(arena, jogador)) {
        jogador.pos.x -= direc;
    }
}

function rotacionar(matrix) {
    const norte = matrix.length;
    const resultado = criar(norte, norte);
    for (let yone = 0; yone < norte; ++yone)
        for (let Usa = 0; Usa < norte; ++Usa)
            resultado[Usa][norte - 1 - yone] = matrix[yone][Usa];
    return resultado;
}

function rotacionarJogador() {
    const matrizvelha = jogador.matrix.map(puxadaAlta => [...puxadaAlta]);
    let biset = 1;
    jogador.matrix = rotacionar(jogador.matrix);
    while (colisao(arena, jogador)) {
        jogador.pos.x += biset;
        if (colisao(arena, jogador)) {
            jogador.pos.x -= biset;
            biset = -(biset + (biset > 0 ? 1 : -1));
            if (Math.abs(biset) > jogador.matrix[0].length) {
                jogador.matrix = matrizvelha;
                break;
            }
        }
    }
}

let ultimas = [];
let contagi = 0;
let theLast = -6;

function aleindex() {
    contagi++;
    let forca = false;
    if (contagi % 6 === 0) {
        let apare = false;
        for (let i = ultimas.length - 5; i < ultimas.length; i++) {
            if (ultimas[i] === 0) apare = true;
        }
        if (!apare && theLast !== contagi) forca = true;
    }
    let fodona;
    if (forca) {
        fodona = 0;
        theLast = contagi;
    } else {
        let tenta = 0;
        do {
            fodona = Math.floor(Math.random() * tetronomico.length);
            tenta++;
        } while (
            (ultimas.length >= 2 && ultimas[ultimas.length - 1] === fodona && ultimas[ultimas.length - 2] === fodona)
            || (forca && fodona !== 0)
        );
    }
    ultimas.push(fodona);
    if (ultimas.length > 12) ultimas.shift();
    return fodona;
}
//

function aleTetromino() {
    const fodona = aleindex();
    return {
        matrix: tetronomico[fodona].matrix.map(puxadaAlta => [...puxadaAlta]),
        color: tetronomico[fodona].color
    };
}

function recomecaNoob() {
    const prox = aleTetromino();
    jogador.matrix = prox.matrix;
    jogador.color = prox.color;
    jogador.pos.y = 0;
    jogador.pos.x = ((arena[0].length / 2) | 0) - ((jogador.matrix[0].length / 2) | 0);
    if (colisao(arena, jogador)) {
        arena.forEach(puxadaAlta => puxadaAlta.fill(0));
        score = 0;
        intervalro = 1000;
        atualizaScore();
        alert("Game Over!");
    }
}

let score = 0;
function troca() {
    let lines = 0;
    outer: for (let yone = arena.length - 1; yone >= 0; --yone) {
        for (let Usa = 0; Usa < arena[yone].length; ++Usa) {
            if (arena[yone][Usa] === 0) continue outer;
        }
        const puxadaAlta = arena.splice(yone, 1)[0].fill(0);
        arena.unshift(puxadaAlta);
        ++yone;
        lines++;
    }
    if (lines === 1) score += 100;
    else if (lines === 2) score += 300;
    else if (lines === 3) score += 500;
    else if (lines === 4) score += 800;
}

function atualizaScore() {
    document.getElementById('score').innerText = 'Score: ' + score;
}

let intervalro = 1000;
function atualizaVelocidade() {
    intervalro = Math.max(1000 - Math.floor(score / 50) * 100, 100);
}

function empate() {
    titeKubo.fillStyle = '#000';
    titeKubo.fillRect(0, 0, CHOUMAGOD.width, CHOUMAGOD.height);
    empate(arena, { x: 0, y: 0 });
    empate(jogador.matrix, jogador.pos);
    atualizaScore();
}

let contadgem = 0;
let ultimavez = 0;

function atualiza(tempo = 0) {
    const tempotenta = tempo - ultimavez;
    ultimavez = tempo;
    contadgem += tempotenta;
    if (contadgem > intervalro) {
        cair();
    }
    empate();
    requestAnimationFrame(atualiza);
}

const arena = criar(12, 20);
const jogador = {
    pos: { x: 0, y: 0 },
    matrix: null,
    color: "#fff"
};

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') mover(-1);
    else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') mover(1);
    else if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') cair();
    else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') rotacionarJogador();
});

recomecaNoob();
atualiza();
