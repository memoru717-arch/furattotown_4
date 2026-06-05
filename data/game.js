// ============================================
// ふらっとタウン - ゲームロジック
// ============================================

// 選択可能なアバター（Profile1〜104）
const avatarOptions = Array.from({length: 104}, (_, i) => `Profile/profile${i + 1}.png`);

// お知らせ本文マスター（localStorageに依存しないよう定数で管理）
const NEWS_BODIES = {
    1: {
        title: 'ふらっとタウンへようこそ！',
        snippet: 'タウンの使い方や各施設の説明はこちらをご覧ください。',
        body: `
        <p>こんにちは！ふらっとタウンへようこそ！<br>ここはみんながふらっと立ち寄れる街です。</p>

        <h4>まずはお仕事をするのがおすすめ！</h4>
        <p><img src="mapimg/work.png" style="width:27px;height:27px;vertical-align:middle;position:relative;top:-3px;margin-right:6px;"><strong>ハローワーク（H-10）</strong>で就職すると、会社に通勤してお金が稼げるようになります。<br>最初はアルバイトからスタート！<br>
        <img src="status/status1.png" style="width:27px;height:27px;vertical-align:middle;position:relative;top:0px;margin-right:6px;">のアイコンをクリックすると、出勤することができます。</p>

        <h4>能力値を上げることもできます</h4>
        <p><img src="mapimg/gym.png" style="width:27px;height:27px;vertical-align:middle;position:relative;top:-3px;margin-right:6px;"><strong>ジム（F-7）</strong>や<img src="mapimg/school.png" style="width:27px;height:27px;vertical-align:middle;position:relative;top:-3px;margin-right:6px;"><strong>習い事スクール（F-6）</strong>に通うと、身体・頭脳の能力値がアップ！<br>能力値が上がると、もっと良いお仕事にも就けます。<br>
        <img src="mapimg/store.png" style="width:27px;height:27px;vertical-align:middle;position:relative;top:-3px;margin-right:6px;"><strong>ショッピングモール（H-6）</strong>でアイテムを購入するのもオススメ👍️</p>

        <h4>ごはんも大事！</h4>
        <p><img src="mapimg/syokudo.png" style="width:27px;height:27px;vertical-align:middle;position:relative;top:-3px;margin-right:6px;"><strong>食堂（H-9）</strong>でごはんを食べて、空腹度を回復しましょう🍚<br>お腹がすいていると体調を崩してしまうこともあるので、適度に食べていきましょう。</p>

        <h4>最後はセーブも忘れずに！</h4>
        <p>終わるときは、<img src="status/status6.png" style="width:27px;height:27px;vertical-align:middle;position:relative;top:0px;margin-right:6px;">のアイコンを押して保存しましょう。</p>

        <br>
        <p>そのほかにも…<br>
            お金を貯めてマイホームを買ったり、<br>
            温泉でのんびりしたりすることもできます♨️
        </p>

        <p style="margin-top:14px; font-weight:bold; color:#3a6e35;">決まった遊び方はありません✨️<br>
        あなたのペースで、ふらっと過ごしてみてくださいね🏡</p>
        `,
    },
};

function _generateStartingBody() {
    const height = Math.floor(Math.random() * 26) + 150;
    const bmi = 18 + Math.random() * 7;
    const heightM = height / 100;
    const weight = Math.round(bmi * heightM * heightM * 10) / 10;
    return { height, weight };
}
const _startingBody = _generateStartingBody();

