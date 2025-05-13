/**
 * renderer.js - ゲーム描画処理
 * テトリス・アドベンチャー v1.0.1
 */

// ゲーム描画を管理するオブジェクト
const Renderer = {
    // キャンバスと描画コンテキスト
    canvas: null,
    ctx: null,
    
    // セルのサイズと色
    cellSize: 30,
    gridColor: '#222222',
    
    // 初期化
    init: function(gameScreen) {
        // キャンバス要素の作成とサイズ設定
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // レスポンシブデザイン対応
        this.adjustCanvasSize();
        window.addEventListener('resize', this.adjustCanvasSize.bind(this));
        
        // キャンバスをゲーム画面に追加
        if (gameScreen) {
            const gameBoard = document.getElementById('game-board');
            if (gameBoard) {
                gameBoard.innerHTML = '';
                gameBoard.appendChild(this.canvas);
            }
        }
    },
    
    // キャンバスサイズの調整（レスポンシブ対応）
    adjustCanvasSize: function() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard || !this.canvas) return;
        
        // 親要素のサイズを取得
        const parentWidth = gameBoard.clientWidth;
        const parentHeight = gameBoard.clientHeight;
        
        // テトリスの標準サイズ（10x20）に合わせる
        const cols = 10;
        const rows = 20;
        
        // セルサイズを親要素に合わせて調整
        const cellWidth = Math.floor(parentWidth / cols);
        const cellHeight = Math.floor(parentHeight / rows);
        this.cellSize = Math.min(cellWidth, cellHeight);
        
        // キャンバスサイズを設定
        this.canvas.width = this.cellSize * cols;
        this.canvas.height = this.cellSize * rows;
    },
    
    // ボードの描画
    drawBoard: function(board) {
        if (!this.ctx || !this.canvas) return;
        
        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景グリッドの描画
        this.drawGrid(board[0].length, board.length);
        
        // ボードの各セルを描画
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                if (board[y][x]) {
                    this.drawCell(x, y, board[y][x].color);
                }
            }
        }
    },
    
    // グリッドの描画
    drawGrid: function(cols, rows) {
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 0.5;
        
        // 縦線
        for (let x = 0; x <= cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, rows * this.cellSize);
            this.ctx.stroke();
        }
        
        // 横線
        for (let y = 0; y <= rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(cols * this.cellSize, y * this.cellSize);
            this.ctx.stroke();
        }
    },
    
    // 個別セルの描画
    drawCell: function(x, y, color) {
        const borderRadius = 4;
        const padding = 1;
        
        // セル本体
        this.ctx.fillStyle = color;
        this.roundRect(
            x * this.cellSize + padding,
            y * this.cellSize + padding,
            this.cellSize - padding * 2,
            this.cellSize - padding * 2,
            borderRadius
        );
        this.ctx.fill();
        
        // ハイライト（上と左）
        this.ctx.fillStyle = this.lightenColor(color, 30);
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.cellSize + padding, y * this.cellSize + padding + borderRadius);
        this.ctx.lineTo(x * this.cellSize + padding, y * this.cellSize + this.cellSize - padding - borderRadius);
        this.ctx.arcTo(
            x * this.cellSize + padding,
            y * this.cellSize + this.cellSize - padding,
            x * this.cellSize + padding + borderRadius,
            y * this.cellSize + this.cellSize - padding,
            borderRadius
        );
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding - borderRadius, y * this.cellSize + this.cellSize - padding);
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding - borderRadius, y * this.cellSize + this.cellSize - padding - 2);
        this.ctx.lineTo(x * this.cellSize + padding + 2, y * this.cellSize + this.cellSize - padding - 2);
        this.ctx.lineTo(x * this.cellSize + padding + 2, y * this.cellSize + padding + borderRadius);
        this.ctx.arcTo(
            x * this.cellSize + padding + 2,
            y * this.cellSize + padding + 2,
            x * this.cellSize + padding + borderRadius,
            y * this.cellSize + padding + 2,
            borderRadius - 1
        );
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding - 2, y * this.cellSize + padding + 2);
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding - 2, y * this.cellSize + padding + 2);
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding - 2, y * this.cellSize + padding + 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // シャドウ（右と下）
        this.ctx.fillStyle = this.darkenColor(color, 30);
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.cellSize + this.cellSize - padding, y * this.cellSize + padding + borderRadius);
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding, y * this.cellSize + this.cellSize - padding - borderRadius);
        this.ctx.arcTo(
            x * this.cellSize + this.cellSize - padding,
            y * this.cellSize + this.cellSize - padding,
            x * this.cellSize + this.cellSize - padding - borderRadius,
            y * this.cellSize + this.cellSize - padding,
            borderRadius
        );
        this.ctx.lineTo(x * this.cellSize + padding + borderRadius, y * this.cellSize + this.cellSize - padding);
        this.ctx.lineTo(x * this.cellSize + padding + borderRadius, y * this.cellSize + this.cellSize - padding - 2);
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding - 2, y * this.cellSize + this.cellSize - padding - 2);
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding - 2, y * this.cellSize + padding + borderRadius);
        this.ctx.arcTo(
            x * this.cellSize + this.cellSize - padding - 2,
            y * this.cellSize + padding + 2,
            x * this.cellSize + this.cellSize - padding - borderRadius,
            y * this.cellSize + padding + 2,
            borderRadius - 1
        );
        this.ctx.lineTo(x * this.cellSize + this.cellSize - padding, y * this.cellSize + padding + borderRadius);
        this.ctx.closePath();
        this.ctx.fill();
    },
    
    // 角丸長方形パスの作成
    roundRect: function(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.arcTo(x + width, y, x + width, y + radius, radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.arcTo(x, y + height, x, y + height - radius, radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.arcTo(x, y, x + radius, y, radius);
        this.ctx.closePath();
    },
    
    // 色を明るくする
    lightenColor: function(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
    },
    
    // 色を暗くする
    darkenColor: function(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
    },
    
    // 現在のピースを描画
    drawCurrentPiece: function(piece, tetrominos) {
        if (!this.ctx || !piece) return;
        
        const tetromino = tetrominos[piece.type];
        if (!tetromino) return;
        
        const shape = this.rotatePiece(tetromino.shape, piece.rotation);
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    // ボード内のセルのみ描画
                    if (boardY >= 0) {
                        this.drawCell(boardX, boardY, tetromino.color);
                    }
                }
            }
        }
    },
    
    // ゴーストピース（着地位置表示）の描画
    drawGhostPiece: function(piece, tetrominos, board) {
        if (!this.ctx || !piece) return;
        
        const tetromino = tetrominos[piece.type];
        if (!tetromino) return;
        
        const shape = this.rotatePiece(tetromino.shape, piece.rotation);
        
        // ゴーストピースの位置（ハードドロップ位置）を計算
        let ghostY = piece.y;
        let collided = false;
        
        while (!collided) {
            ghostY++;
            
            // 衝突チェック
            for (let y = 0; y < shape.length && !collided; y++) {
                for (let x = 0; x < shape[y].length && !collided; x++) {
                    if (shape[y][x]) {
                        const boardX = piece.x + x;
                        const boardY = ghostY + y;
                        
                        // ボード外または他のブロックとの衝突
                        if (boardY >= board.length || (boardY >= 0 && boardX >= 0 && boardX < board[0].length && board[boardY][boardX])) {
                            collided = true;
                            ghostY--;
                        }
                    }
                }
            }
        }
        
        // ゴーストピースを半透明で描画
        const ghostColor = this.setAlpha(tetromino.color, 0.3);
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = ghostY + y;
                    
                    // ボード内かつ現在のピースと重ならない場合のみ描画
                    if (boardY >= 0 && boardY !== piece.y + y) {
                        // 簡易的な半透明セルを描画
                        this.ctx.fillStyle = ghostColor;
                        this.ctx.fillRect(
                            boardX * this.cellSize + 2,
                            boardY * this.cellSize + 2,
                            this.cellSize - 4,
                            this.cellSize - 4
                        );
                    }
                }
            }
        }
    },
    
    // 色にアルファ値を設定
    setAlpha: function(color, alpha) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    
    // ピースの回転
    rotatePiece: function(shape, rotation) {
        let result = JSON.parse(JSON.stringify(shape));
        
        for (let r = 0; r < rotation; r++) {
            const newShape = Array.from({ length: result[0].length }, () => Array(result.length).fill(0));
            for (let y = 0; y < result.length; y++) {
                for (let x = 0; x < result[y].length; x++) {
                    newShape[x][result.length - 1 - y] = result[y][x];
                }
            }
            result = newShape;
        }
        
        return result;
    },
    
    // 次のピースプレビューの描画
    drawNextPiece: function(nextPiece, tetrominos, element) {
        if (!element) return;
        
        // プレビュー領域をクリア
        element.innerHTML = '';
        
        const tetromino = tetrominos[nextPiece];
        if (!tetromino) return;
        
        // プレビュー用のキャンバス作成
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        
        // ピースのサイズに合わせてキャンバスサイズを調整
        const shape = tetromino.shape;
        const previewCellSize = 20;
        previewCanvas.width = shape[0].length * previewCellSize;
        previewCanvas.height = shape.length * previewCellSize;
        
        // ピースを描画
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    // 簡易的なセル描画
                    previewCtx.fillStyle = tetromino.color;
                    previewCtx.fillRect(
                        x * previewCellSize + 1,
                        y * previewCellSize + 1,
                        previewCellSize - 2,
                        previewCellSize - 2
                    );
                    
                    // ハイライトとシャドウ
                    previewCtx.fillStyle = this.lightenColor(tetromino.color, 30);
                    previewCtx.fillRect(
                        x * previewCellSize + 1,
                        y * previewCellSize + 1,
                        previewCellSize - 2,
                        2
                    );
                    previewCtx.fillRect(
                        x * previewCellSize + 1,
                        y * previewCellSize + 3,
                        2,
                        previewCellSize - 4
                    );
                    
                    previewCtx.fillStyle = this.darkenColor(tetromino.color, 30);
                    previewCtx.fillRect(
                        x * previewCellSize + 3,
                        y * previewCellSize + previewCellSize - 3,
                        previewCellSize - 4,
                        2
                    );
                    previewCtx.fillRect(
                        x * previewCellSize + previewCellSize - 3,
                        y * previewCellSize + 3,
                        2,
                        previewCellSize - 6
                    );
                }
            }
        }
        
        // キャンバスを要素に追加
        element.appendChild(previewCanvas);
    },
    
    // ホールドピースの描画
    drawHoldPiece: function(holdPiece, tetrominos, element, canHold) {
        if (!element) return;
        
        // ホールド領域をクリア
        element.innerHTML = '';
        
        if (!holdPiece) return;
        
        const tetromino = tetrominos[holdPiece];
        if (!tetromino) return;
        
        // ホールド用のキャンバス作成
        const holdCanvas = document.createElement('canvas');
        const holdCtx = holdCanvas.getContext('2d');
        
        // ピースのサイズに合わせてキャンバスサイズを調整
        const shape = tetromino.shape;
        const holdCellSize = 20;
        holdCanvas.width = shape[0].length * holdCellSize;
        holdCanvas.height = shape.length * holdCellSize;
        
        // 使用不可状態の場合は色を変更
        const color = canHold ? tetromino.color : '#888888';
        
        // ピースを描画
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    // 簡易的なセル描画
                    holdCtx.fillStyle = color;
                    holdCtx.fillRect(
                        x * holdCellSize + 1,
                        y * holdCellSize + 1,
                        holdCellSize - 2,
                        holdCellSize - 2
                    );
                    
                    if (canHold) {
                        // ハイライトとシャドウ（使用可能時のみ）
                        holdCtx.fillStyle = this.lightenColor(color, 30);
                        holdCtx.fillRect(
                            x * holdCellSize + 1,
                            y * holdCellSize + 1,
                            holdCellSize - 2,
                            2
                        );
                        holdCtx.fillRect(
                            x * holdCellSize + 1,
                            y * holdCellSize + 3,
                            2,
                            holdCellSize - 4
                        );
                        
                        holdCtx.fillStyle = this.darkenColor(color, 30);
                        holdCtx.fillRect(
                            x * holdCellSize + 3,
                            y * holdCellSize + holdCellSize - 3,
                            holdCellSize - 4,
                            2
                        );
                        holdCtx.fillRect(
                            x * holdCellSize + holdCellSize - 3,
                            y * holdCellSize + 3,
                            2,
                            holdCellSize - 6
                        );
                    }
                }
            }
        }
        
        // キャンバスを要素に追加
        element.appendChild(holdCanvas);
    }
};
