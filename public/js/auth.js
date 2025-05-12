/**
 * 認証関連の機能を管理するモジュール
 */
const Auth = (function() {
    // プライベート変数
    let currentUser = null;
    let token = null;
    
    // LocalStorageのキー
    const TOKEN_KEY = 'tetris_auth_token';
    const USER_KEY = 'tetris_user';
    
    /**
     * ローカルストレージからユーザー情報を読み込む
     */
    const loadFromStorage = function() {
        try {
            token = localStorage.getItem(TOKEN_KEY);
            const userString = localStorage.getItem(USER_KEY);
            
            if (token && userString) {
                currentUser = JSON.parse(userString);
                return true;
            }
        } catch (error) {
            console.error('ローカルストレージからの読み込みエラー:', error);
        }
        
        return false;
    };
    
    /**
     * ユーザー情報とトークンをローカルストレージに保存
     */
    const saveToStorage = function() {
        try {
            if (token && currentUser) {
                localStorage.setItem(TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
            }
        } catch (error) {
            console.error('ローカルストレージへの保存エラー:', error);
        }
    };
    
    /**
     * ローカルストレージからユーザー情報を削除
     */
    const clearStorage = function() {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } catch (error) {
            console.error('ローカルストレージからの削除エラー:', error);
        }
    };
    
    /**
     * APIリクエストのヘッダーを取得
     */
    const getAuthHeaders = function() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    };
    
    /**
     * ユーザー登録
     * @param {string} username - ユーザー名
     * @param {string} password - パスワード
     * @returns {Promise} - 登録結果のPromise
     */
    const register = async function(username, password) {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || '登録に失敗しました');
            }
            
            currentUser = data.user;
            token = data.token;
            
            saveToStorage();
            
            return {
                success: true,
                user: currentUser
            };
        } catch (error) {
            console.error('登録エラー:', error);
            return {
                success: false,
                message: error.message
            };
        }
    };
    
    /**
     * ログイン
     * @param {string} username - ユーザー名
     * @param {string} password - パスワード
     * @returns {Promise} - ログイン結果のPromise
     */
    const login = async function(username, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'ログインに失敗しました');
            }
            
            currentUser = data.user;
            token = data.token;
            
            saveToStorage();
            
            return {
                success: true,
                user: currentUser
            };
        } catch (error) {
            console.error('ログインエラー:', error);
            return {
                success: false,
                message: error.message
            };
        }
    };
    
    /**
     * ゲストログイン
     * @returns {Object} - ゲストユーザー情報
     */
    const loginAsGuest = function() {
        currentUser = {
            id: 'guest',
            username: 'ゲスト',
            level: 1,
            exp: 0,
            role: 'guest',
            achievements: []
        };
        
        token = null;
        clearStorage();
        
        return {
            success: true,
            user: currentUser
        };
    };
    
    /**
     * ログアウト
     */
    const logout = function() {
        currentUser = null;
        token = null;
        clearStorage();
    };
    
    /**
     * ユーザープロファイルの取得
     * @returns {Promise} - プロファイル取得結果のPromise
     */
    const getProfile = async function() {
        if (!token) {
            return {
                success: false,
                message: '認証が必要です'
            };
        }
        
        try {
            const response = await fetch('/api/users/profile', {
                method: 'GET',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'プロファイル取得に失敗しました');
            }
            
            // 最新のユーザー情報に更新
            currentUser = data.user;
            saveToStorage();
            
            return {
                success: true,
                user: currentUser
            };
        } catch (error) {
            console.error('プロファイル取得エラー:', error);
            return {
                success: false,
                message: error.message
            };
        }
    };
    
    /**
     * スコアを送信
     * @param {Object} scoreData - スコアデータ
     * @returns {Promise} - スコア送信結果のPromise
     */
    const submitScore = async function(scoreData) {
        if (!token && currentUser.id !== 'guest') {
            return {
                success: false,
                message: '認証が必要です'
            };
        }
        
        // ゲストの場合はローカルでスコアを記録するだけ
        if (currentUser.id === 'guest') {
            const guestResult = {
                success: true,
                message: 'ゲストスコアを記録しました',
                score: {
                    ...scoreData,
                    username: 'ゲスト',
                    date: new Date().toISOString()
                },
                expGained: Math.floor(scoreData.score / 100),
                levelUp: false
            };
            
            // ゲストユーザーの経験値を更新（ストレージには保存しない）
            currentUser.exp += guestResult.expGained;
            
            // レベルアップの処理
            const expNeeded = currentUser.level * 1000;
            if (currentUser.exp >= expNeeded) {
                currentUser.level += 1;
                currentUser.exp -= expNeeded;
                guestResult.levelUp = true;
            }
            
            guestResult.newLevel = currentUser.level;
            guestResult.newExp = currentUser.exp;
            
            return guestResult;
        }
        
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(scoreData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'スコア送信に失敗しました');
            }
            
            // ユーザーの経験値とレベルを更新
            if (data.levelUp) {
                currentUser.level = data.newLevel;
                currentUser.exp = data.newExp;
                saveToStorage();
            }
            
            return data;
        } catch (error) {
            console.error('スコア送信エラー:', error);
            return {
                success: false,
                message: error.message
            };
        }
    };
    
    /**
     * ランキングを取得
     * @param {string} period - 期間 ('daily', 'weekly', 'monthly', 'yearly', 'all', 'special')
     * @param {string} gameMode - ゲームモード (optional)
     * @returns {Promise} - ランキング取得結果のPromise
     */
    const getRankings = async function(period = 'all', gameMode = 'all') {
        try {
            let url = `/api/rankings/${period}`;
            
            if (gameMode !== 'all') {
                url += `?gameMode=${gameMode}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'ランキング取得に失敗しました');
            }
            
            return data;
        } catch (error) {
            console.error('ランキング取得エラー:', error);
            return {
                success: false,
                message: error.message,
                rankings: []
            };
        }
    };
    
    // 初期化時にローカルストレージからユーザー情報を読み込む
    loadFromStorage();
    
    // パブリックAPI
    return {
        register,
        login,
        loginAsGuest,
        logout,
        getProfile,
        submitScore,
        getRankings,
        getCurrentUser: function() {
            return currentUser;
        },
        isLoggedIn: function() {
            return !!currentUser;
        },
        isGuest: function() {
            return currentUser && currentUser.id === 'guest';
        }
    };
})();

// イベントハンドラの設定（DOMの読み込み完了後）
document.addEventListener('DOMContentLoaded', function() {
    // ログインフォーム
    const loginForm = document.getElementById('login-form');
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const guestBtn = document.getElementById('guest-btn');
    
    // 登録フォーム
    const registerForm = document.getElementById('register-form');
    const registerUsername = document.getElementById('register-username');
    const registerPassword = document.getElementById('register-password');
    const registerConfirm = document.getElementById('register-confirm');
    const registerBtn = document.getElementById('register-btn');
    
    // タブ切り替え
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // タブ切り替えの処理
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // タブボタンのアクティブ状態を切り替え
            tabBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // フォームの表示/非表示を切り替え
            document.querySelectorAll('.form-container').forEach(form => {
                form.classList.remove('active');
            });
            
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });
    
    // ログインボタンの処理
    loginBtn.addEventListener('click', async function() {
        if (!loginUsername.value || !loginPassword.value) {
            UI.showNotification('ユーザー名とパスワードを入力してください');
            return;
        }
        
        UI.showLoading();
        
        const result = await Auth.login(loginUsername.value, loginPassword.value);
        
        UI.hideLoading();
        
        if (result.success) {
            UI.showNotification('ログインに成功しました');
            UI.showScreen('menu-screen');
            UI.updateUserInfo();
        } else {
            UI.showNotification(result.message || 'ログインに失敗しました');
        }
    });
    
    // ゲストログインボタンの処理
    guestBtn.addEventListener('click', function() {
        const result = Auth.loginAsGuest();
        
        if (result.success) {
            UI.showNotification('ゲストとしてログインしました');
            UI.showScreen('menu-screen');
            UI.updateUserInfo();
        }
    });
    
    // 登録ボタンの処理
    registerBtn.addEventListener('click', async function() {
        if (!registerUsername.value || !registerPassword.value || !registerConfirm.value) {
            UI.showNotification('すべてのフィールドを入力してください');
            return;
        }
        
        if (registerPassword.value !== registerConfirm.value) {
            UI.showNotification('パスワードが一致しません');
            return;
        }
        
        UI.showLoading();
        
        const result = await Auth.register(registerUsername.value, registerPassword.value);
        
        UI.hideLoading();
        
        if (result.success) {
            UI.showNotification('登録に成功しました');
            UI.showScreen('menu-screen');
            UI.updateUserInfo();
        } else {
            UI.showNotification(result.message || '登録に失敗しました');
        }
    });
    
    // ログアウトボタンの処理
    document.getElementById('logout-btn').addEventListener('click', function() {
        Auth.logout();
        UI.showNotification('ログアウトしました');
        UI.showScreen('auth-screen');
    });
});