// ゲーム状態
const gameState = {
    player: {
        name: 'ユーザー',
        avatar: 'Profile/profile1.png',
        avatarBgColor: '#FFB6C1',
        money: 0,
        health: 50,
        maxHealth: 50,
        intelligence: 50,
        maxIntelligence: 50,
        weight: _startingBody.weight,
        height: _startingBody.height,
        bodyFat: 17,
        gender: null, // 性別（'男性' / '女性' / null）
        lastMealTime: Date.now() - 4 * 60 * 60 * 1000, // 最後に食事した時刻（初期：丁度いい）
        lastRegenTime: Date.now(), // 最後にパワーが回復した時刻
        job: '無職',
        jobLevel: 0,
        jobExp: 0,
        currentJobId: null, // 現在の職業ID
        jobClass: 1, // 現在のクラス（1=初級, 2=中級, 3=上級）
        workCount: 0, // 出勤回数（今日の回数・病気判定用）
        lastWorkTime: null, // 最終出勤時刻
        spouse: null,
        lover: null,
        possessions: [], // 所有物（アイテム全般）
        shopInventory: [], // マイホームショップの仕入れ商品
        shopDescription: '', // マイホームショップの説明文
        disease: null, // 現在の病気（null = 健康）
        mealCount: 0, // 食事回数（病気判定用）
        targetJob: null, // 目標の職業ID（単一）
        targetJobTier: null, // 目標職業のクラス（1=初級, 2=中級, 3=上級）
        birthday: null, // 生年月日 { year, month, day }
        // 能力値
        abilities: {
            国語: 15,
            数学: 15,
            理科: 15,
            社会: 15,
            英語: 15,
            音楽: 15,
            美術: 15,
            体力: 15,
            気力: 15,
            ルックス: 15,
            素早さ: 15,
            面白さ: 15,
            優しさ: 15,
            エロさ: 15
        }
    },
    currentLocation: null,
    day: 1,
    actionCount: 0,
    lastDiseaseCheckDate: null, // 最後に病気チェックした日付（YYYY-MM-DD）
    lastDiseaseOccurredDate: null, // 最後に病気になった日付（重複防止用）
    lastWorkCountDate: null, // 出勤カウントをリセットした日付（当日分のみ管理）
    lastGikkuriCheckDate: null, // ぎっくり腰チェックを実行した日付（1日1回制限）
    lastInterestDate: null, // 預金利息を付与した日付（1日1回）
    // マイホームショップ仕入れ在庫
    shopStock: [],
    // 問屋の残り在庫（アイテム名: 残数）
    tonyaStock: {},
    lastTonyaStockResetDate: null,
    // 銀行預金
    savings: 30000000,
    // 入出金履歴（最新100件）
    bankHistory: [],
    // 掲示板データ
    boardPosts: [],
    boardNextId: 1,
    // お絵かき掲示板
    oekakiPosts: [],
    oekakiLiked: [],
    oekakiBookmarked: [],
    // 自己紹介掲示板
    profileBoardPost: null,
    favoritedProfiles: [],
    // つぶやきデータ
    tweets: [],
    tweetNextId: 1,
    tweetLikes: [],
    lastTweetTime: null,
    lastGymTime: null,
    lastSchoolTime: null,
    lastEmergencySupport: null,
    coinTree: {
        date: null,
        y: null,
        x: null,
        amount: null,
        collected: false
    },
    likedAnswers: [],
    likedBulletins: [],
    // カードゲームデータ
    cardGame: {
        tableCards: [],   // 現在のチェーン上のカード
        lastCard: null,   // 前の人が引いたカード（これと違う数字を引く必要がある）
        history: [],      // 最近のゲーム履歴（最大20件）
        lastDrawDate: null // 最後にカードを引いた日付（YYYY-MM-DD）
    },
    // メールボックスデータ
    mailbox: {
        inbox: [
            {
                id: 1,
                from: '管理人',
                fromAvatar: '🐻',
                fromAvatarBg: '#D4A017',
                subject: 'メインストリートへようこそ！',
                body: 'ふらっとタウンへようこそ！\n\nこの街は、ふらっと立ち寄って、\n自分のペースで過ごせる場所です🏡\n\nなんとなく歩いたり、\n誰かのつぶやきを見たり、\nこんな風にお手紙を書いて交流することもできますよ✉️✨️\n\n{{name}}さんなりの過ごし方を、\n見つけてみてくださいね🌷',
                date: Date.now() - 1000 * 60 * 60 * 24 * 3,
                read: false,
                starred: false,
                designImg: 'letter/flower2.png',
                fontFamily: 'gothic',
                fontSize: 13,
                honorific: 'さま'
            }
        ],
        sent: [],
        draft: [],
        favorites: [],
        later: [],
        trash: []
    },
    mailNextId: 2,
    // 通知データ
    notifications: [
        { id: 1, type: 'news', fromName: '管理人', fromAvatar: '🐻', fromAvatarBg: '#D4A017', title: 'ふらっとタウンへようこそ！', postSnippet: 'タウンの使い方や各施設の説明はこちらをご覧ください。', date: Date.now() - 24 * 60 * 60 * 1000, read: false },
    ],
    notifNextId: 2,
    // 温泉コンビニ購入記録（1日1個制限用）
    onsenShopPurchaseDate: null, // 最後に購入した日付(YYYY-MM-DD)
    onsenShopPurchased: [], // その日に購入済みの商品名リスト
    // アイテム使用間隔記録（{ itemName: timestamp }）
    itemCooldowns: {},
    // チャレンジ報酬受取日（YYYY-MM-DD）
    lastChallengeRewardDate: null,
    // 納税イベント最終発生日時（ISO文字列）
    lastTaxEventDate: null,
    // ランダムイベント保留フラグ
    pendingRandomEvent: false
};

// ============================================
// ユーティリティ
// ============================================
function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

// ============================================
// マイホームをマップに反映（ロード後に呼ぶ）
// ============================================
function setHouseOnMap(row, col, houseId) {
    townMap[row][col] = 'myhouse';
    mapTiles[row][col] = `house/${houseId}.png`;
    if (typeof townMapIcon !== 'undefined' && townMapIcon[row]) {
        townMapIcon[row][col] = `house/${houseId}`;
    }
}

function restoreHouseOnMap() {
    const house = gameState.player.house;
    if (!house) return;
    setHouseOnMap(house.row, house.col, house.houseId);
}

// ============================================
// 初期化
// ============================================
function init() {
    loadGame(); // セーブデータがあれば復元
    restoreHouseOnMap(); // セーブされた家をマップに反映
    updateBackground(); // 時間帯に応じた背景を設定
    renderMap();
    updateStatus();
    updateSlotIndicator(); // スロット番号表示
    updateMailBadges(); // メールアイコンバッジを初期表示

    renderTweetList();
    setupTweetInfiniteScroll(); // 無限スクロール設定

    // 最初はマップを表示（施設に移動しない）
    document.getElementById('mapView').style.display = 'block';
    document.getElementById('actionView').style.display = 'none';
    document.getElementById('tweetView').style.display = 'none';

    // ローディングオーバーレイを非表示
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';

    // 初回登録
    if (!gameState.player.birthday) {
        showInitialRegistration();
    }
}

// ============================================
// 時間帯別背景設定
// ============================================
function updateBackground() {
    const hour = new Date().getHours();
    const body = document.body;

    // 既存の背景クラスを削除
    body.classList.remove('bg-day', 'bg-evening', 'bg-night');

    // 時間帯に応じてクラスを追加
    if (hour >= 5 && hour < 15) {
        // 5:00〜15:00 → 昼
        body.classList.add('bg-day');
    } else if (hour >= 15 && hour < 18) {
        // 15:00〜18:00 → 夕方
        body.classList.add('bg-evening');
    } else {
        // 18:00〜5:00 → 夜
        body.classList.add('bg-night');
    }
}

// ============================================
// モーダル操作
// ============================================

function openNameModal() {
    document.getElementById('nameInput').value = gameState.player.name;
    document.getElementById('nameModal').classList.add('active');
}

function closeNameModal() {
    document.getElementById('nameModal').classList.remove('active');
}

function saveName() {
    const newName = document.getElementById('nameInput').value.trim();
    if (newName && newName.length <= 10) {
        gameState.player.name = newName;
        updateStatus();
        closeNameModal();
    }
}

// ============================================
// マップ描画
// ============================================
// タイル名 → place ID マッピング表（新マップフォーマット用）
const tileToPlace = {
    // 施設名の読み替え
    'jinja':    'temple',
    'keiziban': 'board',
    'syokudo':  'shokudo',
    'ginkou':   'bank',
    'store':    'shop2',
    'game':     'arcade',
    'tonya':    'tonya',
    'bill':     'chintai',
    'kouji':    'kouji',
    // 道路タイル（クリック・ホバー無効）
    'yoko_road':  'road',
    'tate_road':  'road',
    'hodou_yoko': 'road',
    'hodou_tate': 'road',
    'hodou_big3': 'road',
    'hodou_big4': 'road',
    'T_yoko':     'road',
    'T_sita':     'road',
    'T_hidari':   'road',
    'T_ue':       'road',
    '+':          'road',
    'hyossiki2':  'border',
    // 木タイル（コインチェック有効）
    'tree':  'tree',
    'tree2': 'tree',
};

