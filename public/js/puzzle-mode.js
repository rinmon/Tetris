/**
 * puzzle-mode.js - パズルモード実装
 * テトリス・アドベンチャー v1.0.1
 */

// パズルモード設定
const PuzzleMode = {
    name: 'パズル',
    description: '特定の形状や条件を満たすようにブロックを配置する思考型モードです。限られた数のピースで目標を達成しましょう。',
    image: 'images/modes/puzzle.png',
    
    // パズルのレベル一覧
    puzzles: [
        // レベル1
        {
            id: 'pzl_1',
            name: 'シンプルライン',
            description: '1列のラインを消す単純なパズルです。',
            objective: '1本のラインを消す',
            initialBoard: [
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,1,1,0,0]  // 最下段に8マスのブロック配置済み
            ],
            availablePieces: ['I'],  // 使用可能なピース
            pieceLimit: 1,           // ピース使用制限数
            targetLines: 1           // 目標ライン消去数
        },
        
        // レベル2
        {
            id: 'pzl_2',
            name: 'Lの組み合わせ',
            description: 'Lピースを使って隙間を埋めましょう。',
            objective: '2本のラインを消す',
            initialBoard: [
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,0,1,1,1],  // 下から2段目に隙間
                [1,1,1,1,1,1,0,1,1,1]   // 最下段に隙間
            ],
            availablePieces: ['L', 'J'],
            pieceLimit: 2,
            targetLines: 2
        },
        
        // レベル3
        {
            id: 'pzl_3',
            name: 'テトリス初級',
            description: '4本同時消しを狙ってみましょう。',
            objective: '4本同時消し（テトリス）を達成',
            initialBoard: [
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,0]
            ],
            availablePieces: ['I'],
            pieceLimit: 1,
            targetLines: 4,
            requireTetris: true
        },
        
        // その他のパズルは開発中に追加
    ],
    
    // 解放済みパズル
    unlockedPuzzles: 1,
    
    // 現在選択中のパズル
    currentPuzzle: 'pzl_1',
    
    // モード初期化
    init: function() {
        // 解放済みパズルの読み込み
        this.loadProgress();
        
        // 現在のパズル情報を取得
        const puzzle = this.getCurrentPuzzle();
        
        return {
            // ゲームボード設定
            rows: 20,
            cols: 10,
            
            // 初期ボード状態
            initialBoard: puzzle.initialBoard,
            
            // パズル情報
            puzzleId: puzzle.id,
            puzzleName: puzzle.name,
            puzzleDescription: puzzle.description,
            puzzleObjective: puzzle.objective,
            
            // 制限
            availablePieces: puzzle.availablePieces,
            pieceLimit: puzzle.pieceLimit,
            usedPieces: 0,
            
            // 目標
            targetLines: puzzle.targetLines,
            requireTetris: puzzle.requireTetris || false,
            
            // スコア倍率
            scoreMultiplier: 1.0,
            
            // 特殊ルール
            gravity: 1.0,            // 重力（通常＝1.0）
            ghostPiece: true,        // ゴーストピース表示
            holdEnabled: false,      // ホールド機能（パズルモードでは無効）
            nextPieces: 1,           // 次のピース表示数
            
            // モード特有のコールバック
            callbacks: {
                onGameStart: function() {
                    // ゲーム開始時の処理
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playMusic('puzzle');
                    }
                    
                    // パズル情報の表示
                    if (typeof UI !== 'undefined') {
                        UI.showPuzzleInfo(puzzle);
                        UI.updatePieceLimit(0, puzzle.pieceLimit);
                    }
                },
                
                onPieceSpawned: function() {
                    // ピース生成時の処理
                    this.usedPieces++;
                    
                    // ピース使用数表示の更新
                    if (typeof UI !== 'undefined') {
                        UI.updatePieceLimit(this.usedPieces, puzzle.pieceLimit);
                    }
                    
                    // ピース制限チェック
                    if (this.usedPieces >= puzzle.pieceLimit) {
                        // 最後のピース
                        if (typeof GameController !== 'undefined') {
                            GameController.setLastPiece();
                        }
                    }
                },
                
                onLineCleared: function(lines, totalLines, isTetris) {
                    // ライン消去時の処理
                    
                    // 目標達成チェック
                    if (puzzle.requireTetris) {
                        // テトリス（4ライン同時消去）が必要な場合
                        if (isTetris) {
                            this.puzzleSolved();
                        }
                    } else {
                        // 通常のライン消去数でチェック
                        if (totalLines >= puzzle.targetLines) {
                            this.puzzleSolved();
                        }
                    }
                },
                
                onGameOver: function(stats) {
                    // ゲームオーバー時の処理（ピースを使い切って目標未達成）
                    
                    // 失敗結果表示
                    if (typeof UI !== 'undefined') {
                        UI.showPuzzleResult({
                            puzzleId: puzzle.id,
                            puzzleName: puzzle.name,
                            solved: false,
                            score: stats.score,
                            lines: stats.lines,
                            usedPieces: this.usedPieces,
                            time: stats.time
                        });
                    }
                }
            }
        };
    },
    
    // 進行状況読み込み
    loadProgress: function() {
        try {
            const savedProgress = localStorage.getItem('tetris_puzzle_progress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                this.unlockedPuzzles = progress.unlockedPuzzles || 1;
                this.currentPuzzle = progress.currentPuzzle || 'pzl_1';
                
                // 選択中のパズルが解放されていない場合は最初のパズルを選択
                if (this.getPuzzleIndex(this.currentPuzzle) >= this.unlockedPuzzles) {
                    this.currentPuzzle = this.puzzles[0].id;
                }
            }
        } catch (e) {
            console.error('パズルモード進行状況の読み込みエラー:', e);
            this.unlockedPuzzles = 1;
            this.currentPuzzle = 'pzl_1';
        }
    },
    
    // 進行状況保存
    saveProgress: function() {
        try {
            const progress = {
                unlockedPuzzles: this.unlockedPuzzles,
                currentPuzzle: this.currentPuzzle
            };
            
            localStorage.setItem('tetris_puzzle_progress', JSON.stringify(progress));
            
            // オンライン保存（ログイン済みの場合）
            if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
                Auth.saveGameProgress('puzzle', progress);
            }
        } catch (e) {
            console.error('パズルモード進行状況の保存エラー:', e);
        }
    },
    
    // 現在のパズル情報を取得
    getCurrentPuzzle: function() {
        const puzzle = this.puzzles.find(p => p.id === this.currentPuzzle);
        return puzzle || this.puzzles[0];
    },
    
    // パズルのインデックスを取得
    getPuzzleIndex: function(puzzleId) {
        return this.puzzles.findIndex(p => p.id === puzzleId);
    },
    
    // パズル解決時の処理
    puzzleSolved: function() {
        // ゲームを一時停止
        if (typeof GameController !== 'undefined') {
            GameController.pause();
        }
        
        // 次のパズル解放
        const currentIndex = this.getPuzzleIndex(this.currentPuzzle);
        if (currentIndex + 1 >= this.unlockedPuzzles && currentIndex + 1 < this.puzzles.length) {
            this.unlockedPuzzles = currentIndex + 2;
            this.saveProgress();
        }
        
        // 成功演出
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSfx('puzzleSolved');
        }
        
        // 成功画面表示
        if (typeof UI !== 'undefined') {
            const stats = GameController.getStats();
            const puzzle = this.getCurrentPuzzle();
            
            UI.showPuzzleResult({
                puzzleId: puzzle.id,
                puzzleName: puzzle.name,
                solved: true,
                score: stats.score,
                lines: stats.lines,
                usedPieces: stats.usedPieces,
                time: stats.time,
                nextPuzzle: currentIndex + 1 < this.puzzles.length,
                nextPuzzleName: currentIndex + 1 < this.puzzles.length ? this.puzzles[currentIndex + 1].name : null
            });
        }
    },
    
    // パズル選択
    selectPuzzle: function(puzzleId) {
        // パズルが存在するか確認
        const puzzleIndex = this.getPuzzleIndex(puzzleId);
        if (puzzleIndex === -1) {
            console.error(`パズル '${puzzleId}' が見つかりません`);
            return false;
        }
        
        // パズルが解放済みか確認
        if (puzzleIndex >= this.unlockedPuzzles) {
            // 未解放パズルは選択不可
            if (typeof UI !== 'undefined') {
                UI.showNotification('このパズルはまだ解放されていません', 'warning');
            }
            return false;
        }
        
        // 選択したパズルをセット
        this.currentPuzzle = puzzleId;
        this.saveProgress();
        
        // パズル選択UI更新
        this.updatePuzzleSelectionUI();
        
        return true;
    },
    
    // パズル選択UI更新
    updatePuzzleSelectionUI: function() {
        // パズル選択ボタンの更新
        const puzzleButtons = document.querySelectorAll('.puzzle-btn');
        
        puzzleButtons.forEach(button => {
            button.classList.remove('selected');
            
            const puzzleId = button.getAttribute('data-puzzle');
            if (puzzleId === this.currentPuzzle) {
                button.classList.add('selected');
            }
        });
        
        // 現在のパズル情報の表示
        const puzzle = this.getCurrentPuzzle();
        
        const puzzleNameElement = document.getElementById('puzzle-name');
        const puzzleDescElement = document.getElementById('puzzle-description');
        const puzzleObjectiveElement = document.getElementById('puzzle-objective');
        
        if (puzzleNameElement) {
            puzzleNameElement.textContent = puzzle.name;
        }
        
        if (puzzleDescElement) {
            puzzleDescElement.textContent = puzzle.description;
        }
        
        if (puzzleObjectiveElement) {
            puzzleObjectiveElement.textContent = `目標: ${puzzle.objective}`;
        }
    },
    
    // パズル一覧表示
    showPuzzleSelect: function() {
        if (typeof UI === 'undefined') return;
        
        // パズル選択画面表示
        UI.showScreen('puzzleSelect');
        
        // パズル一覧データの準備
        const puzzleData = {
            unlockedPuzzles: this.unlockedPuzzles,
            currentPuzzle: this.currentPuzzle,
            puzzles: this.puzzles.map((puzzle, index) => {
                return {
                    id: puzzle.id,
                    name: puzzle.name,
                    description: puzzle.description,
                    objective: puzzle.objective,
                    unlocked: index < this.unlockedPuzzles
                };
            })
        };
        
        // データを画面に反映
        UI.updatePuzzleSelectUI(puzzleData);
    },
    
    // パズル再スタート
    restartPuzzle: function() {
        if (typeof GameController !== 'undefined') {
            // 現在のパズル情報で初期化
            const config = this.init();
            
            // ゲーム準備
            GameController.prepare(config, 'puzzle');
            
            // ゲーム開始
            GameController.start();
        }
    },
    
    // 次のパズルへ
    nextPuzzle: function() {
        const currentIndex = this.getPuzzleIndex(this.currentPuzzle);
        
        // 次のパズルがあり、解放済みの場合
        if (currentIndex + 1 < this.puzzles.length && currentIndex + 1 < this.unlockedPuzzles) {
            this.currentPuzzle = this.puzzles[currentIndex + 1].id;
            this.saveProgress();
            
            // 新しいパズルでゲーム再開
            this.restartPuzzle();
        }
    }
};

// モードをゲームに登録
if (typeof GameModesCore !== 'undefined') {
    GameModesCore.addMode('puzzle', PuzzleMode);
}
