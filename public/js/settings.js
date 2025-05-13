/**
 * settings.js - ゲーム設定管理
 * テトリス・アドベンチャー v1.0.1
 */

// 設定管理オブジェクト
const SettingsManager = {
    // デフォルト設定
    defaultSettings: {
        // サウンド設定
        sound: {
            enabled: true,        // サウンド有効/無効
            volume: 0.7,          // 主音量（0.0〜1.0）
            musicVolume: 0.5,     // BGM音量
            sfxVolume: 0.8        // 効果音音量
        },
        
        // 表示設定
        display: {
            showGhost: true,      // ゴーストピース表示
            showGrid: true,       // グリッド表示
            animationLevel: 2,    // アニメーションレベル（0:なし, 1:低, 2:標準, 3:高）
            colorTheme: 'default' // カラーテーマ
        },
        
        // コントロール設定
        controls: {
            rotateMode: 'right',  // 回転方向（right:時計回り, left:反時計回り）
            touchSensitivity: 2,  // タッチ感度（1:低, 2:中, 3:高）
            enableSwipe: true     // スワイプ有効/無効
        },
        
        // ゲームプレイ設定
        gameplay: {
            startLevel: 1,        // 開始レベル
            defaultMode: 'classic', // デフォルトモード
            enableHardcore: false // ハードコアモード
        }
    },
    
    // 現在の設定
    currentSettings: {},
    
    // 初期化
    init: function() {
        // 設定を読み込み
        this.loadSettings();
        
        // イベントリスナー設定
        this.setupEventListeners();
    },
    
    // 設定読み込み
    loadSettings: function() {
        try {
            // ローカルストレージから設定を読み込み
            const savedSettings = localStorage.getItem('tetris_settings');
            
            if (savedSettings) {
                // 保存された設定をパース
                const parsed = JSON.parse(savedSettings);
                
                // デフォルト設定とマージ
                this.currentSettings = this.mergeSettings(this.defaultSettings, parsed);
            } else {
                // 保存された設定がない場合はデフォルト設定を使用
                this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));
            }
        } catch (e) {
            console.error('設定の読み込みに失敗しました:', e);
            // エラーが発生した場合はデフォルト設定を使用
            this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        }
        
        // 設定を適用
        this.applySettings();
    },
    
    // 設定保存
    saveSettings: function() {
        try {
            // 設定をJSON文字列に変換してローカルストレージに保存
            localStorage.setItem('tetris_settings', JSON.stringify(this.currentSettings));
        } catch (e) {
            console.error('設定の保存に失敗しました:', e);
        }
    },
    
    // 設定のマージ
    mergeSettings: function(defaultObj, savedObj) {
        const result = {};
        
        // デフォルト設定のすべてのプロパティをコピー
        for (const key in defaultObj) {
            if (defaultObj.hasOwnProperty(key)) {
                if (typeof defaultObj[key] === 'object' && defaultObj[key] !== null) {
                    // オブジェクトの場合は再帰的にマージ
                    result[key] = this.mergeSettings(
                        defaultObj[key], 
                        (savedObj && savedObj[key]) ? savedObj[key] : {}
                    );
                } else {
                    // プリミティブ値の場合は、保存された設定があればそれを使用、なければデフォルト値
                    result[key] = (savedObj && savedObj.hasOwnProperty(key)) ? savedObj[key] : defaultObj[key];
                }
            }
        }
        
        return result;
    },
    
    // 設定適用
    applySettings: function() {
        // サウンド設定を適用
        this.applySoundSettings();
        
        // 表示設定を適用
        this.applyDisplaySettings();
        
        // コントロール設定を適用
        this.applyControlSettings();
        
        // ゲームプレイ設定を適用
        this.applyGameplaySettings();
    },
    
    // サウンド設定適用
    applySoundSettings: function() {
        const soundSettings = this.currentSettings.sound;
        
        // SoundManagerが存在する場合に設定を適用
        if (typeof SoundManager !== 'undefined') {
            SoundManager.toggleSound(soundSettings.enabled);
            SoundManager.setVolume(soundSettings.volume);
            SoundManager.setMusicVolume(soundSettings.musicVolume);
            SoundManager.setSfxVolume(soundSettings.sfxVolume);
        }
    },
    
    // 表示設定適用
    applyDisplaySettings: function() {
        const displaySettings = this.currentSettings.display;
        
        // Rendererが存在する場合に設定を適用
        if (typeof Renderer !== 'undefined') {
            Renderer.showGhost = displaySettings.showGhost;
            Renderer.showGrid = displaySettings.showGrid;
            Renderer.setTheme(displaySettings.colorTheme);
        }
        
        // アニメーションレベルに応じてCSSクラスを設定
        document.body.classList.remove('animation-none', 'animation-low', 'animation-standard', 'animation-high');
        
        const animationClass = [
            'animation-none',
            'animation-low',
            'animation-standard',
            'animation-high'
        ][displaySettings.animationLevel] || 'animation-standard';
        
        document.body.classList.add(animationClass);
    },
    
    // コントロール設定適用
    applyControlSettings: function() {
        const controlSettings = this.currentSettings.controls;
        
        // KeyboardControllerが存在する場合に設定を適用
        if (typeof KeyboardController !== 'undefined') {
            KeyboardController.rotateDirection = (controlSettings.rotateMode === 'left') ? -1 : 1;
        }
        
        // TouchControllerが存在する場合に設定を適用
        if (typeof TouchController !== 'undefined') {
            TouchController.swipeEnabled = controlSettings.enableSwipe;
            TouchController.sensitivity = controlSettings.touchSensitivity;
        }
    },
    
    // ゲームプレイ設定適用
    applyGameplaySettings: function() {
        const gameplaySettings = this.currentSettings.gameplay;
        
        // GameControllerが存在する場合に設定を適用
        if (typeof GameController !== 'undefined') {
            GameController.defaultLevel = gameplaySettings.startLevel;
            GameController.defaultMode = gameplaySettings.defaultMode;
            GameController.hardcoreMode = gameplaySettings.enableHardcore;
        }
    },
    
    // イベントリスナー設定
    setupEventListeners: function() {
        // 設定モーダルのオープンボタン
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettingsModal();
            });
        }
        
        // 設定モーダルのクローズボタン
        const closeBtn = document.getElementById('settings-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeSettingsModal();
            });
        }
        
        // 設定変更時のイベントリスナー
        this.setupSettingsChangeListeners();
    },
    
    // 設定変更リスナー設定
    setupSettingsChangeListeners: function() {
        // サウンド有効/無効トグル
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', () => {
                this.currentSettings.sound.enabled = soundToggle.checked;
                this.applySoundSettings();
                this.saveSettings();
            });
        }
        
        // 音量スライダー
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                this.currentSettings.sound.volume = parseFloat(volumeSlider.value);
                this.applySoundSettings();
            });
            
            volumeSlider.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        // BGM音量スライダー
        const musicSlider = document.getElementById('music-slider');
        if (musicSlider) {
            musicSlider.addEventListener('input', () => {
                this.currentSettings.sound.musicVolume = parseFloat(musicSlider.value);
                this.applySoundSettings();
            });
            
            musicSlider.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        // 効果音音量スライダー
        const sfxSlider = document.getElementById('sfx-slider');
        if (sfxSlider) {
            sfxSlider.addEventListener('input', () => {
                this.currentSettings.sound.sfxVolume = parseFloat(sfxSlider.value);
                this.applySoundSettings();
            });
            
            sfxSlider.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        // ゴーストピース表示トグル
        const ghostToggle = document.getElementById('ghost-toggle');
        if (ghostToggle) {
            ghostToggle.addEventListener('change', () => {
                this.currentSettings.display.showGhost = ghostToggle.checked;
                this.applyDisplaySettings();
                this.saveSettings();
            });
        }
        
        // グリッド表示トグル
        const gridToggle = document.getElementById('grid-toggle');
        if (gridToggle) {
            gridToggle.addEventListener('change', () => {
                this.currentSettings.display.showGrid = gridToggle.checked;
                this.applyDisplaySettings();
                this.saveSettings();
            });
        }
        
        // アニメーションレベル選択
        const animationSelect = document.getElementById('animation-level');
        if (animationSelect) {
            animationSelect.addEventListener('change', () => {
                this.currentSettings.display.animationLevel = parseInt(animationSelect.value);
                this.applyDisplaySettings();
                this.saveSettings();
            });
        }
        
        // カラーテーマ選択
        const themeSelect = document.getElementById('color-theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', () => {
                this.currentSettings.display.colorTheme = themeSelect.value;
                this.applyDisplaySettings();
                this.saveSettings();
            });
        }
        
        // 回転方向選択
        const rotateSelect = document.getElementById('rotate-mode');
        if (rotateSelect) {
            rotateSelect.addEventListener('change', () => {
                this.currentSettings.controls.rotateMode = rotateSelect.value;
                this.applyControlSettings();
                this.saveSettings();
            });
        }
        
        // タッチ感度選択
        const touchSensSelect = document.getElementById('touch-sensitivity');
        if (touchSensSelect) {
            touchSensSelect.addEventListener('change', () => {
                this.currentSettings.controls.touchSensitivity = parseInt(touchSensSelect.value);
                this.applyControlSettings();
                this.saveSettings();
            });
        }
        
        // スワイプ有効/無効トグル
        const swipeToggle = document.getElementById('swipe-toggle');
        if (swipeToggle) {
            swipeToggle.addEventListener('change', () => {
                this.currentSettings.controls.enableSwipe = swipeToggle.checked;
                this.applyControlSettings();
                this.saveSettings();
            });
        }
        
        // 開始レベル選択
        const levelSelect = document.getElementById('start-level');
        if (levelSelect) {
            levelSelect.addEventListener('change', () => {
                this.currentSettings.gameplay.startLevel = parseInt(levelSelect.value);
                this.applyGameplaySettings();
                this.saveSettings();
            });
        }
        
        // デフォルトモード選択
        const modeSelect = document.getElementById('default-mode');
        if (modeSelect) {
            modeSelect.addEventListener('change', () => {
                this.currentSettings.gameplay.defaultMode = modeSelect.value;
                this.applyGameplaySettings();
                this.saveSettings();
            });
        }
        
        // ハードコアモードトグル
        const hardcoreToggle = document.getElementById('hardcore-toggle');
        if (hardcoreToggle) {
            hardcoreToggle.addEventListener('change', () => {
                this.currentSettings.gameplay.enableHardcore = hardcoreToggle.checked;
                this.applyGameplaySettings();
                this.saveSettings();
            });
        }
    },
    
    // 設定モーダルを開く
    openSettingsModal: function() {
        // 設定モーダル要素を取得
        const settingsModal = document.getElementById('settings-modal');
        if (!settingsModal) return;
        
        // 現在の設定値をフォーム要素に反映
        this.updateSettingsForm();
        
        // モーダルを表示
        settingsModal.style.display = 'flex';
        
        // サウンド再生
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSfx('click');
        }
    },
    
    // 設定モーダルを閉じる
    closeSettingsModal: function() {
        const settingsModal = document.getElementById('settings-modal');
        if (!settingsModal) return;
        
        // モーダルを非表示
        settingsModal.style.display = 'none';
        
        // サウンド再生
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSfx('click');
        }
    },
    
    // 設定フォームの更新
    updateSettingsForm: function() {
        // サウンド設定
        const soundToggle = document.getElementById('sound-toggle');
        const volumeSlider = document.getElementById('volume-slider');
        const musicSlider = document.getElementById('music-slider');
        const sfxSlider = document.getElementById('sfx-slider');
        
        if (soundToggle) soundToggle.checked = this.currentSettings.sound.enabled;
        if (volumeSlider) volumeSlider.value = this.currentSettings.sound.volume;
        if (musicSlider) musicSlider.value = this.currentSettings.sound.musicVolume;
        if (sfxSlider) sfxSlider.value = this.currentSettings.sound.sfxVolume;
        
        // 表示設定
        const ghostToggle = document.getElementById('ghost-toggle');
        const gridToggle = document.getElementById('grid-toggle');
        const animationSelect = document.getElementById('animation-level');
        const themeSelect = document.getElementById('color-theme');
        
        if (ghostToggle) ghostToggle.checked = this.currentSettings.display.showGhost;
        if (gridToggle) gridToggle.checked = this.currentSettings.display.showGrid;
        if (animationSelect) animationSelect.value = this.currentSettings.display.animationLevel;
        if (themeSelect) themeSelect.value = this.currentSettings.display.colorTheme;
        
        // コントロール設定
        const rotateSelect = document.getElementById('rotate-mode');
        const touchSensSelect = document.getElementById('touch-sensitivity');
        const swipeToggle = document.getElementById('swipe-toggle');
        
        if (rotateSelect) rotateSelect.value = this.currentSettings.controls.rotateMode;
        if (touchSensSelect) touchSensSelect.value = this.currentSettings.controls.touchSensitivity;
        if (swipeToggle) swipeToggle.checked = this.currentSettings.controls.enableSwipe;
        
        // ゲームプレイ設定
        const levelSelect = document.getElementById('start-level');
        const modeSelect = document.getElementById('default-mode');
        const hardcoreToggle = document.getElementById('hardcore-toggle');
        
        if (levelSelect) levelSelect.value = this.currentSettings.gameplay.startLevel;
        if (modeSelect) modeSelect.value = this.currentSettings.gameplay.defaultMode;
        if (hardcoreToggle) hardcoreToggle.checked = this.currentSettings.gameplay.enableHardcore;
    },
    
    // 設定のリセット
    resetSettings: function() {
        // デフォルト設定をコピー
        this.currentSettings = JSON.parse(JSON.stringify(this.defaultSettings));
        
        // 設定を適用
        this.applySettings();
        
        // 設定フォームを更新
        this.updateSettingsForm();
        
        // 設定を保存
        this.saveSettings();
        
        // 通知表示
        if (typeof UI !== 'undefined') {
            UI.showNotification('設定をリセットしました');
        }
    }
};

// 設定取得関数（外部から呼び出し用）
function getSettings() {
    return SettingsManager.currentSettings;
}
