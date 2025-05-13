/**
 * game-modes.js - 各種ゲームモードの実装（互換レイヤー）
 * テトリス・アドベンチャー v1.0.2
 */

// 新しい分割されたモジュールとの互換レイヤー
// 古いコードとの互換性を確保する

// GameModesCoreが存在するかチェック
const useNewModules = typeof GameModesCore !== 'undefined';

// 互換レイヤー
const GameModes = useNewModules ? {} : {
    // クラシックモード: 伝統的なテトリス
    classic: {
        name: 'クラシック',
        description: '伝統的なテトリスのルールに従ったスタンダードモード。',
        icon: 'fas fa-chess-rook',
        init: function(tetris) {
            return {
                rows: 20,
                cols: 10,
                level: 1,
                gameMode: 'classic',
                onGameOver: (score, lines, level) => {
                    UI.showGameOver('クラシックモード', score, lines, level);
                    saveScore('classic', score, level);
                }
            };
        }
    },
    
    // アドベンチャーモード: ストーリー性のあるミッションベースのモード
    adventure: {
        name: 'アドベンチャー',
        description: 'ストーリーを進めながらミッションをクリアしていく冒険モード。特殊アイテムやスキルが使えます。',
        icon: 'fas fa-hat-wizard',
        init: function(tetris) {
            // 現在のストーリーレベルを取得（ローカルストレージから）
            const currentStoryLevel = parseInt(localStorage.getItem('storyLevel') || '1');
            
            // ミッション設定
            const missions = [
                { level: 1, description: '10ライン消去せよ', target: 10, type: 'lines' },
                { level: 2, description: '3,000点を獲得せよ', target: 3000, type: 'score' },
                { level: 3, description: 'Tスピンを3回決めよ', target: 3, type: 'tspin' },
                { level: 4, description: '4ラインを同時に消去せよ', target: 1, type: 'tetris' },
                { level: 5, description: '5分間サバイバル', target: 300, type: 'time' }
            ];
            
            const currentMission = missions.find(m => m.level === currentStoryLevel) || missions[0];
            
            // ミッション進捗
            let missionProgress = 0;
            
            // 特殊アイテム（レベル毎に解禁）
            const specialItems = [
                { level: 1, name: 'ラインクリア', icon: 'fas fa-broom', use: () => {} },
                { level: 2, name: 'スロー', icon: 'fas fa-clock', use: () => {} },
                { level: 3, name: '形状変換', icon: 'fas fa-random', use: () => {} },
                { level: 4, name: '次のピース選択', icon: 'fas fa-hand-pointer', use: () => {} },
                { level: 5, name: '全消し', icon: 'fas fa-trash-alt', use: () => {} }
            ];
            
            // 利用可能なアイテム
            const availableItems = specialItems.filter(item => item.level <= currentStoryLevel);
            
            return {
                rows: 20,
                cols: 10,
                level: Math.max(1, Math.floor(currentStoryLevel / 2)),
                gameMode: 'adventure',
                mission: currentMission,
                missionProgress: missionProgress,
                items: availableItems,
                
                // ミッション更新
                updateMission: (type, value) => {
                    if (currentMission.type === type) {
                        missionProgress += value;
                        UI.updateMissionProgress(missionProgress, currentMission.target);
                        
                        // ミッションクリア判定
                        if (missionProgress >= currentMission.target) {
                            // 次のストーリーレベルを保存
                            localStorage.setItem('storyLevel', (currentStoryLevel + 1).toString());
                            
                            UI.showMissionComplete(currentMission.description);
                            setTimeout(() => {
                                UI.showGameOver('アドベンチャーモード', tetris.getState().score, tetris.getState().lines, tetris.getState().level, true);
                                saveScore('adventure', tetris.getState().score, tetris.getState().level);
                            }, 2000);
                        }
                    }
                },
                
                onLinesCleared: (linesCleared, totalLines, level) => {
                    this.updateMission('lines', linesCleared);
                    
                    // テトリス（4ライン同時消去）の判定
                    if (linesCleared === 4) {
                        this.updateMission('tetris', 1);
                    }
                },
                
                onScore: (score) => {
                    this.updateMission('score', score - tetris.getState().score);
                },
                
                onGameOver: (score, lines, level) => {
                    UI.showGameOver('アドベンチャーモード', score, lines, level, false);
                    saveScore('adventure', score, level);
                }
            };
        }
    },
    
    // バトルモード: AI対戦モード
    battle: {
        name: 'バトル',
        description: 'AIと対戦するモード。ラインを消すとゴミブロックが相手のフィールドに送られます。',
        icon: 'fas fa-gamepad',
        init: function(tetris) {
            // AI難易度
            const difficulties = ['easy', 'normal', 'hard', 'expert'];
            const difficulty = localStorage.getItem('aiDifficulty') || 'normal';
            
            // AIの行動間隔（難易度による）
            const aiIntervals = {
                easy: 1200,
                normal: 800,
                hard: 500,
                expert: 300
            };
            
            // AIのフィールド状態
            let aiBoard = Array.from({ length: 20 }, () => Array(10).fill(0));
            let aiScore = 0;
            let aiLines = 0;
            
            // AIの行動をシミュレート
            const aiInterval = setInterval(() => {
                if (tetris.isPaused || tetris.isGameOver) return;
                
                // AIがランダムに行動（簡易的なAI）
                const action = Math.random();
                
                if (action < 0.7) { // 70%の確率でライン消去
                    const linesCleared = Math.floor(Math.random() * 3) + 1; // 1-3ライン
                    aiLines += linesCleared;
                    aiScore += linesCleared * 100;
                    
                    // プレイヤーにゴミブロックを送る
                    if (linesCleared > 1) {
                        const garbageLines = linesCleared - 1;
                        sendGarbageToPlayer(garbageLines);
                    }
                    
                    // UIを更新
                    UI.updateOpponentStats(aiScore, aiLines);
                }
                
            }, aiIntervals[difficulty]);
            
            // プレイヤーにゴミブロックを送る
            function sendGarbageToPlayer(lines) {
                if (lines <= 0 || tetris.isGameOver) return;
                
                // 現在のボードを取得
                const board = tetris.getState().board;
                
                // ボードの上部からgarbageLines行分を削除
                board.splice(0, lines);
                
                // 下部にゴミブロック行を追加
                for (let i = 0; i < lines; i++) {
                    const garbageLine = Array(10).fill({ type: 'garbage', color: '#888888' });
                    // ランダムな1箇所は空ける
                    const holePosition = Math.floor(Math.random() * 10);
                    garbageLine[holePosition] = 0;
                    board.push(garbageLine);
                }
                
                UI.showNotification(`AIから${lines}行のゴミブロックが送られてきた！`);
            }
            
            return {
                rows: 20,
                cols: 10,
                level: difficulties.indexOf(difficulty) + 1,
                gameMode: 'battle',
                difficulty: difficulty,
                
                onLinesCleared: (linesCleared, totalLines, level) => {
                    // 2ライン以上消した場合、AIにゴミブロックを送る
                    if (linesCleared >= 2) {
                        const garbageLines = linesCleared - 1;
                        UI.showNotification(`AIに${garbageLines}行のゴミブロックを送った！`);
                        
                        // AIのスコアを減少（シミュレーション）
                        aiScore = Math.max(0, aiScore - 100);
                        UI.updateOpponentStats(aiScore, aiLines);
                    }
                },
                
                onGameOver: (score, lines, level) => {
                    // バトル結果判定
                    const result = score > aiScore ? 'win' : (score < aiScore ? 'lose' : 'draw');
                    
                    UI.showGameOver('バトルモード', score, lines, level, result === 'win');
                    saveScore('battle', score, level);
                    
                    // インターバルをクリア
                    clearInterval(aiInterval);
                }
            };
        }
    },
    
    // パズルモード: 指定された形状を作るパズル
    puzzle: {
        name: 'パズル',
        description: '指定された形状になるようにブロックを配置するパズルモード。論理的思考と戦略が試されます。',
        icon: 'fas fa-puzzle-piece',
        init: function(tetris) {
            // パズルレベル（ローカルストレージから）
            const puzzleLevel = parseInt(localStorage.getItem('puzzleLevel') || '1');
            
            // パズルの定義
            const puzzles = [
                { level: 1, name: '基本の四角形', targetShape: [[1,1],[1,1]], timeLimit: 60 },
                { level: 2, name: '階段', targetShape: [[1,0],[1,1],[0,1]], timeLimit: 90 },
                { level: 3, name: 'T字型', targetShape: [[1,1,1],[0,1,0],[0,1,0]], timeLimit: 120 },
                { level: 4, name: 'ピラミッド', targetShape: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1]], timeLimit: 150 },
                { level: 5, name: '穴あきブロック', targetShape: [[1,1,1],[1,0,1],[1,1,1]], timeLimit: 180 }
            ];
            
            const currentPuzzle = puzzles.find(p => p.level === puzzleLevel) || puzzles[0];
            
            // 残り時間
            let timeRemaining = currentPuzzle.timeLimit;
            
            // タイマー
            const timer = setInterval(() => {
                if (tetris.isPaused || tetris.isGameOver) return;
                
                timeRemaining--;
                UI.updateTimer(timeRemaining);
                
                if (timeRemaining <= 0) {
                    clearInterval(timer);
                    tetris.isGameOver = true;
                    UI.showGameOver('パズルモード', 0, 0, puzzleLevel, false);
                }
            }, 1000);
            
            // パズル完成判定
            function checkPuzzleCompletion() {
                const board = tetris.getState().board;
                const shape = currentPuzzle.targetShape;
                
                // ボード内で指定された形状が完成しているか確認
                for (let startY = 0; startY <= board.length - shape.length; startY++) {
                    for (let startX = 0; startX <= board[0].length - shape[0].length; startX++) {
                        let matches = true;
                        
                        // 形状チェック
                        for (let y = 0; y < shape.length; y++) {
                            for (let x = 0; x < shape[y].length; x++) {
                                if (shape[y][x] === 1 && (!board[startY + y][startX + x] || board[startY + y][startX + x] === 0)) {
                                    matches = false;
                                    break;
                                }
                                if (shape[y][x] === 0 && board[startY + y][startX + x] !== 0) {
                                    matches = false;
                                    break;
                                }
                            }
                            if (!matches) break;
                        }
                        
                        if (matches) {
                            // パズル完成！
                            tetris.isGameOver = true;
                            clearInterval(timer);
                            
                            // 次のレベルを解放
                            localStorage.setItem('puzzleLevel', (puzzleLevel + 1).toString());
                            
                            // スコア計算: 残り時間 × 100
                            const score = timeRemaining * 100;
                            
                            setTimeout(() => {
                                UI.showGameOver('パズルモード', score, 0, puzzleLevel, true);
                                saveScore('puzzle', score, puzzleLevel);
                            }, 1000);
                            
                            return true;
                        }
                    }
                }
                
                return false;
            }
            
            return {
                rows: 10, // パズルモードは小さめのフィールド
                cols: 10,
                level: 1, // 落下速度は遅め
                gameMode: 'puzzle',
                puzzle: currentPuzzle,
                
                onPieceMove: () => {
                    // 毎回の移動後にパズル完成チェック
                    checkPuzzleCompletion();
                },
                
                onGameOver: (score, lines, level) => {
                    clearInterval(timer);
                }
            };
        }
    },
    
    // スピードモード: 高速モード
    speed: {
        name: 'スピード',
        description: 'どんどん加速していく高速モード。反射神経と集中力が試されます。',
        icon: 'fas fa-tachometer-alt',
        init: function(tetris) {
            // 初期レベル
            const startLevel = 5; // 最初から高速
            
            // 加速用タイマー
            let speedTimer = null;
            
            // 残り時間（スピードモードは制限時間あり）
            let timeRemaining = 120; // 2分
            
            // タイマー
            const timer = setInterval(() => {
                if (tetris.isPaused || tetris.isGameOver) return;
                
                timeRemaining--;
                UI.updateTimer(timeRemaining);
                
                if (timeRemaining <= 0) {
                    clearInterval(timer);
                    clearInterval(speedTimer);
                    tetris.isGameOver = true;
                    
                    const state = tetris.getState();
                    UI.showGameOver('スピードモード', state.score, state.lines, state.level, true);
                    saveScore('speed', state.score, state.level);
                }
            }, 1000);
            
            // 加速処理
            speedTimer = setInterval(() => {
                if (tetris.isPaused || tetris.isGameOver) return;
                
                // 10秒ごとにレベルアップ
                tetris.level++;
                tetris.dropInterval = Math.max(100, 1000 - (tetris.level * 50));
                
                UI.showNotification(`レベルアップ! Lv.${tetris.level}`);
            }, 10000);
            
            return {
                rows: 20,
                cols: 10,
                level: startLevel,
                gameMode: 'speed',
                
                onGameOver: (score, lines, level) => {
                    clearInterval(timer);
                    clearInterval(speedTimer);
                    UI.showGameOver('スピードモード', score, lines, level);
                    saveScore('speed', score, level);
                }
            };
        }
    },
    
    // 禅モード: リラックスモード
    zen: {
        name: '禅',
        description: '時間制限なし、ゲームオーバーなしのリラックスモード。心を落ち着かせてプレイ。',
        icon: 'fas fa-yin-yang',
        init: function(tetris) {
            // 禅モードの特殊処理
            const originalCheckCollision = tetris.checkCollision;
            
            // 衝突判定をオーバーライド
            tetris.checkCollision = function(piece = this.currentPiece, offsetX = 0, offsetY = 0, rotation = 0) {
                const result = originalCheckCollision.call(this, piece, offsetX, offsetY, rotation);
                
                // 上部での衝突はゲームオーバーにしない
                if (result && offsetY === 0 && piece.y <= 0) {
                    // ボードをクリア
                    this.board = this.createEmptyBoard();
                    UI.showNotification('ボードをリセットしました。リラックスして続けましょう。');
                    return false;
                }
                
                return result;
            };
            
            return {
                rows: 20,
                cols: 10,
                level: 1,
                gameMode: 'zen',
                
                onGameOver: () => {
                    // 禅モードではゲームオーバーにならない
                    tetris.isGameOver = false;
                }
            };
        }
    }
};

