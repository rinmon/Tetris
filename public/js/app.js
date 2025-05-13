/**
 * app.js - メインアプリケーション
 * テトリス・アドベンチャー v1.0.2
 */

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    // UI初期化
    if (typeof UI !== 'undefined') {
        UI.init();
    }
    
    // ゲームモードシステム初期化
    if (typeof GameModesCore !== 'undefined') {
        GameModesCore.init();
    }
    
    // ゲームコントローラー初期化
    if (typeof GameController !== 'undefined') {
        GameController.init();
    }
    
    // サウンドシステム初期化
    if (typeof SoundManager !== 'undefined') {
        SoundManager.init();
    } else if (typeof SoundEvents !== 'undefined') {
        SoundEvents.init();
    }
    
    // 設定マネージャー初期化
    if (typeof SettingsManager !== 'undefined') {
        SettingsManager.init();
    }
    
    // メニューUI初期化
    if (typeof MenuUI !== 'undefined') {
        MenuUI.init();
    } else {
        // 旧バージョンの互換性のため
        setupMenuListeners();
    }
    
    // 認証関連のイベントリスナー設定
    setupAuthListeners();
    
    // ゲームモード選択画面のイベントリスナー設定
    if (typeof MenuUI === 'undefined' || typeof MenuUI.setupModeScreenListeners !== 'function') {
        setupModeScreenListeners();
    }
    
    // ヘルプ画面の初期化
    if (typeof HelpUI !== 'undefined') {
        HelpUI.init();
    } else {
        // 旧バージョンの互換性のため
        setupHelpScreenListeners();
    }
    
    // モバイルデバイスの画面方向チェック
    if (typeof checkOrientation === 'function') {
        checkOrientation();
    }
    
    // 初期画面表示（ログインを要求せずメニュー画面かゲーム画面に直接遷移）
    showInitialScreen();
    
    // ローディング画面を非表示
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) loadingScreen.style.display = 'none';
    }, 1000);
});

