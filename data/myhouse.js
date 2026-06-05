// ============================================
// マイホーム
// ============================================
const myhouseContentDefs = {
    bulletin: { name: '交流掲示板', icon: '📋' },
    shop:     { name: 'ショップ', icon: '🏪' },
    url:      { name: 'ウェブリンク', icon: '🌐' },
    diary:    { name: '家主掲示板', icon: '📖' },
};

let myhouseMode = 'view'; // 'view' | 'settings'
let myhouseActiveContent = null;
let myhouseActiveSetting = null;
let myhouseIsOwner = false;

function openMyHome() {
    const house = gameState.player.house;
    if (!house) return;

    myhouseIsOwner = true;
    myhouseMode = 'view';
    myhouseActiveSetting = null;
    document.getElementById('myhouseModal').classList.remove('settings-mode');

    const contents = house.contents || [];
    const homeId = house.homeContent || 'bulletin';
    myhouseActiveContent = contents.includes(homeId) ? homeId : (contents[0] || null);

    renderMyhouseSidebar();
    if (myhouseActiveContent) {
        renderMyhouseContent(myhouseActiveContent, document.getElementById('myhouseRight'));
    } else {
        document.getElementById('myhouseRight').innerHTML = '';
    }
    document.getElementById('myhouseModal').style.display = 'flex';
}

function renderMyhouseSidebar() {
    const sidebar = document.getElementById('myhouseSidebar');
    const house = gameState.player.house;
    const contents = (house && house.contents) || [];

    if (myhouseMode === 'view') {
        let contentHtml = '';
        if (contents.length === 0) {
            contentHtml = '<p class="myhouse-sb-empty">コンテンツがありません</p>';
        } else {
            const CONTENT_ORDER = ['bulletin', 'shop', 'url', 'diary'];
            contentHtml = CONTENT_ORDER
                .filter(id => contents.includes(id))
                .map(id => {
                    const isActive = id === myhouseActiveContent;
                    const title = getContentTitle(id);
                    return `<button class="myhouse-sb-btn${isActive ? ' active' : ''}" onclick="selectMyhouseContent('${id}', this)">${title}</button>`;
                }).join('');
        }
        sidebar.innerHTML = `
            <div class="myhouse-sb-content">${contentHtml}</div>
            <div class="myhouse-sb-footer">
                <button class="myhouse-sb-setting-btn" onclick="openSaisenModal()"><img src="status/mail/coin.svg" class="myhouse-setting-icon saisen-btn-icon">お賽銭する</button>
                ${myhouseIsOwner ? `<button class="myhouse-sb-setting-btn" onclick="switchMyhouseToSettings()">
                    <img src="status/mail/haguruma.png" class="myhouse-setting-icon">おうち設定
                </button>` : ''}
            </div>`;
    } else {
        const allDefs = [
            { id: 'bulletin', def: myhouseContentDefs.bulletin },
            { id: 'shop',     def: myhouseContentDefs.shop },
            { id: 'url',      def: myhouseContentDefs.url },
            { id: 'diary',    def: myhouseContentDefs.diary },
        ];
        const contentSubHtml = allDefs
            .filter(({ id }) => contents.includes(id))
            .map(({ id, def }) => {
                const isActive = myhouseActiveSetting === `content_${id}`;
                return `<button class="myhouse-sb-sub-btn${isActive ? ' active' : ''}" onclick="selectMyhouseSetting('content_${id}', this)">${def.name}</button>`;
            }).join('');
        const kisekaeActive  = myhouseActiveSetting === 'kisekae';
        const exteriorActive = myhouseActiveSetting === 'exterior';
        const hikkoshiActive = myhouseActiveSetting === 'hikkoshi';
        const sellActive     = myhouseActiveSetting === 'sell';
        sidebar.innerHTML = `
            <div class="myhouse-sb-content">
                <button class="myhouse-sb-top-btn${kisekaeActive ? ' active' : ''}" onclick="selectMyhouseSetting('kisekae', this)">🎨 きせかえ</button>
                <p class="myhouse-sb-section-label">コンテンツ設定</p>
                ${contentSubHtml}
                <p class="myhouse-sb-section-label">おうち全般</p>
                <button class="myhouse-sb-sub-btn${exteriorActive ? ' active' : ''}" onclick="selectMyhouseSetting('exterior', this)">🏠 外装変更</button>
                <button class="myhouse-sb-sub-btn${hikkoshiActive ? ' active' : ''}" onclick="selectMyhouseSetting('hikkoshi', this)">🚚 引っ越し</button>
                <button class="myhouse-sb-sub-btn${sellActive ? ' active' : ''}" onclick="selectMyhouseSetting('sell', this)">💰 売却</button>
            </div>
            <div class="myhouse-sb-footer">
                <button class="myhouse-sb-back-btn" onclick="switchMyhouseToView()">← 本番に戻る</button>
            </div>`;
    }
}

function selectMyhouseContent(id, btn) {
    myhouseActiveContent = id;
    const backBtn = document.getElementById('diaryComposeBackBtn');
    if (backBtn) backBtn.style.display = 'none';
    renderMyhouseSidebar();
    renderMyhouseContent(id, document.getElementById('myhouseRight'));
}

function switchMyhouseToSettings() {
    myhouseMode = 'settings';
    myhouseActiveSetting = null;
    document.getElementById('myhouseModal').classList.add('settings-mode');
    renderMyhouseSidebar();
    document.getElementById('myhouseRight').innerHTML = '';
}

function switchMyhouseToView() {
    myhouseMode = 'view';
    myhouseActiveSetting = null;
    document.getElementById('myhouseModal').classList.remove('settings-mode');

    const house = gameState.player.house;
    const contents = (house && house.contents) || [];
    const homeId = (house && house.homeContent) || 'bulletin';
    myhouseActiveContent = contents.includes(homeId) ? homeId : (contents[0] || null);

    renderMyhouseSidebar();
    if (myhouseActiveContent) {
        renderMyhouseContent(myhouseActiveContent, document.getElementById('myhouseRight'));
    } else {
        document.getElementById('myhouseRight').innerHTML = '';
    }
}

function selectMyhouseSetting(id, btn) {
    myhouseActiveSetting = id;
    renderMyhouseSidebar();
    renderMyhouseSettingArea(id);
}

