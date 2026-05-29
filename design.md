# ふらっとタウン デザインガイド

作業前に必ず読み込んでください。

---

## 基本方針

シンプルでわかりやすさを最優先にします。装飾よりも**見やすさ・使いやすさ**を重視した設計にしてください。

---

## 絵文字の使用について

基本的に絵文字は使用しません。どうしても必要と感じた場合のみ、象徴的なアイコンとしてUIに限定して使用します。文章やタイトルへの多用はNGです。

- OK：UIのアイコンとして使う、象徴として1箇所に使う
- NG：文章中や見出しに絵文字を多用する

---

## レイアウト・区切りについて

区切り線（`<hr>` など）は多用しません。セクションの分割には**背景色や余白**を活用して、デザインで情報を整理するようにしてください。

---

## 施設系モーダル設計

タウンマップ内の全建物を押したときに出るモーダル画面。

### 基本スタイル

| プロパティ | 値 |
|-----------|-----|
| 背景色 | `#FAF4EF` |
| 枠線 | `3px solid #e6913f` |
| 角丸 | `4px` |
| 影 | なし |

### 中型モーダル共通サイズ（`.modal-content-medium`）

掲示板・お絵かきなど、横広めのモーダルに使う共通サイズクラス。個別の `.xxx-modal-content` と一緒に付与する。

```css
.modal-content-medium {
    width: 75vw;
    max-width: 950px;
    min-width: 500px;
    height: 90vh;
}
```

```html
<div class="modal-content modal-content-medium board-modal-content">
```

---

### カラー一覧

**メインカラー（オレンジ系）**

| 用途 | カラーコード |
|------|------------|
| テーブルヘッダー背景・タブ・枠線（メイン） | `#E6913F` |
| テーブルサブヘッダー背景 | `#EDA85E` |
| ヘッダーhover・縦線（暗め） | `#C97A2C` |
| 購入ボタンactive | `#E07A35` |
| 価格テキスト・備考アイコン | `#EB6101` |

**ボーダー・区切り線**

| 用途 | カラーコード |
|------|------------|
| カートアイテム区切り・列区切り | `#EAAD77` |
| テーブル内セル区切り・ジャンル行 | `#fde4c4` |

**背景色**

| 用途 | カラーコード |
|------|------------|
| モーダル本体・右パネル | `#FFF8F0` |
| ジャンル区切り行 | `#FDE4C4` |
| 自分の能力値行 | `#FFF9C4` |
| 目標能力値行 | `#fff8bb` |

**アクセント**

| 用途 | カラーコード |
|------|------------|
| 目標能力値テキスト | `#228b22`（緑） |
| 残高不足テキスト | `#e53935`（赤） |
| 非アクティブタブ文字 | `#b8b4af`（グレー） |

### ボタンスタイル

ホバーアクション（浮き上がり・ドロップシャドウ）は**なし**。外側のボーダーも**なし**。白い内枠線（inset box-shadow）は**あり**。

```css
/* 通常 */
background: #E07A35;
border: none;
border-radius: 4px;
color: #FFF;
font-family: inherit;
text-shadow: none;
box-shadow: inset 0 0 0 3px #E07A35,
            inset 0 0 0 4px #FFFFFF;

/* disabled */
background: #CCCCCC;
border: none;
border-radius: 4px;
color: #999999;
font-family: inherit;
text-shadow: none;
box-shadow: inset 0 0 0 3px #CCCCCC,
            inset 0 0 0 4px #FFFFFF;

/* hover（グローバルの.btn:hoverを打ち消す） */
transform: none;
box-shadow: /* 通常時と同じ box-shadow を指定 */
```

---

## ステータス系モーダル設計

アクションアイコン（プレイヤー情報内の6つのアイコン）を押したときに出るモーダル画面。

### 基本スタイル

| プロパティ | 値 |
|-----------|-----|
| 背景色 | `#FAF4EF` |
| 枠線 | `2px solid #4EA840` |
| 角丸 | `4px` |
| 影 | なし |

### カラー一覧

