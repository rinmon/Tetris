/**
 * sounds.js - ゲームサウンド管理
 * テトリス・アドベンチャー v1.0.1
 */

// ゲームサウンドを管理するオブジェクト
const SoundManager = {
    // オーディオコンテキスト
    context: null,
    
    // サウンドバッファの保存場所
    buffers: {},
    
    // サウンド設定
    settings: {
        enabled: true,      // サウンド有効/無効
        volume: 0.7,        // 主音量（0.0 - 1.0）
        musicVolume: 0.5,   // 音楽音量
        sfxVolume: 0.8      // 効果音音量
    },
    
    // BGM用オーディオノード
    bgmNode: null,
    bgmGainNode: null,
    currentBgm: null,
    
    // 初期化
    init: function() {
        // Web Audio API対応確認
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // 音量調整用のマスターゲインノード
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.settings.volume;
            this.masterGain.connect(this.context.destination);
            
            // BGM用のゲインノード
            this.bgmGainNode = this.context.createGain();
            this.bgmGainNode.gain.value = this.settings.musicVolume;
            this.bgmGainNode.connect(this.masterGain);
            
            // 効果音用のゲインノード
            this.sfxGainNode = this.context.createGain();
            this.sfxGainNode.gain.value = this.settings.sfxVolume;
            this.sfxGainNode.connect(this.masterGain);
            
            // ローカルストレージから設定を読み込み
            this.loadSettings();
            
            // 初期サウンド読み込み
            this.loadSounds();
            
            console.log('SoundManager initialized');
            return true;
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            return false;
        }
    },
    
    // 設定の読み込み
    loadSettings: function() {
        const savedSettings = localStorage.getItem('tetris_sound_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
                
                // 読み込んだ設定を適用
                if (this.masterGain) this.masterGain.gain.value = this.settings.volume;
                if (this.bgmGainNode) this.bgmGainNode.gain.value = this.settings.musicVolume;
                if (this.sfxGainNode) this.sfxGainNode.gain.value = this.settings.sfxVolume;
            } catch (e) {
                console.error('Failed to parse sound settings', e);
            }
        }
    },
    
    // 設定の保存
    saveSettings: function() {
        localStorage.setItem('tetris_sound_settings', JSON.stringify(this.settings));
    },
    
    // 音量の設定
    setVolume: function(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.settings.volume;
        }
        this.saveSettings();
    },
    
    // 音楽音量の設定
    setMusicVolume: function(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmGainNode) {
            this.bgmGainNode.gain.value = this.settings.musicVolume;
        }
        this.saveSettings();
    },
    
    // 効果音音量の設定
    setSfxVolume: function(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGainNode) {
            this.sfxGainNode.gain.value = this.settings.sfxVolume;
        }
        this.saveSettings();
    },
    
    // サウンド有効/無効の切り替え
    toggleSound: function(enabled) {
        if (enabled !== undefined) {
            this.settings.enabled = enabled;
        } else {
            this.settings.enabled = !this.settings.enabled;
        }
        
        if (!this.settings.enabled) {
            // サウンドを無効化
            if (this.masterGain) {
                this.masterGain.gain.value = 0;
            }
        } else {
            // サウンドを有効化
            if (this.masterGain) {
                this.masterGain.gain.value = this.settings.volume;
            }
        }
        
        this.saveSettings();
        return this.settings.enabled;
    },
    
    // サウンドデータの読み込み
    loadSounds: function() {
        // 基本効果音
        this.loadSound('move', 'sounds/move.mp3');
        this.loadSound('rotate', 'sounds/rotate.mp3');
        this.loadSound('drop', 'sounds/drop.mp3');
        this.loadSound('clear', 'sounds/clear.mp3');
        this.loadSound('tetris', 'sounds/tetris.mp3');
        this.loadSound('levelup', 'sounds/levelup.mp3');
        this.loadSound('gameover', 'sounds/gameover.mp3');
        
        // BGM
        this.loadSound('bgm_menu', 'sounds/bgm_menu.mp3');
        this.loadSound('bgm_game', 'sounds/bgm_game.mp3');
        this.loadSound('bgm_adventure', 'sounds/bgm_adventure.mp3');
        
        // UIサウンド
        this.loadSound('click', 'sounds/click.mp3');
        this.loadSound('success', 'sounds/success.mp3');
        this.loadSound('error', 'sounds/error.mp3');
    },
    
    // 個別サウンドの読み込み
    loadSound: function(name, url) {
        if (!this.context) return;
        
        fetch(url)
            .then(response => {
                // ファイルが存在しない場合はダミーサウンドを生成
                if (!response.ok) {
                    console.warn(`Sound file not found: ${url}, using dummy sound`);
                    this.createDummySound(name);
                    return null;
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => {
                if (arrayBuffer) {
                    return this.context.decodeAudioData(arrayBuffer);
                }
                return null;
            })
            .then(audioBuffer => {
                if (audioBuffer) {
                    this.buffers[name] = audioBuffer;
                    console.log(`Sound loaded: ${name}`);
                }
            })
            .catch(error => {
                console.error(`Error loading sound ${name}:`, error);
                this.createDummySound(name);
            });
    },
    
    // ダミーサウンドの作成（ファイルが見つからない場合の代替）
    createDummySound: function(name) {
        if (!this.context) return;
        
        // 短い無音に近いバッファを作成
        const sampleRate = this.context.sampleRate;
        const buffer = this.context.createBuffer(2, sampleRate * 0.1, sampleRate);
        
        // 小さなノイズを追加
        if (name.startsWith('bgm_')) {
            // BGMの場合は長めのバッファ
            const longerBuffer = this.context.createBuffer(2, sampleRate * 3, sampleRate);
            this.buffers[name] = longerBuffer;
        } else {
            // 効果音はわずかなノイズ（ほぼ無音）
            this.buffers[name] = buffer;
        }
    },
    
    // 効果音の再生
    playSfx: function(name) {
        if (!this.context || !this.settings.enabled || !this.buffers[name]) return;
        
        try {
            // 新しいオーディオソースを作成
            const source = this.context.createBufferSource();
            source.buffer = this.buffers[name];
            
            // 効果音ゲインノードに接続
            source.connect(this.sfxGainNode);
            
            // 再生開始
            source.start();
        } catch (e) {
            console.error(`Error playing sound ${name}:`, e);
        }
    },
    
    // BGMの再生
    playBgm: function(name, loop = true) {
        if (!this.context || !this.settings.enabled || !this.buffers[name]) return;
        
        // 現在のBGMを停止
        this.stopBgm();
        
        try {
            // 新しいオーディオソースを作成
            const source = this.context.createBufferSource();
            source.buffer = this.buffers[name];
            source.loop = loop;
            
            // BGMゲインノードに接続
            source.connect(this.bgmGainNode);
            
            // 再生開始
            source.start();
            
            // 参照を保存
            this.bgmNode = source;
            this.currentBgm = name;
        } catch (e) {
            console.error(`Error playing BGM ${name}:`, e);
        }
    },
    
    // BGMの停止
    stopBgm: function() {
        if (this.bgmNode) {
            try {
                this.bgmNode.stop();
            } catch (e) {
                console.error('Error stopping BGM:', e);
            }
            this.bgmNode = null;
            this.currentBgm = null;
        }
    },
    
    // BGMの一時停止/再開
    pauseBgm: function(pause) {
        if (!this.context) return;
        
        if (pause) {
            if (this.context.state === 'running') {
                this.context.suspend();
            }
        } else {
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
        }
    }
};

// ゲーム内のサウンドイベントを管理するオブジェクト
const SoundEvents = {
    // 初期化
    init: function() {
        if (!SoundManager.init()) {
            console.warn('Sound system disabled');
            return false;
        }
        
        // イベントリスナーを設定
        this.setupUIListeners();
        
        return true;
    },
    
    // UI要素へのサウンドイベント設定
    setupUIListeners: function() {
        // ボタンクリック音
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                SoundManager.playSfx('click');
            });
        });
        
        // ゲーム画面表示時にBGM開始
        document.addEventListener('screenChange', (e) => {
            const screen = e.detail.screen;
            if (screen === 'menu') {
                SoundManager.playBgm('bgm_menu');
            } else if (screen === 'game') {
                // ゲームモードに応じてBGMを変更
                const mode = e.detail.mode || 'classic';
                if (mode === 'adventure') {
                    SoundManager.playBgm('bgm_adventure');
                } else {
                    SoundManager.playBgm('bgm_game');
                }
            }
        });
    },
    
    // テトリスゲームイベントへのサウンド設定
    setupGameListeners: function(tetris) {
        if (!tetris) return;
        
        // 移動音
        tetris.onPieceMove = function(dx, dy) {
            if (dx !== 0) {
                SoundManager.playSfx('move');
            }
        };
        
        // 回転音
        tetris.onPieceRotate = function() {
            SoundManager.playSfx('rotate');
        };
        
        // ホールド音
        tetris.onHold = function() {
            SoundManager.playSfx('rotate');
        };
        
        // ラインクリア音
        tetris.onLinesCleared = function(linesCleared) {
            if (linesCleared === 4) {
                SoundManager.playSfx('tetris');
            } else if (linesCleared > 0) {
                SoundManager.playSfx('clear');
            }
        };
        
        // レベルアップ音
        const originalCheckLines = tetris.checkLines;
        tetris.checkLines = function() {
            const oldLevel = this.level;
            originalCheckLines.call(this);
            
            if (this.level > oldLevel) {
                SoundManager.playSfx('levelup');
            }
        };
        
        // ゲームオーバー音
        const originalGameOver = tetris.onGameOver;
        tetris.onGameOver = function(score, lines, level) {
            SoundManager.playSfx('gameover');
            if (originalGameOver) {
                originalGameOver.call(this, score, lines, level);
            }
        };
    }
};
