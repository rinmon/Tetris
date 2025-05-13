const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'tetris-adventure-secret-key';
const BASE_PATH = '/games/tetris'; // 新しいベースパス

// ミドルウェア
app.use(cors({
  origin: '*', // 本番環境では適切なオリジンに制限することを推奨
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// ベースパスのリダイレクト
app.get('/', (req, res) => {
  res.redirect(BASE_PATH);
});

// テトリスのベースパスへのアクセスを/publicにリダイレクト
app.get(BASE_PATH, (req, res) => {
  res.redirect(BASE_PATH + '/public/');
});

// データディレクトリの確認と作成
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const scoresFile = path.join(dataDir, 'scores.json');

// データディレクトリとファイルの初期化
const initDataFiles = async () => {
  try {
    await fs.ensureDir(dataDir);
    
    if (!await fs.pathExists(usersFile)) {
      await fs.writeJson(usersFile, { users: [] });
    }
    
    if (!await fs.pathExists(scoresFile)) {
      await fs.writeJson(scoresFile, { scores: [] });
    }
    
    console.log('データファイルの初期化が完了しました');
  } catch (err) {
    console.error('データファイルの初期化中にエラーが発生しました:', err);
  }
};

// ユーザー登録
app.post(BASE_PATH + '/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'ユーザー名とパスワードが必要です' });
    }
    
    const usersData = await fs.readJson(usersFile);
    
    // ユーザー名の重複チェック
    if (usersData.users.some(user => user.username === username)) {
      return res.status(400).json({ success: false, message: 'このユーザー名は既に使用されています' });
    }
    
    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      created: moment().format(),
      level: 1,
      exp: 0,
      role: 'beginner',
      achievements: [],
      lastLogin: moment().format()
    };
    
    usersData.users.push(newUser);
    await fs.writeJson(usersFile, usersData);
    
    // JWTトークンの生成
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // パスワードを除いたユーザー情報を返す
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.json({
      success: true,
      message: '登録が完了しました',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('ユーザー登録中にエラーが発生しました:', err);
    res.status(500).json({ success: false, message: 'サーバーエラーが発生しました' });
  }
});

// ログイン
app.post(BASE_PATH + '/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'ユーザー名とパスワードが必要です' });
    }
    
    const usersData = await fs.readJson(usersFile);
    const user = usersData.users.find(user => user.username === username);
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'ユーザー名またはパスワードが正しくありません' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'ユーザー名またはパスワードが正しくありません' });
    }
    
    // ユーザーの最終ログイン日時を更新
    user.lastLogin = moment().format();
    await fs.writeJson(usersFile, usersData);
    
    // JWTトークンの生成
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // パスワードを除いたユーザー情報を返す
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'ログインに成功しました',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('ログイン中にエラーが発生しました:', err);
    res.status(500).json({ success: false, message: 'サーバーエラーが発生しました' });
  }
});

// 認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: '認証が必要です' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'トークンが無効です' });
    }
    
    req.user = user;
    next();
  });
};

// スコア登録
app.post(BASE_PATH + '/api/scores', authenticateToken, async (req, res) => {
  try {
    const { score, level, gameMode } = req.body;
    const userId = req.user.id;
    
    if (!score || !level || !gameMode) {
      return res.status(400).json({ success: false, message: 'スコア、レベル、ゲームモードが必要です' });
    }
    
    const usersData = await fs.readJson(usersFile);
    const user = usersData.users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'ユーザーが見つかりません' });
    }
    
    const scoresData = await fs.readJson(scoresFile);
    
    const newScore = {
      id: uuidv4(),
      userId,
      username: user.username,
      score,
      level,
      gameMode,
      date: moment().format(),
      timestamp: Date.now()
    };
    
    scoresData.scores.push(newScore);
    await fs.writeJson(scoresFile, scoresData);
    
    // ユーザーの経験値とレベルを更新
    const expGained = Math.floor(score / 100);
    user.exp += expGained;
    
    // レベルアップの処理
    const expNeeded = user.level * 1000;
    if (user.exp >= expNeeded) {
      user.level += 1;
      user.exp -= expNeeded;
    }
    
    await fs.writeJson(usersFile, usersData);
    
    res.json({
      success: true,
      message: 'スコアが登録されました',
      score: newScore,
      expGained,
      levelUp: user.exp < expNeeded ? false : true,
      newLevel: user.level,
      newExp: user.exp
    });
  } catch (err) {
    console.error('スコア登録中にエラーが発生しました:', err);
    res.status(500).json({ success: false, message: 'サーバーエラーが発生しました' });
  }
});

// ランキング取得（日次、週次、月次、年次、全期間）
app.get(BASE_PATH + '/api/rankings/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const { gameMode } = req.query;
    
    const scoresData = await fs.readJson(scoresFile);
    let filteredScores = scoresData.scores;
    
    if (gameMode) {
      filteredScores = filteredScores.filter(score => score.gameMode === gameMode);
    }
    
    const now = moment();
    
    // 期間に基づくフィルタリング
    switch (period) {
      case 'daily':
        filteredScores = filteredScores.filter(score => 
          moment(score.date).isSame(now, 'day')
        );
        break;
      case 'weekly':
        filteredScores = filteredScores.filter(score => 
          moment(score.date).isSame(now, 'week')
        );
        break;
      case 'monthly':
        filteredScores = filteredScores.filter(score => 
          moment(score.date).isSame(now, 'month')
        );
        break;
      case 'yearly':
        filteredScores = filteredScores.filter(score => 
          moment(score.date).isSame(now, 'year')
        );
        break;
      case 'special':
        // 特別なランキング（例: 特定のイベント期間中のスコア）
        const eventStart = moment('2025-05-01');
        const eventEnd = moment('2025-05-31');
        
        filteredScores = filteredScores.filter(score => 
          moment(score.date).isBetween(eventStart, eventEnd)
        );
        break;
      case 'all':
      default:
        // すべてのスコアを使用
        break;
    }
    
    // ユーザーごとに最高スコアを取得
    const userBestScores = {};
    
    filteredScores.forEach(score => {
      if (!userBestScores[score.userId] || userBestScores[score.userId].score < score.score) {
        userBestScores[score.userId] = score;
      }
    });
    
    // ランキングを作成
    const rankings = Object.values(userBestScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .map((score, index) => ({
        rank: index + 1,
        ...score
      }));
    
    res.json({
      success: true,
      rankings,
      period,
      gameMode: gameMode || 'all',
      total: rankings.length
    });
  } catch (err) {
    console.error('ランキング取得中にエラーが発生しました:', err);
    res.status(500).json({ success: false, message: 'サーバーエラーが発生しました' });
  }
});

// ユーザープロファイル取得
app.get(BASE_PATH + '/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const usersData = await fs.readJson(usersFile);
    const user = usersData.users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'ユーザーが見つかりません' });
    }
    
    // パスワードを除いたユーザー情報を返す
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('プロファイル取得中にエラーが発生しました:', err);
    res.status(500).json({ success: false, message: 'サーバーエラーが発生しました' });
  }
});

// サーバー起動
app.listen(PORT, async () => {
  await initDataFiles();
  console.log(`サーバーが起動しました: http://localhost:${PORT}${BASE_PATH}`);
});