| 用途 | カラーコード |
|------|------------|
| メインカラー（枠線・サイドバー・ヘッダー・ボタン） | `#4EA840` |
| モーダル背景 | `#FAF4EF` |
| コンテンツ内ボックス背景 | `#ffffff` |
| グリーン hover 用（ボタンなど） | `#3d8f31` |
| 区切り線（薄緑） | `#A8D5A2` |
| リストアイテム hover 背景 | `#F0FFF0` |
| 未読バッジ背景 | `#E53935` |
| 削除・破棄ボタン文字 | `#c0392b` |

### ボタンスタイル

```css
/* 通常 */
background: #4EA840;
box-shadow: inset 0 0 0 3px #4EA840,
            inset 0 0 0 4px #FFFFFF;

/* disabled */
background: #CCCCCC;
color: #999999;
box-shadow: inset 0 0 0 3px #CCCCCC,
            inset 0 0 0 4px #FFFFFF;
```

### OKボタン（モーダル確認用）

結果確認・完了通知などのモーダルで使うOKボタンの型。ステータス系（緑）を基準とする。

```css
min-width: 147px;
padding: 11px 20px;
font-size: 13px;
font-weight: bold;
cursor: pointer;
background: #4EA840;
border: none;
border-radius: 4px;
color: #fff;
font-family: inherit;
text-shadow: none;
box-shadow: inset 0 0 0 3px #4EA840,
            inset 0 0 0 4px #FFFFFF;

/* hover */
transform: none;
box-shadow: inset 0 0 0 3px #4EA840,
            inset 0 0 0 4px #FFFFFF; /* 通常時と同じ */
```

### ウィンドウタイトルバー（ステータス系）

モーダル上部に配置するWindowsスタイルのタイトルバー。ステータス系モーダル全体で統一して使用する。

#### HTML構造

```html
<div class="win-titlebar">
    <span class="win-titlebar-title">タイトル名</span>
    <div class="win-titlebar-btns">
        <button class="win-titlebar-btn win-titlebar-close" onclick="closeXxxModal()">✕</button>
    </div>
</div>
```

#### CSSスタイル

```css
.win-titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 5px 6px 13px;
    background: #4EA840;
}

.win-titlebar-title {
    color: #faf4ef;
    font-size: 14px;
    font-weight: bold;
}

.win-titlebar-btns {
    display: flex;
}

.win-titlebar-btn {
    width: 24px;
    height: 24px;
    border: 1px solid;
    border-radius: 4px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
}

.win-titlebar-close {
    background: #4ea840;
    color: #ffffff;
    cursor: pointer;
}

.win-titlebar-close:hover {
    background: #3d8f31;
}
```

### ウィンドウタイトルバー（施設系）

モーダル上部に配置するタイトルバーの施設版。オレンジ系カラーで統一する。タイトルテキストは空欄でもOK（✕ボタンのみの構成も可）。

ロビーから別ビューへ遷移する施設では、タイトルバー内に「戻る」ボタンを配置する。ロビー表示時は非表示（`display:none`）、サブビュー表示時に表示に切り替える。

#### HTML構造（戻るボタンなし）

```html
<div class="win-titlebar-facility">
    <span class="win-titlebar-facility-title">施設名など（空欄可）</span>
    <button class="win-titlebar-btn win-titlebar-facility-close" onclick="closeXxxModal()">✕</button>
</div>
```

#### HTML構造（戻るボタンあり）

```html
<div class="win-titlebar-facility">
    <button class="facility-back-btn" id="xxxBackBtn" onclick="openXxxLobby()" style="display:none;">← 戻る</button>
    <span class="win-titlebar-facility-title"></span>
    <button class="win-titlebar-btn win-titlebar-facility-close" onclick="closeXxxModal()">✕</button>
</div>
```

#### 戻るボタンの表示制御（JS）

```js
// ロビーを開くとき → 非表示
document.getElementById('xxxBackBtn').style.display = 'none';

// サブビューを開くとき → 表示
document.getElementById('xxxBackBtn').style.display = '';

// 完了ビューを開くとき → 非表示
document.getElementById('xxxBackBtn').style.display = 'none';
```

#### CSSスタイル

