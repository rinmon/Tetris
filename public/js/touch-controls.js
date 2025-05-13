/**
 * touch-controls.js - タッチデバイス用コントロール
 * テトリス・アドベンチャー v1.0.2
 */

// タッチデバイス用コントローラー
// 変数定義を避けてwindowに直接登録
window.TouchController = window.TouchController || {
    // タッチ操作が有効かどうか
    isEnabled: false,
    
    // コントロール要素の参照
    elements: {},
    
    // テトリスインスタンスの参照
    tetris: null,
    
    // スワイプ状態の追跡
    swipeState: {
        startX: 0,
        startY: 0,
        startTime: 0,
        isActive: false
    },
    
    // 自動ドロップ用タイマー
    autoDropTimer: null,
    
    // 初期化
    init: function(tetrisInstance) {
        this.tetris = tetrisInstance;
        
        // タッチデバイスの検出
        this.detectTouchDevice();
        
        // タッチコントロールの生成とイベントハンドラのセットアップ
        this.createTouchControls();
        this.setupSwipeHandler();
    },
    
    // タッチデバイスの検出
    detectTouchDevice: function() {
        const isTouchDevice = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             navigator.msMaxTouchPoints > 0;
        
        this.isEnabled = isTouchDevice;
        
        // ブラウザのユーザーエージェントからモバイルデバイスかどうかも判定
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
        
        // PC環境でもタッチ対応デバイスならタッチコントロールを有効化
        document.body.classList.toggle('touch-device', this.isEnabled);
        document.body.classList.toggle('mobile-device', isMobile);
    },
    
    // タッチコントロールの生成
    createTouchControls: function() {
        // 既存のタッチコントロールが存在するか確認
        let touchControls = document.getElementById('touch-controls');
        
        if (!touchControls) {
            // コントロールコンテナの作成
            touchControls = document.createElement('div');
            touchControls.id = 'touch-controls';
            touchControls.className = 'touch-controls';
            document.body.appendChild(touchControls);
        }
        
        // コントロールUI作成
        touchControls.innerHTML = `
            <div class="touch-control-row">
                <div id="touch-hold" class="touch-button">
                    <i class="fas fa-inbox"></i>
                    <span>ホールド</span>
                </div>
                <div id="touch-score" class="touch-info">
                    <div class="score-value">0</div>
                    <span>スコア</span>
                </div>
                <div id="touch-rotate" class="touch-button">
                    <i class="fas fa-redo"></i>
                    <span>回転</span>
                </div>
            </div>
            
            <div class="touch-control-row">
                <div id="touch-left" class="touch-button">
                    <i class="fas fa-arrow-left"></i>
                </div>
                <div id="touch-hard-drop" class="touch-button">
                    <i class="fas fa-arrow-down"></i>
                    <i class="fas fa-arrow-down"></i>
                </div>
                <div id="touch-right" class="touch-button">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
            
            <div class="touch-control-row">
                <div id="touch-down" class="touch-button">
                    <i class="fas fa-arrow-down"></i>
                </div>
            </div>
        `;
        
        // 要素への参照を保持
        this.elements = {
            container: touchControls,
            holdBtn: document.getElementById('touch-hold'),
            rotateBtn: document.getElementById('touch-rotate'),
            leftBtn: document.getElementById('touch-left'),
            rightBtn: document.getElementById('touch-right'),
            downBtn: document.getElementById('touch-down'),
            hardDropBtn: document.getElementById('touch-hard-drop'),
            scoreDisplay: document.getElementById('touch-score').querySelector('.score-value')
        };
        
        // イベントリスナー設定
        this.setupEventListeners();
    },
    
    // イベントリスナーの設定
    setupEventListeners: function() {
        if (!this.elements.container) return;
        
        // ホールドボタン
        if (this.elements.holdBtn) {
            this.elements.holdBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.tetris) {
                    this.tetris.holdPiece();
                    
                    // サウンド再生
                    if (SoundManager) {
                        SoundManager.playSfx('rotate');
                    }
                }
            });
        }
        
        // 回転ボタン
        if (this.elements.rotateBtn) {
            this.elements.rotateBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.tetris) {
                    this.tetris.rotatePiece(1);
                    
                    // サウンド再生
                    if (SoundManager) {
                        SoundManager.playSfx('rotate');
                    }
                }
            });
        }
        
        // 左移動ボタン
        if (this.elements.leftBtn) {
            // タッチ開始時
            this.elements.leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.tetris) {
                    this.tetris.movePiece(-1, 0);
                    
                    // 自動移動タイマー開始
                    this.startAutoMove(-1, 0);
                    
                    // サウンド再生
                    if (SoundManager) {
                        SoundManager.playSfx('move');
                    }
                }
            });
            
            // タッチ終了時にタイマー停止
            this.elements.leftBtn.addEventListener('touchend', () => {
                this.stopAutoMove();
            });
            
            this.elements.leftBtn.addEventListener('touchcancel', () => {
                this.stopAutoMove();
            });
        }
        
        // 右移動ボタン
        if (this.elements.rightBtn) {
            // タッチ開始時
            this.elements.rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.tetris) {
                    this.tetris.movePiece(1, 0);
                    
                    // 自動移動タイマー開始
                    this.startAutoMove(1, 0);
                    
                    // サウンド再生
                    if (SoundManager) {
                        SoundManager.playSfx('move');
                    }
                }
            });
            
            // タッチ終了時にタイマー停止
            this.elements.rightBtn.addEventListener('touchend', () => {
                this.stopAutoMove();
            });
            
            this.elements.rightBtn.addEventListener('touchcancel', () => {
                this.stopAutoMove();
            });
        }
        
        // 下移動ボタン（ソフトドロップ）
        if (this.elements.downBtn) {
            // タッチ開始時
            this.elements.downBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.tetris) {
                    this.tetris.movePiece(0, 1);
                    
                    // 自動落下タイマー開始
                    this.startAutoMove(0, 1);
                }
            });
            
            // タッチ終了時にタイマー停止
            this.elements.downBtn.addEventListener('touchend', () => {
                this.stopAutoMove();
            });
            
            this.elements.downBtn.addEventListener('touchcancel', () => {
                this.stopAutoMove();
            });
        }
        
        // ハードドロップボタン
        if (this.elements.hardDropBtn) {
            this.elements.hardDropBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.tetris) {
                    this.tetris.hardDrop();
                    
                    // サウンド再生
                    if (SoundManager) {
                        SoundManager.playSfx('drop');
                    }
                }
            });
        }
    },
    
    // 自動移動タイマーの開始
    startAutoMove: function(dx, dy) {
        // 既存のタイマーをクリア
        this.stopAutoMove();
        
        // 長押し用のタイマー設定
        let delay = 150; // ミリ秒
        let initialDelay = true;
        
        this.autoMoveTimer = setInterval(() => {
            if (initialDelay) {
                // 最初の遅延は長め
                initialDelay = false;
                return;
            }
            
            if (this.tetris && !this.tetris.isPaused && !this.tetris.isGameOver) {
                this.tetris.movePiece(dx, dy);
                
                // 左右移動時のみサウンド再生（下移動は連続音を避ける）
                if (dy === 0 && dx !== 0 && SoundManager) {
                    SoundManager.playSfx('move');
                }
            }
        }, delay);
    },
    
    // 自動移動タイマーの停止
    stopAutoMove: function() {
        if (this.autoMoveTimer) {
            clearInterval(this.autoMoveTimer);
            this.autoMoveTimer = null;
        }
    },
    
    // スワイプ操作の設定
    setupSwipeHandler: function() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;
        
        // スワイプ開始
        gameBoard.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.swipeState.startX = touch.clientX;
            this.swipeState.startY = touch.clientY;
            this.swipeState.startTime = Date.now();
            this.swipeState.isActive = true;
        });
        
        // スワイプ中
        gameBoard.addEventListener('touchmove', (e) => {
            if (!this.swipeState.isActive) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.swipeState.startX;
            const deltaY = touch.clientY - this.swipeState.startY;
            const deltaTime = Date.now() - this.swipeState.startTime;
            
            // 閾値を超えた場合にアクション
            if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30 && deltaTime < 300) {
                // 左右スワイプで移動
                if (deltaX < 0) {
                    // 左スワイプ
                    if (this.tetris) this.tetris.movePiece(-1, 0);
                } else {
                    // 右スワイプ
                    if (this.tetris) this.tetris.movePiece(1, 0);
                }
                
                // スワイプ状態をリセット
                this.swipeState.isActive = false;
                
                // サウンド再生
                if (SoundManager) {
                    SoundManager.playSfx('move');
                }
            } else if (deltaY > 80 && deltaTime < 300) {
                // 下スワイプでハードドロップ
                if (this.tetris) this.tetris.hardDrop();
                
                // スワイプ状態をリセット
                this.swipeState.isActive = false;
                
                // サウンド再生
                if (SoundManager) {
                    SoundManager.playSfx('drop');
                }
            } else if (deltaY < -80 && deltaTime < 300) {
                // 上スワイプで回転
                if (this.tetris) this.tetris.rotatePiece(1);
                
                // スワイプ状態をリセット
                this.swipeState.isActive = false;
                
                // サウンド再生
                if (SoundManager) {
                    SoundManager.playSfx('rotate');
                }
            }
        });
        
        // スワイプ終了
        gameBoard.addEventListener('touchend', () => {
            this.swipeState.isActive = false;
        });
        
        gameBoard.addEventListener('touchcancel', () => {
            this.swipeState.isActive = false;
        });
    },
    
    // スコア表示の更新
    updateScore: function(score) {
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = score.toLocaleString();
        }
    },
    
    // タッチコントロールの表示/非表示
    show: function() {
        if (this.elements.container) {
            this.elements.container.style.display = 'flex';
        }
    },
    
    hide: function() {
        if (this.elements.container) {
            this.elements.container.style.display = 'none';
        }
    },
    
    // コントロールの有効化（ゲーム画面表示時）
    activate: function() {
        // タッチデバイスの場合のみ有効化
        if (this.isEnabled) {
            this.show();
        }
    },
    
    // コントロールの無効化（メニュー画面表示時など）
    deactivate: function() {
        this.hide();
        this.stopAutoMove();
    }
};
