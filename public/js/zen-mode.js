/**
 * zen-mode.js - 禅モード実装
 * テトリス・アドベンチャー v1.0.1
 */

// 禅モード設定
const ZenMode = {
    name: '禅',
    description: 'リラックスして気ままにテトリスを楽しめるモードです。タイムプレッシャーがなく、徐々に難しくなりません。',
    image: 'images/modes/zen.png',
    
    // 背景テーマオプション
    themeOptions: [
        { id: 'theme_nature', name: '自然', backgroundImage: 'images/backgrounds/nature.jpg', musicTrack: 'zen_nature' },
        { id: 'theme_ocean', name: '海', backgroundImage: 'images/backgrounds/ocean.jpg', musicTrack: 'zen_ocean' },
        { id: 'theme_space', name: '宇宙', backgroundImage: 'images/backgrounds/space.jpg', musicTrack: 'zen_space' },
        { id: 'theme_forest', name: '森林', backgroundImage: 'images/backgrounds/forest.jpg', musicTrack: 'zen_forest' },
        { id: 'theme_sunset', name: '夕暮れ', backgroundImage: 'images/backgrounds/sunset.jpg', musicTrack: 'zen_sunset' }
    ],
    
    // 現在選択中のテーマ
    currentTheme: 'theme_nature',
    
    // モード初期化
    init: function() {
        // 選択中のテーマを取得
        const theme = this.getCurrentTheme();
        
        return {
            // ゲームボード設定
            rows: 20,
            cols: 10,
            
            // 初期レベルと速度
            level: 1,
            speed: 0.8,  // 通常より少し遅い
            
            // スコア倍率
            scoreMultiplier: 1.0,
            
            // 特殊ルール
            gravity: 0.8,            // 重力（通常より少し軽く）
            ghostPiece: true,        // ゴーストピース表示
            holdEnabled: true,       // ホールド機能
            nextPieces: 3,           // 次のピース表示数
            
            // レベルアップなし
            noLevelUp: true,
            
            // テーマ情報
            theme: theme,
            
            // モード特有のコールバック
            callbacks: {
                onGameStart: function() {
                    // ゲーム開始時の処理
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playMusic(theme.musicTrack);
                        SoundManager.setMusicVolume(0.4);  // 音楽を少し静かめに
                    }
                    
                    // 背景設定
                    if (typeof UI !== 'undefined') {
                        UI.setBackground(theme.backgroundImage);
                    }
                    
                    // 呼吸ガイドの表示（リラックス要素）
                    if (typeof UI !== 'undefined') {
                        UI.showBreathingGuide();
                    }
                },
                
                onLineCleared: function(lines, totalLines, isTetris) {
                    // ライン消去時の処理（禅モードではレベルアップなし）
                    
                    // 特別な効果音（通常より柔らかい）
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playSfx('zen_clear');
                    }
                },
                
                onGameOver: function(stats) {
                    // ゲームオーバー時の処理
                    
                    // 結果表示（禅モードは競争が目的ではないので、スコアを強調しない）
                    if (typeof UI !== 'undefined') {
                        UI.showZenResult({
                            theme: theme.name,
                            lines: stats.lines,
                            time: stats.time,
                            pieces: stats.pieces
                        });
                    }
                    
                    // オンライン統計（ログイン済みの場合）
                    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                        this.submitStats(stats);
                    }
                }
            }
        };
    },
    
    // 現在のテーマ情報を取得
    getCurrentTheme: function() {
        return this.themeOptions.find(t => t.id === this.currentTheme) || this.themeOptions[0];
    },
    
    // テーマの選択
    selectTheme: function(themeId) {
        const theme = this.themeOptions.find(t => t.id === themeId);
        
        if (!theme) {
            console.error(`テーマ '${themeId}' が見つかりません`);
            return false;
        }
        
        this.currentTheme = themeId;
        
        // テーマ選択UI更新
        this.updateThemeSelectionUI();
        
        // 背景のプレビュー表示
        if (typeof UI !== 'undefined') {
            UI.previewBackground(theme.backgroundImage);
        }
        
        // BGMのプレビュー再生
        if (typeof SoundManager !== 'undefined') {
            SoundManager.previewMusic(theme.musicTrack, 5000);  // 5秒間プレビュー
        }
        
        return true;
    },
    
    // テーマ選択UI更新
    updateThemeSelectionUI: function() {
        // テーマ選択ボタンの更新
        const themeButtons = document.querySelectorAll('.theme-btn');
        
        themeButtons.forEach(button => {
            button.classList.remove('selected');
            
            const themeId = button.getAttribute('data-theme');
            if (themeId === this.currentTheme) {
                button.classList.add('selected');
            }
        });
        
        // 現在のテーマ情報の表示
        const theme = this.getCurrentTheme();
        
        const themeNameElement = document.getElementById('theme-name');
        
        if (themeNameElement) {
            themeNameElement.textContent = theme.name;
        }
    },
    
    // プレイ統計送信
    submitStats: function(stats) {
        if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return;
        
        const statsData = {
            mode: 'zen',
            theme: this.currentTheme,
            time: stats.time,
            lines: stats.lines,
            pieces: stats.pieces
        };
        
        Auth.submitStats(statsData);
    },
    
    // 呼吸ガイド表示の制御
    toggleBreathingGuide: function(enabled) {
        if (typeof UI === 'undefined') return;
        
        if (enabled) {
            UI.showBreathingGuide();
        } else {
            UI.hideBreathingGuide();
        }
        
        // 設定保存
        try {
            localStorage.setItem('tetris_zen_breathing_guide', enabled ? 'true' : 'false');
        } catch (e) {
            console.error('設定の保存に失敗しました:', e);
        }
    },
    
    // 呼吸ガイド表示設定の読み込み
    loadBreathingGuideSetting: function() {
        try {
            const setting = localStorage.getItem('tetris_zen_breathing_guide');
            return setting !== 'false';  // デフォルトは表示する
        } catch (e) {
            return true;  // エラー時はデフォルト値
        }
    }
};

// モードをゲームに登録
if (typeof GameModesCore !== 'undefined') {
    GameModesCore.addMode('zen', ZenMode);
}
