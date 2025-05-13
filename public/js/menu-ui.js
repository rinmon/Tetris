/**
 * menu-ui.js - メニュー画面UI管理
 * テトリス・アドベンチャー v1.0.1
 */

// メニュー画面管理オブジェクト
const MenuUI = {
    // 初期化
    init: function() {
        this.setupEventListeners();
    },
    
    // イベントリスナー設定
    setupEventListeners: function() {
        // メニュー項目のクリックイベント
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                this.handleMenuAction(action);
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('click');
                }
            });
        });
        
        // クイックプレイボタン
        const quickPlayBtn = document.getElementById('quick-play-btn');
        if (quickPlayBtn) {
            quickPlayBtn.addEventListener('click', () => {
                // クイックプレイはクラシックモードを直接開始
                this.startQuickPlay();
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('start');
                }
            });
        }
        
        // ログインプロモーションを閉じるボタン
        const closePromptBtn = document.getElementById('close-login-prompt');
        if (closePromptBtn) {
            closePromptBtn.addEventListener('click', () => {
                this.hideLoginPrompt();
            });
        }
        
        // ログインプロモーションのログインボタン
        const promptLoginBtn = document.getElementById('prompt-login-btn');
        if (promptLoginBtn) {
            promptLoginBtn.addEventListener('click', () => {
                this.hideLoginPrompt();
                
                // 認証画面に遷移
                if (typeof UI !== 'undefined') {
                    UI.showScreen('auth');
                }
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('click');
                }
            });
        }
        
        // ユーザーボタン（プロフィール表示）
        const userInfoBtn = document.getElementById('user-info-btn');
        if (userInfoBtn) {
            userInfoBtn.addEventListener('click', () => {
                this.toggleUserMenu();
                
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
                this.handleLogout();
            });
        }
    },
    
    // メニューアクション処理
    handleMenuAction: function(action) {
        switch (action) {
            case 'play':
                // プレイ画面に遷移（モード選択）
                if (typeof UI !== 'undefined') {
                    UI.showScreen('mode-select');
                }
                break;
                
            case 'settings':
                // 設定画面を表示
                if (typeof SettingsManager !== 'undefined') {
                    SettingsManager.openSettingsModal();
                }
                break;
                
            case 'rankings':
                // ランキング表示
                if (typeof RankingManager !== 'undefined') {
                    RankingManager.showRankingModal();
                } else if (typeof showRankings === 'function') {
                    showRankings();
                }
                break;
                
            case 'help':
                // ヘルプ画面に遷移
                if (typeof UI !== 'undefined') {
                    UI.showScreen('help');
                }
                break;
                
            case 'login':
                // 認証画面に遷移
                if (typeof UI !== 'undefined') {
                    UI.showScreen('auth');
                }
                break;
        }
    },
    
    // クイックプレイ開始
    startQuickPlay: function() {
        // クラシックモードでゲーム開始
        if (typeof GameModesCore !== 'undefined') {
            GameModesCore.selectMode('classic');
            GameModesCore.startGame();
        } else if (typeof startGame === 'function') {
            startGame('classic');
        }
    },
    
    // ログインプロンプト表示
    showLoginPrompt: function() {
        const loginPrompt = document.getElementById('login-prompt');
        if (loginPrompt) {
            loginPrompt.style.display = 'block';
            
            // 一定時間後に自動的に閉じる
            setTimeout(() => {
                this.hideLoginPrompt();
            }, 15000);
        }
    },
    
    // ログインプロンプト非表示
    hideLoginPrompt: function() {
        const loginPrompt = document.getElementById('login-prompt');
        if (loginPrompt) {
            loginPrompt.style.display = 'none';
            
            // 表示済みフラグを保存
            try {
                localStorage.setItem('tetris_login_prompt_shown', 'true');
            } catch (e) {
                console.error('ローカルストレージへの保存に失敗しました:', e);
            }
        }
    },
    
    // ユーザーメニュー切り替え
    toggleUserMenu: function() {
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.classList.toggle('visible');
        }
    },
    
    // ログアウト処理
    handleLogout: function() {
        // ユーザーメニューを隠す
        this.toggleUserMenu();
        
        // auth.jsで定義されたログアウト関数を呼び出し
        if (typeof logoutUser === 'function') {
            logoutUser((success) => {
                if (success) {
                    // ユーザー情報をクリア
                    if (typeof UI !== 'undefined') {
                        UI.updateUserInfo('ゲスト', 1, 0, 1000);
                    }
                    
                    // 通知表示
                    if (typeof UI !== 'undefined') {
                        UI.showNotification('ログアウトしました');
                    }
                    
                    // サウンド再生
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playSfx('back');
                    }
                }
            });
        } else {
            // 認証機能がない場合
            // ユーザー情報をクリア
            if (typeof UI !== 'undefined') {
                UI.updateUserInfo('ゲスト', 1, 0, 1000);
            }
            
            // 通知表示
            if (typeof UI !== 'undefined') {
                UI.showNotification('ログアウトしました');
            }
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('back');
            }
        }
    },
    
    // ゲームモード選択画面のイベントリスナー設定
    setupModeScreenListeners: function() {
        // モード選択ボタン
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.getAttribute('data-mode');
                
                // モード選択
                if (typeof GameModesCore !== 'undefined') {
                    GameModesCore.selectMode(mode);
                }
                
                // 選択状態の更新
                modeButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('click');
                }
            });
        });
        
        // スタートボタン
        const startButton = document.getElementById('start-game-btn');
        if (startButton) {
            startButton.addEventListener('click', () => {
                // 選択されたモードでゲーム開始
                if (typeof GameModesCore !== 'undefined') {
                    GameModesCore.startGame();
                } else {
                    // 選択されたモードを取得
                    const selectedMode = document.querySelector('.mode-btn.selected');
                    const mode = selectedMode ? selectedMode.getAttribute('data-mode') : 'classic';
                    
                    // フォールバック関数でゲーム開始
                    if (typeof startGame === 'function') {
                        startGame(mode);
                    }
                }
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('start');
                }
            });
        }
        
        // 戻るボタン
        const backButton = document.getElementById('mode-back-btn');
        if (backButton) {
            backButton.addEventListener('click', () => {
                // メニュー画面に戻る
                if (typeof UI !== 'undefined') {
                    UI.showScreen('menu');
                }
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('back');
                }
            });
        }
    }
};

// 外部からのアクセス用
window.MenuUI = MenuUI;