```css
.win-titlebar-facility {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 5px 6px 13px;
    background: #E6913F;
}

.win-titlebar-facility-title {
    color: #faf4ef;
    font-size: 14px;
    font-weight: bold;
}

.win-titlebar-facility-close {
    background: #E6913F;
    color: #ffffff;
    cursor: pointer;
    border-color: #faf4ef;
}

.win-titlebar-facility-close:hover {
    background: #C97A2C;
}

/* タイトルバー内の「← 戻る」ボタン（ヘッダー専用） */
.facility-back-btn {
    background: none;
    border: none;
    border-radius: 0;
    color: #ffffff;
    font-size: 15px;
    padding: 0;
    cursor: pointer;
    transition: none;
}
.facility-back-btn:hover {
    background: none;
}
```

> **注意：** `.facility-back-btn` はタイトルバー内専用。画面コンテンツ内の「戻る」ボタン（確認ダイアログなど）とは別枠。画面内の戻る・キャンセル系は「キャンセル・削除ボタンスタイル」セクションを参照。

#### ✕ボタンなしの場合の高さ固定

✕ボタンを省略するとタイトルバーが縮んでしまうため、モーダル固有のCSSで `min-height` を指定して高さを固定する。

```css
.xxx-modal-content .win-titlebar-facility {
    min-height: 36px;
}
```

---

#### モーダル側の設定

タイトルバーが端まで表示されるよう、モーダルコンテンツに `padding: 0` と `overflow: hidden` を設定し、コンテンツ部分は別の div（`.モーダル名-body` など）に入れて padding を管理する。

```css
.xxx-modal-content {
    padding: 0;
    overflow: hidden;
}

.xxx-modal-body {
    padding: 20px 30px 30px;
}
```

> **ベースクラスの注意：** `.modal-content` はすでに `padding: 0` / `overflow: hidden` が設定されている。個別の `.xxx-modal-content` クラスでサイズなどを上書きするだけでOK。

---

## 新モーダル実装テンプレート

新しいモーダルを作るときは必ずこの構造をベースにする。`board-close-btn` は旧パターンなので使わない。

### 施設系モーダル（ロビーなし）

```html
<div class="modal" id="xxxModal">
    <div class="modal-content xxx-modal-content">
        <div class="win-titlebar-facility">
            <span class="win-titlebar-facility-title"></span>
            <button class="win-titlebar-btn win-titlebar-facility-close" onclick="closeXxxModal()">✕</button>
        </div>
        <div class="xxx-modal-body">
            <!-- コンテンツをここに -->
        </div>
    </div>
</div>
```

```css
.xxx-modal-content {
    width: 90%;
    max-width: 600px;  /* 施設に合わせて調整 */
}
.xxx-modal-body {
    padding: 20px 30px 30px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
```

### 施設系モーダル（ロビーあり・戻るボタンあり）

```html
<div class="modal" id="xxxModal">
    <div class="modal-content shop2-modal-content">
        <div class="win-titlebar-facility">
            <button class="facility-back-btn" id="xxxBackBtn" onclick="openXxxLobby()" style="display:none;">← 戻る</button>
            <span class="win-titlebar-facility-title"></span>
            <button class="win-titlebar-btn win-titlebar-facility-close" onclick="closeXxxModal()">✕</button>
        </div>
        <div class="shop2-content-area">
            <!-- ロビービュー・各コンテンツビューをここに -->
        </div>
    </div>
</div>
```

> ロビーあり施設は `shop2-modal-content` + `shop2-content-area` の組み合わせを流用できる。

---

## キャンセル・削除ボタンスタイル

確認ダイアログ・モーダル内で使うセカンダリ系ボタン。`.diary-confirm-cancel` / `.diary-confirm-delete` が基準。

### キャンセル・戻るボタン

```css
background: #BBBBBB;
border: none;
border-radius: 4px;
color: #fff;
font-family: inherit;
box-shadow: inset 0 0 0 3px #BBBBBB,
            inset 0 0 0 4px #FFFFFF;

/* hover */
transform: none;
box-shadow: inset 0 0 0 3px #BBBBBB,
            inset 0 0 0 4px #FFFFFF;
```

### 削除ボタン

```css
background: #e05040;
border: none;
border-radius: 4px;
color: #fff;
font-family: inherit;
box-shadow: inset 0 0 0 3px #e05040,
            inset 0 0 0 4px #FFFFFF;

/* hover */
transform: none;
box-shadow: inset 0 0 0 3px #e05040,
            inset 0 0 0 4px #FFFFFF;
```