// スコアをサーバーに保存
function saveScore(gameMode, score, level) {
    // auth.jsで定義されているAPIを利用
    if (typeof saveGameScore === 'function') {
        saveGameScore(score, level, gameMode);
    } else {
        console.log('スコア保存機能は利用できません');
    }
}

// 互換レイヤーの発動処理
// GameModesCoreAPIと古いGameModes APIを統合
if (useNewModules) {
    // 新しいモジュールがある場合は、古いAPIを新しいモジュールにブリッジ
    console.log('互換レイヤーを有効化します');   

    // 必要なモードを定義
    const modeNames = ['classic', 'adventure', 'battle', 'puzzle', 'speed', 'zen'];
    
    // 各モードのブリッジを設定
    modeNames.forEach(modeName => {
        if (GameModesCore.modes && GameModesCore.modes[modeName]) {
            GameModes[modeName] = {
                name: GameModesCore.modes[modeName].name || modeName,
                description: GameModesCore.modes[modeName].description || '',
                icon: 'fas fa-gamepad',
                init: function() { 
                    return GameModesCore.modes[modeName].init(); 
                }
            };
        }
    });
}

// エラーの場合に備えて、デフォルトのInit関数を確認
if (!GameModes.classic || typeof GameModes.classic.init !== 'function') {
    console.error('クラシックモードのinit関数が見つかりません。フォールバックを使用します。');
}
