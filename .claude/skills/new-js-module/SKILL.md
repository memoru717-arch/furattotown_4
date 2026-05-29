---
name: new-js-module
description: ふらっとタウンの新機能JSファイルをプロジェクトの規約に沿ってテンプレート生成する
---

# new-js-module

引数で渡された機能名をもとに、`data/` ディレクトリに新しいJSモジュールを作成する。

## 引数

- `$ARGUMENTS` — 機能名（例: `event-log`、`ranking`、`minigame`）

## 手順

### 1. 既存モジュールのパターン確認

以下のファイルを参考にして、プロジェクト固有の規約を把握する：
- `data/mail.js`（モーダル開閉・状態管理の参考）
- `data/board.js`（リスト表示・カード描画の参考）

特に注意する点：
- ヘッダーコメントのフォーマット（`// ===...===` の区切り線スタイル）
- `gameState` の参照方法
- `_` プレフィックスによるプライベート関数の命名規則
- モーダル関数の命名: `open[Name]Modal()` / `close[Name]Modal()`
- 描画関数の命名: `render[Name]()` / `update[Name]UI()`

### 2. ファイルを生成する

`data/$ARGUMENTS.js` を以下のテンプレート構造で作成する：

```javascript
// ============================================
// ふらっとタウン - [機能名（日本語）]
// ============================================
// ============================================
// [機能名] 機能
// ============================================

// --- 状態変数 ---
// （必要な状態変数をここに定義）

// --- 定数 ---
// （必要な定数をここに定義）

// --- ヘルパー関数 ---

function _[featureName]Helper() {
    // プライベートなヘルパー処理
}

// --- メイン機能 ---

function open[FeatureName]Modal() {
    const modal = document.getElementById('[featureName]Modal');
    if (!modal) return;
    modal.classList.add('active');
    render[FeatureName]();
}

function close[FeatureName]Modal() {
    const modal = document.getElementById('[featureName]Modal');
    if (!modal) return;
    modal.classList.remove('active');
}

function render[FeatureName]() {
    // 描画処理
}

function update[FeatureName]UI() {
    // UI更新処理
}
```

### 3. 確認事項

生成後、以下を確認してユーザーに伝える：
- 作成したファイルパス
- `index.html` に `<script src="data/$ARGUMENTS.js"></script>` を追加する必要があること
- モーダルのHTMLを `index.html` に追加する必要があること（モーダル形式の場合）
- `gameState` に必要なデータキーがあれば `data/game.js` への追記が必要なこと