---

## 浮き出しボタン（プレスダウン型）

選択式の金額ボタンなど、押した感を表現したいときに使う。ホバーで少し沈み、選択時はさらに沈む。お賽銭モーダルの金額ボタンが基準。

### 通常・ホバー・選択時

```css
/* 通常 */
background: #fbfbfb;
border: 1.5px solid #d5c5b8;
border-radius: 4px;
color: #555;
font-size: 16px;
font-weight: bold;
font-family: inherit;
cursor: pointer;
box-shadow: 0 4px 0 0 #d5c5b8;

/* hover（少し沈む） */
transform: translateY(1px);
box-shadow: 0 3px 0 0 #d5c5b8;

/* selected（ホバーと同じ高さで沈む・背景色反転） */
background: #e6913f;
color: #fff;
border-color: #b06633;
transform: translateY(1px);
box-shadow: 0 3px 0 0 #b06633;

/* selected:hover（選択済みはホバーしても変化なし） */
border-color: #b06633;
transform: translateY(1px);
box-shadow: 0 3px 0 0 #b06633;
```

### 使い方メモ

- `box-shadow: 0 Npx 0 0 カラー` が「床の影」の役割。translateY と合わせて沈み込みを演出する。
- 選択状態の切り替えは JS で `.selected` クラスを付け外しする。
- グリッドレイアウトで並べるときは `grid-template-columns: 1fr 1fr` + `gap: 11px` が目安。

---

## テキストスタイル基本方針

絶対ルールではないが、なるべくこの方針に沿って統一する。

| 対象 | スタイル |
|------|---------|
| 基本フォントサイズ | `13px` |
| 商品名・メニュー名 | `font-weight: bold` |
| 金額（円） | `font-weight: bold` + `color: #EB6101` |

---

## テーブルデザイン基本方針

| プロパティ | 値 |
|-----------|-----|
| 外枠の色 | 施設系：`#E6913F` / ステータス系：対応色 |
| 外枠の太さ | `2px solid` |
| 角丸 | `4px` |
| 空セル | 「-」は使わず、空白のままにする |

**実装上の注意**

外枠はコンテナ div に `border`・`border-radius` を付け、テーブルセルの外側ボーダー（上行・左端・右端・下行）は `border: none` で消す。こうすることでコンテナの枠だけがきれいに見える。

---

### 結果表スタイル（shokudo-eat-changes パターン）

アイテム使用結果・緊急支援の支給品一覧など、「名称 ＋ 値」を縦に並べる表に使う共通パターン。

**使用クラス**

| クラス | 役割 |
|--------|------|
| `.shokudo-eat-changes` | 表全体のコンテナ |
| `.shokudo-change-row` | 1行分（label + 値） |
| `.shokudo-change-label` | 左側の項目名（太字） |
| `.shokudo-change-plus` | 右側の強調値（オレンジ `#EB6101`）― 金額・増加値など |
| `.shokudo-change-after` | 右側の通常値（グレー `#333`）― 個数・現在値など |

**コンテナスタイル**

```css
.shokudo-eat-changes {
    background: #FFFFFF;
    border: 2px solid #EAAD77;
    border-radius: 4px;
    padding: 0;
    width: 300px;      /* 全幅にしたいときは 100% に上書き */
    max-width: 100%;
    overflow-y: auto;
}
```

**行スタイル（破線区切り）**

```css
.shokudo-change-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 15px;
    font-size: 17px;
    color: #333333;
    border-bottom: none;       /* solid を消して ::after で破線に */
    position: relative;
}
.shokudo-change-row::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 12px;
    right: 12px;
    border-bottom: 1px dashed #EAAD77;  /* オレンジ破線 */
}
.shokudo-change-row:last-child::after {
    display: none;             /* 最終行は区切り線なし */
}
```

**HTML テンプレート**

```html
<div class="shokudo-eat-changes">
    <div class="shokudo-change-row">
        <span class="shokudo-change-label">項目名</span>
        <span class="shokudo-change-plus">強調値（金額など）</span>
    </div>
    <div class="shokudo-change-row">
        <span class="shokudo-change-label">項目名</span>
        <span class="shokudo-change-after">通常値（×1 など）</span>
    </div>
</div>
```

