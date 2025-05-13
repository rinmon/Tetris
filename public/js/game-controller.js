/**
 * game-controller.js - ゲーム制御
 * テトリス・アドベンチャー v1.0.1
 */

// ゲームコントローラー
const GameController = {
    // テトリスインスタンス
    tetris: null,
    
    // 現在のゲームモード
    currentMode: 'classic',
    
    // アニメーションフレームID
    animationId: null,
    
    // 初期化
    init: function() {
        // UIイベント設定
        this.setupUIListeners();
    },
    
    // UIイベントリスナーの設定
    setupUIListeners: function() {
        // ゲームオーバーモーダルのボタン
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        const menuBtn = document.getElementById('back-to-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.endGame();
                UI.showScreen('menu');
            });
        }
        
        // ポーズボタン
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
    },
    
    // ゲーム開始処理
    startGame: function(mode) {
        // ゲーム画面に遷移
        UI.showScreen('game');
        
        // 選択されたゲームモードで初期化
        this.currentMode = mode || 'classic';
        const modeConfig = GameModes[this.currentMode];
        
        if (!modeConfig) {
            console.error(`ゲームモード '${this.currentMode}' が見つかりません`);
            return;
        }
        
        // 既存のテトリスインスタンスがあれば破棄
        if (this.tetris) {
            // ゲームループが実行中の場合は停止
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
        
        // モードの設定を取得
        const config = modeConfig.init();
        
        // 新しいテトリスインスタンスを作成
        this.tetris = initTetris(config);
        
        // レンダラー初期化
        if (typeof Renderer !== 'undefined') {
            const gameBoard = document.getElementById('game-board');
            Renderer.init(gameBoard);
        }
        
        // コントローラー初期化
        if (typeof KeyboardController !== 'undefined') {
            KeyboardController.init(this.tetris);
            KeyboardController.activate();
        }
        
        if (typeof TouchController !== 'undefined') {
            TouchController.init(this.tetris);
            TouchController.activate();
        }
        
        // サウンド設定
        if (typeof SoundEvents !== 'undefined') {
            SoundEvents.setupGameListeners(this.tetris);
            
            // ゲームBGM再生
            if (typeof SoundManager !== 'undefined') {
                if (mode === 'adventure') {
                    SoundManager.playBgm('bgm_adventure');
                } else {
                    SoundManager.playBgm('bgm_game');
                }
            }
        }
        
        // ゲーム情報表示を更新
        this.updateGameInfo();
        
        // ゲーム開始
        this.tetris.start();
        
        // レンダリングループ開始
        this.startRenderLoop();
        
        // モード名表示
        UI.showNotification(`${modeConfig.name}モードを開始！`, 2000);
    },
    
    // レンダリングループ開始
    startRenderLoop: function() {
        if (!this.tetris) return;
        
        const renderFrame = () => {
            const state = this.tetris.getState();
            
            // ゲーム状態の描画
            if (typeof Renderer !== 'undefined') {
                Renderer.drawBoard(state.board);
                Renderer.drawCurrentPiece(state.currentPiece, this.tetris.tetrominos);
                Renderer.drawGhostPiece(state.currentPiece, this.tetris.tetrominos, state.board);
            }
            
            // 次のピースとホールドピース描画
            const nextPieceEl = document.getElementById('next-piece');
            const holdPieceEl = document.getElementById('hold-piece');
            
            if (typeof Renderer !== 'undefined' && nextPieceEl && state.nextPieces.length > 0) {
                Renderer.drawNextPiece(state.nextPieces[0], this.tetris.tetrominos, nextPieceEl);
            }
            
            if (typeof Renderer !== 'undefined' && holdPieceEl) {
                Renderer.drawHoldPiece(state.holdPiece, this.tetris.tetrominos, holdPieceEl, this.tetris.canHold);
            }
            
            // ゲーム情報更新
            this.updateGameInfo();
            
            // タッチ用スコア更新
            if (typeof TouchController !== 'undefined') {
                TouchController.updateScore(state.score);
            }
            
            // 次のフレームを要求（ゲームオーバーでない場合）
            if (!state.isGameOver) {
                this.animationId = requestAnimationFrame(renderFrame);
            }
        };
        
        // 最初のフレーム描画要求
        this.animationId = requestAnimationFrame(renderFrame);
    },
    
    // ゲーム情報表示を更新
    updateGameInfo: function() {
        if (!this.tetris) return;
        
        const state = this.tetris.getState();
        
        // スコア、レベル、ライン数の表示更新
        const scoreEl = document.getElementById('score-value');
        const levelEl = document.getElementById('level-value');
        const linesEl = document.getElementById('lines-value');
        
        if (scoreEl) scoreEl.textContent = state.score.toLocaleString();
        if (levelEl) levelEl.textContent = state.level;
        if (linesEl) linesEl.textContent = state.lines;
    },
    
    // ゲーム一時停止/再開
    togglePause: function() {
        if (!this.tetris) return;
        
        if (this.tetris.isPaused) {
            // ゲーム再開
            this.tetris.resume();
            
            // 音楽再開
            if (typeof SoundManager !== 'undefined') {
                SoundManager.pauseBgm(false);
            }
            
            // 一時停止画面を非表示
            const pauseScreen = document.getElementById('pause-screen');
            if (pauseScreen) pauseScreen.style.display = 'none';
            
            // コントローラーを有効化
            if (typeof KeyboardController !== 'undefined') {
                KeyboardController.activate();
            }
            
            // レンダリングループ再開
            this.startRenderLoop();
        } else {
            // ゲーム一時停止
            this.tetris.pause();
            
            // 音楽一時停止
            if (typeof SoundManager !== 'undefined') {
                SoundManager.pauseBgm(true);
            }
            
            // 一時停止画面を表示
            const pauseScreen = document.getElementById('pause-screen');
            if (pauseScreen) pauseScreen.style.display = 'flex';
            
            // コントローラーを無効化
            if (typeof KeyboardController !== 'undefined') {
                KeyboardController.deactivate();
            }
            
            // レンダリングループ停止
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    },
    
    // ゲーム再開
    resumeGame: function() {
        if (!this.tetris || !this.tetris.isPaused) return;
        
        this.togglePause();
    },
    
    // ゲーム再スタート
    restartGame: function() {
        // ゲームオーバーモーダルを閉じる
        const gameOverModal = document.getElementById('game-over-modal');
        if (gameOverModal) gameOverModal.style.display = 'none';
        
        // 同じモードでゲーム再開
        this.startGame(this.currentMode);
    },
    
    // ゲーム終了
    endGame: function() {
        if (!this.tetris) return;
        
        // ゲームループを停止
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // コントローラーを無効化
        if (typeof KeyboardController !== 'undefined') {
            KeyboardController.deactivate();
        }
        
        if (typeof TouchController !== 'undefined') {
            TouchController.deactivate();
        }
        
        // BGM停止
        if (typeof SoundManager !== 'undefined') {
            SoundManager.stopBgm();
        }
        
        // テトリスインスタンスをクリア
        this.tetris = null;
    }
};

// モバイルデバイス用の画面方向チェック
function checkOrientation() {
    const orientationWarning = document.getElementById('orientation-warning');
    if (!orientationWarning) return;
    
    if (window.innerHeight < window.innerWidth && window.innerWidth < 768) {
        // モバイル端末で横向きの場合は警告を表示
        orientationWarning.style.display = 'flex';
    } else {
        // それ以外は警告を非表示
        orientationWarning.style.display = 'none';
    }
}

// 画面回転イベントのリスナー
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