function renderMyhouseSettingArea(id) {
    const right = document.getElementById('myhouseRight');
    if (id === 'kisekae') {
        right.innerHTML = `<div class="myhouse-placeholder">
            <div class="myhouse-placeholder-icon">🎨</div>
            <div class="myhouse-placeholder-name">きせかえ</div>
            <p class="myhouse-placeholder-msg">準備中です。<br>もうしばらくお待ちください！</p>
        </div>`;
        return;
    }
    if (id.startsWith('content_')) {
        renderContentSettingArea(id.replace('content_', ''));
        return;
    }
    if (id === 'exterior') {
        right.innerHTML = `<div class="myhouse-placeholder">
            <div class="myhouse-placeholder-icon">🏠</div>
            <div class="myhouse-placeholder-name">外装変更</div>
            <p class="myhouse-placeholder-msg">準備中です。<br>もうしばらくお待ちください！</p>
        </div>`;
        return;
    }
    if (id === 'hikkoshi') {
        right.innerHTML = `<div class="myhouse-placeholder">
            <div class="myhouse-placeholder-icon">🚚</div>
            <div class="myhouse-placeholder-name">引っ越し</div>
            <p class="myhouse-placeholder-msg">準備中です。<br>もうしばらくお待ちください！</p>
        </div>`;
        return;
    }
    if (id === 'sell') {
        right.innerHTML = `<div class="myhouse-sell-area">
            <p class="myhouse-sell-title">🏠 家を売却する</p>
            <p class="myhouse-sell-desc">家を売却すると、住所がなくなります。<br>よく考えてから決めてください。</p>
            <button class="myhouse-sell-btn" onclick="alert('売却機能は準備中です。')">家を売却する</button>
        </div>`;
        return;
    }
}

function renderMyhouseContent(contentId, container) {
    const visibility = ((gameState.player.house && gameState.player.house.contentVisibility) || {})[contentId] || 'public';
    if (!myhouseIsOwner && (visibility === 'private' || visibility === 'friends')) {
        const def = myhouseContentDefs[contentId] || { name: contentId, icon: '🏠' };
        const msg = visibility === 'friends' ? 'フレンドのみ公開中です' : '非公開中です';
        container.innerHTML = `
            <div class="myhouse-placeholder">
                <div class="myhouse-placeholder-icon">🔒</div>
                <div class="myhouse-placeholder-name">${escapeHtml(def.name)}は${msg}</div>
                <p class="myhouse-placeholder-msg">このコンテンツは現在非公開に設定されています。</p>
            </div>`;
        return;
    }
    if (contentId === 'bulletin') {
        renderBulletinContent(container);
        return;
    }
    if (contentId === 'url') {
        renderUrlSpaceContent(container);
        return;
    }
    if (contentId === 'diary') {
        renderDiaryContent(container);
        return;
    }
    if (contentId === 'shop') {
        renderMyhouseShopContent(container);
        return;
    }
    const def = myhouseContentDefs[contentId] || { name: contentId, icon: '🏠' };
    container.innerHTML = `
        <div class="myhouse-placeholder">
            <div class="myhouse-placeholder-icon">${def.icon}</div>
            <div class="myhouse-placeholder-name">${escapeHtml(def.name)}</div>
            <p class="myhouse-placeholder-msg">このコンテンツは準備中です。<br>もうしばらくお待ちください！</p>
        </div>`;
}

// ============================================
// マイホーム ショップ コンテンツビュー
// ============================================
let myhouseShopCart = [];

function renderMyhouseShopContent(container) {
    container.innerHTML = `
        <div class="myhouse-shop-view">
            <div class="myhouse-shop-cart-bar">
                <p class="myhouse-shop-desc">${escapeHtml(gameState.player.shopDescription || '')}</p>
                <button class="shop2-cart-open-btn" onclick="openMyhouseShopCart()">
                    <img src="public/icon/cart.png" alt="カート">
                    カートを見る
                    <span class="shop2-cart-badge" id="myhouseShopCartBadge" style="display:none;"></span>
                </button>
            </div>
            <div class="myhouse-shop-listview">
                <div class="shop2-table-container">
                    <table class="shop2-table" id="myhouseShopTable">
                        <thead>
                            <tr class="shop2-header-group">
                                <th rowspan="2">商品名</th>
                                <th colspan="14">アップする能力値</th>
                                <th colspan="2">消費パワー</th>
                                <th rowspan="2">使用<br>回数</th>
                                <th rowspan="2">使用<br>間隔</th>
                                <th rowspan="2">価格</th>
                                <th rowspan="2">在庫</th>
                            </tr>
                            <tr class="shop2-header-sub">
                                <th>国</th><th>数</th><th>理</th><th>社</th><th>英</th>
                                <th>音</th><th>美</th><th>体</th><th>気</th><th>ル</th>
                                <th>素</th><th>面</th><th>優</th><th>エ</th>
                                <th>身体</th><th>頭脳</th>
                            </tr>
                        </thead>
                        <tbody id="myhouseShopTableBody"></tbody>
                    </table>
                </div>
            </div>
            <div class="shop2-cart-overlay" id="myhouseShopCartPanel" style="display:none;">
                <div class="shop2-cart-tab" onclick="closeMyhouseShopCart()">閉じる</div>
                <div class="shop2-cart-overlay-body">
                    <div class="shop2-right-money">
                        現在の所持金<br>
                        <span id="myhouseShopMoneyValue">0円</span>
                    </div>
                    <div class="shop2-cart-title">カート</div>
                    <div class="shop2-cart-items" id="myhouseShopCartItems">
                        <p class="shop2-cart-empty">商品を選んでください</p>
                    </div>
                    <div class="shop2-cart-total">
                        <span>合計</span>
                        <span id="myhouseShopCartTotal">0円</span>
                    </div>
                    <button class="shop2-purchase-btn" id="myhouseShopPurchaseBtn" onclick="alert('購入機能は準備中です。')">購入する</button>
                </div>
            </div>
        </div>`;

    myhouseShopCart = [];
    renderMyhouseShopTable();
}

function buildItemMaps() {
    const itemGenreMap = {};
    const itemOrderMap = {};
    const genreMap = new Map();
    const genreOrder = [];
    let cg = null;
    for (const item of [...shopItems, ...tonyaItems]) {
        if (item.type === 'separator') {
            cg = item.name;
            if (!genreMap.has(cg)) { genreMap.set(cg, []); genreOrder.push(cg); }
        } else if (item.name && cg) {
            const arr = genreMap.get(cg);
            if (!arr.includes(item.name)) arr.push(item.name);
        }
    }
    genreOrder.forEach((genre, gi) => {
        genreMap.get(genre).forEach((name, ii) => {
            itemGenreMap[name] = genre;
            itemOrderMap[name] = gi * 10000 + ii;
        });
    });
    return { itemGenreMap, itemOrderMap };
}