**カラーバリエーション**

| 用途 | 枠線・破線色 | 強調テキスト色 |
|------|------------|--------------|
| オレンジ（施設系・緊急支援） | `#EAAD77` | `#EB6101` |
| グリーン（アイテム使用結果） | `#B8E0B0` | `#4EA840` |

グリーン版は `#itemResultModal` 内でオーバーライドして使用している。

---

## ラジオボタン（施設系）

食堂の「ここで食べるビュー」が基準。施設系全体で統一して使用する。

```css
/* 通常 */
-webkit-appearance: none;
appearance: none;
width: 18px;
height: 18px;
border: 2px solid #EAAD77;
border-radius: 50%;
background: #FFFFFF;
cursor: pointer;
position: relative;
flex-shrink: 0;
vertical-align: middle;
margin-right: 5px;

/* 選択時 */
border-color: #EB6101;
background: #EB6101;

/* 選択時の中央ドット */
content: '';
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 6px;
height: 6px;
background: #FFFFFF;
border-radius: 50%;
```

---

## チェックボックス（掲示板系）

マイホーム掲示板の「コメントを許可する」チェックボックスが基準。SVGインラインチェックマークを使用することで位置ズレなく白チェックが表示できる。

```css
/* 通常 */
-webkit-appearance: none;
appearance: none;
width: 18px;
height: 18px;
border: 1.5px solid #d6c5b8;
border-radius: 3px;
background: #fff;
cursor: pointer;
vertical-align: middle;
position: relative;
flex-shrink: 0;

/* チェック時 */
background: #e6913f;
border-color: #e6913f;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpolyline points='2,6 5,9.5 10,2.5' stroke='white' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
background-size: 12px 12px;
background-repeat: no-repeat;
background-position: center;
```

ポイント：`::after` 疑似要素のcheckmarkは位置ズレしやすいため、SVGをdata URIでbackground-imageに指定する方式を採用。

---

## 施設ロビー画面設計

タウンマップの各施設を開いたときに最初に表示されるロビー画面。全施設共通のデザインテンプレート。

### レイアウト構造

```
[ ストライプ ][ 左パネル（メニュー） ][ 右パネル（風景 + 説明枠） ]
```

HTMLの構造：
```html
<div id="○○LobbyView" class="facility-lobby">
    <div class="facility-lobby-stripe"></div>
    <div class="facility-lobby-left">
        <div class="facility-lobby-name">施設名</div>
        <div class="facility-lobby-divider"></div>
        <p class="facility-lobby-greeting">いらっしゃいませ。<br>サブテキスト</p>
        <div class="facility-lobby-btns">
            <button class="facility-lobby-btn" onclick="○○()"
                onmouseenter="showFacilityDesc('施設ID', 'キー')" onmouseleave="hideFacilityDesc('施設ID')">
                <img src="public/icon/○○.png" alt="○○" class="facility-lobby-btn-icon">
                <span class="facility-lobby-btn-label">ボタン名</span>
            </button>
        </div>
    </div>
    <div class="facility-lobby-right">
        <img src="haikei/○○.jpg" alt="施設名" class="facility-lobby-img">
        <div class="facility-lobby-desc" id="施設IDLobbyDesc"></div>
    </div>
</div>
```

### 各パーツのスタイル

#### ストライプ（左端の細い帯）

| プロパティ | 値 |
|-----------|-----|
| width | `95px` |
| background | `#e07935` |

#### 左パネル

| プロパティ | 値 |
|-----------|-----|
| width | `361px` |
| background | `#eaad77` |
| padding | `64px 37px` |
| gap | `6px` |

#### 施設名（.facility-lobby-name）

| プロパティ | 値 |
|-----------|-----|
| font-size | `26px` |
| font-weight | `bold` |
| color | `#fff` |

#### 区切り線（.facility-lobby-divider）

施設名とあいさつ文の間に入る横線。ストライプからにゅいんと伸びているように見せる。

| プロパティ | 値 |
|-----------|-----|
| height | `2px` |
| background | `#e07a35` |
| margin-left | `-75px` |
| width | `calc(100% + 37px)` |

#### あいさつ文（.facility-lobby-greeting）