function renderMap() {
    const mapTable = document.getElementById('townMap');
    const labelsTop = document.getElementById('mapLabelsTop');
    const labelsLeft = document.getElementById('mapLabelsLeft');
    mapTable.innerHTML = '';
    labelsTop.innerHTML = '';
    labelsLeft.innerHTML = '';

    // 新フォーマット（townMapBg/townMapIcon）が使えるか判定
    const useNewFormat = typeof townMapBg !== 'undefined' && townMapBg !== null
                      && typeof townMapIcon !== 'undefined' && townMapIcon !== null;

    const numRows = useNewFormat ? townMapBg.length : townMap.length;
    const numCols = useNewFormat ? townMapBg[0].length : townMap[0].length;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // 上部ラベル（横軸の数字）
    for (let x = 1; x <= numCols; x++) {
        const label = document.createElement('div');
        label.classList.add('map-label', 'map-label-top');
        label.textContent = x;
        labelsTop.appendChild(label);
    }

    // 左側ラベル（縦軸 A, B, C...）
    for (let y = 0; y < numRows; y++) {
        const label = document.createElement('div');
        label.classList.add('map-label', 'map-label-left');
        label.textContent = alphabet[y] || (y + 1);
        labelsLeft.appendChild(label);
    }

    // マップ本体
    for (let y = 0; y < numRows; y++) {
        const row = document.createElement('tr');

        for (let x = 0; x < numCols; x++) {
            const cell = document.createElement('td');
            let placeId, tileForInfo;

            if (useNewFormat) {
                // 新フォーマット：bg + icon の2レイヤー
                const bgName = townMapBg[y] ? townMapBg[y][x] : null;
                const iconName = townMapIcon[y] ? townMapIcon[y][x] : null;
                const rawId = iconName || bgName || 'tree';
                placeId = tileToPlace[rawId] || rawId;
                // house/* タイルはmyhouseとして扱う
                if (rawId && rawId.startsWith('house/')) placeId = 'myhouse';
                tileForInfo = iconName;

                // bg は Safari でも確実に描画されるよう td の background-image に設定
                if (bgName) {
                    cell.style.backgroundImage = `url('mapimg/${bgName}.png')`;
                    cell.style.backgroundSize = 'cover';
                    cell.style.backgroundPosition = 'center';
                }
                if (iconName) {
                    cell.innerHTML = `<img src="mapimg/${iconName}.png" class="tile-img tile-icon" alt="${iconName}">`;
                } else if (!bgName) {
                    const place = places[placeId];
                    cell.innerHTML = `<span class="emoji">${place ? place.emoji : ''}</span>`;
                }

                // ホバーエフェクト無効化：placesに登録のない背景タイルや道路・木・空き地
                const noHoverIds = ['road', 'tree', 'sale'];
                const isNoHover = noHoverIds.includes(placeId) || !places[placeId];
                if (isNoHover) cell.classList.add('no-hover');
                if (placeId === 'road') cell.classList.add('road-tile');
            } else {
                // 旧フォーマット：townMap + mapTiles（後方互換）
                placeId = townMap[y][x];
                const place = places[placeId];
                const tile = mapTiles[y][x];
                tileForInfo = tile;

                if (tile) {
                    const imgPath = tile.includes('/') ? `${tile}.png` : `tree&road/${tile}.png`;
                    cell.innerHTML = `<img src="${imgPath}" alt="${tile}" class="tile-img">`;
                } else {
                    cell.innerHTML = `<span class="emoji">${place ? place.emoji : ''}</span>`;
                }

                const noHoverTiles = ['T', '+', 'Y', 'L', 'K', 'S'];
                if (noHoverTiles.includes(tile)) cell.classList.add('no-hover');
            }

            cell.dataset.place = placeId;
            if (placeId === 'road') cell.classList.add('road');

            cell.addEventListener('click', () => moveTo(placeId, y, x));
            cell.addEventListener('mouseenter', () => showPlaceInfo(placeId, tileForInfo, y, x));
            cell.addEventListener('mouseleave', () => hidePlaceInfo());
            row.appendChild(cell);
        }
        mapTable.appendChild(row);
    }
}

// ============================================
// マップホバー説明表示
// ============================================
function showPlaceInfo(placeId, tile, tileY, tileX) {
    const place = places[placeId];
    const infoBox = document.getElementById('placeInfoBox');

    if (placeId === 'tree') {
        // 木タイルはコインチェックを先に行う
        initDailyCoin();
        const coin = gameState.coinTree;
        if (!coin.collected && coin.y === tileY && coin.x === tileX) {
            infoBox.textContent = 'おや...？なにか落ちている...？';
        } else {
            infoBox.textContent = '';
        }
    } else if (placeId === 'board') {
        const boardNames = {
            '3,8': '📋 自己紹介掲示板',
            '5,3': '❓ ギモン解決！BBS',
            '9,9': '☀️ ハッピー掲示板',
            '7,13': '🎨 お絵かき掲示板',
        };
        infoBox.textContent = boardNames[`${tileY},${tileX}`] || '掲示板';
    } else if (placeId === 'road') {
        infoBox.textContent = '';
    } else if (placeId === 'sale') {
        infoBox.textContent = 'この場所に家を建てることができます';
    } else if (place) {
        infoBox.textContent = place.mapDescription || place.description || '';
    } else {
        // 旧フォーマット用フォールバック（タイルコード直接チェック）
        if (['T', '+', 'Y', 'L', 'K'].includes(tile)) {
            infoBox.textContent = '';
        } else if (tile === 'S') {
            infoBox.textContent = 'この場所に家を建てることができます';
        } else if (tile === 'H') {
            infoBox.textContent = '他のタウンに移動します。※ただいま建設工事中';
        } else {
            infoBox.textContent = '';
        }
    }
    infoBox.classList.add('visible');
}