function renderMyhouseShopTable() {
    const tbody = document.getElementById('myhouseShopTableBody');
    if (!tbody) return;

    const abilities = ['国語', '数学', '理科', '社会', '英語', '音楽', '美術', '体力', '気力', 'ルックス', '素早さ', '面白さ', '優しさ', 'エロさ'];

    const { itemGenreMap, itemOrderMap } = buildItemMaps();

    let listedInv = (gameState.shopInventory || []).filter(inv => inv.listed === true && inv.sellPrice > 0);
    listedInv = [...listedInv].sort((a, b) => (itemOrderMap[a.name] ?? 999) - (itemOrderMap[b.name] ?? 999));

    if (listedInv.length === 0) {
        tbody.innerHTML = `<tr><td colspan="21" class="shopinv-empty">陳列中の商品がありません。</td></tr>`;
        return;
    }

    let html = '';
    let lastGenre = null;
    for (const inv of listedInv) {
        const genre = itemGenreMap[inv.name] || '';
        if (genre !== lastGenre) {
            lastGenre = genre;
            html += `<tr class="separator-row"><td colspan="21">${escapeHtml(genre)}</td></tr>`;
        }
        const master = shopItems.find(i => i.name === inv.name) || tonyaItems.find(i => i.name === inv.name) || {};
        const stats = master.stats || {};
        const stockEntry = (gameState.shopStock || []).find(s => s.name === inv.name);
        const displayQty = inv.sellQty !== undefined ? Math.min(inv.sellQty, stockEntry?.quantity || 0) : (stockEntry?.quantity || 0);
        const inCart = myhouseShopCart.some(c => c.name === inv.name);
        const safeNameJs = JSON.stringify(inv.name).replace(/"/g, '&quot;');

        html += `<tr>`;
        html += `<td class="shop2-item-name"><label><input type="checkbox" class="shop2-checkbox myhouse-shop-cb" data-name="${escapeHtml(inv.name)}" ${inCart ? 'checked' : ''} onchange="myhouseShopToggleCart(${safeNameJs}, this.checked)"> ${escapeHtml(inv.name)}</label></td>`;
        for (const ab of abilities) { html += `<td>${stats[ab] || ''}</td>`; }
        html += `<td>${master.bodyConsume || ''}</td>`;
        html += `<td>${master.brainConsume || ''}</td>`;
        html += `<td>${master.useCount || ''}</td>`;
        html += `<td>${master.cooldown || ''}</td>`;
        html += `<td class="shop2-price">${inv.sellPrice.toLocaleString()}円</td>`;
        html += `<td>${displayQty}</td>`;
        html += `</tr>`;
    }
    tbody.innerHTML = html;
}


function myhouseShopToggleCart(itemName, checked) {
    if (checked) {
        const inv = (gameState.shopInventory || []).find(i => i.name === itemName);
        if (inv && !myhouseShopCart.some(c => c.name === itemName)) {
            myhouseShopCart.push({ name: itemName, price: inv.sellPrice, qty: 1 });
        }
    } else {
        const idx = myhouseShopCart.findIndex(c => c.name === itemName);
        if (idx !== -1) myhouseShopCart.splice(idx, 1);
    }
    updateMyhouseShopCartBadge();
    updateMyhouseShopCartPanel();
}

function myhouseShopCartChangeQty(itemName, delta) {
    const item = myhouseShopCart.find(c => c.name === itemName);
    if (!item) return;
    const inv = (gameState.shopInventory || []).find(i => i.name === itemName);
    const stockEntry = (gameState.shopStock || []).find(s => s.name === itemName);
    const maxQty = inv?.sellQty !== undefined
        ? Math.min(inv.sellQty, stockEntry?.quantity || 0)
        : (stockEntry?.quantity || 0);
    item.qty = Math.max(1, Math.min(maxQty, item.qty + delta));
    updateMyhouseShopCartBadge();
    updateMyhouseShopCartPanel();
}

function myhouseShopCartRemove(itemName) {
    const idx = myhouseShopCart.findIndex(c => c.name === itemName);
    if (idx !== -1) myhouseShopCart.splice(idx, 1);
    // テーブルのチェックボックスも外す
    document.querySelectorAll('.myhouse-shop-cb').forEach(cb => {
        if (cb.dataset.name === itemName) cb.checked = false;
    });
    updateMyhouseShopCartBadge();
    updateMyhouseShopCartPanel();
}

function updateMyhouseShopCartBadge() {
    const badge = document.getElementById('myhouseShopCartBadge');
    if (!badge) return;
    const count = myhouseShopCart.reduce((s, c) => s + c.qty, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
}

function updateMyhouseShopCartPanel() {
    const itemsEl = document.getElementById('myhouseShopCartItems');
    const totalEl = document.getElementById('myhouseShopCartTotal');
    if (!itemsEl) return;
    const btn = document.getElementById('myhouseShopPurchaseBtn');
    if (myhouseShopCart.length === 0) {
        itemsEl.innerHTML = '<p class="shop2-cart-empty">商品を選んでください</p>';
        if (totalEl) totalEl.textContent = '0円';
        if (btn) btn.classList.remove('active');
        return;
    }
    let total = 0;
    itemsEl.innerHTML = myhouseShopCart.map(c => {
        const lineTotal = c.price * c.qty;
        total += lineTotal;
        const safeNameJs = JSON.stringify(c.name).replace(/"/g, '&quot;');
        return `<div class="shop2-cart-item">
            <span class="shop2-cart-name">${escapeHtml(c.name)}</span>
            <div class="shop2-cart-qty">
                <button class="shop2-qty-btn" onclick="myhouseShopCartChangeQty(${safeNameJs}, -1)">－</button>
                <span class="shop2-qty-num">${c.qty}</span>
                <button class="shop2-qty-btn" onclick="myhouseShopCartChangeQty(${safeNameJs}, 1)">＋</button>
            </div>
            <span class="shop2-cart-price">${lineTotal.toLocaleString()}円</span>
            <button class="shop2-cart-delete" onclick="myhouseShopCartRemove(${safeNameJs})">
                <img src="public/icon/dustbox2.png" alt="削除">
            </button>
        </div>`;
    }).join('');
    if (totalEl) totalEl.textContent = total.toLocaleString() + '円';
    if (btn) btn.classList.toggle('active', myhouseShopCart.length > 0);
}

function openMyhouseShopCart() {
    const panel = document.getElementById('myhouseShopCartPanel');
    if (!panel) return;
    const moneyEl = document.getElementById('myhouseShopMoneyValue');
    if (moneyEl) moneyEl.textContent = (gameState.player?.money || 0).toLocaleString() + '円';
    updateMyhouseShopCartPanel();
    panel.classList.remove('closing');
    panel.style.display = '';
}

function closeMyhouseShopCart() {
    const panel = document.getElementById('myhouseShopCartPanel');
    if (!panel || panel.style.display === 'none') return;
    panel.classList.add('closing');
    panel.addEventListener('animationend', () => {
        panel.classList.remove('closing');
        panel.style.display = 'none';
    }, { once: true });
}

let urlSlideshowImages = [];
let urlSlideshowIndex  = 0;

function renderUrlSpaceContent(container) {
    const s = (gameState.player.house && gameState.player.house.urlSpace) || {};
    urlSlideshowIndex = 0;

    if (s.hidden) {
        container.innerHTML = `<p class="myhouse-url-empty">URLスペースは非表示に設定されています。</p>`;
        return;
    }

    const images = (s.images || []).filter(Boolean);
    const hasUrl = !!s.url;

    if (!images.length && !hasUrl) {
        container.innerHTML = `<p class="myhouse-url-empty">URLがまだ設定されていません。</p>`;
        return;
    }

    urlSlideshowImages = images;

    let domain = '';
    if (hasUrl) { try { domain = new URL(s.url).hostname; } catch(e) { domain = s.url; } }
    const displayLabel = s.label || domain;

    const counterHtml = images.length > 1
        ? `<span class="url-slideshow-counter" id="urlSlideshowCounter">1 / ${images.length}</span>`
        : '';
    const arrowsHtml = images.length > 1
        ? `<button class="url-slideshow-arrow url-slideshow-prev" onclick="prevUrlSlide()"><img src="house/icon/yajirusi.svg" style="width:18px;transform:scaleX(-1);"></button>
           <button class="url-slideshow-arrow url-slideshow-next" onclick="nextUrlSlide()"><img src="house/icon/yajirusi.svg" style="width:18px;"></button>`
        : '';
    const slideshowHtml = images.length
        ? `<div class="myhouse-url-slideshow">
               ${arrowsHtml}
               ${counterHtml}
               <img id="urlSlideshowImg" src="${images[0]}" class="url-slideshow-img" alt="プレビュー">
           </div>`
        : '';
    const linkHtml = hasUrl
        ? `<div class="myhouse-url-fallback">
               <span class="myhouse-url-fallback-label">${escapeHtml(displayLabel)}</span>
               <a href="${/^https?:\/\//i.test(s.url) ? escapeHtml(s.url) : '#'}" target="_blank" rel="noopener noreferrer"
                   class="myhouse-url-open-btn">開いてみる <img src="house/icon/open.svg" style="width:18px;vertical-align:middle;margin-bottom:2px;"></a>
           </div>`
        : '';

    container.innerHTML = `<div class="myhouse-url-view">${slideshowHtml}${linkHtml}</div>`;
}

function prevUrlSlide() {
    if (urlSlideshowImages.length <= 1) return;
    urlSlideshowIndex = (urlSlideshowIndex - 1 + urlSlideshowImages.length) % urlSlideshowImages.length;
    updateUrlSlideshow();
}
function nextUrlSlide() {
    if (urlSlideshowImages.length <= 1) return;
    urlSlideshowIndex = (urlSlideshowIndex + 1) % urlSlideshowImages.length;
    updateUrlSlideshow();
}
function updateUrlSlideshow() {
    const img = document.getElementById('urlSlideshowImg');
    if (img) img.src = urlSlideshowImages[urlSlideshowIndex];
    const counter = document.getElementById('urlSlideshowCounter');
    if (counter) counter.textContent = `${urlSlideshowIndex + 1} / ${urlSlideshowImages.length}`;
}

function compressImage(file, maxW = 1920, quality = 0.95) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width, h = img.height;
                if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/webp', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function handleUrlImageUpload(index, input) {
    if (!input.files || !input.files[0]) return;
    const compressed = await compressImage(input.files[0]);
    if (!gameState.player.house.urlSpace) gameState.player.house.urlSpace = {};
    if (!gameState.player.house.urlSpace.images) gameState.player.house.urlSpace.images = [];
    const urlInput = document.getElementById('urlSpaceInput');
    const labelInput = document.getElementById('urlLabelInput');
    if (urlInput) gameState.player.house.urlSpace.url = urlInput.value.trim();
    if (labelInput) gameState.player.house.urlSpace.label = labelInput.value.trim();
    gameState.player.house.urlSpace.images[index] = compressed;
    renderContentSettingArea('url');
}

function deleteUrlImage(index) {
    const images = gameState.player.house.urlSpace && gameState.player.house.urlSpace.images;
    if (!images) return;
    const urlInput = document.getElementById('urlSpaceInput');
    const labelInput = document.getElementById('urlLabelInput');
    if (urlInput) gameState.player.house.urlSpace.url = urlInput.value.trim();
    if (labelInput) gameState.player.house.urlSpace.label = labelInput.value.trim();
    images.splice(index, 1);
    renderContentSettingArea('url');
}

/* ─── マイホーム 汎用 ────────────────────────── */
function closeMyHome() {
    document.getElementById('myhouseModal').style.display = 'none';
}

let currentContentSettingId = null;

function saveUrlSpaceSetting() {
    saveContentTitle(currentContentSettingId);
    saveContentVisibility();
    const urlInput = document.getElementById('urlSpaceInput');
    const labelInput = document.getElementById('urlLabelInput');
    if (!urlInput) return;

    const url = urlInput.value.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URLは http:// または https:// から始めてください。');
        return;
    }

    if (!gameState.player.house.urlSpace) gameState.player.house.urlSpace = {};
    gameState.player.house.urlSpace.url   = url;
    gameState.player.house.urlSpace.label = labelInput ? labelInput.value.trim().slice(0, 60) : '';

    saveGame(true);

    const btn = document.querySelector('.myhouse-url-save-btn');
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = '保存しました';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
    }
}


