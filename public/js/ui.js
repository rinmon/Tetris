/**
 * ui.js - ユーザーインターフェース制御（簡略版）
 * テトリス・アドベンチャー v1.0.1
 */

// UI操作を管理するオブジェクト
const UI = {
    elements: {},
    
    // 初期化
    init: function() {
        // 画面要素の参照を取得
        this.elements = {
            app: document.getElementById('app'),
            loadingScreen: document.getElementById('loading-screen'),
            authScreen: document.getElementById('auth-screen'),
            menuScreen: document.getElementById('menu-screen'),
            modeScreen: document.getElementById('mode-screen'),
            gameScreen: document.getElementById('game-screen'),
            helpScreen: document.getElementById('help-screen'),
            
            // 通知
            notification: document.getElementById('notification'),
            notificationMessage: document.getElementById('notification-message')
        };
        
        // 画面遷移
        this.showScreen('loading');
        setTimeout(() => this.showScreen('auth'), 1500);
    },
    
    // 画面切り替え
    showScreen: function(screenName) {
        // すべての画面を非表示
        const screens = ['loading', 'auth', 'menu', 'mode', 'game', 'help'];
        screens.forEach(screen => {
            const element = this.elements[screen + 'Screen'];
            if (element) element.style.display = 'none';
        });
        
        // 指定した画面を表示
        const targetScreen = this.elements[screenName + 'Screen'];
        if (targetScreen) targetScreen.style.display = 'flex';
    },
    
    // 通知表示
    showNotification: function(message, duration = 3000) {
        if (!this.elements.notification || !this.elements.notificationMessage) return;
        
        this.elements.notificationMessage.textContent = message;
        this.elements.notification.classList.add('show');
        
        setTimeout(() => {
            this.elements.notification.classList.remove('show');
        }, duration);
    },
    
    // ゲームオーバー画面表示
    showGameOver: function(mode, score, lines, level, success = false) {
        const gameOverModal = document.getElementById('game-over-modal');
        if (!gameOverModal) return;
        
        const titleElement = gameOverModal.querySelector('.modal-title');
        const scoreElement = gameOverModal.querySelector('.final-score');
        const messageElement = gameOverModal.querySelector('.result-message');
        
        if (titleElement) titleElement.textContent = `${mode} 終了`;
        if (scoreElement) scoreElement.textContent = score.toLocaleString();
        
        let message = success ? 
            'おめでとうございます！目標を達成しました！' : 
            'また挑戦してください！';
        
        if (messageElement) messageElement.textContent = message;
        
        gameOverModal.style.display = 'flex';
    },
    
    // ミッション完了表示
    showMissionComplete: function(missionDescription) {
        this.showNotification(`ミッション完了: ${missionDescription}`, 5000);
    },
    
    // ユーザー情報の更新
    updateUserInfo: function(username, level, exp, expNeeded) {
        const usernameDisplay = document.getElementById('username-display');
        const userLevel = document.getElementById('user-level');
        const expDisplay = document.getElementById('exp-display');
        const expBar = document.getElementById('exp-bar');
        
        if (usernameDisplay) {
            usernameDisplay.textContent = username || 'ゲスト';
        }
        
        if (userLevel) {
            userLevel.textContent = level;
        }
        
        if (expDisplay) {
            expDisplay.textContent = `XP: ${exp}/${expNeeded}`;
        }
        
        if (expBar) {
            const percent = Math.min(100, (exp / expNeeded) * 100);
            expBar.style.width = `${percent}%`;
        }
    }
};

// キーボード入力ハンドラー
const KeyboardController = {
    // キーマッピング
    keyMap: {
        'ArrowLeft': 'moveLeft',
        'ArrowRight': 'moveRight',
        'ArrowDown': 'moveDown',
        'ArrowUp': 'rotate',
        ' ': 'hardDrop',
        'c': 'hold',
        'C': 'hold',
        'Escape': 'pause'
    },
    
    // アクティブなコントローラー
    active: false,
    
    // 初期化
    init: function(tetris) {
        this.tetris = tetris;
        this.setupListeners();
    },
    
    // イベントリスナー設定
    setupListeners: function() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },
    
    // キー入力ハンドラー
    handleKeyDown: function(event) {
        if (!this.active || !this.tetris) return;
        
        const action = this.keyMap[event.key];
        if (!action) return;
        
        event.preventDefault();
        
        switch (action) {
            case 'moveLeft':
                this.tetris.movePiece(-1, 0);
                break;
            case 'moveRight':
                this.tetris.movePiece(1, 0);
                break;
            case 'moveDown':
                this.tetris.movePiece(0, 1);
                break;
            case 'rotate':
                this.tetris.rotatePiece(1);
                break;
            case 'hardDrop':
                this.tetris.hardDrop();
                break;
            case 'hold':
                this.tetris.holdPiece();
                break;
            case 'pause':
                if (this.tetris.isPaused) {
                    this.tetris.resume();
                } else {
                    this.tetris.pause();
                }
                break;
        }
    },
    
    // アクティブ化
    activate: function() {
        this.active = true;
    },
    
    // 非アクティブ化
    deactivate: function() {
        this.active = false;
    }
};
