/**
 * rankings.js - ランキング機能管理
 * テトリス・アドベンチャー v1.0.1
 */

// ランキング管理オブジェクト
const RankingManager = {
    // 現在表示中のランキング
    currentPeriod: 'all',
    currentGameMode: 'classic',
    
    // ランキングデータのキャッシュ
    cachedRankings: {},
    
    // 初期化
    init: function() {
        this.setupEventListeners();
    },
    
    // イベントリスナー設定
    setupEventListeners: function() {
        // ランキングモーダルの閉じるボタン
        const closeBtn = document.getElementById('ranking-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideRankingModal();
            });
        }
        
        // 期間切り替えタブ
        const periodTabs = document.querySelectorAll('.ranking-period-tab');
        periodTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const period = tab.getAttribute('data-period');
                
                // タブの切り替え
                periodTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // ランキング更新
                this.updateRankings(period, this.currentGameMode);
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('click');
                }
            });
        });
        
        // モード切り替えタブ
        const modeTabs = document.querySelectorAll('.ranking-mode-tab');
        modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.getAttribute('data-mode');
                
                // タブの切り替え
                modeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // ランキング更新
                this.updateRankings(this.currentPeriod, mode);
                
                // サウンド再生
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.playSfx('click');
                }
            });
        });
    },
    
    // ランキングモーダルを表示
    showRankingModal: function(period = 'all', gameMode = 'classic') {
        const modal = document.getElementById('ranking-modal');
        if (!modal) return;
        
        // モーダルを表示
        modal.style.display = 'flex';
        
        // 対応するタブをアクティブ化
        this.activateTab('period', period);
        this.activateTab('mode', gameMode);
        
        // ランキングデータを取得・表示
        this.updateRankings(period, gameMode);
    },
    
    // ランキングモーダルを非表示
    hideRankingModal: function() {
        const modal = document.getElementById('ranking-modal');
        if (!modal) return;
        
        modal.style.display = 'none';
    },
    
    // タブをアクティブ化
    activateTab: function(type, value) {
        const selector = `.ranking-${type}-tab[data-${type}="${value}"]`;
        const tab = document.querySelector(selector);
        
        if (tab) {
            // 同じ種類のタブを全て非アクティブ化
            const tabs = document.querySelectorAll(`.ranking-${type}-tab`);
            tabs.forEach(t => t.classList.remove('active'));
            
            // 指定されたタブをアクティブ化
            tab.classList.add('active');
        }
    },
    
    // ランキングデータの更新と表示
    updateRankings: function(period, gameMode) {
        // 現在の選択を保存
        this.currentPeriod = period;
        this.currentGameMode = gameMode;
        
        // ランキングタイトル更新
        this.updateRankingTitle(period, gameMode);
        
        // ローディング表示
        this.showRankingLoading();
        
        // ランキングデータを取得
        this.fetchRankings(period, gameMode);
    },
    
    // ランキングタイトル更新
    updateRankingTitle: function(period, gameMode) {
        const titleElement = document.getElementById('ranking-title');
        if (!titleElement) return;
        
        // 期間とモードの名前を取得
        const periodName = this.getPeriodName(period);
        const modeName = this.getModeName(gameMode);
        
        // タイトルを設定
        titleElement.textContent = `${periodName}・${modeName}モード ランキング`;
    },
    
    // 期間名を取得
    getPeriodName: function(period) {
        const periods = {
            'daily': '日間',
            'weekly': '週間',
            'monthly': '月間',
            'yearly': '年間',
            'all': '全期間',
            'special': '特別イベント'
        };
        
        return periods[period] || '全期間';
    },
    
    // モード名を取得
    getModeName: function(gameMode) {
        // GameModesから取得（存在する場合）
        if (typeof GameModes !== 'undefined' && GameModes[gameMode] && GameModes[gameMode].name) {
            return GameModes[gameMode].name;
        }
        
        // 存在しない場合はデフォルト名
        const modes = {
            'classic': 'クラシック',
            'adventure': 'アドベンチャー',
            'battle': 'バトル',
            'puzzle': 'パズル',
            'speed': 'スピード',
            'zen': '禅'
        };
        
        return modes[gameMode] || 'クラシック';
    },
    
    // ロード中表示
    showRankingLoading: function() {
        const rankingList = document.getElementById('ranking-list');
        if (!rankingList) return;
        
        rankingList.innerHTML = '<div class="loading">ランキングデータを取得中...</div>';
    },
    
    // ランキングデータ取得
    fetchRankings: function(period, gameMode) {
        // キャッシュキー
        const cacheKey = `${period}_${gameMode}`;
        
        // キャッシュがある場合はそれを使用
        if (this.cachedRankings[cacheKey]) {
            this.displayRankings(this.cachedRankings[cacheKey]);
            return;
        }
        
        // auth.jsで定義されたランキング取得関数を呼び出し
        if (typeof fetchRankings === 'function') {
            fetchRankings(period, gameMode, (success, data) => {
                if (success) {
                    // キャッシュに保存
                    this.cachedRankings[cacheKey] = data;
                    
                    // ランキング表示
                    this.displayRankings(data);
                } else {
                    // エラー表示
                    this.showRankingError();
                }
            });
        } else {
            // ランキング機能が利用できない場合はダミーデータを表示
            this.displayDummyRankings();
        }
    },
    
    // ランキングデータ表示
    displayRankings: function(data) {
        const rankingList = document.getElementById('ranking-list');
        if (!rankingList) return;
        
        // リストをクリア
        rankingList.innerHTML = '';
        
        if (!data || !data.rankings || data.rankings.length === 0) {
            rankingList.innerHTML = '<div class="no-data">ランキングデータがありません</div>';
            return;
        }
        
        // ランキングリスト生成
        data.rankings.forEach(rank => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            
            // 上位3位はクラスを追加
            if (rank.rank <= 3) {
                item.classList.add(`rank-${rank.rank}`);
            }
            
            // 項目の内容を設定
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
        
        // 統計情報の表示
        this.updateRankingStats(data);
    },
    
    // ダミーランキングデータ表示（オフライン用）
    displayDummyRankings: function() {
        const dummyData = {
            success: true,
            rankings: [
                { rank: 1, username: 'テトリスマスター', level: 10, score: 25000 },
                { rank: 2, username: 'ブロックウィザード', level: 8, score: 18500 },
                { rank: 3, username: 'パズルキング', level: 7, score: 15300 },
                { rank: 4, username: 'テトリスファン', level: 6, score: 12800 },
                { rank: 5, username: 'ゲーマー1234', level: 5, score: 10200 },
                { rank: 6, username: 'ビギナー', level: 3, score: 5600 },
                { rank: 7, username: 'プレイヤー7', level: 2, score: 3200 },
                { rank: 8, username: 'ゲスト', level: 1, score: 1500 },
                { rank: 9, username: 'テスト', level: 1, score: 800 },
                { rank: 10, username: 'ビジター', level: 1, score: 500 }
            ],
            period: this.currentPeriod,
            gameMode: this.currentGameMode,
            total: 10
        };
        
        this.displayRankings(dummyData);
    },
    
    // ランキング統計情報の更新
    updateRankingStats: function(data) {
        const statsElement = document.getElementById('ranking-stats');
        if (!statsElement) return;
        
        // 統計情報を表示
        statsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">総プレイヤー数:</span>
                <span class="stat-value">${data.total || 0}人</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">平均スコア:</span>
                <span class="stat-value">${this.calculateAverageScore(data.rankings).toLocaleString()}</span>
            </div>
        `;
    },
    
    // 平均スコア計算
    calculateAverageScore: function(rankings) {
        if (!rankings || rankings.length === 0) return 0;
        
        const totalScore = rankings.reduce((sum, rank) => sum + rank.score, 0);
        return Math.floor(totalScore / rankings.length);
    },
    
    // エラー表示
    showRankingError: function() {
        const rankingList = document.getElementById('ranking-list');
        if (!rankingList) return;
        
        rankingList.innerHTML = '<div class="error">ランキングデータの取得に失敗しました</div>';
    }
};

// ランキング表示関数（外部から呼び出し用）
function showRankings(period = 'all', gameMode = 'classic') {
    RankingManager.showRankingModal(period, gameMode);
}
