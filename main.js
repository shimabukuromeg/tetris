const board = [];

for (let y = -2; y < 21; y++) {
    board[y] = [];
    for (let x = -1; x < 11; x++) {
      if (y === -2 || y === 20 || x < 0 || x >= 10) {
        board[y][x] = 1;
      } else {
        board[y][x] = 0;
      }
    }
  }

const showBoard = () => {
    while(document.body.firstChild) {
        document.body.removeChild(document.body.firstChild)
    }
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            const v = board[y][x];
            let edgeColor, bgColor;
            if (v === 0){
                edgeColor = '#888';
                bgColor = '#ccc'
            } else if (v === 8) {
                edgeColor = '#D92626';
                bgColor = '#2B0707'              
            } else {
                edgeColor = `hsl(${((v - 1) / 8) * 360}deg, 100%, 50%)`;
                bgColor = `hsl(${((v - 1) / 8) * 360}deg, 100%, 70%)`;
            }
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.left = `${x * 24}px`;
            div.style.top = `${y * 24}px`;
            div.style.width = '24px';
            div.style.height = '24px';
            div.style.boxSizing = 'border-box';
            div.style.border = '4px ridge ' + edgeColor;
            div.style.backgroundColor = bgColor;
            document.body.appendChild(div)
        }
    }
}

const blockShapes = [
    [0, []],
    [2, [0, -1], [0, 1], [0, 2]], //tetris
    [2, [0, -1], [1, 0], [1, 1]], //key 1
    [2, [0, -1], [-1, 0], [-1, 1]], //key 2
    [1, [1, 0], [0, 1], [1, 1]], // square
    [4, [0, -1], [0, 1], [1, 1]], // l1
    [4, [0, -1], [0, 1], [-1, 1]], // L2
    [4, [0, -1], [1, 0], [-1, 0]] // T
];

// NOTE: 置くだけ（表示は showBoard）
const putBlock = (blockIndex, x, y, rotation, remove = false, action = false) => {
    console.log(blockIndex, x, y, rotation)
    const blockShape = [...blockShapes[blockIndex]];
    const rotateMax = blockShape.shift();
    blockShape.unshift([0, 0])
    for(let [dx, dy] of blockShape) {
        for(let i = 0; i < rotation % rotateMax; i++) {
            [dx, dy] = [dy, -dx];
        }
        if(remove) {
            board[y + dy][x + dx] = 0;
        } else {
            // 既にブロックがある場合は終了
            if (board[y + dy][x + dx]) {
                console.log(board[y + dy][x + dx])
                return false
            }
            // メインの処理
            if(action) {
                board[y + dy][x + dx] = blockIndex;
            }
        }
    }
    if(!action) {
        putBlock(blockIndex, x, y, rotation, remove, true)
    }
    return true;
}

let cx, cy, cr, ci;
let gameOver = false;

const move = (dx, dy, dr) => {
    // 今のブロックを消す
    putBlock(ci, cx, cy, cr, true);
    // 新しい位置にブロックを移動する
    if (putBlock(ci, cx + dx, cy + dy, cr + dr)) {
        cx += dx;
        cy += dy;
        cr += dr;
        showBoard();
        return true
    } else {
        putBlock(ci, cx, cy, cr);
        return false;

    }
}

// NOTE: 新しいブロックを生成する
const createNewBlock = () => {
    clearLine()
    ci = Math.trunc(Math.random() * 7 + 1);
    cr = Math.trunc(Math.random() * 4);
    cx = 4;
    cy = 0;
    if(!putBlock(ci, cx, cy, cr)) {
        gameOver = true;
        console.log('gameOver', gameOver);
        for(let y = 0; y < 20; y++) {
            for(let x = 0; x < 10; x++) {
                 if(board[y][x]) {
                    board[y][x] = 8;
                 }
            }
        }
        showBoard();
    }
}

const clearLine = () => {
    for(let y = 0; y < 20; y++) {
        let removable = true;
        for(let x = 0; x < 10; x++) {
            if(board[y][x] === 0) {
                removable = false;
                break;
            }
        }
        if(removable) {
            for(let j = y; j >= -1; j--) {
                for(let x = 0; x < 10; x++) {
                    board[j][x] = (j === -1) ? 0 : board[j - 1][x];
                }
            }
        }
    }
}

window.onload = () => {
    createNewBlock();

    setInterval(() => {
        if (!move(0, 1, 0)) {
            // 次のブロックを生成する
            if (!gameOver) {
                createNewBlock();
            }
        }
    }, 1000)

    document.onkeydown = (e) => {
        console.log('gameOver', gameOver)
        if (gameOver) return;
        switch(e.key) {
            case "ArrowLeft":
                move(-1, 0, 0);
                break;
            case "ArrowRight":
                move(1, 0, 0);
                break;
            case "ArrowDown":
                if(!move(0, 1, 0)) {
                    createNewBlock()
                }
                break
            case "ArrowUp":
                move(0, 0, 1);
                break;
            case " ":
                move(0, -1, 0);
                break;
            default:
                break;
        }
        e.preventDefault();
    }

    showBoard()
}