function showStatusInfo(text) {
    const infoBox = document.getElementById('placeInfoBox');
    infoBox.textContent = text;
    infoBox.classList.add('visible');
}

function showWorkInfo() {
    const infoBox = document.getElementById('placeInfoBox');
    const p = gameState.player;
    if (p.job === '無職') {
        infoBox.textContent = '仕事に出かけます。※職に就いていません';
    } else {
        const currentLevel = getCurrentJobLevel();
        const nextLevel = jobLevels[currentLevel.level] || null;
        const expToNext = nextLevel ? nextLevel.expRequired - p.jobExp : 0;
        const nextText = nextLevel ? `次のLvまであと ${expToNext}` : 'MAX';
        infoBox.textContent = `仕事に出かけます。【現在】Lv.${currentLevel.level} | 経験値 ${p.jobExp} | ${nextText}`;
    }
    infoBox.classList.add('visible');
}

function hidePlaceInfo() {
    const infoBox = document.getElementById('placeInfoBox');
    infoBox.classList.remove('visible');
    infoBox.textContent = '';
}

// ============================================
// 移動
// ============================================
function moveTo(placeId, tileY, tileX) {
    const place = places[placeId];
    if (!place) return;

    // 道・空き地・準備中施設はクリックしても何もしない
    if (placeId === 'road' || placeId === 'sale' || placeId === 'chintai' || placeId === 'kouji') {
        return;
    }

    // 木：コインが落ちているかチェック
    if (placeId === 'tree') {
        checkTreeCoin(tileY, tileX);
        return;
    }

    gameState.currentLocation = placeId;

    // マップの現在地表示を更新
    document.querySelectorAll('.town-map td').forEach(cell => {
        cell.classList.remove('current');
        if (cell.dataset.place === placeId) {
            cell.classList.add('current');
        }
    });

    // 役場は直接モーダルを開く
    if (placeId === 'yakuba') {
        openYakubaModal();
        return;
    }

    // 温泉は直接モーダルを開く
    if (placeId === 'onsen') {
        openOnsenLobby();
        return;
    }

    // 掲示板は座標ごとに種別を判定して直接モーダルを開く
    if (placeId === 'board') {
        // D-9(y=3,x=8)=自己紹介 / F-4(y=5,x=3)=ギモン解決 / J-10(y=9,x=9)=ハッピー / H-14(y=7,x=13)=お絵かき
        let boardType = 'question'; // デフォルト（念のため）
        if (tileY === 3 && tileX === 8) boardType = 'intro';
        else if (tileY === 5 && tileX === 3) boardType = 'question';
        else if (tileY === 9 && tileX === 9) boardType = 'happy';
        else if (tileY === 7 && tileX === 13) boardType = 'oekaki';
        openBoard(boardType);
        return;
    }

    // マイホームは直接モーダルを開く
    if (placeId === 'myhouse') {
        openMyHome();
        return;
    }

    // 不動産屋は直接モーダルを開く
    if (placeId === 'hudosan') {
        openHudosan();
        return;
    }

    // 食堂は直接モーダルを開く
    if (placeId === 'shokudo') {
        openShokudo();
        return;
    }

    // 職業安定所は直接モーダルを開く
    if (placeId === 'work') {
        openHelloworkModal();
        return;
    }

    // 新デパートは直接モーダルを開く
    if (placeId === 'shop2') {
        openShop2();
        return;
    }

    // ジムは直接モーダルを開く
    if (placeId === 'gym') {
        openGymModal();
        return;
    }

    // 習い事スクールは直接モーダルを開く
    if (placeId === 'school') {
        openSchoolModal();
        return;
    }

    // 銀行は直接モーダルを開く
    if (placeId === 'bank') {
        openBankModal();
        return;
    }

    // 病院は直接モーダルを開く
    if (placeId === 'hospital') {
        openHospitalModal();
        return;
    }

    // ゲームセンター
    if (placeId === 'arcade') {
        openArcadeModal();
        return;
    }

    // 問屋
    if (placeId === 'tonya') {
        openTonyaModal();
        return;
    }


    // アクションビューを表示
    showActionView(place);
}

// ============================================
// アクションビュー表示
// ============================================
// 現在のアクションを保存するグローバル配列
let currentActions = [];

function showActionView(place) {
    // マップを非表示、アクションビューを表示
    document.getElementById('mapView').style.display = 'none';
    document.getElementById('actionView').style.display = 'block';

    const titleEl = document.getElementById('actionViewTitle');
    const descEl = document.getElementById('actionViewDesc');

    // タイトルを非表示
    titleEl.style.display = 'none';

    // 説明文を設定（HTMLタグ対応）
    descEl.innerHTML = place.description;

    // 説明の背景を非表示、フォント設定
    descEl.style.background = 'none';
    descEl.style.border = 'none';
    descEl.style.boxShadow = 'none';
    descEl.style.fontFamily = '"ヒラギノ角ゴシック", "Hiragino Sans", sans-serif';
    descEl.style.color = '#333333';


    // 施設スタイルのリセット
    document.getElementById('actionButtons').classList.remove('shop-buttons');
    document.querySelector('.action-view-content').style.borderColor = '';

    // アクションを保存
    currentActions = place.actions;

    // アクションボタンを生成
    const buttonsContainer = document.getElementById('actionButtons');
    let html = '';

    place.actions.forEach((action, index) => {
        const descHtml = action.description ? `<span class="action-btn-desc">${action.description}</span>` : '';
        html += `
            <button class="btn btn-primary action-btn" onclick="executeAction(${index})">
                <span class="action-btn-name">${action.name}</span>
                ${descHtml}
            </button>
        `;
    });

    buttonsContainer.innerHTML = html;

    // 商店スタイルの適用
    if (place === places.shop) {
        buttonsContainer.classList.add('shop-buttons');
    }
}

// アクション実行関数
function executeAction(index) {
    if (currentActions[index] && currentActions[index].effect) {
        currentActions[index].effect();
    }
}

// ============================================
// マップに戻る
// ============================================
function backToMap() {
    hideRandomEvent();
    document.getElementById('mapView').style.display = 'block';
    document.getElementById('actionView').style.display = 'none';
    document.getElementById('tweetView').style.display = 'none';
    // アクション後のみランダムイベント判定
    flushRandomEvent();
}

