/**
 * tetris.js - テトリスのコアゲームロジック
 * テトリス・アドベンチャー v1.0.1
 */

class Tetris {
    constructor(config = {}) {
        // ゲーム設定
        this.rows = config.rows || 20;
        this.cols = config.cols || 10;
        this.scorePerLine = config.scorePerLine || 100;
        this.level = config.level || 1;
        this.gameMode = config.gameMode || 'classic';
        
        // ゲーム状態
        this.score = 0;
        this.lines = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.holdPiece = null;
        this.canHold = true;
        
        // ボード初期化
        this.board = this.createEmptyBoard();
        
        // テトロミノ定義
        this.tetrominos = {
            'I': {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: '#00FFFF'
            },
            'J': {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#0000FF'
            },
            'L': {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#FF8800'
            },
            'O': {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#FFFF00'
            },
            'S': {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: '#00FF00'
            },
            'T': {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#9900FF'
            },
            'Z': {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: '#FF0000'
            }
        };
        
        // 次のピースキュー（次の7つのピース）
        this.nextPieces = [];
        this.fillNextPieces();
        
        // 現在のピース
        this.currentPiece = null;
        this.getNextPiece();
        
        // イベントコールバック
        this.onGameOver = config.onGameOver || (() => {});
        this.onScore = config.onScore || (() => {});
        this.onLinesCleared = config.onLinesCleared || (() => {});
        this.onPieceMove = config.onPieceMove || (() => {});
        this.onPieceRotate = config.onPieceRotate || (() => {});
        this.onHold = config.onHold || (() => {});
        
        // ゲームループ
        this.lastFrameTime = 0;
        this.dropInterval = 1000 - (this.level * 50); // レベルに応じてドロップ速度を調整
        this.frameId = null;
    }
    
