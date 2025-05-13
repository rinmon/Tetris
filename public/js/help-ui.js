/**
 * help-ui.js - ヘルプ画面UI管理
 * テトリス・アドベンチャー v1.0.1
 */

// ヘルプ画面管理オブジェクト
const HelpUI = {
    // 初期化
    init: function() {
        this.setupEventListeners();
    },
    
    // イベントリスナー設定
    setupEventListeners: function() {
        // ヘルプカテゴリタブ
        const tabs = document.querySelectorAll('.help-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.getAttribute('data-category');
                this.showHelpCategory(category);
                
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
                this.goBackToMenu();
            });
        }
        
        // ヘルプコンテンツ内のリンク
        const helpLinks = document.querySelectorAll('.help-link');
        helpLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.getAttribute('data-category');
                if (category) {
                    this.showHelpCategory(category);
                    
                    // サウンド再生
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playSfx('click');
                    }
                }
            });
        });
    },
    
    // ヘルプカテゴリの表示
    showHelpCategory: function(category) {
        // 該当するカテゴリIDが存在するか確認
        const categoryContent = document.getElementById(category);
        if (!categoryContent) return;
        
        // タブの選択状態更新
        const tabs = document.querySelectorAll('.help-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            
            if (tab.getAttribute('data-category') === category) {
                tab.classList.add('active');
            }
        });
        
        // コンテンツの切り替え
        const contents = document.querySelectorAll('.help-content');
        contents.forEach(content => content.style.display = 'none');
        categoryContent.style.display = 'block';
    },
    
    // メニュー画面に戻る
    goBackToMenu: function() {
        if (typeof UI !== 'undefined') {
            UI.showScreen('menu');
        }
        
        // サウンド再生
        if (typeof SoundManager !== 'undefined') {
            SoundManager.playSfx('back');
        }
    },
    
    // 特定の動画ヘルプを再生
    playHelpVideo: function(videoId) {
        const videoPlayer = document.getElementById('help-video-player');
        if (!videoPlayer) return;
        
        // 動画ソースの設定
        videoPlayer.src = `videos/help/${videoId}.mp4`;
        
        // 動画プレーヤーの表示
        const videoModal = document.getElementById('video-modal');
        if (videoModal) {
            videoModal.style.display = 'flex';
        }
        
        // 再生開始
        videoPlayer.play();
    },
    
    // 動画モーダルを閉じる
    closeVideoModal: function() {
        const videoModal = document.getElementById('video-modal');
        const videoPlayer = document.getElementById('help-video-player');
        
        if (videoModal) {
            videoModal.style.display = 'none';
        }
        
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
        }
    },
    
    // オンラインヘルプを開く
    openOnlineHelp: function() {
        window.open('https://tetris-adventure.example.com/help', '_blank');
    }
};

// 動画プレーヤーの共通設定
document.addEventListener('DOMContentLoaded', () => {
    // 動画モーダルの閉じるボタン
    const closeBtn = document.getElementById('video-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            HelpUI.closeVideoModal();
            
            // サウンド再生
            if (typeof SoundManager !== 'undefined') {
                SoundManager.playSfx('click');
            }
        });
    }
    
    // 動画終了時に自動で閉じる
    const videoPlayer = document.getElementById('help-video-player');
    if (videoPlayer) {
        videoPlayer.addEventListener('ended', () => {
            HelpUI.closeVideoModal();
        });
    }
});

// 外部からのアクセス用
window.HelpUI = HelpUI;
