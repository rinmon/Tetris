/**
 * game-modes-core.js - ゲームモード基本構造
 * テトリス・アドベンチャー v1.0.2
 */

// ゲームモード管理の中核
const GameModesCore = {
    // 現在選択されているモード
    currentMode: 'classic',
    
    // 全モードの一覧（各モード詳細は個別ファイルに定義）
    modes: {},
    
    // 初期化
    init: function() {
        console.log('ゲームモードコア初期化中...');
        
        // 全モードを登録
        this.registerAllModes();
        
        // モード選択のイベントリスナー設定
        this.setupEventListeners();
        
        // デフォルトモードを読み込み
        this.loadDefaultMode();
        
        console.log('登録済みモード:', Object.keys(this.modes));
    },
    
    // 全モードの登録
    registerAllModes: function() {
        console.log('全モード登録開始...');
        
        // 旧モードからのバックポート
        if (typeof GameModes !== 'undefined') {
            console.log('GameModesからのモード登録を試みます');
            // 古いモードオブジェクトからモードを取得
            if (GameModes.classic) this.registerMode('classic', GameModes.classic);
            if (GameModes.adventure) this.registerMode('adventure', GameModes.adventure);
            if (GameModes.battle) this.registerMode('battle', GameModes.battle);
            if (GameModes.puzzle) this.registerMode('puzzle', GameModes.puzzle);
            if (GameModes.speed) this.registerMode('speed', GameModes.speed);
            if (GameModes.zen) this.registerMode('zen', GameModes.zen);
        }
        
        // 新モードオブジェクトからモードを取得
        // グローバルおよびwindowの両方をチェック
        ['ClassicMode', 'AdventureMode', 'BattleMode', 'PuzzleMode', 'SpeedMode', 'ZenMode'].forEach(modeName => {
            // グローバルスコープでチェック
            if (typeof window[modeName] !== 'undefined') {
                const shortName = modeName.replace('Mode', '').toLowerCase();
                console.log(`windowから${modeName}の登録成功`);
                this.registerMode(shortName, window[modeName]);
            } else if (typeof eval('typeof ' + modeName + ' !== "undefined" ? ' + modeName + ' : undefined') !== 'undefined') {
                // 直接グローバル変数としてチェック
                const shortName = modeName.replace('Mode', '').toLowerCase();
                const modeObj = eval(modeName);
                console.log(`グローバルから${modeName}の登録成功`);
                this.registerMode(shortName, modeObj);
            }
        });
        
        // GameModesから直接移植
        if (typeof GameModes !== 'undefined' && Object.keys(this.modes).length === 0) {
            console.log('直接GameModesの内容をコピーします');
            this.modes = Object.assign({}, GameModes);
        }
        
        console.log('登録完了したモード:', Object.keys(this.modes));
    },
    
    // モード登録
    registerMode: function(modeName, modeObject) {
        this.modes[modeName] = modeObject;
        console.log(`モード登録: ${modeName}`);
    },
    
    // addModeは互換性のためにエイリアスとして提供
    addMode: function(modeName, modeObject) {
        console.log(`addModeが呼ばれました: ${modeName}`);
        this.registerMode(modeName, modeObject);
    },
    
    // イベントリスナー設定
    setupEventListeners: function() {
        // モード選択ボタン
        const modeButtons = document.querySelectorAll('.mode-select-btn');
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.target.getAttribute('data-mode');
                if (mode && this.modes[mode]) {
                    this.selectMode(mode);
                    
                    // サウンド再生
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playSfx('click');
                    }
                }
            });
        });
    },
    
    // デフォルトモードの読み込み
    loadDefaultMode: function() {
        // 設定があれば設定から、なければクラシックをデフォルトに
        let defaultMode = 'classic';
        
        if (typeof SettingsManager !== 'undefined' && 
            SettingsManager.currentSettings && 
            SettingsManager.currentSettings.gameplay) {
            defaultMode = SettingsManager.currentSettings.gameplay.defaultMode || 'classic';
        }
        
        // モードが存在するか確認
        if (this.modes[defaultMode]) {
            this.currentMode = defaultMode;
        } else {
            // 存在しない場合は最初に見つかったモードを使用
            const firstMode = Object.keys(this.modes)[0];
            if (firstMode) {
                this.currentMode = firstMode;
            }
        }
    },
    
    // モードの追加（各モードファイルから呼び出される）
    addMode: function(modeKey, modeConfig) {
        this.modes[modeKey] = modeConfig;
    },
    
    // モードの選択
    selectMode: function(modeKey) {
        if (!this.modes[modeKey]) {
            console.error(`モード '${modeKey}' が見つかりません`);
            return false;
        }
        
        this.currentMode = modeKey;
        
        // モード選択UI更新
        this.updateModeSelectionUI();
        
        // ゲーム開始準備
        this.prepareGame();
        
        return true;
    },
    
    // モード選択UI更新
    updateModeSelectionUI: function() {
        // 全モードボタンの選択状態をリセット
        const modeButtons = document.querySelectorAll('.mode-select-btn');
        modeButtons.forEach(button => {
            button.classList.remove('selected');
            
            // 現在のモードに合致するボタンを選択状態に
            const mode = button.getAttribute('data-mode');
            if (mode === this.currentMode) {
                button.classList.add('selected');
            }
        });
        
        // モード説明の更新
        this.updateModeDescription();
    },
    
    // モード説明の更新
    updateModeDescription: function() {
        const modeInfo = this.modes[this.currentMode];
        
        // 説明表示エリア
        const titleElement = document.getElementById('mode-title');
        const descElement = document.getElementById('mode-description');
        const imageElement = document.getElementById('mode-image');
        
        if (titleElement) {
            titleElement.textContent = modeInfo.name || '';
        }
        
        if (descElement) {
            descElement.textContent = modeInfo.description || '';
        }
        
        if (imageElement && modeInfo.image) {
            imageElement.src = modeInfo.image;
            imageElement.alt = modeInfo.name || 'ゲームモード';
        }
    },
    
    // ゲーム開始準備
    prepareGame: function() {
        const modeInfo = this.modes[this.currentMode];
        
        // ゲーム構成オブジェクトの作成
        const config = modeInfo.init();
        
        // ゲームの準備
        if (typeof GameController !== 'undefined') {
            GameController.prepare(config, this.currentMode);
        }
    },
    
    // ゲームの開始
    startGame: function() {
        if (typeof GameController !== 'undefined') {
            GameController.start();
            
            // UI画面切り替え
            if (typeof UI !== 'undefined') {
                UI.showScreen('game');
            }
        }
    },
    
    // 現在のモード情報の取得
    getCurrentModeInfo: function() {
        return this.modes[this.currentMode] || null;
    },
    
    // すべてのモード情報の取得
    getAllModes: function() {
        const result = {};
        
        for (const key in this.modes) {
            if (this.modes.hasOwnProperty(key)) {
                result[key] = {
                    name: this.modes[key].name,
                    description: this.modes[key].description,
                    image: this.modes[key].image
                };
            }
        }
        
        return result;
    }
};

// 外部からのアクセス用
window.GameModes = GameModesCore;