| プロパティ | 値 |
|-----------|-----|
| font-size | `16px` |
| color | `#fff3e0` |
| margin | `0` |
| padding | `10px 0px 30px 0px` |
| line-height | `1.6` |

#### メニューボタン（.facility-lobby-btn）

ホバーアクション：明るくなる（`filter: brightness(1.15)`）。浮き上がりなし。

```css
/* 通常 */
display: flex;
align-items: center;
justify-content: center;
background: #E07A35;
border: none;
border-radius: 50px;
padding: 21px 0px;
gap: 64px;
color: #ffffff;
font-weight: bold;
font-family: inherit;
box-shadow: inset 0 0 0 5px #E07A35, inset 0 0 0 6px #ffffff;

/* hover */
filter: brightness(1.15);
box-shadow: inset 0 0 0 5px #E07A35, inset 0 0 0 6px #ffffff; /* 同じ */
transform: none;
```

ボタン内のアイコンと文字の配置：
- アイコン（`.facility-lobby-btn-icon`）：`26×26px`
- ラベル（`.facility-lobby-btn-label`）：`font-size: 20px`、`font-weight: bold`
- `::after` に `width: 26px` の透明スペーサーを置くことで、ラベルをボタン中央に揃える

#### ボタン間のgap

`.facility-lobby-btns` の `gap: 21px`

### 右パネル

#### 風景イラスト（.facility-lobby-img）

| プロパティ | 値 |
|-----------|-----|
| width | `100%` |
| height | `100%` |
| object-fit | `cover` |
| opacity | `0.75` |

#### 説明枠（.facility-lobby-desc）

ボタンホバー時に説明文が切り替わる。枠のサイズは固定。左辺の枠線はなし（左パネルから伸びているように見せる）。

| プロパティ | 値 |
|-----------|-----|
| position | `absolute` bottom: `30px` left: `0` right: `30px` |
| height | `160px` |
| background | `rgba(255, 248, 240, 0.95)` |
| padding | `18px 30px` |
| font-size | `17px` |
| line-height | `1.7` |
| color | `#444` |
| border | `4px solid #EAAD77`（左辺のみ `none`） |
| border-radius | `0 18px 18px 0` |
| white-space | `pre-line`（改行を反映するため） |

### ホバー説明の実装（JS）

`shop.js` 内の `facilityLobbyDescs` オブジェクトに施設IDと説明文を追加する。

```js
const facilityLobbyDescs = {
    施設ID: {
        default: '',           // ホバーしていないときの表示（空でもOK）
        キー名: `説明文\n改行もOK`,
    },
};
```

呼び出しはボタンの `onmouseenter` / `onmouseleave` で行う：

```html
onmouseenter="showFacilityDesc('施設ID', 'キー名')"
onmouseleave="hideFacilityDesc('施設ID')"
```

---

## 掲示板系モーダル（木目テーマ）

ギモン解決BBS（`#boardModal`）とお絵かき掲示板（`#oekakiModal`）で共通して使う木目テーマのデザイン仕様。

### カラー

| 用途 | カラーコード |
|------|------------|
| 外枠・ヘッダー背景・✕ボタン背景 | `#664118` |
| ✕ボタン border-color | `#9a6030` |
| ✕ボタン hover | `#4d2f0f` |
| モーダル本体背景色 | `#e9b782` |

### 木目テクスチャの適用方法

背景色の上に `::before` 疑似要素で木目画像を重ねる。テキストが隠れないよう `z-index` を制御する。

```css
.board-modal-body {
    background-color: #e9b782;
    position: relative;
}

.board-modal-body::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('public/keiziban/mokume1.png');
    background-repeat: repeat;
    opacity: 0.8;
    pointer-events: none;
    z-index: 0;
}

.board-modal-body > * {
    position: relative;
    z-index: 1;
}
```

- 木目画像：`public/keiziban/mokume1.png`
- 透明度は `opacity` で調整（現在 `0.8`）
- コンテンツが隠れないよう `> *` に `z-index: 1` を設定する

### タイトルバーの上書き

`.win-titlebar-facility` のデフォルト色（オレンジ系）をモーダルIDで上書きする。

