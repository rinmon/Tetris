/**
 * battle-mode.js - バトルモード実装
 * テトリス・アドベンチャー v1.0.1
 */

// バトルモード設定
const BattleMode = {
    name: 'バトル',
    description: 'CPUや他のプレイヤーと対戦できる競争モードです。相手のボードにブロックを送り込み、先に詰まらせた方が勝利です。',
    image: 'images/modes/battle.png',
    
    // 対戦相手の種類
    opponentTypes: [
        { id: 'cpu_easy', name: 'CPU（初級）', ai: 'easy' },
        { id: 'cpu_normal', name: 'CPU（中級）', ai: 'normal' },
        { id: 'cpu_hard', name: 'CPU（上級）', ai: 'hard' },
        { id: 'cpu_expert', name: 'CPU（達人）', ai: 'expert' },
        { id: 'local', name: '2人対戦（ローカル）', ai: null },
        { id: 'online', name: 'オンライン対戦', ai: null, requiresLogin: true }
    ],
    
    // 現在選択中の対戦相手
    currentOpponent: 'cpu_easy',
    
    // 対戦設定
    battleSettings: {
        winCondition: 'knockout',   // knockout = 先に詰む方が負け, score = 制限時間後の高スコア勝ち
        gameTime: 180,              // 対戦時間（秒）- winConditionがscoreの場合のみ使用
        attackPower: 1.0,           // 攻撃力倍率
        startingGarbage: 0,         // 開始時のお邪魔ブロック数
        itemsEnabled: false,        // アイテム有効/無効
        specialRules: []            // 特殊ルール
    },
    
    // モード初期化
    init: function() {
        // 対戦相手に応じた設定
        const opponent = this.getCurrentOpponentInfo();
        
        // オンライン対戦時はログインチェック
        if (opponent.id === 'online') {
            if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
                this.promptLogin();
                // デフォルトはCPU対戦に変更
                this.currentOpponent = 'cpu_easy';
            }
        }
        
        // プレイヤーまたはAIの初期化
        if (opponent.ai) {
            this.initAI(opponent.ai);
        } else if (opponent.id === 'local') {
            this.init2Players();
        } else if (opponent.id === 'online') {
            this.initOnlineBattle();
        }
        
        return {
            // ゲームボード設定
            rows: 20,
            cols: 10,
            
            // 初期レベルと速度
            level: 1,
            speed: 1.0,
            
            // スコア倍率
            scoreMultiplier: 1.0,
            
            // 特殊ルール
            gravity: 1.0,            // 重力（通常＝1.0）
            ghostPiece: true,        // ゴーストピース表示
            holdEnabled: true,       // ホールド機能
            nextPieces: 3,           // 次のピース表示数
            
            // バトル情報
            opponent: opponent,
            battleSettings: this.battleSettings,
            
            // モード特有のコールバック
            callbacks: {
                onLevelUp: function(level) {
                    // レベルアップ時の処理
                    return {
                        // 新しい速度（レベルに応じて加速）
                        speed: 1.0 + (level - 1) * 0.1
                    };
                },
                
                onGameStart: function() {
                    // ゲーム開始時の処理
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playMusic('battle');
                    }
                    
                    // 対戦相手情報の表示
                    if (typeof UI !== 'undefined') {
                        UI.showOpponentInfo(opponent);
                    }
                },
                
                onLineCleared: function(lines, totalLines, isTetris) {
                    // ライン消去時の処理 - 相手へのお邪魔ブロック送信
                    if (lines > 1) {
                        const garbageLines = this.calculateGarbageLines(lines, isTetris);
                        
                        // 相手プレイヤーへのお邪魔ブロック送信
                        if (typeof GameController !== 'undefined') {
                            GameController.sendGarbage(garbageLines);
                        }
                    }
                },
                
                onGarbageReceived: function(lines) {
                    // お邪魔ブロック受信時の処理
                    if (typeof UI !== 'undefined') {
                        UI.showGarbageWarning(lines);
                    }
                    
                    // 効果音
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playSfx('garbageWarning');
                    }
                },
                
                onGameOver: function(stats) {
                    // ゲームオーバー時の処理
                    const isWinner = this.checkWinCondition(stats);
                    
                    // 結果表示
                    if (typeof UI !== 'undefined') {
                        UI.showBattleResult({
                            mode: 'battle',
                            opponent: opponent.name,
                            win: isWinner,
                            score: stats.score,
                            level: stats.level,
                            lines: stats.lines,
                            time: stats.time
                        });
                    }
                    
                    // 戦績保存（ログイン済みの場合）
                    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                        const resultData = {
                            mode: 'battle',
                            opponent: opponent.id,
                            win: isWinner,
                            score: stats.score,
                            time: stats.time
                        };
                        
                        Auth.saveBattleResult(resultData);
                    }
                }
            }
        };
    },
    
    // 現在の対戦相手情報を取得
    getCurrentOpponentInfo: function() {
        return this.opponentTypes.find(o => o.id === this.currentOpponent) || this.opponentTypes[0];
    },
    
    // AIの初期化
    initAI: function(difficulty) {
        // AI難易度に応じた設定
        const aiSettings = {
            easy: {
                thinkSpeed: 1000,  // AI思考間隔（ミリ秒）
                errorRate: 0.3,    // ミス率（0〜1）
                attackPriority: 0.3 // 攻撃優先度（0〜1）
            },
            normal: {
                thinkSpeed: 700,
                errorRate: 0.15,
                attackPriority: 0.5
            },
            hard: {
                thinkSpeed: 500,
                errorRate: 0.05,
                attackPriority: 0.7
            },
            expert: {
                thinkSpeed: 300,
                errorRate: 0.01,
                attackPriority: 0.9
            }
        };
        
        // AI設定をゲームコントローラーに渡す
        if (typeof GameController !== 'undefined') {
            GameController.setAISettings(aiSettings[difficulty] || aiSettings.normal);
        }
    },
    
    // 2人プレイの初期化
    init2Players: function() {
        // 2人プレイ用の設定
        if (typeof GameController !== 'undefined') {
            GameController.setMultiplayerMode('local');
        }
        
        // 2Pのコントロール設定
        if (typeof KeyboardController !== 'undefined') {
            // 2P用のキー設定
            const player2Keys = {
                left: ['j', 'J'],
                right: ['l', 'L'],
                down: ['k', 'K'],
                hardDrop: ['i', 'I'],
                rotateClockwise: ['o', 'O'],
                rotateCounterClockwise: ['u', 'U'],
                hold: ['y', 'Y'],
                pause: ['p', 'P']
            };
            
            KeyboardController.setPlayer2Keys(player2Keys);
        }
    },
    
    // オンライン対戦の初期化
    initOnlineBattle: function() {
        // オンライン対戦用の設定（実装は別ファイルで）
        if (typeof GameController !== 'undefined') {
            GameController.setMultiplayerMode('online');
        }
        
        // マッチング開始
        if (typeof OnlineBattle !== 'undefined') {
            OnlineBattle.startMatching();
        }
    },
    
    // お邪魔ブロック数の計算
    calculateGarbageLines: function(lines, isTetris) {
        // 基本攻撃力
        let garbageLines = 0;
        
        // ライン数に応じた攻撃力計算
        if (isTetris) {
            // テトリス（4ライン消し）の場合
            garbageLines = 4;
        } else if (lines === 3) {
            // 3ライン消しの場合
            garbageLines = 2;
        } else if (lines === 2) {
            // 2ライン消しの場合
            garbageLines = 1;
        }
        
        // 攻撃力倍率の適用
        garbageLines = Math.floor(garbageLines * this.battleSettings.attackPower);
        
        return garbageLines;
    },
    
    // 勝利条件のチェック
    checkWinCondition: function(stats) {
        // 勝敗判定
        const opponentStats = GameController.getOpponentStats();
        
        if (this.battleSettings.winCondition === 'knockout') {
            // ノックアウト勝ち
            return opponentStats.gameOver === true && stats.gameOver === false;
        } else {
            // スコア勝ち
            return stats.score > opponentStats.score;
        }
    },
    
    // 対戦相手の選択
    selectOpponent: function(opponentId) {
        const opponent = this.opponentTypes.find(o => o.id === opponentId);
        
        if (!opponent) {
            console.error(`対戦相手 '${opponentId}' が見つかりません`);
            return false;
        }
        
        // ログインが必要な対戦相手の場合はログインチェック
        if (opponent.requiresLogin) {
            if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
                this.promptLogin();
                return false;
            }
        }
        
        this.currentOpponent = opponentId;
        
        // 対戦相手選択UIの更新
        this.updateOpponentSelectionUI();
        
        return true;
    },
    
    // 対戦相手選択UIの更新
    updateOpponentSelectionUI: function() {
        // 対戦相手選択ボタンの更新
        const opponentButtons = document.querySelectorAll('.opponent-btn');
        
        opponentButtons.forEach(button => {
            button.classList.remove('selected');
            
            const opponentId = button.getAttribute('data-opponent');
            if (opponentId === this.currentOpponent) {
                button.classList.add('selected');
            }
        });
        
        // 対戦相手情報の表示
        const opponent = this.getCurrentOpponentInfo();
        
        // 説明表示の更新
        const opponentNameElement = document.getElementById('opponent-name');
        const opponentDescElement = document.getElementById('opponent-description');
        
        if (opponentNameElement) {
            opponentNameElement.textContent = opponent.name;
        }
        
        if (opponentDescElement) {
            if (opponent.ai) {
                opponentDescElement.textContent = `CPU対戦モードです。難易度は「${opponent.name.replace('CPU（', '').replace('）', '')}」です。`;
            } else if (opponent.id === 'local') {
                opponentDescElement.textContent = '同じ端末で2人対戦できるモードです。キーボードを分けて操作します。';
            } else if (opponent.id === 'online') {
                opponentDescElement.textContent = '世界中のプレイヤーとオンラインで対戦できるモードです。ログインが必要です。';
            }
        }
    },
    
    // ログイン促進
    promptLogin: function() {
        if (typeof UI === 'undefined') return;
        
        UI.showModal({
            title: 'ログインが必要です',
            content: `
                <p>オンライン対戦をプレイするにはログインが必要です。</p>
                <p>アカウントを作成して、世界中のプレイヤーと腕前を競いましょう！</p>
                <p>ログインすると以下の機能が使えるようになります：</p>
                <ul>
                    <li>🌐 オンライン対戦</li>
                    <li>🏆 グローバルランキング</li>
                    <li>💾 ゲーム進行の保存</li>
                    <li>🎮 追加のゲームモード</li>
                </ul>
            `,
            buttons: [
                {
                    text: 'ログイン',
                    action: 'login',
                    class: 'primary-btn'
                },
                {
                    text: '新規登録',
                    action: 'register',
                    class: 'secondary-btn'
                },
                {
                    text: 'キャンセル',
                    action: 'close',
                    class: 'text-btn'
                }
            ],
            callback: function(action) {
                if (action === 'login' && typeof Auth !== 'undefined') {
                    Auth.showLoginForm();
                } else if (action === 'register' && typeof Auth !== 'undefined') {
                    Auth.showRegistrationForm();
                }
            }
        });
    },
    
    // バトル設定の更新
    updateBattleSettings: function(settings) {
        // 設定の更新
        for (const key in settings) {
            if (this.battleSettings.hasOwnProperty(key)) {
                this.battleSettings[key] = settings[key];
            }
        }
        
        // 設定UIの更新
        this.updateBattleSettingsUI();
    },
    
    // バトル設定UIの更新
    updateBattleSettingsUI: function() {
        // 勝利条件
        const knockoutRadio = document.getElementById('win-knockout');
        const scoreRadio = document.getElementById('win-score');
        
        if (knockoutRadio && scoreRadio) {
            knockoutRadio.checked = (this.battleSettings.winCondition === 'knockout');
            scoreRadio.checked = (this.battleSettings.winCondition === 'score');
        }
        
        // 対戦時間
        const timeSelect = document.getElementById('battle-time');
        if (timeSelect) {
            timeSelect.value = this.battleSettings.gameTime;
        }
        
        // 攻撃力
        const attackSelect = document.getElementById('attack-power');
        if (attackSelect) {
            attackSelect.value = this.battleSettings.attackPower;
        }
        
        // お邪魔ブロック
        const garbageSelect = document.getElementById('starting-garbage');
        if (garbageSelect) {
            garbageSelect.value = this.battleSettings.startingGarbage;
        }
        
        // アイテム有効/無効
        const itemsToggle = document.getElementById('items-toggle');
        if (itemsToggle) {
            itemsToggle.checked = this.battleSettings.itemsEnabled;
        }
    }
};

// モードをゲームに登録
if (typeof GameModesCore !== 'undefined') {
    GameModesCore.addMode('battle', BattleMode);
}
