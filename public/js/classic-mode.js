/**
 * classic-mode.js - クラシックモード実装
 * テトリス・アドベンチャー v1.0.2
 */

// クラシックモード設定
// windowオブジェクトに直接定義して重複を避ける
window.ClassicMode = {
    name: 'クラシック',
    description: '伝統的なテトリスルールで遊べるモードです。レベルが上がるごとにブロックの落下速度が速くなります。',
    image: 'images/modes/classic.png',
    
    // モード初期化時の設定
    init: function() {
        return {
            // ゲームボード設定
            rows: 20,
            cols: 10,
            
            // 初期レベルと速度
            level: 1,
            speed: 1.0,
            
            // スコア倍率
            scoreMultiplier: 1.0,
            
            // レベルアップ条件
            linesPerLevel: 10,
            
            // 特殊ルール
            gravity: 1.0,            // 重力（通常＝1.0）
            ghostPiece: true,        // ゴーストピース表示
            holdEnabled: true,       // ホールド機能
            nextPieces: 3,           // 次のピース表示数
            
            // モード特有のコールバック
            callbacks: {
                onLevelUp: function(level) {
                    // レベルアップ時の処理
                    return {
                        // 新しい速度（レベルに応じて加速）
                        speed: 1.0 + (level - 1) * 0.2
                    };
                },
                
                onGameStart: function() {
                    // ゲーム開始時の処理
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playMusic('classic');
                    }
                },
                
                onGameOver: function(stats) {
                    // ゲームオーバー時の処理
                    const score = stats.score;
                    const level = stats.level;
                    const lines = stats.lines;
                    
                    // ハイスコア処理
                    this.checkHighScore(score, level, lines);
                    
                    // 結果表示
                    if (typeof UI !== 'undefined') {
                        UI.showGameOver({
                            mode: 'classic',
                            score: score,
                            level: level,
                            lines: lines,
                            time: stats.time
                        });
                    }
                }
            }
        };
    },
    
    // ハイスコア確認
    checkHighScore: function(score, level, lines) {
        // ローカルストレージにハイスコアを保存
        try {
            const key = 'tetris_highscore_classic';
            const currentHighScore = localStorage.getItem(key) || 0;
            
            if (score > currentHighScore) {
                localStorage.setItem(key, score);
                
                // ハイスコア更新通知
                if (typeof UI !== 'undefined') {
                    UI.showNotification('新記録達成！', 'success');
                }
                
                // オンラインランキング送信（ユーザーが登録済みの場合）
                if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                    this.submitScore(score, level, lines);
                } else {
                    // 未ログインユーザーには登録を促す
                    this.promptRegistration(score);
                }
            }
        } catch (e) {
            console.error('ハイスコア保存エラー:', e);
        }
    },
    
    // スコア送信
    submitScore: function(score, level, lines) {
        if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return;
        
        const scoreData = {
            mode: 'classic',
            score: score,
            level: level,
            lines: lines
        };
        
        Auth.submitScore(scoreData, (success) => {
            if (success && typeof UI !== 'undefined') {
                UI.showNotification('ランキングにスコアを送信しました', 'info');
            }
        });
    },
    
    // 登録促進
    promptRegistration: function(score) {
        if (typeof UI === 'undefined') return;
        
        UI.showModal({
            title: 'ランキングに参加しませんか？',
            content: `
                <p>素晴らしいスコア: <strong>${score.toLocaleString()}</strong> を記録しました！</p>
                <p>ユーザー登録をすると、あなたのスコアを世界中のプレイヤーと競争できます。</p>
                <p>また、以下の特典も得られます：</p>
                <ul>
                    <li>🏆 グローバルランキングへの参加</li>
                    <li>🔄 ゲーム進行の自動保存</li>
                    <li>🎮 特別なゲームモードへのアクセス</li>
                    <li>🎨 追加のテーマとカスタマイズ</li>
                </ul>
            `,
            buttons: [
                {
                    text: '今すぐ登録',
                    action: 'register',
                    class: 'primary-btn'
                },
                {
                    text: 'あとで',
                    action: 'close',
                    class: 'secondary-btn'
                }
            ],
            callback: function(action) {
                if (action === 'register' && typeof Auth !== 'undefined') {
                    Auth.showRegistrationForm();
                }
            }
        });
    }
};

// モードをゲームに登録
if (typeof GameModesCore !== 'undefined') {
    GameModesCore.addMode('classic', ClassicMode);
}
