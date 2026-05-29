# 未解決の問題メモ

---

## デザインメモ：お賽銭ボタン候補（arcade風）（2026-04-19）

お賽銭確定ボタンのarcade風デザイン。現在は不採用だが、将来使う可能性あり。

```css
.saisen-arcade-btn {
    background: #e6913f;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 12px 0;
    font-size: 16px;
    font-weight: bold;
    font-family: inherit;
    width: 100%;
    cursor: pointer;
    box-shadow: inset 0 0 0 2.5px #af4727, 0 6px 0 0 #af4727;
    transition: background 0.15s;
}
.saisen-arcade-btn:hover {
    background: #e6913f;
    box-shadow: inset 0 0 0 2.5px #af4727, 0 4px 0 0 #af4727;
    transform: translateY(2px);
}
.saisen-arcade-btn:disabled {
    background: #ccc;
    box-shadow: inset 0 0 0 3px #aaa, 0 6px 0 0 #aaa;
    cursor: default;
    transform: none;
}
```

---

## 未解決バグ：家主掲示板 1行目サイズボタンが効かない問題（2026-04-05 調査）【一時保留】

> 実際の使い方では1行目からいきなりサイズ変更するケースがほぼないため、一時保留。マルチプレイ公開前に再検討。

### 症状

- 新規投稿を開いてすぐ（何も書く前）にサイズボタンを押してから文字を書くと、サイズが反映されない
- ボタンのアクティブ表示（ON）はされる
- 文字を書いてからサイズボタンを押すケースは正常
- 2行目以降のサイズ変更も正常

### 根本原因（特定済み）

ブラウザが空の `contenteditable` に `<br>` を直接挿入する。
この `<br>` がエディタの直接の子として存在している状態で `diarySetFontSize` が呼ばれると：

1. `_getEditorBlock` が `<br>` をブロックとして返してしまう → `blocks = [br]`
2. `br.style.fontSize = 'XXpx'` → BR にフォントサイズをセットしても視覚的変化なし
3. カーソルは br のまま → 文字入力が div の外に入り、サイズ無視

スクショで確認した初期状態のエディタ DOM：
```
<div id="diaryEditor">
  <br>   ← ブラウザが追加した要素（div に包まれていない）
</div>
```

### 試したこと（すべて効果なし）

1. `blocks.forEach` の後に `removeAllRanges + addRange(range)` を追加
   → `blocks = [br]` の時点でそもそも問題のパスに到達しなかった

2. `blocks.length === 0` フォールバックでカーソルを `divs[0]` 内に移動
   → `blocks = [br]`（空ではない）なのでこのパスが通らなかった

3. `_getEditorBlock` で `n.nodeName === 'BR'` のとき `null` を返すよう修正
   → `null` になることで `_diaryInsertInitialBlock` が呼ばれるはずが、
     実際の DOM 変化が起きなかった（原因不明のまま）

### 次回の調査ポイント

- `<br>` が挿入される正確なタイミング・経路を特定する
  （`editor.focus()` を呼んだときに Chrome が自動挿入している可能性が高い）
- 初期化の順序を見直す：`focus → div作成` vs `div作成 → focus`
- `_diaryInsertInitialBlock` が呼ばれても DOM に反映されない理由の究明
- `MutationObserver`（`diaryHistoryObserve`）が初期化直後の変更に干渉していないか確認

---

## カラーボックス関連バグまとめ（2026-04-06）

カラーボックスは `contenteditable=false` な外枠の中に `contenteditable=true` な内側を持つ **nested contenteditable 構造**。
これが Chrome のブラウザ仕様と相性が悪く、バグが出やすい。

### ❌ 未解決・保留：最後のカラーボックスを抜けると空行が出る【一時保留】

> Deleteキーで空行を消すことができるため実害は少なく、一時保留。

**症状**
複数のカラーボックスがあるとき、最後のボックスを Enter2回で抜けると、ボックスの下に空行が1行出る。1・2個目のボックスでは発生しない。

**根本原因**
Chrome の contenteditable 正規化仕様。`contenteditable=false` な要素がエディタの末尾にあるとき、Chrome が編集可能領域を確保するため自動的に `<br>` を追加する。

**試みた対処（すべて効果なし）**

1. `_exitDiaryColorbox` でBRが最後の要素なら削除して `setStartAfter(box)` にカーソルを置く
   → Chrome が focus 時に再び BR を追加してしまい空行が消えない

