/**
 * adventure-mode.js - アドベンチャーモード実装
 * テトリス・アドベンチャー v1.0.1
 */

// アドベンチャーモード設定
const AdventureMode = {
    name: 'アドベンチャー',
    description: 'ストーリーに沿って進める冒険モードです。各ステージでは異なる目標や特別なルールが待ち受けています。',
    image: 'images/modes/adventure.png',
    
    // 現在のステージ
    currentStage: 1,
    totalStages: 30,
    
    // ステージ情報
    stages: [
        // ステージ1
        {
            title: '旅の始まり',
            objective: 'ライン消去10本達成',
            targetLines: 10,
            timeLimit: 0, // 0は無制限
            rows: 20,
            cols: 10,
            level: 1,
            specialRules: []
        },
        // ステージ2
        {
            title: '時間との勝負',
            objective: '60秒間生き残る',
            targetLines: 0,
            timeLimit: 60,
            rows: 20,
            cols: 10,
            level: 2,
            specialRules: []
        },
        // ステージ3
        {
            title: 'テトリスマスター',
            objective: '4本同時消し（テトリス）を2回決める',
            targetTetris: 2,
            timeLimit: 0,
            rows: 20,
            cols: 10,
            level: 2,
            specialRules: []
        },
        // 他のステージはゲーム開発中に追加
    ],
    
    // 解放済みステージ（ローカルストレージから読み込み）
    unlockedStages: 1,
    
    // モード初期化
    init: function() {
        // 解放済みステージの読み込み
        this.loadProgress();
        
        // 現在のステージ情報を取得
        const stage = this.getStageInfo(this.currentStage);
        
        return {
            // ゲームボード設定
            rows: stage.rows,
            cols: stage.cols,
            
            // 初期レベルと速度
            level: stage.level,
            speed: 1.0 + (stage.level - 1) * 0.15,
            
            // スコア倍率
            scoreMultiplier: 1.2,
            
            // 特殊ルール
            gravity: 1.0,            // 重力（通常＝1.0）
            ghostPiece: true,        // ゴーストピース表示
            holdEnabled: true,       // ホールド機能
            nextPieces: 3,           // 次のピース表示数
            
            // ステージ情報
            stage: this.currentStage,
            stageTitle: stage.title,
            objective: stage.objective,
            timeLimit: stage.timeLimit,
            targetLines: stage.targetLines,
            targetTetris: stage.targetTetris,
            specialRules: stage.specialRules,
            
            // モード特有のコールバック
            callbacks: {
                onLevelUp: function(level) {
                    // レベルアップ時の処理
                    return {
                        // 新しい速度（レベルに応じて加速）
                        speed: 1.0 + (level - 1) * 0.15
                    };
                },
                
                onGameStart: function() {
                    // ゲーム開始時の処理
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playMusic('adventure');
                    }
                    
                    // ステージ目標の表示
                    if (typeof UI !== 'undefined') {
                        UI.showStageObjective(stage);
                    }
                },
                
                onLineCleared: function(lines, totalLines, isTetris) {
                    // ライン消去時の処理
                    if (stage.targetLines > 0) {
                        // 目標ライン数達成チェック
                        if (totalLines >= stage.targetLines) {
                            this.stageClear();
                        }
                    }
                    
                    if (stage.targetTetris > 0 && isTetris) {
                        // テトリス回数カウント
                        const currentTetris = this.getStateValue('tetrisCount') || 0;
                        const newCount = currentTetris + 1;
                        this.setStateValue('tetrisCount', newCount);
                        
                        // テトリス目標達成チェック
                        if (newCount >= stage.targetTetris) {
                            this.stageClear();
                        }
                    }
                },
                
                onTimerTick: function(remainingTime) {
                    // タイマー処理
                    if (stage.timeLimit > 0) {
                        // 制限時間クリアチェック
                        if (remainingTime <= 0) {
                            this.stageClear();
                        }
                    }
                },
                
                onGameOver: function(stats) {
                    // ゲームオーバー時の処理
                    
                    // 結果表示
                    if (typeof UI !== 'undefined') {
                        UI.showGameOver({
                            mode: 'adventure',
                            stage: this.currentStage,
                            stageTitle: stage.title,
                            score: stats.score,
                            level: stats.level,
                            lines: stats.lines,
                            time: stats.time,
                            clear: false
                        });
                    }
                }
            }
        };
    },
    
    // 進行状況読み込み
    loadProgress: function() {
        try {
            const savedProgress = localStorage.getItem('tetris_adventure_progress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                this.unlockedStages = progress.unlockedStages || 1;
                this.currentStage = progress.currentStage || 1;
            }
        } catch (e) {
            console.error('アドベンチャーモード進行状況の読み込みエラー:', e);
            this.unlockedStages = 1;
            this.currentStage = 1;
        }
    },
    
    // 進行状況保存
    saveProgress: function() {
        try {
            const progress = {
                unlockedStages: this.unlockedStages,
                currentStage: this.currentStage
            };
            
            localStorage.setItem('tetris_adventure_progress', JSON.stringify(progress));
            
            // オンライン保存（ログイン済みの場合）
            if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                Auth.saveGameProgress('adventure', progress);
            }
        } catch (e) {
            console.error('アドベンチャーモード進行状況の保存エラー:', e);
        }
    },
    
    // ステージ情報取得
    getStageInfo: function(stageNumber) {
        if (stageNumber < 1 || stageNumber > this.stages.length) {
            // 存在しないステージの場合は最初のステージを返す
            return this.stages[0];
        }
        
        return this.stages[stageNumber - 1];
    },
    
    // ステージクリア処理
    stageClear: function() {
        // ゲームを一時停止
        if (typeof GameController !== 'undefined') {
            GameController.pause();
        }
        
        // クリア報酬（次のステージ解放）
        if (this.currentStage >= this.unlockedStages) {
            this.unlockedStages = Math.min(this.currentStage + 1, this.totalStages);
            this.saveProgress();
        }
        
        // クリア演出
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSfx('stageClear');
        }
        
        // クリア画面表示
        if (typeof UI !== 'undefined') {
            const stats = GameController.getStats();
            
            UI.showStageClear({
                stage: this.currentStage,
                stageTitle: this.getStageInfo(this.currentStage).title,
                nextStage: this.currentStage + 1,
                nextStageTitle: this.getStageInfo(this.currentStage + 1).title,
                score: stats.score,
                time: stats.time,
                lines: stats.lines
            });
        }
    },
    
    // 次のステージへ
    nextStage: function() {
        if (this.currentStage < this.unlockedStages) {
            this.currentStage++;
            this.saveProgress();
            
            // 新しいステージでゲーム再開
            this.restartGame();
        }
    },
    
    // ゲーム再開
    restartGame: function() {
        if (typeof GameModesCore !== 'undefined' && typeof GameController !== 'undefined') {
            // 現在のステージ情報で初期化
            const config = this.init();
            
            // ゲーム準備
            GameController.prepare(config, 'adventure');
            
            // ゲーム開始
            GameController.start();
        }
    },
    
    // ステージ選択画面表示
    showStageSelect: function() {
        if (typeof UI === 'undefined') return;
        
        // ステージ選択画面表示
        UI.showScreen('stageSelect');
        
        // ステージ選択データの準備
        const stageData = {
            unlockedStages: this.unlockedStages,
            currentStage: this.currentStage,
            stages: this.stages.map((stage, index) => {
                return {
                    number: index + 1,
                    title: stage.title,
                    objective: stage.objective,
                    unlocked: index + 1 <= this.unlockedStages
                };
            })
        };
        
        // データを画面に反映
        UI.updateStageSelectUI(stageData);
    },
    
    // ステージ選択
    selectStage: function(stageNumber) {
        // ステージが解放済みか確認
        if (stageNumber <= 0 || stageNumber > this.unlockedStages) {
            // 未解放ステージは選択不可
            if (typeof UI !== 'undefined') {
                UI.showNotification('このステージはまだ解放されていません', 'warning');
            }
            return false;
        }
        
        // 選択したステージをセット
        this.currentStage = stageNumber;
        this.saveProgress();
        
        // ゲーム開始
        this.restartGame();
        
        return true;
    }
};

// モードをゲームに登録
if (typeof GameModesCore !== 'undefined') {
    GameModesCore.addMode('adventure', AdventureMode);
}