    // 空のボードを作成
    createEmptyBoard() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }
    
    // 次のピースキューを補充
    fillNextPieces() {
        if (this.nextPieces.length <= 3) {
            // 7種類のテトロミノをランダムに並べてキューに追加
            const bag = Object.keys(this.tetrominos);
            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]]; // Fisher-Yatesシャッフル
            }
            this.nextPieces = [...this.nextPieces, ...bag];
        }
    }
    
    // 次のピースを取得
    getNextPiece() {
        this.currentPiece = {
            type: this.nextPieces.shift(),
            x: Math.floor(this.cols / 2) - 1,
            y: 0,
            rotation: 0
        };
        
        this.fillNextPieces();
        
        // 衝突チェック - ゲームオーバー判定
        if (this.checkCollision()) {
            this.isGameOver = true;
            this.onGameOver(this.score, this.lines, this.level);
        }
    }
    
    // 衝突チェック
    checkCollision(piece = this.currentPiece, offsetX = 0, offsetY = 0, rotation = 0) {
        const tetromino = this.tetrominos[piece.type];
        const shape = this.rotateShape(tetromino.shape, (piece.rotation + rotation) % 4);
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = piece.x + x + offsetX;
                    const boardY = piece.y + y + offsetY;
                    
                    // 境界外チェック
                    if (boardX < 0 || boardX >= this.cols || boardY >= this.rows) {
                        return true;
                    }
                    
                    // ボードとの衝突チェック（ボード上部は除外）
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 形状を回転
    rotateShape(shape, rotation) {
        let result = JSON.parse(JSON.stringify(shape)); // ディープコピー
        
        for (let r = 0; r < rotation; r++) {
            // 90度回転
            const newShape = Array.from({ length: result[0].length }, () => Array(result.length).fill(0));
            for (let y = 0; y < result.length; y++) {
                for (let x = 0; x < result[y].length; x++) {
                    newShape[x][result.length - 1 - y] = result[y][x];
                }
            }
            result = newShape;
        }
        
        return result;
    }
    
    // ピースをボードに固定
    lockPiece() {
        const tetromino = this.tetrominos[this.currentPiece.type];
        const shape = this.rotateShape(tetromino.shape, this.currentPiece.rotation);
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    
                    // ボード上部の範囲外は無視
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = {
                            type: this.currentPiece.type,
                            color: tetromino.color
                        };
                    }
                }
            }
        }
        
        // ラインクリアチェック
        this.checkLines();
        
        // 次のピースを取得
        this.getNextPiece();
        
        // ホールドリセット
        this.canHold = true;
    }
    
    // ラインクリアチェック
    checkLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // ラインが揃った場合削除して上から空行を追加
                this.board.splice(y, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // 同じ位置を再チェック
            }
        }
        
        if (linesCleared > 0) {
            // スコア計算 (1:100, 2:300, 3:500, 4:800)
            const points = [0, 100, 300, 500, 800][linesCleared] * this.level;
            this.score += points;
            this.lines += linesCleared;
            
            // レベルアップチェック（10ライン消去ごと）
            if (Math.floor(this.lines / 10) > Math.floor((this.lines - linesCleared) / 10)) {
                this.level++;
                this.dropInterval = Math.max(100, 1000 - (this.level * 50));
            }
            
            this.onLinesCleared(linesCleared, this.lines, this.level);
            this.onScore(this.score);
        }
    }
    
    // ピースを移動
    movePiece(dx, dy) {
        if (this.isPaused || this.isGameOver) return false;
        
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            this.onPieceMove(dx, dy);
            return true;
        }
        
        // 下方向の移動が失敗した場合はピースを固定
        if (dy > 0) {
            this.lockPiece();
            return false;
        }
        
        return false;
    }
    
    // ピースを回転
    rotatePiece(direction = 1) { // 1: 時計回り, -1: 反時計回り
        if (this.isPaused || this.isGameOver) return false;
        
        const newRotation = (this.currentPiece.rotation + direction + 4) % 4;
        
        // ウォールキック用のオフセット候補
        const kickOffsets = [
            [0, 0], // そのまま
            [1, 0], // 右
            [-1, 0], // 左
            [0, -1], // 上
            [1, -1], // 右上
            [-1, -1], // 左上
            [2, 0], // 右2
            [-2, 0], // 左2
        ];
        
        // 'I'テトロミノの場合は追加オフセット
        if (this.currentPiece.type === 'I') {
            kickOffsets.push([0, -2], [0, 1]);
        }
        
        // ウォールキックを試す
        for (const [offsetX, offsetY] of kickOffsets) {
            if (!this.checkCollision(this.currentPiece, offsetX, offsetY, direction)) {
                this.currentPiece.rotation = newRotation;
                this.currentPiece.x += offsetX;
                this.currentPiece.y += offsetY;
                this.onPieceRotate(direction);
                return true;
            }
        }
        
        return false;
    }
    
    // ハードドロップ（一気に落下）
    hardDrop() {
        if (this.isPaused || this.isGameOver) return;
        
        let dropDistance = 0;
        while (!this.checkCollision(this.currentPiece, 0, dropDistance + 1)) {
            dropDistance++;
        }
        
        if (dropDistance > 0) {
            this.currentPiece.y += dropDistance;
            this.onPieceMove(0, dropDistance);
        }
        
        this.lockPiece();
    }
    
    // ホールド機能
    holdPiece() {
        if (this.isPaused || this.isGameOver || !this.canHold) return;
        
        // ホールドと現在のピースを交換
        const tempType = this.currentPiece.type;
        
        if (this.holdPiece) {
            this.currentPiece = {
                type: this.holdPiece,
                x: Math.floor(this.cols / 2) - 1,
                y: 0,
                rotation: 0
            };
        } else {
            this.getNextPiece();
        }
        
        this.holdPiece = tempType;
        this.canHold = false;
        this.onHold(this.holdPiece);
    }
    
    // ゲームループ
    gameLoop(timestamp) {
        if (this.isPaused || this.isGameOver) {
            this.lastFrameTime = timestamp;
            this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }
        
        const deltaTime = timestamp - this.lastFrameTime;
        
        if (deltaTime > this.dropInterval) {
            this.movePiece(0, 1); // 自動落下
            this.lastFrameTime = timestamp;
        }
        
        this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // ゲーム開始
    start() {
        if (this.frameId) return;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.frameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // ゲーム一時停止
    pause() {
        this.isPaused = true;
    }
    
    // ゲーム再開
    resume() {
        if (this.isGameOver) return;
        this.isPaused = false;
        this.lastFrameTime = performance.now();
    }
    
    // ゲームリセット
    reset(config = {}) {
        // 設定をリセット
        this.rows = config.rows || this.rows;
        this.cols = config.cols || this.cols;
        this.level = config.level || 1;
        this.gameMode = config.gameMode || 'classic';
        
        // 状態をリセット
        this.score = 0;
        this.lines = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.holdPiece = null;
        this.canHold = true;
        
        // ボードをリセット
        this.board = this.createEmptyBoard();
        
        // 次のピースキューをリセット
        this.nextPieces = [];
        this.fillNextPieces();
        
        // 現在のピースをリセット
        this.getNextPiece();
        
        // ゲームループが実行中の場合は停止
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        
        // ドロップ間隔をリセット
        this.dropInterval = 1000 - (this.level * 50);
    }
    
    // ゲーム状態の取得
    getState() {
        return {
            board: this.board,
            currentPiece: this.currentPiece,
            nextPieces: this.nextPieces.slice(0, 3),
            holdPiece: this.holdPiece,
            score: this.score,
            level: this.level,
            lines: this.lines,
            gameMode: this.gameMode,
            isGameOver: this.isGameOver,
            isPaused: this.isPaused
        };
    }
}

// テトリスインスタンスへのグローバルアクセス
let tetrisInstance = null;

// テトリスインスタンスを初期化/取得する関数
function initTetris(config) {
    tetrisInstance = new Tetris(config);
    return tetrisInstance;
}

function getTetris() {
    return tetrisInstance;
}