function renderContentSettingArea(contentId) {
    currentContentSettingId = contentId;
    const shopinvBtn = document.getElementById('shopinvBackBtn');
    if (shopinvBtn) shopinvBtn.style.display = 'none';
    const area = document.getElementById('myhouseRight');
    const contents = (gameState.player.house && gameState.player.house.contents) || [];
    const homeId = (gameState.player.house && gameState.player.house.homeContent) || 'bulletin';
    const isHome = homeId === contentId;
    const def = myhouseContentDefs[contentId] || { name: contentId, icon: '🏠' };
    const currentTitle = ((gameState.player.house && gameState.player.house.contentTitles) || {})[contentId] || '';

    const currentVisibility = ((gameState.player.house && gameState.player.house.contentVisibility) || {})[contentId] || 'public';
    const visibilityFieldHtml = `
        <div class="myhouse-setting-row">
            <label class="myhouse-setting-row-label">公開範囲</label>
            <div class="myhouse-setting-row-control">
                <div class="myhouse-visibility-options">
                    <label class="myhouse-visibility-label">
                        <input type="radio" name="contentVisibility" value="public" ${currentVisibility === 'public' ? 'checked' : ''}>
                        全員に公開
                    </label>
                    <label class="myhouse-visibility-label">
                        <input type="radio" name="contentVisibility" value="friends" ${currentVisibility === 'friends' ? 'checked' : ''}>
                        フレンドのみ
                    </label>
                    <label class="myhouse-visibility-label">
                        <input type="radio" name="contentVisibility" value="private" ${currentVisibility === 'private' ? 'checked' : ''}>
                        自分のみ
                    </label>
                </div>
            </div>
        </div>`;

    const titleFieldHtml = `
        <div class="myhouse-setting-row">
            <label class="myhouse-setting-row-label">タイトル</label>
            <div class="myhouse-setting-row-control">
                <div class="myhouse-title-input-row">
                    <input type="text" id="contentTitleInput" class="myhouse-url-input myhouse-title-input"
                        maxlength="10" value="${escapeHtml(currentTitle)}" placeholder="${escapeHtml(def.name)}"
                        oninput="updateTitleCharCount()">
                    <span class="tweet-char-count" id="titleCharCount"></span>
                </div>
            </div>
        </div>`;
    const homeCheckHtml = contents.length <= 1
        ? `<div class="myhouse-setting-row">
            <label class="myhouse-setting-row-label">ホーム画面</label>
            <div class="myhouse-setting-row-control">
                <label style="display:flex;align-items:center;gap:8px;cursor:default;">
                    <input type="checkbox" id="homeContentCheck" checked disabled>
                    <span style="font-size:16px;">このコンテンツをホーム画面にする</span>
                </label>
                <p style="margin:4px 0 0;font-size:12px;color:#999;">コンテンツが1つのため自動設定されています</p>
            </div>
        </div>`
        : `<div class="myhouse-setting-row">
            <label class="myhouse-setting-row-label">ホーム画面</label>
            <div class="myhouse-setting-row-control">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="checkbox" id="homeContentCheck" ${isHome ? 'checked' : ''}
                        onchange="setHomeContent('${contentId}', this.checked)">
                    <span style="font-size:16px;">このコンテンツをホーム画面にする</span>
                </label>
            </div>
        </div>`;

    if (contentId === 'diary') {
        const d = (gameState.player.house && gameState.player.house.diary) || {};
        const visibility = d.visibility || 'public';
        const visibilityOptions = [
            { value: 'public',  label: '全員に公開' },
            { value: 'friends', label: 'フレンドのみ' },
            { value: 'private', label: '自分のみ' },
        ];
        const visibilityHtml = visibilityOptions.map(opt => `
            <label class="myhouse-visibility-label">
                <input type="radio" name="diaryVisibility" value="${opt.value}" ${visibility === opt.value ? 'checked' : ''}>
                ${opt.label}
            </label>`).join('');
        area.innerHTML = `
            <div class="myhouse-right-scroll"><div class="myhouse-url-setting">
                <div class="myhouse-setting-title-row">
                    <p class="myhouse-url-setting-title">${def.name}の設定</p>
                    <button class="myhouse-url-save-btn" id="diarySaveBtn" onclick="saveDiarySetting()">設定を保存</button>
                </div>
                ${titleFieldHtml}
                <div class="myhouse-setting-row">
                    <label class="myhouse-setting-row-label">公開範囲</label>
                    <div class="myhouse-setting-row-control">
                        <div class="myhouse-visibility-options">${visibilityHtml}</div>
                    </div>
                </div>
                ${homeCheckHtml}
            </div></div>`;
        updateTitleCharCount();
        return;
    }

    if (contentId === 'url') {
        const s = (gameState.player.house && gameState.player.house.urlSpace) || {};
        const images = s.images || [];
        let slotsHtml = '';
        for (let i = 0; i < 4; i++) {
            if (images[i]) {
                slotsHtml += `
                    <div class="myhouse-url-slot myhouse-url-slot-filled">
                        <img src="${images[i]}" class="myhouse-url-slot-thumb" alt="プレビュー${i+1}">
                        <button class="myhouse-url-slot-del" onclick="deleteUrlImage(${i})">×</button>
                    </div>`;
            } else {
                slotsHtml += `
                    <div class="myhouse-url-slot myhouse-url-slot-empty"
                        onclick="document.getElementById('urlImgInput_${i}').click()">
                        <span class="myhouse-url-slot-plus">＋</span>
                        <input type="file" id="urlImgInput_${i}" accept="image/*" style="display:none"
                            onchange="handleUrlImageUpload(${i}, this)">
                    </div>`;
            }
        }
        area.innerHTML = `
            <div class="myhouse-right-scroll"><div class="myhouse-url-setting">
                <div class="myhouse-setting-title-row">
                    <p class="myhouse-url-setting-title">${def.name}の設定</p>
                    <button class="myhouse-url-save-btn" onclick="saveUrlSpaceSetting()">設定を保存</button>
                </div>
                ${titleFieldHtml}
                <div class="myhouse-url-group">
                    <div class="myhouse-setting-row">
                        <label class="myhouse-setting-row-label">URL</label>
                        <div class="myhouse-setting-row-control">
                            <input type="url" id="urlSpaceInput" class="myhouse-url-input myhouse-shop-desc-input"
                                value="${escapeHtml(s.url || '')}">
                        </div>
                    </div>
                    <div class="myhouse-setting-row">
                        <label class="myhouse-setting-row-label">紹介文</label>
                        <div class="myhouse-setting-row-control">
                            <input type="text" id="urlLabelInput" class="myhouse-url-input myhouse-shop-desc-input"
                                maxlength="60" oninput="updateUrlLabelCharCount()"
                                value="${escapeHtml(s.label || '')}">
                            <div class="myhouse-shop-desc-footer">
                                <p class="myhouse-url-hint">空欄の場合、URLのドメインが自動表示されます</p>
                                <span class="tweet-char-count" id="urlLabelCharCount"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="myhouse-setting-row">
                    <label class="myhouse-setting-row-label">プレビュー画像</label>
                    <div class="myhouse-setting-row-control">
                        <div class="myhouse-url-slots">${slotsHtml}</div>
                        <p class="myhouse-url-hint">画像をアップロードすると、訪問者に見てもらうことができます。横長サイズ推奨(16:9)</p>
                    </div>
                </div>
                ${homeCheckHtml}
                ${visibilityFieldHtml}
            </div></div>`;
        updateTitleCharCount();
        updateUrlLabelCharCount();
        return;
    }

    if (contentId === 'shop') {
        area.innerHTML = `
            <div class="myhouse-right-scroll"><div class="myhouse-url-setting">
                <div class="myhouse-setting-title-row">
                    <p class="myhouse-url-setting-title">${def.name}の設定</p>
                    <button class="myhouse-url-save-btn" id="shopDescSaveBtn" onclick="saveShopDescription()">設定を保存</button>
                </div>
                ${titleFieldHtml}
                <div class="myhouse-setting-row myhouse-setting-row--top">
                    <label class="myhouse-setting-row-label">ショップの説明文</label>
                    <div class="myhouse-setting-row-control">
                        <textarea class="myhouse-url-input myhouse-shop-desc-input" id="shopDescInput" rows="1" maxlength="60" oninput="onShopDescInput()" onkeydown="if(event.key==='Enter')event.preventDefault()">${escapeHtml(gameState.player.shopDescription || '')}</textarea>
                        <div class="myhouse-shop-desc-footer">
                            <p class="myhouse-url-hint">ショップ画面の上部に表示される説明文です。</p>
                            <span class="tweet-char-count" id="shopDescCharCount"></span>
                        </div>
                        <p class="myhouse-url-error" id="shopDescError" style="display:none;">60文字以内で入力してください</p>
                    </div>
                </div>
                <div class="myhouse-setting-row">
                    <label class="myhouse-setting-row-label">商品の管理</label>
                    <div class="myhouse-setting-row-control">
                        <button class="myhouse-url-save-btn" style="width:fit-content" onclick="openShopInventoryModal()">在庫を管理する</button>
                    </div>
                </div>
                ${homeCheckHtml}
                ${visibilityFieldHtml}
            </div></div>`;
        updateTitleCharCount();
        onShopDescInput();
        return;
    }

    if (contentId === 'bulletin') {
        const bio = (gameState.player.house && gameState.player.house.bio) || '';
        area.innerHTML = `
            <div class="myhouse-right-scroll"><div class="myhouse-url-setting">
                <div class="myhouse-setting-title-row">
                    <p class="myhouse-url-setting-title">${def.name}の設定</p>
                    <button class="myhouse-url-save-btn" onclick="saveProfileBio()">設定を保存</button>
                </div>
                ${titleFieldHtml}
                <div class="myhouse-setting-row myhouse-setting-row--top">
                    <label class="myhouse-setting-row-label">プロフィール紹介文</label>
                    <div class="myhouse-setting-row-control">
                        <textarea id="profileBioInput" class="myhouse-url-input myhouse-bio-input" maxlength="100" rows="3"
                            oninput="updateBioCharCount()"
                            onkeydown="if(event.key==='Enter')event.preventDefault()"
                            >${escapeHtml(bio)}</textarea>
                        <div class="myhouse-bio-footer">
                            <span></span>
                            <span class="tweet-char-count" id="bioCharCount"></span>
                        </div>
                    </div>
                </div>
                ${homeCheckHtml}
                ${visibilityFieldHtml}
            </div></div>`;
        updateTitleCharCount();
        updateBioCharCount();
        return;
    }

    area.innerHTML = `
        <div class="myhouse-right-scroll"><div class="myhouse-url-setting">
            <p class="myhouse-url-setting-title">${def.name}の設定</p>
            ${titleFieldHtml}
            <div class="myhouse-placeholder" style="min-height:180px;">
                <p class="myhouse-placeholder-msg">その他の設定項目は準備中です。<br>もうしばらくお待ちください！</p>
            </div>
            ${homeCheckHtml}
        </div></div>`;
}