2. 1回目の Enter も `e.preventDefault()` して内部にdivを作らせない
   → カラーボックス内での改行（末尾でない場所）もできなくなった → リバート

**状態**
保留。Notion・Qiita 等のリッチエディタは ProseMirror 等の専用ライブラリで同問題を回避している。
根本解決には nested contenteditable をやめてポップアップ入力方式（吹き出しと同じ方式）に変更するのが現実的だが、「書いてる感」が失われるためのぞみちゃんが検討中。

---

## 確認が必要な操作

### Undo/Redo ズレバグの確認（2026-04-17 修正済み・テスト未実施）

`data/diary.js` の `diaryHistorySave` を修正済み。以下の操作で動作確認してね。

1. 日記エディターを開く
2. テキスト追加・削除・書式変更などを **50回以上** 繰り返す
3. **Ctrl+Z（Undo）を何回も押す**
   - 期待：最初の状態まで戻れる
   - バグ時：1つ手前で止まる・途中で変な状態になる

---

## カーソルが冒頭に飛ぶ問題（2026-04-17）

**現象**
カラーボックスや吹き出しなど、ネストされた contenteditable 要素の操作後にカーソルがエディタ先頭に戻ってしまう。

**根本原因**
`editor.focus()` をカーソル位置設定の**後**に呼ぶと、Chromeがフォーカス処理時にカーソルをリセットしてしまう。

**対処法（適用済み）**
`_exitDiaryColorbox` で `editor.focus()` をカーソル設定より**前**に移動して修正済み。

**要注意**
同様のパターン（`sel.addRange()` の後に `element.focus()`）が他の箇所にも残っている可能性がある。カーソルが先頭に飛ぶ症状が出た場合は `focus()` の呼び出し順を確認すること。

---

## デザインメモ：共同掲示板アクションボタン（テキスト付き版）（2026-04-19）

共同掲示板の「返信する」「いいね」「こっそりいいね」ボタンのテキスト付きデザイン。
アイコンのみ版に変更したため、元のデザインをここに保存。

```css
.myhouse-bulletin-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px solid #d5c5b8;
    border-radius: 4px;
    padding: 4px 10px;
    background: #fff;
    cursor: pointer;
    font-size: 11px;
    color: #ab9787;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.myhouse-bulletin-action-btn:hover {
    background: #f0ebe7;
    border-color: #bfad9f;
    color: #8f7060;
}
/* activeはアイコンのみボタンを除外して適用 */
.myhouse-bulletin-action-btn--active:not(.myhouse-bulletin-action-btn--icon) {
    background: var(--myhouse-accent-light, #fde4c4);
    border-color: var(--myhouse-accent, #E6913F);
    color: var(--myhouse-accent, #E6913F);
    transition: none;
}
```

---

## ロビー画面ボタン（検討中）

```css
background: #f6c30d;
border-radius: 16px;
box-shadow: inset 0 0 0 3px #ffcd0d, inset 0 0 0 0px #FFFFFF, 0 6px 0 0 #c69d01;
```

---

## 自己紹介掲示板 項目まとめ（2026-05-26 設計）

### セクション構成

**① 基本プロフィール＋自己紹介**（穴埋め文章スタイル）
- なまえ：ゲームのユーザー名を自動取得
- ニックネーム（呼んでほしい名前）
- 生年月日（年・月・日）、星座、血液型
- 性格：「よく〇〇って言われるけど、自分では〇〇だと思う」
- 趣味、最近ハマってること、特技

**② お気に入り**（6項目）
食べ物 / 色 / 音楽 / 漫画・アニメ / 場所 / お菓子

**③ どっち派？**（4項目）
犬派？猫派？ / 朝型？夜型？ / 甘党？辛党？ / インドア？アウトドア？

**④ Q&A**（5項目）
- 幸せを感じる瞬間は？
- 休日は何してる？
- 1000万円もらえたら何に使う？
- 旅行するならどこがいい？
- ストレス発散法は？

**⑤ 最後にひとこと**（フリースペース）

### デザイン方針
- CSSのみで実装（画像背景なし）
- 穴埋め文章スタイルで平成プロフ帳風に
- 1ページに凝縮
- まずシンプルなデザインから作り、後でテーマ展開予定

---