// ============================================
// ステータス更新
// ============================================
function updateStatus() {
    const p = gameState.player;

    // 基本情報
    document.getElementById('playerAvatar').innerHTML = `<img src="${p.avatar}" alt="アバター" class="player-avatar-img">`;
    document.getElementById('playerAvatar').style.backgroundColor = p.avatarBgColor;
    document.getElementById('playerName').textContent = p.birthday ? p.name : '--';
    const moneyEl = document.getElementById('money');
    moneyEl.textContent = p.money.toLocaleString();
    moneyEl.classList.toggle('money-negative', p.money < 0);

    // 総資産計算（所持金 + 銀行預金）
    document.getElementById('totalAssets').textContent = (p.money + gameState.savings).toLocaleString();

    // 職業
    document.getElementById('playerJob').textContent = p.job;
    const jobLevel = getCurrentJobLevel();
    document.getElementById('playerJobLevel').textContent = p.currentJobId ? `Lv.${jobLevel.level}` : '';

    // 未登録時は身体ステータスをすべて「--」で表示
    if (!p.birthday) {
        ['health', 'maxHealth', 'intelligence', 'maxIntelligence', 'weight', 'height', 'bodyFat'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '--';
        });
        const healthBar = document.getElementById('healthBar');
        const intelligenceBar = document.getElementById('intelligenceBar');
        if (healthBar) healthBar.style.width = '0%';
        if (intelligenceBar) intelligenceBar.style.width = '0%';
        const hungerEl = document.getElementById('hungerText');
        if (hungerEl) { hungerEl.textContent = '--'; hungerEl.style.color = ''; }
        const conditionEl = document.getElementById('condition');
        if (conditionEl) { conditionEl.textContent = '--'; conditionEl.style.color = ''; }
        const bmiLabelEl = document.getElementById('bodyFatLabel');
        if (bmiLabelEl) { bmiLabelEl.textContent = ''; bmiLabelEl.className = 'body-fat-label'; }
        renderPossessions();
        return;
    }

    // 身体ステータス
    document.getElementById('health').textContent = Math.floor(p.health);
    document.getElementById('maxHealth').textContent = p.maxHealth;
    document.getElementById('intelligence').textContent = Math.floor(p.intelligence);
    document.getElementById('maxIntelligence').textContent = p.maxIntelligence;
    document.getElementById('weight').textContent = p.weight.toFixed(1);
    document.getElementById('height').textContent = p.height;

    // BMI計算: 体重(kg) ÷ {身長(m) × 身長(m)}
    const bmi = calculateBMI(p);
    document.getElementById('bodyFat').textContent = bmi.toFixed(1);

    // バー更新
    const healthPercent = p.health / p.maxHealth * 100;
    const intelligencePercent = p.intelligence / p.maxIntelligence * 100;

    const healthBar = document.getElementById('healthBar');
    const intelligenceBar = document.getElementById('intelligenceBar');

    if (healthBar) {
        healthBar.style.width = healthPercent + '%';
        healthBar.style.background = getBarColor(healthPercent);
    }
    if (intelligenceBar) {
        intelligenceBar.style.width = intelligencePercent + '%';
        intelligenceBar.style.background = getBarColor(intelligencePercent);
    }

    // 空腹度テキスト
    const hungerResult = getHungerText();
    const hungerEl = document.getElementById('hungerText');
    if (hungerEl) {
        hungerEl.textContent = hungerResult.text;
        hungerEl.style.color = hungerResult.isWarning ? '#EB6101' : '';
    }

    // コンディション
    const condition = getCondition();
    const conditionEl = document.getElementById('condition');
    if (conditionEl) {
        conditionEl.textContent = condition.text;
        conditionEl.style.color = condition.class === 'bad' ? '#D32F2F' : '';
    }

    // BMIラベル
    const bmiLabel = getBMILabel(bmi);
    const bmiLabelEl = document.getElementById('bodyFatLabel');
    if (bmiLabelEl) {
        bmiLabelEl.textContent = bmiLabel.text;
        bmiLabelEl.className = 'body-fat-label ' + bmiLabel.class;
    }

    // 所有物更新
    renderPossessions();
}

// ============================================
// 職業レベル取得
// ============================================
function getCurrentJobLevel() {
    const exp = gameState.player.jobExp;
    for (let i = jobLevels.length - 1; i >= 0; i--) {
        if (exp >= jobLevels[i].expRequired) {
            return jobLevels[i];
        }
    }
    return jobLevels[0];
}

// プレイヤーの現在クラスを返す（1=初級, 2=中級, 3=上級）
// jobClass フィールドを優先参照。旧セーブデータ互換のため未定義時は job.names で検索してフォールバック。
function getPlayerCurrentClass() {
    const p = gameState.player;
    if (!p.currentJobId) return 1;
    if (p.jobClass) return p.jobClass;
    // 旧セーブデータ向けフォールバック（job.names の文字列検索）
    const job = jobsData.find(j => j.id === p.currentJobId);
    if (!job) return 1;
    const idx = job.names.indexOf(p.job);
    return idx >= 0 ? idx + 1 : 1;
}

// クラスアップ条件を満たしていれば昇格し、新クラス番号を返す（なければ null）
function checkAndApplyClassUp() {
    const p = gameState.player;
    if (!p.currentJobId) return null;
    const job = jobsData.find(j => j.id === p.currentJobId);
    if (!job) return null;

    const currentClass = getPlayerCurrentClass();
    const nextClass = currentClass + 1;
    if (nextClass > 3) return null;

    // 次クラスの能力値条件をチェック
    const tierData = getJobTierData(job, nextClass);
    const abilityKeys = ['国語', '数学', '理科', '社会', '英語', '音楽', '美術', '体力', '気力', 'ルックス', '素早さ', '面白さ', '優しさ', 'エロさ'];
    const abilitiesMet = abilityKeys.every(key => p.abilities[key] >= tierData.abilities[key]);
    if (!abilitiesMet) return null;

    p.job = job.names[nextClass - 1];
    p.jobClass = nextClass;
    p.jobExp = 0;
    return nextClass;
}