// ============================================
// ショップ在庫管理
// ============================================
let shopinvCurrentItem = null;

function onShopDescInput() {
    const input = document.getElementById('shopDescInput');
    const errorEl = document.getElementById('shopDescError');
    const btn = document.getElementById('shopDescSaveBtn');
    const counter = document.getElementById('shopDescCharCount');
    if (!input) return;
    input.value = input.value.replace(/\n/g, '');
    const len = input.value.length;
    const over = len > 60;
    if (errorEl) errorEl.style.display = over ? '' : 'none';
    if (btn) btn.disabled = over;
    if (counter) {
        counter.textContent = `${len} / 60`;
        counter.className = 'tweet-char-count' + (over ? ' at-limit' : len >= 50 ? ' near-limit' : '');
    }
}

function saveShopDescription() {
    saveContentTitle(currentContentSettingId);
    saveContentVisibility();
    const input = document.getElementById('shopDescInput');
    if (!input) return;
    gameState.player.shopDescription = input.value.replace(/\n/g, '').trim().slice(0, 60);
    saveGame(true);
    const btn = document.getElementById('shopDescSaveBtn');
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = '保存しました';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
    }
}


function closeShopInventoryView() {
    const btn = document.getElementById('shopinvBackBtn');
    if (btn) btn.style.display = 'none';
    renderContentSettingArea('shop');
}