// 認証関連のイベントリスナー設定
function setupAuthListeners() {
    // タブ切り替え
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // ボタンのアクティブ状態を切り替え
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // フォームの表示を切り替え
            const forms = document.querySelectorAll('.form-container');
            forms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${targetTab}-form`).classList.add('active');
        });
    });
    
    // ログインボタン
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            if (!username || !password) {
                UI.showNotification('ユーザー名とパスワードを入力してください');
                return;
            }
            
            // auth.jsで定義されたログイン関数を呼び出し
            if (typeof loginUser === 'function') {
                loginUser(username, password, (success, data) => {
                    if (success) {
                        UI.showScreen('menu');
                        UI.updateUserInfo(data.user.username, data.user.level, data.user.exp, data.user.level * 1000);
                        
                        // サウンド再生
                        if (typeof SoundManager !== 'undefined') {
                            SoundManager.playSfx('success');
                            SoundManager.playBgm('bgm_menu');
                        }
                    } else {
                        UI.showNotification(data.message || 'ログインに失敗しました');
                        
                        // エラーサウンド
                        if (typeof SoundManager !== 'undefined') {
                            SoundManager.playSfx('error');
                        }
                    }
                });
            } else {
                // 認証機能がない場合はメニュー画面に遷移
                UI.showScreen('menu');
                UI.updateUserInfo(username, 1, 0, 1000);
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('success');
                    SoundManager.playBgm('bgm_menu');
                }
            }
        });
    }
    
    // 登録ボタン
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            
            if (!username || !password) {
                UI.showNotification('ユーザー名とパスワードを入力してください');
                return;
            }
            
            if (password !== confirm) {
                UI.showNotification('パスワードが一致しません');
                return;
            }
            
            // auth.jsで定義された登録関数を呼び出し
            if (typeof registerUser === 'function') {
                registerUser(username, password, (success, data) => {
                    if (success) {
                        UI.showScreen('menu');
                        UI.updateUserInfo(data.user.username, data.user.level, data.user.exp, data.user.level * 1000);
                        
                        // サウンド再生
                        if (typeof SoundManager !== 'undefined') {
                            SoundManager.playSfx('success');
                            SoundManager.playBgm('bgm_menu');
                        }
                    } else {
                        UI.showNotification(data.message || '登録に失敗しました');
                        
                        // エラーサウンド
                        if (typeof SoundManager !== 'undefined') {
                            SoundManager.playSfx('error');
                        }
                    }
                });
            } else {
                // 認証機能がない場合はメニュー画面に遷移
                UI.showScreen('menu');
                UI.updateUserInfo(username, 1, 0, 1000);
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('success');
                    SoundManager.playBgm('bgm_menu');
                }
            }
        });
    }
    
    // ゲストプレイボタン
    const guestBtn = document.getElementById('guest-btn');
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            // ゲストとしてプレイ
            UI.showScreen('menu');
            UI.updateUserInfo('ゲスト', 1, 0, 1000);
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
                SoundManager.playBgm('bgm_menu');
            }
        });
    }
}

// メニュー画面のイベントリスナー設定
function setupMenuListeners() {
    // MenuUIモジュールが存在する場合はそちらを優先
    if (typeof MenuUI !== 'undefined' && typeof MenuUI.init === 'function') {
        return;
    }
    
    // クイックプレイボタン
    const quickPlayBtn = document.getElementById('quick-play-btn');
    if (quickPlayBtn) {
        quickPlayBtn.addEventListener('click', () => {
            // クラシックモードでゲーム開始
            startGame('classic');
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('start');
            }
        });
    }
    
    // プレイボタン
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            UI.showScreen('mode');
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
    
    // ランキングボタン
    const rankingBtn = document.getElementById('ranking-btn');
    if (rankingBtn) {
        rankingBtn.addEventListener('click', () => {
            // ランキング表示
            if (typeof RankingManager !== 'undefined') {
                RankingManager.showRankingModal('all', 'classic');
            } else {
                showRankings('all', 'classic');
            }
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
    
    // 設定ボタン
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // 設定画面表示
            if (typeof SettingsManager !== 'undefined') {
                SettingsManager.openSettingsModal();
            }
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
    
    // ヘルプボタン
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            UI.showScreen('help');
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
    
    // ログイン・登録ボタン
    const loginBtn = document.getElementById('login-register-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            UI.showScreen('auth');
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
    
    // ログアウトボタン
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // auth.jsで定義されたログアウト関数を呼び出し
            if (typeof logoutUser === 'function') {
                logoutUser();
            }
            
            // ゲストとして表示
            UI.updateUserInfo('ゲスト', 1, 0, 1000);
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
}

// ゲームモード選択画面のイベントリスナー設定
function setupModeScreenListeners() {
    console.log('モード選択画面リスナー設定中...');
    
    // GameModesCoreモジュールがある場合はそちらを使用
    const useCoreModule = typeof GameModesCore !== 'undefined';
    console.log('GameModesCore利用状況:', useCoreModule ? '利用可能' : '利用不可');
    
    // モード選択ボタン (正しいセレクタを使用)
    const modeButtons = document.querySelectorAll('.mode-card');
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            
            // 選択状態の更新
            modeButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            
            // モード選択
            if (useCoreModule) {
                GameModesCore.selectMode(mode);
            } else {
                // 旧モード選択方式
                updateModeDescription(mode);
            }
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    });
    
    // 各モードカード
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.getAttribute('data-mode');
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
            
            // ゲーム開始
            if (useCoreModule) {
                GameModesCore.selectMode(mode);
                GameModesCore.startGame();
            } else if (typeof GameController !== 'undefined') {
                GameController.startGame(mode);
            } else {
                // フォールバック：直接ゲーム開始
                startGame(mode);
            }
        });
    });
    
    // スタートボタン
    const startButton = document.getElementById('start-game-btn');
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (useCoreModule) {
                // 新しいモジュールでゲーム開始
                GameModesCore.startGame();
            } else {
                // 選択されたモードを取得
                const selectedMode = document.querySelector('.mode-btn.selected');
                const mode = selectedMode ? selectedMode.getAttribute('data-mode') : 'classic';
                
                // ゲーム開始
                startGame(mode);
            }
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('start');
            }
        });
    }
    
    // 戻るボタン
    const backBtn = document.getElementById('back-to-menu');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            UI.showScreen('menu');
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
}

// ヘルプ画面のイベントリスナー設定
function setupHelpScreenListeners() {
    // ヘルプカテゴリタブ
    const helpTabs = document.querySelectorAll('.help-tab');
    helpTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            
            // タブの切り替え
            helpTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // コンテンツの切り替え
            const contents = document.querySelectorAll('.help-content');
            contents.forEach(content => content.style.display = 'none');
            document.getElementById(category).style.display = 'block';
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    });
    
    // 戻るボタン
    const backBtn = document.getElementById('help-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            UI.showScreen('menu');
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
}

// ランキング表示（フォールバック）
function showRankings(period, gameMode) {
    const rankingModal = document.getElementById('ranking-modal');
    if (!rankingModal) return;
    
    rankingModal.style.display = 'flex';
    
    // ランキングデータ取得
    if (typeof fetchRankings === 'function') {
        fetchRankings(period, gameMode, (success, data) => {
            if (success) {
                // ランキングリスト生成
                const rankingList = document.getElementById('ranking-list');
                if (!rankingList) return;
                
                rankingList.innerHTML = '';
                
                if (data.rankings.length === 0) {
                    rankingList.innerHTML = '<div class="no-data">ランキングデータがありません</div>';
                    return;
                }
                
                data.rankings.forEach(rank => {
                    const item = document.createElement('div');
                    item.className = 'ranking-item';
                    
                    item.innerHTML = `
                        <div class="rank">${rank.rank}</div>
                        <div class="player-info">
                            <div class="player-name">${rank.username || 'ゲスト'}</div>
                            <div class="player-level">Lv.${rank.level || 1}</div>
                        </div>
                        <div class="score">${rank.score.toLocaleString()}</div>
                    `;
                    
                    rankingList.appendChild(item);
                });
            } else {
                UI.showNotification('ランキングデータの取得に失敗しました');
            }
        });
    }
}

// 初期画面表示（直接メニュー画面に移動）
function showInitialScreen() {
    // 起動時の画面設定
    // ログイン不要ですぐにメニュー画面を表示
    UI.showScreen('menu');
    
    // ゲストユーザー情報を設定
    UI.updateUserInfo('ゲスト', 1, 0, 1000);
    
    // BGM再生
    if (typeof SoundManager !== 'undefined') {
        SoundManager.playBgm('bgm_menu');
    }
    
    // 一定回数プレイ後にユーザー登録を促すプロンプトを表示
    checkRegistrationPrompt();
}

// ユーザー登録促進チェック
function checkRegistrationPrompt() {
    try {
        // プレイ回数を取得（存在しなければ0）
        let playCount = parseInt(localStorage.getItem('tetris_play_count') || '0');
        const promptShown = localStorage.getItem('tetris_registration_prompt_shown') === 'true';
        
        // 5回以上プレイしてまだプロンプトを表示していない場合
        if (playCount >= 5 && !promptShown && typeof UI !== 'undefined') {
            setTimeout(() => {
                UI.showModal({
                    title: 'アカウント登録のご案内',
                    content: `
                        <p>テトリス・アドベンチャーを楽しんでいただいていますか？</p>
                        <p>アカウント登録をすると、以下の特典が得られます：</p>
                        <ul>
                            <li>🏆 ランキングにスコアが記録されます</li>
                            <li>💾 ゲームの進行状況が保存されます</li>
                            <li>🎮 アドベンチャーモードの全ステージにアクセスできます</li>
                            <li>🎨 特別なテーマやカスタマイズオプションが解放されます</li>
                        </ul>
                        <p>登録は簡単で、メールアドレスやSNSアカウントで数秒で完了します！</p>
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
                        if (action === 'register') {
                            UI.showScreen('auth');
                            // 登録タブをアクティブに
                            const registerTab = document.querySelector('.tab-btn[data-tab="register"]');
                            if (registerTab) {
                                registerTab.click();
                            }
                        }
                        
                        // プロンプト表示済みとしてマーク
                        localStorage.setItem('tetris_registration_prompt_shown', 'true');
                    }
                });
            }, 1000);
        }
    } catch (e) {
        console.error('プロンプトチェックエラー:', e);
    }
}