// ============================================
// 空腹度テキスト（時間ベース）
// ============================================

// 空腹度ステージ定義（startHours: そのステージの開始時間）
const hungerStages = [
    { stage: 1, text: '満腹（食事できません）', isWarning: true, startHours: 0 },
    { stage: 2, text: '丁度いい', isWarning: false, startHours: 2 },
    { stage: 3, text: 'やや空腹', isWarning: false, startHours: 8 },
    { stage: 4, text: '空腹', isWarning: false, startHours: 16 },
    { stage: 5, text: 'かなり空腹', isWarning: false, startHours: 24 },
    { stage: 6, text: '死にそう⋯', isWarning: true, startHours: 72 }
];

function getHungerText() {
    const lastMeal = gameState.player.lastMealTime;
    const now = Date.now();
    // lastMealTime が無効な場合は73時間前として扱う（死にそう状態）
    const elapsed = (typeof lastMeal === 'number' && isFinite(lastMeal)) ? now - lastMeal : 73 * 60 * 60 * 1000;
    const hoursElapsed = elapsed / (1000 * 60 * 60);

    // 後ろから判定して該当ステージを返す
    for (let i = hungerStages.length - 1; i >= 0; i--) {
        if (hoursElapsed >= hungerStages[i].startHours) {
            return { text: hungerStages[i].text, isWarning: hungerStages[i].isWarning, stage: hungerStages[i].stage };
        }
    }
    // フォールバック：死にそう（stage 6）
    return { text: hungerStages[5].text, isWarning: hungerStages[5].isWarning, stage: 6 };
}

// ============================================
// コンディション判定
// ============================================
function getCondition() {
    const p = gameState.player;
    const hungerStatus = getHungerText();

    // 死にそうな状態 → 絶不調
    if (hungerStatus.text === '死にそう⋯') {
        return { text: '絶不調', class: 'bad' };
    }
    // 病気の場合は病名を表示
    if (p.disease) {
        const diseaseInfo = diseasesData.find(d => d.id === p.disease);
        if (diseaseInfo) {
            return { text: diseaseInfo.name, class: 'bad' };
        }
    }

    // 「最高」判定：空腹度が丁度いい & 身体・頭脳パワー両方95%以上 & BMI 17~30
    const hpRatio = p.health / p.maxHealth;
    const intRatio = p.intelligence / p.maxIntelligence;
    const bmi = calculateBMI(p);
    if (hungerStatus.text === '丁度いい' && hpRatio >= 0.95 && intRatio >= 0.95 && bmi >= 17 && bmi < 30) {
        return { text: '最高', class: 'best' };
    }

    // 身体パワー + 頭脳パワーの合計で判定
    const totalPower = p.health + p.intelligence;
    const maxTotalPower = p.maxHealth + p.maxIntelligence;
    const powerRatio = totalPower / maxTotalPower;

    if (powerRatio >= 0.8) {
        return { text: '良好', class: 'good' };
    }
    if (powerRatio >= 0.5) {
        return { text: '普通', class: 'normal' };
    }
    if (powerRatio >= 0.3) {
        return { text: '悪い', class: 'tired' };
    }
    return { text: 'かなり悪い', class: 'bad' };
}

// ============================================
// BMIラベル
// ============================================
function getBMILabel(bmi) {
    if (bmi < 17) return { text: 'やせすぎ', class: 'thin' };
    if (bmi < 18.5) return { text: 'やせ', class: 'thin' };
    if (bmi < 25) return { text: '普通', class: 'normal' };
    if (bmi < 30) return { text: 'やや肥満', class: 'overweight' };
    return { text: '太りすぎ', class: 'overweight' };
}

function calculateBMI(player) {
    const h = player.height / 100;
    return player.weight / (h * h);
}

function getBarColor(percent) {
    if (percent <= 10) return '#EB6101';
    if (percent <= 50) return '#EAD504';
    return '#329E27';
}