function openShopInventoryModal() {
    shopinvCurrentItem = null;
    const btn = document.getElementById('shopinvBackBtn');
    if (btn) btn.style.display = '';
    const right = document.getElementById('myhouseRight');
    right.innerHTML = `
        <div class="shopinv-view">
            <div class="shopinv-listview">
                <div style="margin-bottom:12px;">
                    <p style="margin:0;font-size:14px;color:#333;">問屋で仕入れた商品の販売設定ができます（最大15種類・価格は仕入れ値の3倍まで）</p>
                </div>
                <div class="shop2-table-container">
                    <table class="shop2-table" id="shopInventoryTable">
                        <thead>
                            <tr class="shop2-header-group">
                                <th rowspan="2">陳列</th>
                                <th rowspan="2">商品名</th>
                                <th rowspan="2">販売価格</th>
                                <th rowspan="2">在庫数</th>
                                <th colspan="14">アップする能力値</th>
                                <th colspan="2">消費パワー</th>
                                <th rowspan="2">使用<br>回数</th>
                                <th rowspan="2">使用<br>間隔</th>
                            </tr>
                            <tr class="shop2-header-sub">
                                <th>国</th><th>数</th><th>理</th><th>社</th><th>英</th>
                                <th>音</th><th>美</th><th>体</th><th>気</th><th>ル</th>
                                <th>素</th><th>面</th><th>優</th><th>エ</th>
                                <th>身体</th><th>頭脳</th>
                            </tr>
                        </thead>
                        <tbody id="shopInventoryTableBody"></tbody>
                    </table>
                </div>
                <div class="shop2-cart-overlay" id="shopInventoryPanel" style="display:none;">
                    <div class="shop2-cart-tab" onclick="closeShopInventoryPanel()">閉じる</div>
                    <div class="shop2-cart-overlay-body">
                        <div class="shopinv-info-group">
                            <div class="shopinv-info-row">
                                <span class="shopinv-info-label">商品名</span>
                                <span id="shopinvPanelName" class="shopinv-info-value"></span>
                            </div>
                            <div class="shopinv-info-row">
                                <span class="shopinv-info-label">在庫数</span>
                                <span id="shopinvPanelStock" class="shopinv-info-value"></span>個
                            </div>
                        </div>
                        <div class="shopinv-field">
                            <label class="shopinv-label">販売価格</label>
                            <div class="shopinv-field-body">
                                <div class="shopinv-input-row">
                                    <input type="number" id="shopinvSellPrice" class="shopinv-input" min="1">
                                    <span class="shopinv-unit">円</span>
                                    <button class="shopinv-save-price-btn" id="shopinvSavePriceBtn" onclick="saveShopInventoryItem()">保存</button>
                                </div>
                                <p class="shopinv-hint" id="shopinvPriceHint"></p>
                            </div>
                        </div>
                        <div class="shopinv-field">
                            <label class="shopinv-label">陳列</label>
                            <div class="shopinv-field-body">
                                <button class="shopinv-toggle-btn" id="shopinvListedToggle" onclick="setShopListed(!this.classList.contains('active'))"><div class="recommend-toggle"><span class="recommend-on-text">出品</span><span class="recommend-off-text">停止</span><div class="recommend-knob"></div></div></button>
                            </div>
                        </div>
                        <div class="shopinv-field shopinv-discard-group">
                            <label class="shopinv-label">破棄</label>
                            <div class="shopinv-field-body">
                                <div class="shopinv-input-row">
                                    <input type="number" id="shopinvDiscardQty" class="shopinv-input" min="1" placeholder="個数">
                                    <span class="shopinv-unit">個</span>
                                    <button class="shopinv-discard-btn" onclick="discardShopInventoryItem(false)">破棄</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    renderShopInventoryTable();
}

function renderShopInventoryTable() {
    const tbody = document.getElementById('shopInventoryTableBody');
    const stock = gameState.shopStock || [];
    const abilities = ['国語', '数学', '理科', '社会', '英語', '音楽', '美術', '体力', '気力', 'ルックス', '素早さ', '面白さ', '優しさ', 'エロさ'];

    const { itemGenreMap, itemOrderMap } = buildItemMaps();
    const sorted = [...stock].sort((a, b) => (itemOrderMap[a.name] ?? 999) - (itemOrderMap[b.name] ?? 999));

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="22" class="shopinv-empty">仕入れた商品がありません。<br>問屋で商品を仕入れてください。</td></tr>`;
        return;
    }

    let html = '';
    let lastGenre = null;
    for (const s of sorted) {
        const genre = itemGenreMap[s.name] || '';
        if (genre !== lastGenre) {
            lastGenre = genre;
            html += `<tr class="separator-row"><td colspan="22">${genre}</td></tr>`;
        }
        const master = shopItems.find(i => i.name === s.name) || tonyaItems.find(i => i.name === s.name) || {};
        const stats = master.stats || {};
        const isActive = shopinvCurrentItem === s.name;
        const inv = ((gameState.shopInventory || []).find(i => i.name === s.name)) || {};
        const listed = inv.listed === true;
        const sellPriceText = inv.sellPrice ? inv.sellPrice.toLocaleString() + '円' : '<span class="shopinv-unset">未設定</span>';
        const safeNameJs = JSON.stringify(s.name).replace(/"/g, '&quot;');

        html += `<tr class="shopinv-row${isActive ? ' active' : ''}${listed ? ' shopinv-row-listed' : ''}" data-name="${escapeHtml(s.name)}" onclick="openShopInventoryPanel(${safeNameJs})">`;
        html += `<td class="shopinv-cb-cell" onclick="event.stopPropagation()"><button class="shopinv-toggle-btn${listed ? ' active' : ''}" onclick="shopinvTableToggleClick(this, ${safeNameJs})"><div class="recommend-toggle"><span class="recommend-on-text">出品</span><span class="recommend-off-text">停止</span><div class="recommend-knob"></div></div></button></td>`;
        html += `<td class="shopinv-name-cell">${s.name}</td>`;
        html += `<td class="shop2-price">${sellPriceText}</td>`;
        html += `<td class="shopinv-qty-cell">${s.quantity}</td>`;
        for (const ab of abilities) {
            html += `<td>${stats[ab] || ''}</td>`;
        }
        html += `<td>${master.bodyConsume || ''}</td>`;
        html += `<td>${master.brainConsume || ''}</td>`;
        html += `<td>${master.useCount || ''}</td>`;
        html += `<td>${master.cooldown || ''}</td>`;
        html += `</tr>`;
    }
    tbody.innerHTML = html;
}