```css
#boardModal .win-titlebar-facility,
#oekakiModal .win-titlebar-facility {
    background: #664118;
}

#boardModal .win-titlebar-facility-close,
#oekakiModal .win-titlebar-facility-close {
    background: #664118;
    border-color: #9a6030;
}

#boardModal .win-titlebar-facility-close:hover,
#oekakiModal .win-titlebar-facility-close:hover {
    background: #4d2f0f;
}
```

### 完了オーバーレイ（投稿完了・処理完了の通知カード）

モーダルの上に重ねて表示する小さいカード型の通知UI。`#boardModal` 直下（`.modal-content` の外）に配置し、モーダル全体（タイトルバーを含む）を覆う。

#### HTML構造

```html
<!-- #boardModal 直下に置く（.modal-content の外） -->
<div class="board-complete-overlay" id="boardCompleteView" style="display: none;">
    <div class="board-complete-inner">
        <div class="board-complete-header">
            <button class="win-titlebar-btn win-titlebar-facility-close" onclick="closeBoard()">✕</button>
        </div>
        <div class="board-complete-body">
            <div class="board-complete-title">投稿しました！</div>
            <div class="board-complete-buttons">
                <button class="btn board-btn-view-post" onclick="viewMyPost()">投稿を見る</button>
                <button class="btn board-btn-go-home" onclick="backToBoardTop()">一覧へ戻る</button>
            </div>
        </div>
    </div>
</div>
```

#### CSSスタイル

```css
/* オーバーレイ背景（モーダル全体を暗くする） */
.board-complete-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

/* 木目カード本体 */
.board-complete-inner {
    background-color: #aa8f73;
    border-radius: 4px;
    border: 3px solid #664118;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: relative;
    overflow: hidden;
    min-width: 360px;
}

/* 木目テクスチャ（掲示板本体と同じ設定） */
.board-complete-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('public/keiziban/mokume1.png');
    background-repeat: repeat;
    opacity: 0.6;
    pointer-events: none;
    z-index: 0;
}
.board-complete-inner > * {
    position: relative;
    z-index: 1;
}

/* ヘッダーバー（✕ボタンのみ・右端） */
.board-complete-header {
    background: #664118;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 5px 5px 6px;
}

/* ボディ部分 */
.board-complete-body {
    padding: 36px 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

/* タイトル */
.board-complete-title {
    color: #fffaf4;
    font-size: 21px;
    font-weight: bold;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

/* ボタン：メイン（黄色系） */
.board-btn-view-post {
    background: #eed296;
    color: #664118;
    border: none;
    border-radius: 8px;
    padding: 11px 36px;
    font-size: 17px;
    font-family: inherit;
    font-weight: bold;
    cursor: pointer;
    box-shadow: inset 0 0 0 3px #eed296, inset 0 0 0 4px #664118;
}

/* ボタン：サブ（茶色系・マイページボタンと同デザイン） */
.board-btn-go-home {
    background: #664118;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 11px 36px;
    font-size: 17px;
    font-family: inherit;
    font-weight: bold;
    cursor: pointer;
    box-shadow: inset 0 0 0 3px #664118, inset 0 0 0 4px #cdb9a4;
}
```

#### 表示・非表示の制御（JS）

```js
// 表示（submitPost完了時）
document.getElementById('boardCompleteView').style.display = 'flex';

// 非表示（各ボタン押下時）
document.getElementById('boardCompleteView').style.display = 'none';
```

> **注意：** `.modal-content` に `position: relative` が必要。また `#boardModal` の `.modal` は `position: fixed` のため、オーバーレイは `position: absolute; inset: 0` でモーダル全体（タイトルバー含む）を覆える。

---

## テキストカーソル（チカチカ）の一括非表示

ゲームUIのdivやボタンにマウスを乗せると、ブラウザがテキスト入力カーソル（`|`）を表示してしまうことがある。モーダルや画面のルートコンテナに `user-select: none` を指定することで一括で解消できる。

```css
#hudosanModal {
    user-select: none;
}
```

### 適用方針
- モーダル単位でルートコンテナに指定するのが最もスッキリする
- 施設モーダル（`#hudosanModal`、`#mailModal` など）それぞれのIDに追加していく
- テキスト入力フィールド（`input`、`textarea`）は自動的に除外されるので影響なし