// ============================================
// 所有物描画
// ============================================
function renderPossessions() {
    const container = document.getElementById('possessions');
    if (!container) return; // 要素が存在しない場合はスキップ

    const poss = gameState.player.possessions;

    if (poss.length === 0) {
        container.innerHTML = '<div class="empty-inventory">何も持っていません</div>';
        return;
    }

    // アイテムをグループ化（同じ名前のアイテムをまとめる）
    const grouped = {};
    poss.forEach(item => {
        if (grouped[item.name]) {
            grouped[item.name].count++;
        } else {
            grouped[item.name] = { ...item, count: 1 };
        }
    });

    let html = '';
    Object.values(grouped).forEach(item => {
        const isConsumable = item.consumable;
        const countBadge = item.count > 1 ? `<span class="possession-count">×${item.count}</span>` : '';
        const useButton = isConsumable ? `<button class="btn-use" onclick="useItem('${item.name}')">使う</button>` : '';

        html += `
            <div class="possession-item ${isConsumable ? 'consumable' : ''}">
                <span class="possession-emoji">${item.emoji || ''}</span>
                <span class="possession-name">${item.name}</span>
                ${countBadge}
                ${useButton}
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// アイテム使用
// ============================================

// '15分' → 15 * 60 * 1000 ms に変換
function parseCooldownMs(cooldownStr) {
    if (!cooldownStr || cooldownStr === '0分') return 0;
    const match = cooldownStr.match(/^(\d+)分$/);
    return match ? parseInt(match[1]) * 60 * 1000 : 0;
}

function useItem(itemName) {
    const p = gameState.player;
    const itemIndex = p.possessions.findIndex(item => item.name === itemName);

    if (itemIndex === -1) {
        return false;
    }

    const item = p.possessions[itemIndex];
    const shopItem = shopItems.find(si => si.name === itemName) || tonyaItems.find(si => si.name === itemName) || shokudoItems.find(si => si.name === itemName) || onsenShopItems.find(si => si.name === itemName);

    if (!shopItem || !shopItem.consumable) {
        return false;
    }

    // 使用間隔チェック（温泉アイテムはクールダウンなし）
    const isOnsenItem = !!(item.maxHpUp || item.maxIntUp);
    const cooldownMs = isOnsenItem ? 0 : parseCooldownMs(shopItem.cooldown);
    if (cooldownMs > 0) {
        if (!gameState.itemCooldowns) gameState.itemCooldowns = {};
        const lastUsed = gameState.itemCooldowns[itemName];
        if (lastUsed) {
            const elapsed = Date.now() - lastUsed;
            if (elapsed < cooldownMs) {
                const remaining = cooldownMs - elapsed;
                const min = Math.ceil(remaining / 60000);
                showToast(`使用間隔中です。あと${min}分お待ちください。`);
                return false;
            }
        }
    }

    // 病気を治す薬の場合、病気の有無・対応を確認
    if (shopItem.cures) {
        if (!p.disease) {
            showToast('今は病気ではありません。');
            return false;
        }
        const canCure = shopItem.cures === 'all' || shopItem.cures.includes(p.disease);
        if (!canCure) {
            const diseaseInfo = diseasesData.find(d => d.id === p.disease);
            showToast(`${diseaseInfo ? diseaseInfo.name : '病気'}にはこの薬は効きません。`);
            return false;
        }
    }

    // パワーチェック（消費パワーが足りるか確認）
    const bodyConsume = shopItem.bodyConsume || 0;
    const brainConsume = shopItem.brainConsume || 0;
    if (p.health < bodyConsume && p.intelligence < brainConsume) {
        showToast('身体パワーと頭脳パワーが足りません');
        return false;
    } else if (p.health < bodyConsume) {
        showToast('身体パワーが足りません');
        return false;
    } else if (p.intelligence < brainConsume) {
        showToast('頭脳パワーが足りません');
        return false;
    }

    // パワー消費
    p.health = Math.max(0, p.health - bodyConsume);
    p.intelligence = Math.max(0, p.intelligence - brainConsume);

    // 効果を適用
    if (shopItem.effect) {
        if (shopItem.effect.health) {
            changeHealth(shopItem.effect.health);
        }
        if (shopItem.effect.intelligence) {
            changeIntelligence(shopItem.effect.intelligence);
        }
        if (shopItem.effect.weight) {
            changeWeight(shopItem.effect.weight);
        }
        if (shopItem.effect.hunger) {
            eatFood(shopItem.hungerEffect || 1);
        }
        if (shopItem.effect.bodyFat) {
            changeBodyFat(shopItem.effect.bodyFat);
        }
        if (shopItem.effect.height) {
            changeHeight(shopItem.effect.height);
        }
    }

    // 上限値アップ（温泉コンビニ商品）
    if (shopItem.maxHpUp) {
        p.maxHealth += shopItem.maxHpUp;
    }
    if (shopItem.maxIntUp) {
        p.maxIntelligence += shopItem.maxIntUp;
    }

    // カロリーによる体重増加（1000kcal = 1kg）
    if (shopItem.calorie && shopItem.calorie > 0) {
        const weightGain = shopItem.calorie / 1000;
        changeWeight(weightGain);
    }

    // デザート・ドリンクは食べ過ぎで虫歯リスク（mealCountに加算）
    if (shopItem.isSweet) {
        gameState.player.mealCount++;
    }

    // 能力値を適用
    if (shopItem.stats) {
        const stats = shopItem.stats;
        const abilities = p.abilities;

        for (const key in stats) {
            if (key in abilities && stats[key]) {
                abilities[key] += stats[key];
            }
        }
    }

    // 病気を治す
    if (shopItem.cures) {
        p.disease = null;
    }

    // アイテムを消費（残り回数を減らす）
    if (item.remainingUses > 1) {
        item.remainingUses -= 1;
    } else {
        // 残り1個の場合は削除
        p.possessions.splice(itemIndex, 1);
    }

    // 使用間隔を記録
    if (cooldownMs > 0) {
        if (!gameState.itemCooldowns) gameState.itemCooldowns = {};
        gameState.itemCooldowns[itemName] = Date.now();
    }

    updateStatus();
    return true;
}


// ============================================
// ステータス変更ヘルパー
// ============================================
function changeHealth(amount) {
    const p = gameState.player;
    p.health = Math.max(0, Math.min(p.maxHealth, p.health + amount));
    updateStatus();
}

function changeMoney(amount) {
    gameState.player.money += amount;
    updateStatus();
}

function changeIntelligence(amount) {
    const p = gameState.player;
    // ノートパソコン所持で効率UP
    const hasLaptop = p.possessions.some(item => item.name === 'ノートパソコン');
    const finalAmount = hasLaptop && amount > 0 ? amount * 2 : amount;
    p.intelligence = Math.max(0, Math.min(p.maxIntelligence, p.intelligence + finalAmount));
    updateStatus();
}

function changeWeight(amount) {
    gameState.player.weight = Math.max(40, gameState.player.weight + amount);
    updateStatus();
}

function changeHeight(amount) {
    gameState.player.height = Math.max(1, gameState.player.height + amount);
    updateStatus();
}

function changeHunger(amount) {
    // 食事した場合（マイナス値）は lastMealTime をリセット
    if (amount < 0) {
        eatFood();
    }
    // プラス値は何もしない（時間ベースのため）
    updateStatus();
}

// 食事関数（hungerEffectの段階数ぶん空腹度を回復）
function eatFood(stages = 1) {
    const hungerStatus = getHungerText();
    if (hungerStatus.text === '満腹（食事できません）') {
        return false;
    }

    // 現在のステージからstages分だけ回復（最低ステージ1＝満腹）
    const currentStage = hungerStatus.stage;
    const targetStage = Math.max(1, currentStage - stages);

    // 目標ステージの開始時間ぶんだけlastMealTimeを設定
    const targetHours = hungerStages[targetStage - 1].startHours;
    gameState.player.lastMealTime = Date.now() - targetHours * 60 * 60 * 1000;

    gameState.player.mealCount++;
    updateStatus();
    return true;
}

function changeBodyFat(amount) {
    const p = gameState.player;
    p.bodyFat = Math.max(5, Math.min(40, p.bodyFat + amount));
    updateStatus();
}

// ============================================
// アクション後の処理
// ============================================
function afterAction() {
    gameState.actionCount++;
    gameState.pendingRandomEvent = true;
}

// ============================================
// パワー自然回復（30秒に1ポイント）
// ============================================
setInterval(() => {
    const p = gameState.player;
    if (p.health < p.maxHealth) {
        p.health = Math.min(p.maxHealth, p.health + 1);
    }
    if (p.intelligence < p.maxIntelligence) {
        p.intelligence = Math.min(p.maxIntelligence, p.intelligence + 1);
    }
    p.lastRegenTime = Date.now();
    updateStatus();
}, 30000);

// トースト通知
let toastTimer = null;
function showToast(message, duration = 2000) {
    const el = document.getElementById('toastNotification');
    el.textContent = message;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.classList.remove('show');
    }, duration);
}

// ============================================
// 木のコイン
// ============================================
function getTreePositions() {
    const positions = [];
    const useNewFormat = typeof townMapBg !== 'undefined' && townMapBg !== null
                      && typeof townMapIcon !== 'undefined' && townMapIcon !== null;

    if (useNewFormat) {
        // 新フォーマット：描画と同じ townMapIcon を参照して木タイルを検索
        for (let y = 0; y < townMapIcon.length; y++) {
            for (let x = 0; x < townMapIcon[y].length; x++) {
                const icon = townMapIcon[y][x];
                const placeId = (icon && tileToPlace[icon]) || icon;
                if (placeId === 'tree') {
                    positions.push({ y, x });
                }
            }
        }
    } else {
        // 旧フォーマット：townMap を参照
        for (let y = 0; y < townMap.length; y++) {
            for (let x = 0; x < townMap[y].length; x++) {
                if (townMap[y][x] === 'tree') {
                    positions.push({ y, x });
                }
            }
        }
    }
    return positions;
}

function initDailyCoin() {
    const today = todayStr();
    if (gameState.coinTree.date === today) {
        // 保存された座標が現在のマップの木タイルか確認（マップ変更で無効になる場合がある）
        const positions = getTreePositions();
        const isValid = positions.some(p => p.y === gameState.coinTree.y && p.x === gameState.coinTree.x);
        if (isValid) return;
        // 無効な座標なら再初期化
    }

    const positions = getTreePositions();
    if (!positions.length) return;
    const pos = positions[Math.floor(Math.random() * positions.length)];

    // 確率：500(50%) 1000(30%) 3000(12%) 5000(6%) 10000(2%)
    const rand = Math.random() * 100;
    let amount;
    if (rand < 50) amount = 500;
    else if (rand < 80) amount = 1000;
    else if (rand < 92) amount = 3000;
    else if (rand < 98) amount = 5000;
    else amount = 10000;

    gameState.coinTree = {
        date: today,
        y: pos.y,
        x: pos.x,
        amount: amount,
        collected: false
    };
}

function checkTreeCoin(y, x) {
    initDailyCoin();
    const coin = gameState.coinTree;
    if (!coin.collected && coin.y === y && coin.x === x) {
        const el = document.getElementById('treeCoinMessage');
        if (coin.amount >= 5000) {
            el.innerHTML = `超ラッキー！！<br>${coin.amount.toLocaleString()}円を見つけた！！`;
        } else {
            el.textContent = `ラッキー！${coin.amount.toLocaleString()}円を見つけた！`;
        }
        changeMoney(coin.amount);
        coin.collected = true;
        document.getElementById('treeCoinModal').classList.add('active');
    }
}

function collectCoin() {
    closeTreeCoinModal();
}

function closeTreeCoinModal() {
    document.getElementById('treeCoinModal').classList.remove('active');
}


// 神社
function pray() {
    if (gameState.player.money < 100) {
        return;
    }
    changeMoney(-100);
    const luck = Math.random();
    if (luck < 0.3) {
        changeMoney(500);
    } else {
        changeHealth(10);
    }
    afterAction();
}

function drawFortune() {
    if (gameState.player.money < 200) {
        return;
    }
    changeMoney(-200);
    const fortunes = [
        { name: '大吉', effect: () => { changeMoney(1000); return '臨時収入1000円！'; } },
        { name: '吉', effect: () => { changeHealth(20); return '体力+20！'; } },
        { name: '中吉', effect: () => { changeIntelligence(5); return '知力+5！'; } },
        { name: '小吉', effect: () => { changeHealth(10); return '体力+10！'; } },
        { name: '末吉', effect: () => { return '今日は静かに過ごしましょう'; } },
        { name: '凶', effect: () => { changeHealth(-5); return 'ちょっと疲れました...'; } }
    ];
    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    fortune.effect();
    afterAction();
}

// 学校


// ※ランダムイベント・病気チェック → event.js に移動

// ============================================
// 能力値ツールチップ（アバターホバー）
// ============================================
function buildAbilityTooltip() {
    const abilities = gameState.player.abilities;
    const values = Object.values(abilities);
    const maxVal = Math.max(...values, 1);

    let html = '<div class="ab-title">現在の能力値</div>';
    for (const [name, val] of Object.entries(abilities)) {
        const pct = Math.max((val / maxVal) * 100, 15);
        html += `<div class="ab-row">
            <span class="ab-name">${name}</span>
            <div class="ab-bar-outer">
                <div class="ab-bar-inner" style="width:${pct}%">
                    <span class="ab-num">${val}</span>
                </div>
            </div>
        </div>`;
    }
    return html;
}

document.addEventListener('DOMContentLoaded', () => {
    const avatar = document.getElementById('playerAvatar');
    const tooltip = document.getElementById('abilityTooltip');
    if (!avatar || !tooltip) return;

    avatar.addEventListener('mouseenter', () => {
        return; // 能力値グラフは一時非表示
        tooltip.innerHTML = buildAbilityTooltip();
        tooltip.style.display = 'block';

        const rect = avatar.getBoundingClientRect();
        const tw = tooltip.offsetWidth;
        const th = tooltip.offsetHeight;

        // アバターの左側に表示、はみ出したら右側に
        let left = rect.left - tw - 10;
        if (left < 5) left = rect.right + 10;

        // 上端が画面外に出ないよう調整
        let top = rect.top;
        if (top + th > window.innerHeight - 10) {
            top = window.innerHeight - th - 10;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    });

    avatar.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
});

// ============================================
// 起動
// ============================================
window.addEventListener('DOMContentLoaded', init);