function openShopInventoryPanel(itemName) {
    shopinvCurrentItem = itemName;

    // アクティブ行の更新
    document.querySelectorAll('#shopInventoryTableBody tr').forEach(tr => {
        tr.classList.toggle('active', tr.dataset.name === itemName);
    });

    const stock = (gameState.shopStock || []).find(s => s.name === itemName);
    const inv = ((gameState.shopInventory || []).find(i => i.name === itemName)) || {};
    if (!stock) return;

    document.getElementById('shopinvPanelName').textContent = itemName;
    document.getElementById('shopinvPanelStock').textContent = stock.quantity;
    const maxPrice = (stock.costPrice || 0) * 3;
    document.getElementById('shopinvSellPrice').value = inv.sellPrice || '';
    document.getElementById('shopinvSellPrice').min = 1;
    document.getElementById('shopinvSellPrice').max = maxPrice;
    document.getElementById('shopinvPriceHint').textContent = `仕入れ値：${(stock.costPrice || 0).toLocaleString()}円 ｜ 上限：${maxPrice.toLocaleString()}円 まで`;
    document.getElementById('shopinvDiscardQty').value = '';
    document.getElementById('shopinvDiscardQty').max = stock.quantity;
    updateShopListedButtons(inv.listed === true);

    const panel = document.getElementById('shopInventoryPanel');
    panel.classList.remove('closing');
    panel.style.display = '';
}

function closeShopInventoryPanel() {
    const panel = document.getElementById('shopInventoryPanel');
    if (!panel || panel.style.display === 'none') return;
    panel.classList.add('closing');
    panel.addEventListener('animationend', () => {
        panel.classList.remove('closing');
        panel.style.display = 'none';
        shopinvCurrentItem = null;
        document.querySelectorAll('#shopInventoryTableBody tr').forEach(tr => tr.classList.remove('active'));
    }, { once: true });
}

function showShopinvError(message) {
    document.getElementById('shopinvErrorMessage').textContent = message;
    document.getElementById('shopinvErrorModal').classList.add('active');
}

function closeShopinvErrorModal() {
    document.getElementById('shopinvErrorModal').classList.remove('active');
}

// チェックボックスで陳列ON/OFFを切り替え（即保存）
function toggleShopListed(itemName, checked) {
    if (checked) {
        // 販売価格が未設定の場合はチェック不可
        const inv = (gameState.shopInventory || []).find(i => i.name === itemName);
        if (!inv || !inv.sellPrice || inv.sellPrice <= 0) {
            showShopinvError('販売価格が未設定です。\n設定後にONにすることができます。');
            renderShopInventoryTable();
            return;
        }
        // 最大15種類チェック
        const listedCount = (gameState.shopInventory || []).filter(
            i => i.name !== itemName && i.listed === true
        ).length;
        if (listedCount >= 15) {
            showShopinvError('販売できる商品は最大15種類までです。');
            renderShopInventoryTable();
            return;
        }
    }
    if (!gameState.shopInventory) gameState.shopInventory = [];
    const existing = gameState.shopInventory.find(i => i.name === itemName);
    if (existing) {
        existing.listed = checked;
    } else {
        gameState.shopInventory.push({ name: itemName, listed: checked });
    }
    saveGame(true);
    renderShopInventoryTable();
    if (shopinvCurrentItem === itemName) updateShopListedButtons(checked);
}

function updateShopListedButtons(listed) {
    const toggle = document.getElementById('shopinvListedToggle');
    if (!toggle) return;
    toggle.classList.toggle('active', listed);
}

function setShopListed(checked) {
    if (!shopinvCurrentItem) return;
    const panelToggle = document.getElementById('shopinvListedToggle');
    if (panelToggle) panelToggle.classList.toggle('active', checked);
    const tableToggle = document.querySelector(`#shopInventoryTableBody tr[data-name="${CSS.escape(shopinvCurrentItem)}"] .shopinv-toggle-btn`);
    if (tableToggle) tableToggle.classList.toggle('active', checked);
    setTimeout(() => toggleShopListed(shopinvCurrentItem, checked), 250);
}

function shopinvTableToggleClick(btn, itemName) {
    const next = !btn.classList.contains('active');
    btn.classList.toggle('active', next);
    setTimeout(() => toggleShopListed(itemName, next), 250);
}

function saveShopInventoryItem() {
    if (!shopinvCurrentItem) return;

    const sellPrice = parseInt(document.getElementById('shopinvSellPrice').value) || 0;

    const stock = (gameState.shopStock || []).find(s => s.name === shopinvCurrentItem);
    if (!stock) return;

    const maxSellPrice = (stock.costPrice || 0) * 3;
    if (sellPrice < 1) {
        alert('販売価格を入力してください。');
        return;
    }
    if (sellPrice > maxSellPrice) {
        alert(`販売価格は仕入れ値の3倍（${maxSellPrice.toLocaleString()}円）までです。`);
        return;
    }

    if (!gameState.shopInventory) gameState.shopInventory = [];
    const existing = gameState.shopInventory.find(i => i.name === shopinvCurrentItem);
    if (existing) {
        existing.sellPrice = sellPrice;
    } else {
        gameState.shopInventory.push({ name: shopinvCurrentItem, sellPrice, listed: false });
    }
    saveGame(true);
    renderShopInventoryTable();

    const btn = document.getElementById('shopinvSavePriceBtn');
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
    }
}