// ゲーム開始（フォールバック）
function startGame(mode) {
    console.log(`startGameが呼ばれました: モード=${mode}`);
    
    // プレイ回数を増加
    try {
        let playCount = parseInt(localStorage.getItem('tetris_play_count') || '0');
        playCount++;
        localStorage.setItem('tetris_play_count', playCount.toString());
    } catch (e) {
        console.error('プレイ回数保存エラー:', e);
    }
    
    // GameModesCoreを優先して使用
    if (typeof GameModesCore !== 'undefined') {
        console.log('GameModesCoreが存在します。登録モード:', Object.keys(GameModesCore.modes));
        
        // モードが存在するか確認
        if (GameModesCore.modes && GameModesCore.modes[mode]) {
            GameModesCore.selectMode(mode);
            GameModesCore.startGame();
            return;
        } else {
            console.error(`モード '${mode}' がGameModesCoreに見つかりませんでした`);
        }
    } else {
        console.log('GameModesCoreが存在しません、従来のメソッドを使用します。');
    }
    
    // 旧バージョン互換 - GameControllerが存在しない場合の最小限の実装
    // ゲーム画面に遷移
    UI.showScreen('game');
    
    // 選択されたゲームモードで初期化
    const modeConfig = GameModes[mode];
    if (!modeConfig) {
        console.error(`ゲームモード '${mode}' が見つかりません`);
        return;
    }
    
    // 既存のテトリスインスタンスがあれば破棄
    const tetris = getTetris();
    if (tetris) {
        // ゲームループが実行中の場合は停止
        if (tetris.frameId) {
            cancelAnimationFrame(tetris.frameId);
            tetris.frameId = null;
        }
    }
    
    // 新しいテトリスインスタンスを作成
    const config = modeConfig.init();
    const newTetris = initTetris(config);
    
    // コントローラー初期化
    if (typeof KeyboardController !== 'undefined') {
        KeyboardController.init(newTetris);
        KeyboardController.activate();
    }
    
    // タッチコントローラー初期化
    if (typeof TouchController !== 'undefined') {
        TouchController.init(newTetris);
        TouchController.activate();
    }
    
    // ゲーム開始
    newTetris.start();
    
    // 通知表示
    UI.showNotification(`${modeConfig.name}モードを開始しました！`);
}
