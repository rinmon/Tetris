/**
 * keyboard-controls.js - キーボード操作管理
 * テトリス・アドベンチャー v1.0.2
 */

// キーボード操作コントローラーオブジェクト
// 変数定義を避けてwindowに直接登録
window.KeyboardController = window.KeyboardController || {

    // キー設定
    keys: {
        left: ['ArrowLeft', 'a', 'A'],
        right: ['ArrowRight', 'd', 'D'],
        down: ['ArrowDown', 's', 'S'],
        hardDrop: ['ArrowUp', 'w', 'W', ' '],
        rotateClockwise: ['x', 'X', 'ArrowUp'],
        rotateCounterClockwise: ['z', 'Z', 'Control'],
        hold: ['c', 'C', 'Shift'],
        pause: ['p', 'P', 'Escape']
    },
    
    // カスタマイズ可能なキー設定（ユーザーが変更可能）
    customKeys: {},
    
    // キーが押されているかのフラグ
    pressedKeys: {},
    
    // キーの連続入力のタイマー
    repeatTimers: {},
    
    // 連続入力の設定
    repeatConfig: {
        initialDelay: 200,  // 最初の遅延（ミリ秒）
        repeatDelay: 50     // 繰り返しの遅延（ミリ秒）
    },
    
    // 回転方向（1: 時計回り, -1: 反時計回り）
    rotateDirection: 1,
    
    // 管理対象のテトリスゲームインスタンス
    game: null,
    
    // コールバック関数
    callbacks: {
        onPause: null,
        onUnpause: null,
        onMute: null
    },
    
    // 初期化
    init: function(gameInstance) {
        this.game = gameInstance;
        
        // カスタムキー設定を読み込み
        this.loadCustomKeys();
        
        // イベントリスナーを設定
        this.setupEventListeners();
    },
    
    // カスタムキー設定の読み込み
    loadCustomKeys: function() {
        try {
            const savedKeys = localStorage.getItem('tetris_keys');
            if (savedKeys) {
                this.customKeys = JSON.parse(savedKeys);
            }
        } catch (e) {
            console.error('キー設定の読み込みに失敗しました:', e);
            this.customKeys = {};
        }
    },
    
    // カスタムキー設定の保存
    saveCustomKeys: function() {
        try {
            localStorage.setItem('tetris_keys', JSON.stringify(this.customKeys));
        } catch (e) {
            console.error('キー設定の保存に失敗しました:', e);
        }
    },
    
    // イベントリスナーの設定
    setupEventListeners: function() {
        // キーダウンイベント
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // キーアップイベント
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
        
        // 画面のフォーカスが外れた時の処理
        window.addEventListener('blur', () => {
            this.handleBlur();
        });
    },
    
    // キーが押された時の処理
    handleKeyDown: function(e) {
        // テキスト入力欄にフォーカスがある場合は処理しない
        if (this.isFocusedOnInput()) return;
        
        const key = e.key;
        
        // 特定のキーの場合はデフォルト動作を抑制
        if (this.shouldPreventDefault(key)) {
            e.preventDefault();
        }
        
        // すでに押されているキーは処理しない（ただし連続入力の場合は除く）
        if (this.pressedKeys[key] && !this.isRepeatingKey(key)) return;
        
        // キーの処理
        this.processKey(key);
        
        // 押されたキーとして記録
        this.pressedKeys[key] = true;
        
        // 連続入力設定
        if (this.shouldRepeatKey(key)) {
            this.setupKeyRepeat(key);
        }
    },
    
    // キーが離された時の処理
    handleKeyUp: function(e) {
        const key = e.key;
        
        // キーの押下フラグをリセット
        delete this.pressedKeys[key];
        
        // 連続入力のタイマーをクリア
        this.clearKeyRepeat(key);
    },
    
    // フォーカスが外れた時の処理
    handleBlur: function() {
        // すべてのキーの押下フラグをリセット
        this.pressedKeys = {};
        
        // すべての連続入力タイマーをクリア
        for (const key in this.repeatTimers) {
            this.clearKeyRepeat(key);
        }
    },
    
    // キーを処理する
    processKey: function(key) {
        // ゲームインスタンスがない場合は処理しない
        if (!this.game) return;
        
        // 操作キーの判定と処理
        if (this.isKeyFor('left', key)) {
            this.game.moveLeft();
        } 
        else if (this.isKeyFor('right', key)) {
            this.game.moveRight();
        } 
        else if (this.isKeyFor('down', key)) {
            this.game.moveDown();
        }
        else if (this.isKeyFor('hardDrop', key)) {
            this.game.hardDrop();
        }
        else if (this.isKeyFor('rotateClockwise', key)) {
            if (this.rotateDirection === 1) {
                this.game.rotate(1);
            } else {
                this.game.rotate(-1);
            }
        }
        else if (this.isKeyFor('rotateCounterClockwise', key)) {
            if (this.rotateDirection === 1) {
                this.game.rotate(-1);
            } else {
                this.game.rotate(1);
            }
        }
        else if (this.isKeyFor('hold', key)) {
            this.game.holdPiece();
        }
        else if (this.isKeyFor('pause', key)) {
            this.togglePause();
        }
    },
    
    // キーがテキスト入力欄にフォーカスがあるか判定
    isFocusedOnInput: function() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' || 
               activeElement.tagName === 'TEXTAREA' || 
               activeElement.isContentEditable;
    },
    
    // デフォルト動作を抑制すべきキーか判定
    shouldPreventDefault: function(key) {
        // スペースキー、矢印キーなどのデフォルト動作を抑制
        return key === ' ' || 
               key.startsWith('Arrow') || 
               (key === 'p' || key === 'P');
    },
    
    // キーが指定されたアクションに割り当てられているか判定
    isKeyFor: function(action, key) {
        // カスタムキー設定を優先
        if (this.customKeys[action] && this.customKeys[action].includes(key)) {
            return true;
        }
        
        // デフォルトキー設定を確認
        return this.keys[action] && this.keys[action].includes(key);
    },
    
    // キーが連続入力対象か判定
    shouldRepeatKey: function(key) {
        // 左右移動と下移動は連続入力対象
        return this.isKeyFor('left', key) || 
               this.isKeyFor('right', key) || 
               this.isKeyFor('down', key);
    },
    
    // キーが連続入力中か判定
    isRepeatingKey: function(key) {
        return this.repeatTimers[key] !== undefined;
    },
    
    // 連続入力の設定
    setupKeyRepeat: function(key) {
        // 既存のタイマーをクリア
        this.clearKeyRepeat(key);
        
        // 最初の遅延後に連続入力を開始
        this.repeatTimers[key] = setTimeout(() => {
            // 連続入力処理
            const intervalId = setInterval(() => {
                // キーがまだ押されている場合は処理
                if (this.pressedKeys[key]) {
                    this.processKey(key);
                } else {
                    // 押されていなければタイマーをクリア
                    this.clearKeyRepeat(key);
                }
            }, this.repeatConfig.repeatDelay);
            
            // タイマーIDを保存
            this.repeatTimers[key] = intervalId;
        }, this.repeatConfig.initialDelay);
    },
    
    // 連続入力のクリア
    clearKeyRepeat: function(key) {
        if (this.repeatTimers[key]) {
            clearTimeout(this.repeatTimers[key]);
            clearInterval(this.repeatTimers[key]);
            delete this.repeatTimers[key];
        }
    },
    
    // 一時停止の切り替え
    togglePause: function() {
        if (this.game.isPaused) {
            this.game.resumeGame();
            if (this.callbacks.onUnpause) {
                this.callbacks.onUnpause();
            }
        } else {
            this.game.pauseGame();
            if (this.callbacks.onPause) {
                this.callbacks.onPause();
            }
        }
    },
    
    // コールバック関数の設定
    setCallbacks: function(callbacks) {
        if (callbacks.onPause) {
            this.callbacks.onPause = callbacks.onPause;
        }
        
        if (callbacks.onUnpause) {
            this.callbacks.onUnpause = callbacks.onUnpause;
        }
        
        if (callbacks.onMute) {
            this.callbacks.onMute = callbacks.onMute;
        }
    },
    
    // カスタムキー設定の追加
    setCustomKey: function(action, keys) {
        if (this.keys[action] !== undefined) {
            this.customKeys[action] = keys;
            this.saveCustomKeys();
            return true;
        }
        return false;
    },
    
    // カスタムキー設定のリセット
    resetCustomKeys: function() {
        this.customKeys = {};
        this.saveCustomKeys();
    },
    
    // キーボード入力の有効/無効の切り替え
    disable: function() {
        // すべてのキーの押下フラグをリセット
        this.handleBlur();
    },
    
    enable: function() {
        // 特に処理なし（イベントリスナーは常に有効）
    }
};

// キーボード設定UI用の補助関数
function openKeyboardSettings() {
    // キーボード設定モーダルを表示
    const modal = document.getElementById('keyboard-settings-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// キーコード表示用の補助関数
function getKeyName(key) {
    const keyNames = {
        ' ': 'スペース',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'Control': 'Ctrl',
        'Escape': 'Esc'
    };
    
    return keyNames[key] || key;
}