function discardShopInventoryItem(all) {
    if (!shopinvCurrentItem) return;
    const stock = (gameState.shopStock || []).find(s => s.name === shopinvCurrentItem);
    if (!stock) return;

    let qty;
    if (all) {
        if (!confirm(`「${shopinvCurrentItem}」を全部（${stock.quantity}個）破棄しますか？`)) return;
        qty = stock.quantity;
    } else {
        const input = parseInt(document.getElementById('shopinvDiscardQty').value) || 0;
        if (input < 1 || input > stock.quantity) {
            alert(`1〜${stock.quantity}個の範囲で入力してください。`);
            return;
        }
        if (!confirm(`「${shopinvCurrentItem}」を${input}個破棄しますか？`)) return;
        qty = input;
    }

    stock.quantity -= qty;
    if (stock.quantity <= 0) {
        gameState.shopStock = (gameState.shopStock || []).filter(s => s.name !== shopinvCurrentItem);
        if (gameState.shopInventory) {
            gameState.shopInventory = gameState.shopInventory.filter(i => i.name !== shopinvCurrentItem);
        }
        closeShopInventoryPanel();
        renderShopInventoryTable();
    } else {
        document.getElementById('shopinvPanelStock').textContent = stock.quantity;
        document.getElementById('shopinvDiscardQty').value = '';
        renderShopInventoryTable();
    }
}

function setHomeContent(contentId, checked) {
    if (!gameState.player.house) return;
    gameState.player.house.homeContent = checked ? contentId : null;
}

function getContentTitle(contentId) {
    const titles = (gameState.player.house && gameState.player.house.contentTitles) || {};
    const def = myhouseContentDefs[contentId] || { name: contentId };
    return titles[contentId] || def.name;
}

function updateTitleCharCount() {
    const input = document.getElementById('contentTitleInput');
    const counter = document.getElementById('titleCharCount');
    if (!input || !counter) return;
    const len = input.value.length;
    counter.textContent = `${len} / 10`;
    counter.className = 'tweet-char-count' + (len >= 10 ? ' at-limit' : len >= 8 ? ' near-limit' : '');
}

function updateUrlLabelCharCount() {
    const input = document.getElementById('urlLabelInput');
    const counter = document.getElementById('urlLabelCharCount');
    if (!input || !counter) return;
    const len = input.value.length;
    counter.textContent = `${len} / 60`;
    counter.className = 'tweet-char-count' + (len >= 60 ? ' at-limit' : len >= 50 ? ' near-limit' : '');
}

function updateBioCharCount() {
    const input = document.getElementById('profileBioInput');
    const counter = document.getElementById('bioCharCount');
    if (!input || !counter) return;
    input.value = input.value.replace(/\n/g, '');
    const len = input.value.length;
    counter.textContent = `${len} / 100`;
    counter.className = 'tweet-char-count' + (len >= 100 ? ' at-limit' : len >= 90 ? ' near-limit' : '');
}

function saveProfileBio() {
    saveContentTitle(currentContentSettingId);
    saveContentVisibility();
    const input = document.getElementById('profileBioInput');
    if (!input) return;
    gameState.player.house.bio = input.value.trim().slice(0, 100);
    saveGame(true);
    showToast('プロフィールを保存しました！');
}

function saveContentVisibility() {
    const checked = document.querySelector('input[name="contentVisibility"]:checked');
    if (!checked) return;
    if (!gameState.player.house.contentVisibility) gameState.player.house.contentVisibility = {};
    gameState.player.house.contentVisibility[currentContentSettingId] = checked.value;
}

function saveContentTitle(contentId) {
    const input = document.getElementById('contentTitleInput');
    if (!input) return;
    const val = input.value.trim().slice(0, 10);
    if (!gameState.player.house.contentTitles) gameState.player.house.contentTitles = {};
    gameState.player.house.contentTitles[contentId] = val;
    renderMyhouseSidebar();
}

// ============================================
// お賽銭
// ============================================
const SAISEN_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000];
let saisenSelectedAmount = null;

function openSaisenModal() {
    saisenSelectedAmount = null;
    renderSaisenBody();
    document.getElementById('saisenModal').style.display = 'flex';
}

function renderSaisenBody() {
    const body = document.querySelector('#saisenModal .saisen-modal-body');
    body.innerHTML = `
        <p class="saisen-desc">金額を選んでください</p>
        <div class="saisen-amount-list" id="saisenAmountList">
            ${SAISEN_AMOUNTS.map(a =>
                `<button class="saisen-amount-btn" onclick="selectSaisenAmount(${a}, this)">${a.toLocaleString()}円</button>`
            ).join('')}
        </div>
        <img src="house/icon/saisen.png" alt="賽銭箱" class="saisen-img">
        <button class="saisen-confirm-btn" id="saisenConfirmBtn" onclick="confirmSaisen()" disabled>お賽銭する</button>`;
}

function closeSaisenModal() {
    document.getElementById('saisenModal').style.display = 'none';
}

function selectSaisenAmount(amount, btn) {
    saisenSelectedAmount = amount;
    document.querySelectorAll('#saisenAmountList .saisen-amount-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('saisenConfirmBtn').disabled = false;
}

function confirmSaisen() {
    if (!saisenSelectedAmount) return;
    const amount = saisenSelectedAmount;

    if (gameState.player.money < amount) {
        const body = document.querySelector('#saisenModal .saisen-modal-body');
        body.innerHTML = `<p class="saisen-result-msg error"><span class="error-text">ERROR！</span>所持金が足りません。。。<br>（所持金：${gameState.player.money.toLocaleString()}円）</p>
            <button class="saisen-back-btn" onclick="renderSaisenBody()">戻る</button>`;
        return;
    }

    gameState.player.money -= amount;
    gameState.savings += amount;
    addBankHistory('deposit', amount, 'お賽銭収入');

    if (!gameState.notifications) gameState.notifications = [];
    gameState.notifications.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        type: 'saisen',
        fromName: gameState.player.name,
        fromAvatar: gameState.player.avatar,
        fromAvatarBg: gameState.player.avatarBgColor,
        amount: amount,
        date: Date.now(),
        read: false,
    });

    updateStatus();
    updateNotifBadge();
    saveGame(true);

    const body = document.querySelector('#saisenModal .saisen-modal-body');
    body.innerHTML = `
        <p class="saisen-result-msg success"><span style="color:#EB6101">${amount.toLocaleString()}円</span>のお賽銭をしました！</p>
        <button class="saisen-ok-btn" onclick="closeSaisenModal()">OK</button>`;
}
