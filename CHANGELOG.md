# Changelog

## v1.0.2 (2025-05-13)

### 修正点
- **重複定義エラーの解決**: KeyboardControllerとTouchControllerの重複定義問題を解決
  - 変数宣言を避けて`window`オブジェクトに直接登録する方式に変更
  - `window.KeyboardController = window.KeyboardController || {...}`の形式で実装
- **クラシックモード認識の改善**: クラシックモードが見つからない問題を修正
  - `game-modes.js`を先に読み込む形に変更
  - ゲームモードオブジェクトをwindowに登録し、検出性を向上
  - モード登録ロジックを強化して複数の方法でモード検出を行うように改善
- **ファイル構造の最適化**: モジュール構造を改善
  - ファイル読み込み順序を依存関係に合わせて再構成
  - 互換レイヤーを強化し、古いAPIと新APIの共存を確保
- **デバッグ機能の強化**: 問題のトラブルシューティングを容易に
  - 詳細なコンソールログを追加
  - エラー処理を強化して、問題の検出を容易に

### 変更ファイル
- `public/index.html`
- `public/js/game-modes-core.js`
- `public/js/game-modes.js`
- `public/js/classic-mode.js`
- `public/js/keyboard-controls.js`
- `public/js/touch-controls.js`
- `public/js/app.js`

## v1.0.1 (2025-05-12)

初期リリース
