/**
 * speed-mode.js - スピードモード実装
 * テトリス・アドベンチャー v1.0.1
 */

// スピードモード設定
const SpeedMode = {
    name: 'スピード',
    description: '制限時間内にどれだけスコアを稼げるかを競うモードです。時間経過と共にブロックの落下速度が加速していきます。',
    image: 'images/modes/speed.png',
    
    // 制限時間オプション（秒）
    timeOptions: [
        { id: 'time_1min', name: '1分', seconds: 60 },
        { id: 'time_2min', name: '2分', seconds: 120 },
        { id: 'time_3min', name: '3分', seconds: 180 },
        { id: 'time_5min', name: '5分', seconds: 300 }
    ],
    
    // 現在選択中の制限時間
    currentTimeOption: 'time_2min',
    
    // 難易度オプション
    difficultyOptions: [
        { id: 'diff_easy', name: '初級', speedMultiplier: 1.0 },
        { id: 'diff_normal', name: '中級', speedMultiplier: 1.5 },
        { id: 'diff_hard', name: '上級', speedMultiplier: 2.0 },
        { id: 'diff_extreme', name: '達人', speedMultiplier: 3.0 }
    ],
    
    // 現在選択中の難易度
    currentDifficulty: 'diff_normal',
    
    // モード初期化
    init: function() {
        // 選択中の時間オプションを取得
        const timeOption = this.getCurrentTimeOption();
        
        // 選択中の難易度を取得
        const difficulty = this.getCurrentDifficultyOption();
        
        return {
            // ゲームボード設定
            rows: 20,
            cols: 10,
            
            // 初期レベルと速度
            level: 1,
            speed: 1.0 * difficulty.speedMultiplier,
            
            // スコア倍率
            scoreMultiplier: 1.5,
            
            // 特殊ルール
            gravity: 1.0,            // 重力（通常＝1.0）
            ghostPiece: true,        // ゴーストピース表示
            holdEnabled: true,       // ホールド機能
            nextPieces: 3,           // 次のピース表示数
            
            // 制限時間
            timeLimit: timeOption.seconds,
            timerEnabled: true,
            
            // 難易度情報
            difficulty: difficulty.name,
            speedMultiplier: difficulty.speedMultiplier,
            
            // モード特有のコールバック
            callbacks: {
                onGameStart: function() {
                    // ゲーム開始時の処理
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playMusic('speed');
                    }
                    
                    // タイマー情報の表示
                    if (typeof UI !== 'undefined') {
                        UI.showGameTimer(timeOption.seconds);
                    }
                },
                
                onTimerTick: function(remainingTime, elapsedTime) {
                    // タイマー処理
                    
                    // 経過時間に応じた加速
                    const speedIncrement = this.calculateSpeedIncrement(elapsedTime, timeOption.seconds);
                    
                    // 速度更新
                    if (typeof GameController !== 'undefined') {
                        const baseSpeed = 1.0 * difficulty.speedMultiplier;
                        const newSpeed = baseSpeed + speedIncrement;
                        GameController.setSpeed(newSpeed);
                    }
                    
                    // 時間切れ
                    if (remainingTime <= 0) {
                        this.timeUp();
                    }
                    
                    // 残り時間警告
                    if (remainingTime <= 10 && remainingTime > 0) {
                        // 10秒前カウントダウン
                        if (typeof UI !== 'undefined') {
                            UI.showTimeWarning(remainingTime);
                        }
                        
                        // 警告音
                        if (typeof SoundManager !== 'undefined' && remainingTime > 0) {
                            SoundManager.playSfx('timeWarning');
                        }
                    }
                },
                
                onGameOver: function(stats) {
                    // ゲームオーバー時の処理
                    
                    // 結果表示
                    if (typeof UI !== 'undefined') {
                        UI.showGameOver({
                            mode: 'speed',
                            difficulty: difficulty.name,
                            timeLimit: timeOption.seconds,
                            score: stats.score,
                            level: stats.level,
                            lines: stats.lines,
                            time: stats.time
                        });
                    }
                    
                    // ハイスコア処理
                    this.checkHighScore(stats.score, timeOption.id, difficulty.id);
                    
                    // オンラインランキング送信（ログイン済みの場合）
                    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                        this.submitScore(stats.score, stats.lines, timeOption.id, difficulty.id);
                    }
                }
            }
        };
    },
    
    // 現在の時間オプション情報を取得
    getCurrentTimeOption: function() {
        return this.timeOptions.find(o => o.id === this.currentTimeOption) || this.timeOptions[1]; // デフォルトは2分
    },
    
    // 現在の難易度オプション情報を取得
    getCurrentDifficultyOption: function() {
        return this.difficultyOptions.find(o => o.id === this.currentDifficulty) || this.difficultyOptions[1]; // デフォルトは中級
    },
    
    // 経過時間に応じた速度増加量を計算
    calculateSpeedIncrement: function(elapsedTime, totalTime) {
        // 経過時間の割合
        const timeRatio = elapsedTime / totalTime;
        
        // 最大増加量（最終的に基本速度の倍になる）
        const maxIncrement = this.getCurrentDifficultyOption().speedMultiplier;
        
        // 速度増加量（エクスポネンシャルに増加）
        return maxIncrement * Math.pow(timeRatio, 2);
    },
    
    // 制限時間終了
    timeUp: function() {
        // ゲームを停止
        if (typeof GameController !== 'undefined') {
            GameController.gameOver('timeUp');
        }
        
        // 終了音
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSfx('timeUp');
        }
    },
    
    // ハイスコア確認
    checkHighScore: function(score, timeId, difficultyId) {
        // ストレージキーの作成
        const key = `tetris_highscore_speed_${timeId}_${difficultyId}`;
        
        try {
            // 現在のハイスコアを取得
            const currentHighScore = localStorage.getItem(key) || 0;
            
            if (score > currentHighScore) {
                // ハイスコア更新
                localStorage.setItem(key, score);
                
                // 通知
                if (typeof UI !== 'undefined') {
                    UI.showNotification('新記録達成！', 'success');
                }
                
                // 未ログインユーザーには登録を促す
                if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
                    this.promptRegistration(score);
                }
            }
        } catch (e) {
            console.error('ハイスコア保存エラー:', e);
        }
    },
    
    // スコア送信
    submitScore: function(score, lines, timeId, difficultyId) {
        if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return;
        
        const scoreData = {
            mode: 'speed',
            score: score,
            lines: lines,
            timeOption: timeId,
            difficulty: difficultyId
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
    },
    
    // 時間オプションの選択
    selectTimeOption: function(timeId) {
        const timeOption = this.timeOptions.find(o => o.id === timeId);
        
        if (!timeOption) {
            console.error(`時間オプション '${timeId}' が見つかりません`);
            return false;
        }
        
        this.currentTimeOption = timeId;
        
        // 時間選択UIの更新
        this.updateTimeSelectionUI();
        
        return true;
    },
    
    // 難易度の選択
    selectDifficulty: function(difficultyId) {
        const difficulty = this.difficultyOptions.find(o => o.id === difficultyId);
        
        if (!difficulty) {
            console.error(`難易度 '${difficultyId}' が見つかりません`);
            return false;
        }
        
        this.currentDifficulty = difficultyId;
        
        // 難易度選択UIの更新
        this.updateDifficultySelectionUI();
        
        return true;
    },
    
    // 時間選択UIの更新
    updateTimeSelectionUI: function() {
        // 時間選択ボタンの更新
        const timeButtons = document.querySelectorAll('.time-option-btn');
        
        timeButtons.forEach(button => {
            button.classList.remove('selected');
            
            const timeId = button.getAttribute('data-time');
            if (timeId === this.currentTimeOption) {
                button.classList.add('selected');
            }
        });
    },
    
    // 難易度選択UIの更新
    updateDifficultySelectionUI: function() {
        // 難易度選択ボタンの更新
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        difficultyButtons.forEach(button => {
            button.classList.remove('selected');
            
            const difficultyId = button.getAttribute('data-difficulty');
            if (difficultyId === this.currentDifficulty) {
                button.classList.add('selected');
            }
        });
    }
};

// モードをゲームに登録
if (typeof GameModesCore !== 'undefined') {
    GameModesCore.addMode('speed', SpeedMode);
}
