// ============================================
// ふらっとタウン - みんなのプロフィールBBS
// ============================================

function _pbSafeColor(val) {
    const fallback = '#FFB6C1';
    if (!val || typeof val !== 'string') return fallback;
    return val.replace(/[;{}\\\n\r]/g, '').trim() || fallback;
}

function _pbDarkenColor(hex, lightFactor, satBoost) {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return hex;
    let r = parseInt(clean.slice(0, 2), 16) / 255;
    let g = parseInt(clean.slice(2, 4), 16) / 255;
    let b = parseInt(clean.slice(4, 6), 16) / 255;
    // RGB → HSL
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0, s = 0, l = (max + min) / 2;
    if (d !== 0) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    // 彩度・明度を調整
    s = Math.min(1, s + (satBoost || 0));
    l = Math.max(0, Math.min(1, l * lightFactor));
    // HSL → RGB
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    let rr, gg, bb;
    if (s === 0) {
        rr = gg = bb = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        rr = hue2rgb(p, q, h + 1/3);
        gg = hue2rgb(p, q, h);
        bb = hue2rgb(p, q, h - 1/3);
    }
    const hex2 = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${hex2(rr)}${hex2(gg)}${hex2(bb)}`;
}

// ============================================
// 共有データ定義
// ============================================

const _PB_Q_DEFS = [
    { name: 'pbQ1', prefix: '飼うなら', label: '飼うなら犬？猫？',         opts: ['犬', '猫'],               suffix: 'がいい！',   key: 'qDogCat' },
    { name: 'pbQ2', prefix: '生活は',   label: '朝型？ / 夜型？',           opts: ['朝型', '夜型'],           suffix: 'が多いかも', key: 'qMorningNight' },
    { name: 'pbQ3', prefix: '味覚は',   label: '甘党？ / 辛党？',           opts: ['甘党', '辛党'],           suffix: 'だよ！',     key: 'qSweetSpicy' },
    { name: 'pbQ4', prefix: '休日は',   label: 'インドア？ / アウトドア？', opts: ['インドア', 'アウトドア'], suffix: '派！',       key: 'qInOut' },
    { name: 'pbQ5', prefix: '返信は',   label: '返信は？',                   opts: ['すぐ返す', '溜めがち'],   suffix: 'かな',       key: 'qReply' },
    { name: 'pbQ6', prefix: '朝食は',   label: '朝食は？',                   opts: ['ご飯', 'パン'],           suffix: '派だよ！',   key: 'qBreakfast' },
];

const _PB_QA_ITEMS = [
    { id: 'pbQa1', label: '幸せを感じる瞬間は？',        key: 'qa1' },
    { id: 'pbQa2', label: 'ストレス発散法は？',           key: 'qa2' },
    { id: 'pbQa3', label: '1000万円もらえたら何に使う？', key: 'qa3' },
    { id: 'pbQa4', label: '旅行するならどこがいい？',     key: 'qa4' },
];

const _PB_FAV_ITEMS = [
    { id: 'pbFavFood',  label: '食べ物',      key: 'favFood' },
    { id: 'pbFavColor', label: '色',          key: 'favColor' },
    { id: 'pbFavMusic', label: '音楽',        key: 'favMusic' },
    { id: 'pbFavAnime', label: '動画・TV',    key: 'favAnime' },
    { id: 'pbFavPlace', label: '場所',        key: 'favPlace' },
    { id: 'pbFavSnack', label: 'キャラクター', key: 'favSnack' },
];

function _pbBuildFillLines(post, ansClass) {
    const pronoun = escapeHtml(post.pronoun || 'わたし');
    const lines = [];
    if (post.personality || post.callName) {
        lines.push(`${pronoun}は<span class="${ansClass}">${escapeHtml(post.personality || '…')}</span>な性格で、<span class="${ansClass}">${escapeHtml(post.callName || '…')}</span>ってよく呼ばれているよ！`);
    }
    if (post.strength || post.weakness) {
        lines.push(`得意なことは<span class="${ansClass}">${escapeHtml(post.strength || '…')}</span>で、苦手なことは<span class="${ansClass}">${escapeHtml(post.weakness || '…')}</span>かなぁ...`);
    }
    if (post.hobby) {
        lines.push(`趣味は<span class="${ansClass}">${escapeHtml(post.hobby)}</span>${post.recentHobby ? `で、最近は<span class="${ansClass}">${escapeHtml(post.recentHobby)}</span>にハマっているんだ！よろしくね！` : 'だよ！よろしくね！'}`);
    }
    return lines;
}

// ============================================
// モーダル開閉
// ============================================

function openProfileBoard() {
    document.getElementById('profileBoardModal').classList.add('active');
    _pbShowHome();
}

function closeProfileBoardModal() {
    document.getElementById('profileBoardModal').classList.remove('active');
    document.getElementById('pbDetailOverlay').style.display = 'none';
}

function _pbBackdropClick() {
    const detail = document.getElementById('pbDetailOverlay');
    if (detail.style.display === 'flex') {
        _pbCloseDetail();
    }
}

// ============================================
// ビュー切り替え
// ============================================

function _pbShowHome() {
    document.getElementById('profileBoardBackBtn').style.display = 'none';
    document.getElementById('profileBoardTitleText').textContent = '';

    _renderPbHome();
}

function _pbShowEditor() {
    document.getElementById('profileBoardBackBtn').style.display = '';
    document.getElementById('profileBoardTitleText').textContent = '';
    _renderPbEditor();
}

function _pbShowDetail() {
    const overlay = document.getElementById('pbDetailOverlay');
    overlay.style.display = 'flex';
    // シングルプレイは1件のみなので矢印は非表示
    document.getElementById('pbDetailPrev').style.display = 'none';
    document.getElementById('pbDetailNext').style.display = 'none';
    // いいね・お気に入り状態をリセット
    _pbDetailLiked = false;
    _pbDetailSecretLiked = false;
    const heartIcon = document.getElementById('pbDetailHeartIcon');
    heartIcon.src = 'public/keiziban/oekaki-like.svg';
    heartIcon.classList.remove('is-liked');
    document.getElementById('pbDetailHeartBtn').classList.remove('is-liked');
    const secretIcon = document.getElementById('pbDetailSecretIcon');
    secretIcon.src = 'public/keiziban/oekaki-secret.svg';
    secretIcon.classList.remove('is-liked');
    document.getElementById('pbDetailSecretBtn').classList.remove('is-liked');
    // お気に入り状態を復元（マルチプレイ時はプロフIDで判定）
    const profileKey = gameState.player.name || 'player';
    _pbDetailFaved = (gameState.favoritedProfiles || []).includes(profileKey);
    document.getElementById('pbDetailFavBtn').classList.toggle('is-faved', _pbDetailFaved);
    // アバター色をボーダー・タイトルバー・CSS変数に適用
    const headerBg = _pbSafeColor(gameState.player.avatarBgColor);
    const content = overlay.querySelector('.pb-detail-view-content');
    const titlebar = overlay.querySelector('.win-titlebar-facility');
    if (!content || !titlebar) return;
    content.style.borderColor = headerBg;
    content.style.setProperty('--pb-accent', headerBg);
    content.style.setProperty('--pb-accent-dark', _pbDarkenColor(headerBg, 0.917, -0.092));
    content.style.setProperty('--pb-modal-bg', headerBg);
    content.style.setProperty('--pb-fill-bg', headerBg + '55');
    titlebar.style.background = `repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 9px), ${headerBg}`;
    const closeBtn = overlay.querySelector('.win-titlebar-facility-close');
    if (closeBtn) {
        closeBtn.style.background = '#fff';
        closeBtn.style.color = headerBg;
        closeBtn.style.borderColor = 'rgba(255,255,255,0.6)';
    }
    _renderPbDetail();
}

function _pbCloseDetail() {
    document.getElementById('pbDetailOverlay').style.display = 'none';
}

function prevPbDetail() {
    // マルチプレイ時に前のプロフへ移動する処理をここに追加
}

function nextPbDetail() {
    // マルチプレイ時に次のプロフへ移動する処理をここに追加
}

let _pbDetailLiked = false;
let _pbDetailSecretLiked = false;
let _pbDetailFaved = false;
let _pbEditorQAnswers = {};

function togglePbDetailLike() {
    _pbDetailLiked = !_pbDetailLiked;
    const icon = document.getElementById('pbDetailHeartIcon');
    icon.src = _pbDetailLiked
        ? 'public/keiziban/oekaki-like2.svg'
        : 'public/keiziban/oekaki-like.svg';
    icon.classList.toggle('is-liked', _pbDetailLiked);
    document.getElementById('pbDetailHeartBtn').classList.toggle('is-liked', _pbDetailLiked);
    if (_pbDetailLiked) {
        icon.classList.remove('like-pop');
        void icon.offsetWidth;
        icon.classList.add('like-pop');
        icon.addEventListener('animationend', () => icon.classList.remove('like-pop'), { once: true });
    }
}

function togglePbDetailSecretLike() {
    _pbDetailSecretLiked = !_pbDetailSecretLiked;
    const icon = document.getElementById('pbDetailSecretIcon');
    icon.src = _pbDetailSecretLiked
        ? 'public/keiziban/oekaki-secret2.svg'
        : 'public/keiziban/oekaki-secret.svg';
    icon.classList.toggle('is-liked', _pbDetailSecretLiked);
    document.getElementById('pbDetailSecretBtn').classList.toggle('is-liked', _pbDetailSecretLiked);
    if (_pbDetailSecretLiked) {
        icon.classList.remove('like-pop-small');
        void icon.offsetWidth;
        icon.classList.add('like-pop-small');
        icon.addEventListener('animationend', () => icon.classList.remove('like-pop-small'), { once: true });
    }
}

function togglePbDetailFav() {
    _pbDetailFaved = !_pbDetailFaved;
    const btn = document.getElementById('pbDetailFavBtn');
    btn.classList.toggle('is-faved', _pbDetailFaved);
    if (!gameState.favoritedProfiles) gameState.favoritedProfiles = [];
    const profileKey = gameState.player.name || 'player';
    if (_pbDetailFaved) {
        if (!gameState.favoritedProfiles.includes(profileKey)) {
            gameState.favoritedProfiles.push(profileKey);
        }
    } else {
        gameState.favoritedProfiles = gameState.favoritedProfiles.filter(k => k !== profileKey);
    }
    saveGame();
    if (_pbDetailFaved) {
        btn.classList.remove('fav-pop');
        void btn.offsetWidth;
        btn.classList.add('fav-pop');
        btn.addEventListener('animationend', () => btn.classList.remove('fav-pop'), { once: true });
    }
}

// ============================================
// ホーム画面
// ============================================

function _renderPbHome() {
    const post = gameState.profileBoardPost;
    const hasPost = post != null;

    // シングルプレイ：自分のプロフだけ。マルチプレイ時は複数ユーザーのpostを配列に入れる想定。
    const cards = hasPost ? _makePbCard(post) : '';
    const emptyMsg = !hasPost
        ? '<div class="pb-empty">まだプロフィールがありません。「書く」ボタンから投稿してみましょう！</div>'
        : '';

    document.getElementById('profileBoardBody').innerHTML = `
        <div class="pb-home">
            <div class="pb-home-top">
                <div>
                    <h2 class="pb-gallery-title">みんなのプロフィールBBS</h2>
                    <p class="pb-gallery-desc">みんなのプロフィールをみてみよう！</p>
                </div>
                <button class="pb-write-btn" onclick="_pbShowEditor()">
                    ${hasPost ? '編集する' : '書く'}
                </button>
            </div>
            <div class="pb-gallery-divider"></div>
            <div class="pb-grid" id="pbGrid">
                ${emptyMsg}
                ${cards}
            </div>
        </div>
    `;
}

function _makePbCard(post) {
    const avatarHtml = gameState.player.avatar
        ? `<img src="${escapeAttr(gameState.player.avatar)}" alt="アバター" class="pb-card-avatar-img">`
        : `<span>${escapeHtml((gameState.player.name || '?')[0])}</span>`;

    const birthText = post.birthMonth && post.birthDay
        ? `${escapeHtml(String(post.birthMonth))}月${escapeHtml(String(post.birthDay))}日`
        : '';
    const bloodText = post.bloodType ? `${escapeHtml(post.bloodType)}型` : '';

    const headerBg = _pbSafeColor(gameState.player.avatarBgColor);
    const name = escapeHtml(post.name || gameState.player.name);

    const fillLines = _pbBuildFillLines(post, 'pb-card-fill-ans');
    const fillHtml = fillLines.length > 0
        ? `<p class="pb-card-fill-line">${fillLines.join('')}</p>`
        : `<p class="pb-card-fill-line pb-card-fill-line--empty">まだ書かれていません…</p>`;

    const lastWordText = post.lastWord ? escapeHtml(post.lastWord) : '—';
    const extraHtml = `
        <div class="pb-card-extra">
            <span class="pb-card-extra-type">最後にひとこと</span>
            <div class="pb-card-extra-lastword">${lastWordText}</div>
        </div>`;

    return `
        <div class="pb-card-wrap" onclick="_pbShowDetail()">
            <div class="pb-card" style="border-color:${headerBg};--pb-fill-bg:${headerBg}55;--pb-accent:${headerBg}">
                <div class="pb-card-header" style="background-color:${headerBg}">
                    <div class="pb-card-header-stripe">
                        <span class="pb-card-header-title">MY PROFILE</span>
                    </div>
                </div>
                <div class="pb-card-body">
                    <div class="pb-card-main">
                        <div class="pb-card-avatar" style="background-color:${headerBg}">${avatarHtml}</div>
                        <div class="pb-card-info">
                            <div class="pb-card-row">
                                <span class="pb-card-row-label">名前</span>
                                <span class="pb-card-row-val pb-card-row-val--name">${name}</span>
                            </div>
                            <div class="pb-card-row">
                                <span class="pb-card-row-label">お仕事</span>
                                <span class="pb-card-row-val">${escapeHtml(post.realJob || '—')}</span>
                            </div>
                            <div class="pb-card-row">
                                <span class="pb-card-row-label">長所</span>
                                <span class="pb-card-row-val">${escapeHtml(post.appeal || '—')}</span>
                            </div>
                            <div class="pb-card-row pb-card-row--split pb-card-row--last">
                                <div class="pb-card-row-item">
                                    <span class="pb-card-row-label">性別</span>
                                    <span class="pb-card-row-val">${escapeHtml(post.gender || '—')}</span>
                                </div>
                                <div class="pb-card-row-item">
                                    <span class="pb-card-row-label">血液型</span>
                                    <span class="pb-card-row-val">${bloodText || '—'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pb-card-fill">${fillHtml}</div>
                    ${extraHtml}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// 詳細表示
// ============================================

function _renderPbDetail() {
    const post = gameState.profileBoardPost;
    if (!post) { _pbShowHome(); return; }

    const avatarHtml = gameState.player.avatar
        ? `<img src="${escapeAttr(gameState.player.avatar)}" alt="アバター" class="pb-detail-avatar-img">`
        : `<span>${escapeHtml((post.name || '?')[0])}</span>`;

    const qRows = _PB_Q_DEFS.map(q => {
        const ans = post[q.key] || '';
        const chips = q.opts.map(opt =>
            `<span class="pb-q-chip${opt === ans ? ' pb-q-chip--on' : ''}">${escapeHtml(opt)}</span>`
        ).join('<span class="pb-q-sep"> ・ </span>');
        return `
            <div class="pb-detail-q-row">
                <span class="pb-q-prefix">${q.prefix}</span>
                <span class="pb-q-bracket">（ ${chips} ）</span>
                <span class="pb-q-suffix">${q.suffix}</span>
            </div>
        `;
    }).join('');

    const qaRows = _PB_QA_ITEMS.map(qa => `
        <div class="pb-detail-qa-item">
            <div class="pb-detail-qa-q">Q. ${qa.label}</div>
            <div class="pb-detail-qa-a">${post[qa.key] ? escapeHtml(post[qa.key]) : '—'}</div>
        </div>
    `).join('');

    const favRows = _PB_FAV_ITEMS.map(f => `
        <div class="pb-detail-fav-item">
            <span class="pb-detail-fav-label">${f.label}</span>
            <span class="pb-detail-fav-val">${post[f.key] ? escapeHtml(post[f.key]) : '—'}</span>
        </div>
    `).join('');

    const fillLines = _pbBuildFillLines(post, 'pb-detail-fill-ans');
    const fillHtml = fillLines.length > 0
        ? `<p class="pb-detail-fill-text">${fillLines.join(' ')}</p>`
        : '';

    document.getElementById('pbDetailOverlayBody').innerHTML = `
        <div class="pb-detail">
            <div class="pb-detail-top-group">
                <div class="pb-detail-profile-sec">
                    <div class="pb-detail-avatar" style="background-color:${_pbSafeColor(gameState.player.avatarBgColor)}">${avatarHtml}</div>
                    <div class="pb-card-info">
                        <div class="pb-card-row pb-card-row--split">
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">名前</span>
                                <span class="pb-card-row-val pb-card-row-val--name">${escapeHtml(post.name || gameState.player.name)}</span>
                            </div>
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">お仕事</span>
                                <span class="pb-card-row-val">${escapeHtml(post.realJob || '—')}</span>
                            </div>
                        </div>
                        <div class="pb-card-row pb-card-row--split">
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">誕生日</span>
                                <span class="pb-card-row-val">${post.birthMonth && post.birthDay ? `${escapeHtml(String(post.birthMonth))}月${escapeHtml(String(post.birthDay))}日` : '—'}</span>
                            </div>
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">長所</span>
                                <span class="pb-card-row-val">${escapeHtml(post.appeal || '—')}</span>
                            </div>
                        </div>
                        <div class="pb-card-row pb-card-row--split pb-card-row--last">
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">性別</span>
                                <span class="pb-card-row-val">${escapeHtml(post.gender || '—')}</span>
                            </div>
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">血液型</span>
                                <span class="pb-card-row-val">${post.bloodType ? `${escapeHtml(post.bloodType)}型` : '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pb-detail-fill-sec">
                    ${fillHtml}
                </div>
            </div>

            <div class="pb-detail-section">
                <h4 class="pb-detail-section-title">お気に入り</h4>
                <div class="pb-detail-fav-grid">${favRows}</div>
            </div>

            <div class="pb-detail-section pb-detail-section--q">
                <h4 class="pb-detail-section-title">あなたはどっち派？</h4>
                <div class="pb-detail-q-box">
                    <div class="pb-detail-q-grid">${qRows}</div>
                </div>
            </div>

            <div class="pb-detail-section">
                <h4 class="pb-detail-section-title">質問コーナー</h4>
                <div class="pb-detail-qa-list">${qaRows}</div>
            </div>

            <div class="pb-detail-section">
                <h4 class="pb-detail-section-title">最後にひとこと！</h4>
                <p class="pb-detail-lastword">${post.lastWord ? escapeHtml(post.lastWord) : '—'}</p>
            </div>
        </div>
    `;
}

// ============================================
// 編集画面
// ============================================

function _renderPbEditor() {
    const post = gameState.profileBoardPost || {};

    const headerBg = _pbSafeColor(gameState.player.avatarBgColor);
    const accentDark = _pbDarkenColor(headerBg, 0.917, -0.092);
    const fillBg = headerBg + '33';

    _pbEditorQAnswers = {};
    _PB_Q_DEFS.forEach(q => { _pbEditorQAnswers[q.key] = post[q.key] || ''; });

    const avatarHtml = gameState.player.avatar
        ? `<img src="${escapeAttr(gameState.player.avatar)}" alt="アバター" class="pb-detail-avatar-img">`
        : `<span>${escapeHtml((gameState.player.name || '?')[0])}</span>`;

    const favHtml = _PB_FAV_ITEMS.map(f => `
        <div class="pb-detail-fav-item">
            <span class="pb-detail-fav-label">${f.label}</span>
            <input type="text" id="${f.id}" class="pb-edit-fav-input" maxlength="20" value="${escapeAttr(post[f.key] || '')}">
        </div>
    `).join('');

    const qHtml = _PB_Q_DEFS.map(q => {
        const chips = q.opts.map(opt =>
            `<span class="pb-q-chip pb-q-chip--btn${post[q.key] === opt ? ' pb-q-chip--on' : ''}" onclick="_pbToggleChip(this,'${q.key}')" data-val="${escapeAttr(opt)}">${escapeHtml(opt)}</span>`
        ).join('<span class="pb-q-sep"> ・ </span>');
        return `
            <div class="pb-detail-q-row">
                <span class="pb-q-prefix">${q.prefix}</span>
                <span class="pb-q-bracket">（ ${chips} ）</span>
                <span class="pb-q-suffix">${q.suffix}</span>
            </div>
        `;
    }).join('');

    const qaHtml = _PB_QA_ITEMS.map(qa => `
        <div class="pb-detail-qa-item">
            <div class="pb-detail-qa-q">Q. ${qa.label}</div>
            <input type="text" id="${qa.id}" class="pb-edit-qa-input" maxlength="50" value="${escapeAttr(post[qa.key] || '')}">
        </div>
    `).join('');

    const pronounOpts = ['わたし','うち','ぼく','オレ','自分','オイラ','あーし','拙者','ワイ'].map(v =>
        `<option value="${v}"${(post.pronoun || 'わたし') === v ? ' selected' : ''}>${v}</option>`
    ).join('');
    const pronoun = escapeHtml(post.pronoun || 'わたし');

    document.getElementById('profileBoardBody').innerHTML = `
        <div class="pb-detail pb-detail--editor" style="--pb-accent:${headerBg};--pb-accent-dark:${accentDark};--pb-modal-bg:${headerBg};--pb-fill-bg:${fillBg}">
            <div class="pb-editor-preview-bar" style="background:repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(255,255,255,0.3) 6px,rgba(255,255,255,0.3) 9px),${headerBg}">MY PROFILE</div>
            <div class="pb-editor-content">

            <div class="pb-detail-top-group">
                <div class="pb-detail-profile-sec">
                    <div class="pb-detail-avatar" style="background-color:${headerBg}">${avatarHtml}</div>
                    <div class="pb-card-info">
                        <div class="pb-card-row pb-card-row--split">
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">名前</span>
                                <span class="pb-card-row-val pb-card-row-val--name">${escapeHtml(gameState.player.name)}</span>
                            </div>
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label pb-card-row-label--edit">お仕事</span>
                                <select id="pbRealJob" class="pb-edit-val-select">
                                    <option value="">—</option>
                                    ${['IT・エンジニア','クリエイティブ','医療・福祉','教育・学術','販売・美容','飲食・サービス','事務・営業','専門職','フリー・在宅','主婦・主夫','その他','無職','学生','ヒミツ'].map(v =>
                                        `<option value="${v}"${post.realJob === v ? ' selected' : ''}>${v}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="pb-card-row pb-card-row--split">
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">誕生日</span>
                                <span class="pb-card-row-item-inner">
                                    <select id="pbBirthMonth" class="pb-edit-val-select">
                                        <option value="">—</option>
                                        ${Array.from({length:12},(_,i)=>i+1).map(m=>`<option value="${m}"${post.birthMonth===m?' selected':''}>${m}</option>`).join('')}
                                    </select>
                                    <span class="pb-edit-unit">月</span>
                                    <select id="pbBirthDay" class="pb-edit-val-select">
                                        <option value="">—</option>
                                        ${Array.from({length:31},(_,i)=>i+1).map(d=>`<option value="${d}"${post.birthDay===d?' selected':''}>${d}</option>`).join('')}
                                    </select>
                                    <span class="pb-edit-unit">日</span>
                                </span>
                            </div>
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">長所</span>
                                <select id="pbAppeal" class="pb-edit-val-select">
                                    <option value="">—</option>
                                    ${['顔がいい','頭がいい','スタイル抜群','明るい','穏やか','素直','努力家','トークが得意','聞き上手','誠実','お金持ち','手先が器用','心意気','食いしん坊','ボンキュッボン','家庭的','スポーツ得意','歌がうまい','鋼メンタル','推しに全力','料理上手','どこでも眠れる','えっち','ダメ人間'].map(v =>
                                        `<option value="${v}"${post.appeal === v ? ' selected' : ''}>${v}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="pb-card-row pb-card-row--split pb-card-row--last">
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">性別</span>
                                <select id="pbGender" class="pb-edit-val-select">
                                    <option value="">—</option>
                                    ${['男性','女性','その他'].map(v =>
                                        `<option value="${v}"${post.gender === v ? ' selected' : ''}>${v}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="pb-card-row-item">
                                <span class="pb-card-row-label">血液型</span>
                                <select id="pbBloodType" class="pb-edit-val-select">
                                    <option value="">—</option>
                                    ${['A','B','O','AB','不明'].map(v =>
                                        `<option value="${v}"${post.bloodType === v ? ' selected' : ''}>${v}型</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pb-detail-fill-sec">
                    <p class="pb-detail-fill-text"><select id="pbPronoun" class="pb-edit-ans-select">${pronounOpts}</select>は<input id="pbPersonality" class="pb-edit-ans" type="text" maxlength="20" value="${escapeAttr(post.personality || '')}">な性格で、<input id="pbCallName" class="pb-edit-ans" type="text" maxlength="15" value="${escapeAttr(post.callName || '')}">ってよく呼ばれているよ！得意なことは<input id="pbStrength" class="pb-edit-ans" type="text" maxlength="20" value="${escapeAttr(post.strength || '')}">で、苦手なことは<input id="pbWeakness" class="pb-edit-ans" type="text" maxlength="20" value="${escapeAttr(post.weakness || '')}">かなぁ... 趣味は<input id="pbHobby" class="pb-edit-ans" type="text" maxlength="20" value="${escapeAttr(post.hobby || '')}">で、最近は<input id="pbRecentHobby" class="pb-edit-ans" type="text" maxlength="20" value="${escapeAttr(post.recentHobby || '')}">にハマっているんだ！よろしくね！</p>
                </div>
            </div>

            <div class="pb-detail-section">
                <h4 class="pb-detail-section-title">お気に入り</h4>
                <div class="pb-detail-fav-grid">${favHtml}</div>
            </div>

            <div class="pb-detail-section pb-detail-section--q">
                <h4 class="pb-detail-section-title">あなたはどっち派？</h4>
                <div class="pb-detail-q-box">
                    <div class="pb-detail-q-grid">${qHtml}</div>
                </div>
            </div>

            <div class="pb-detail-section">
                <h4 class="pb-detail-section-title">質問コーナー</h4>
                <div class="pb-detail-qa-list">${qaHtml}</div>
            </div>

            <div class="pb-detail-section">
                <h4 class="pb-detail-section-title">最後にひとこと！</h4>
                <input type="text" id="pbLastWord" class="pb-edit-lastword-input" maxlength="100" value="${escapeAttr(post.lastWord || '')}">
            </div>

            <div class="pb-editor-actions">
                <button class="pb-cancel-btn" onclick="_pbShowHome()">キャンセル</button>
                <button class="pb-save-btn" onclick="_savePbPost()">保存する</button>
            </div>
            </div>
        </div>
    `;
}

function _pbToggleChip(el, key) {
    const row = el.closest('.pb-detail-q-row');
    if (!row) return;
    row.querySelectorAll('.pb-q-chip--btn').forEach(c => c.classList.remove('pb-q-chip--on'));
    el.classList.add('pb-q-chip--on');
    _pbEditorQAnswers[key] = el.dataset.val;
}

// ============================================
// 保存
// ============================================

function _savePbPost() {
    const rawMonth = parseInt(document.getElementById('pbBirthMonth').value, 10);
    const rawDay = parseInt(document.getElementById('pbBirthDay').value, 10);
    const birthMonth = (rawMonth >= 1 && rawMonth <= 12) ? rawMonth : '';
    const birthDay = (rawDay >= 1 && rawDay <= 31) ? rawDay : '';

    const qAnswers = {};
    _PB_Q_DEFS.forEach(q => {
        qAnswers[q.key] = _pbEditorQAnswers[q.key] || '';
    });

    const qaAnswers = {};
    _PB_QA_ITEMS.forEach(qa => {
        qaAnswers[qa.key] = document.getElementById(qa.id).value.trim();
    });

    const favAnswers = {};
    _PB_FAV_ITEMS.forEach(f => {
        favAnswers[f.key] = document.getElementById(f.id).value.trim();
    });

    const data = {
        name: gameState.player.name,
        birthMonth,
        birthDay,
        appeal: document.getElementById('pbAppeal').value,
        bloodType: document.getElementById('pbBloodType').value,
        gender: document.getElementById('pbGender').value,
        pronoun: document.getElementById('pbPronoun').value,
        realJob: document.getElementById('pbRealJob').value,
        personality: document.getElementById('pbPersonality').value.trim(),
        callName: document.getElementById('pbCallName').value.trim(),
        strength: document.getElementById('pbStrength').value.trim(),
        weakness: document.getElementById('pbWeakness').value.trim(),
        hobby: document.getElementById('pbHobby').value.trim(),
        recentHobby: document.getElementById('pbRecentHobby').value.trim(),
        ...favAnswers,
        ...qAnswers,
        ...qaAnswers,
        lastWord: document.getElementById('pbLastWord').value.trim(),
        updatedAt: Date.now(),
    };

    gameState.profileBoardPost = data;
    saveGame();
    showToast('プロフィールを保存しました！');
    _pbShowHome();
}
