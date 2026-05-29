// ============================================
// 役場
// ============================================

function openYakubaModal() {
    const mc = document.querySelector('#yakubaModal .yakuba-modal-content');
    mc.classList.add('yakuba-lobby-mode');
    mc.classList.remove('yakuba-emergency-mode');
    document.getElementById('yakubaLobbyView').style.display = 'flex';
    document.getElementById('yakubaEmergencyView').style.display = 'none';
    document.getElementById('yakubaBackBtn').style.display = 'none';
    document.getElementById('yakubaTitleBar').textContent = '';
    document.getElementById('yakubaModal').classList.add('active');

    // 緊急支援ボタンのグレーアウト判定
    const btn = document.getElementById('yakubaEmergencyLobbyBtn');
    btn.disabled = !!getEmergencyDisabledReason();
}

function closeYakubaModal() {
    document.querySelector('#yakubaModal .yakuba-modal-content').classList.remove('yakuba-lobby-mode');
    document.getElementById('yakubaModal').classList.remove('active');
}

function backToYakubaLobby() {
    const mc = document.querySelector('#yakubaModal .yakuba-modal-content');
    document.getElementById('yakubaEmergencyView').style.display = 'none';
    document.getElementById('yakubaLobbyView').style.display = 'flex';
    document.getElementById('yakubaBackBtn').style.display = 'none';
    document.getElementById('yakubaTitleBar').textContent = '';
    requestAnimationFrame(() => {
        mc.classList.remove('yakuba-emergency-mode');
        mc.classList.add('yakuba-lobby-mode');
    });

    const btn = document.getElementById('yakubaEmergencyLobbyBtn');
    btn.disabled = !!getEmergencyDisabledReason();
}

function getEmergencyDisabledReason() {
    const player = gameState.player;
    if (gameState.lastEmergencySupport) {
        const daysSince = (Date.now() - gameState.lastEmergencySupport) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) {
            const remaining = Math.ceil(7 - daysSince);
            return `次の申請まであと${remaining}日お待ちください。`;
        }
    }
    const totalAssets = player.money + gameState.savings;
    if (totalAssets > 0) return '総資産（所持金＋預金）が0円以下になると申請できます。';
    const bmi = calculateBMI(player);
    if (bmi >= 17 && bmi < 30) return 'BMIが正常範囲内のため、支援の対象外です。';
    return null;
}

function applyEmergencySupport() {
    const player = gameState.player;
    const bmi = calculateBMI(player);
    const tooThin = bmi < 17;

    // モーダル表示
    const supportItems = tooThin ? ['ハンバーガー', 'タピオカミルクティー', 'パフェ'] : [];
    const supportMoney = 10000;

    const nameEl = document.getElementById('emergencySupportName');
    const contentEl = document.getElementById('emergencySupportContent');
    if (nameEl) nameEl.textContent = player.name;
    document.querySelectorAll('.emergency-name-inline').forEach(el => el.textContent = player.name);

    let rows = `<div class="shokudo-change-row"><span class="shokudo-change-label">現金</span><span class="shokudo-change-plus">${supportMoney.toLocaleString()}円</span></div>`;
    if (tooThin) {
        supportItems.forEach(item => {
            rows += `<div class="shokudo-change-row"><span class="shokudo-change-label">${item}</span><span class="shokudo-change-after">×1</span></div>`;
        });
    }
    if (contentEl) contentEl.innerHTML = `<div class="shokudo-eat-changes">${rows}</div>`;

    // 受給ボタンにデータをセット・所持品チェック
    const receiveBtn = document.getElementById('emergencySupportReceiveBtn');
    if (receiveBtn) {
        receiveBtn.dataset.tooThin = tooThin ? '1' : '0';
        const possessionsFull = tooThin && (15 - player.possessions.length < 3);
        receiveBtn.disabled = possessionsFull;
        document.getElementById('emergencyPossessionWarning').style.display = possessionsFull ? '' : 'none';
    }

    document.getElementById('emergencySupportMainView').style.display = '';
    document.getElementById('emergencySupportCompleteView').style.display = 'none';
    document.getElementById('yakubaLobbyView').style.display = 'none';
    document.getElementById('yakubaEmergencyView').style.display = 'flex';
    document.getElementById('yakubaBackBtn').style.display = '';
    document.getElementById('yakubaTitleBar').textContent = '緊急支援';
    const emergencyMc = document.querySelector('#yakubaModal .yakuba-modal-content');
    emergencyMc.classList.remove('yakuba-lobby-mode');
    emergencyMc.classList.add('yakuba-emergency-mode');
}

function receiveEmergencySupport() {
    const player = gameState.player;
    const receiveBtn = document.getElementById('emergencySupportReceiveBtn');
    const tooThin = receiveBtn && receiveBtn.dataset.tooThin === '1';

    const foodItems = tooThin ? [
        { name: 'ハンバーガー',       consumable: true, takeout: true, price: 800,  calorie: 700,  hungerEffect: 2, genre: 'フード',   effect: { hunger: -1 }, stats: { 体力: 3, 気力: 1, エロさ: 1 },         useCount: 1, remainingUses: 1, purchaseDate: Date.now() },
        { name: 'タピオカミルクティー', consumable: true, takeout: true, price: 800,  calorie: 600,  hungerEffect: 0, genre: 'ドリンク', effect: {},              stats: { ルックス: 1, 素早さ: 1 },               useCount: 1, remainingUses: 1, purchaseDate: Date.now(), isSweet: true },
        { name: 'パフェ',             consumable: true, takeout: true, price: 1000, calorie: 1100, hungerEffect: 0, genre: 'デザート', effect: {},              stats: { 数学: 1, 英語: 1, 面白さ: 1 },           useCount: 1, remainingUses: 1, purchaseDate: Date.now(), isSweet: true },
    ] : [];

    // 支給
    changeMoney(10000);
    const slots = 15 - player.possessions.length;
    foodItems.slice(0, slots).forEach(item => player.possessions.push(item));

    gameState.lastEmergencySupport = Date.now();

    // 完了画面へ
    document.getElementById('emergencySupportMainView').style.display = 'none';
    document.getElementById('emergencySupportCompleteView').style.display = '';
    document.getElementById('yakubaBackBtn').style.display = 'none';
}


// ============================================
// プロフィール
// ============================================
// 使用済みの名前リスト（将来的にサーバーから取得する想定）
const reservedNames = ['管理人', 'admin', 'ふらっとタウン'];

function validateProfileName() {
    const name = document.getElementById('profileName').value.trim();
    const status = document.getElementById('profileNameStatus');
    const hint = document.getElementById('profileNameHint');

    if (!name) {
        status.textContent = '';
        status.className = 'profile-name-status';
        hint.textContent = '';
        return;
    }

    // 重複チェック（予約名 + 将来のユーザー名チェック）
    const isReserved = reservedNames.some(n => n.toLowerCase() === name.toLowerCase());

    if (isReserved) {
        status.textContent = '！';
        status.className = 'profile-name-status invalid';
        hint.textContent = 'この名前はすでに使われています';
    } else if (name.length > 10) {
        status.textContent = '！';
        status.className = 'profile-name-status invalid';
        hint.textContent = '名前は10文字以内で入力してください';
    } else {
        status.textContent = '';
        status.className = 'profile-name-status valid';
        hint.textContent = '';
    }
}

function showInitialRegistration() {
    const p = gameState.player;

    // フォームの初期値セット
    document.getElementById('profileName').value = '';
    document.querySelectorAll('input[name="profileGender"]').forEach(radio => { radio.checked = false; });
    initBirthdaySelects();

    // ヒントリセット
    document.getElementById('profileNameHint').textContent = '';
    document.getElementById('profileGenderHint').textContent = '';
    document.getElementById('profileBirthdayHint').textContent = '';
    document.getElementById('profileNameStatus').textContent = '';
    document.getElementById('profileNameStatus').className = 'profile-name-status';

    // 登録用アイコン選択状態をリセット
    _regPendingAvatar = null;
    _regPendingBgColor = null;

    // 入力画面を表示、他の画面を非表示
    document.getElementById('profileFormView').style.display = 'block';
    document.getElementById('profileIconView').style.display = 'none';
    document.getElementById('profileConfirmView').style.display = 'none';
    document.getElementById('profileResultView').style.display = 'none';

    document.getElementById('registrationModal').classList.add('active');
}

function initBirthdaySelects() {
    const yearSelect = document.getElementById('profileBirthYear');
    const monthSelect = document.getElementById('profileBirthMonth');
    const daySelect = document.getElementById('profileBirthDay');
    const p = gameState.player;

    // 年（1950〜今年）
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '<option value="" disabled selected></option>';
    for (let y = currentYear - 99; y <= currentYear; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (p.birthday && p.birthday.year === y) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    // 月（1〜12）
    monthSelect.innerHTML = '<option value="" disabled selected></option>';
    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        if (p.birthday && p.birthday.month === m) opt.selected = true;
        monthSelect.appendChild(opt);
    }

    // 日（1〜31）
    daySelect.innerHTML = '<option value="" disabled selected></option>';
    for (let d = 1; d <= 31; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        if (p.birthday && p.birthday.day === d) opt.selected = true;
        daySelect.appendChild(opt);
    }
}


// ============================================
// ステータスアイコン選択
// ============================================

// ステータス画面のアバター変更用（openAvatarPickerModal）
let _pendingAvatar = null;
let _pendingBgColor = null;
// 住民登録フロー用（登録完了まで一時保持）
let _regPendingAvatar = null;
let _regPendingBgColor = null;
let _regPendingData = null;

const avatarBgColors = [
    // 行1：彩度高め（ピンク→コーラル→オレンジ→イエロー→ライム→ミント→スカイ→ブルー→ラベンダー→パープル→ローズ→ディープピンク）
    '#FF9EBC', '#FFB0A0', '#FFCBA4', '#FFE0A0', '#FFEAA7', '#D8F0A8',
    '#A0E8C8', '#B8D8F8', '#A8C8F0', '#C0B0F0', '#E0B8E8', '#C4BCBA',
    // 行2：パステル（同じ順番の薄め版）
    '#FFB6C1', '#FFC8B8', '#FFD8C0', '#FFECC0', '#FFF8D0', '#E8F8C8',
    '#C8F0E0', '#D0E8F8', '#C8D8F0', '#D8CCF8', '#F0D8F8', '#E0D8D6',
];

function openAvatarPickerModal() {
    const p = gameState.player;
    _pendingAvatar = p.avatar;
    _pendingBgColor = p.avatarBgColor || '#FFB6C1';

    const previewEl = document.getElementById('avatarPickerCurrent');
    previewEl.style.backgroundColor = _pendingBgColor;
    previewEl.innerHTML = `<img src="${_pendingAvatar}" alt="アバター" class="player-avatar-img">`;

    document.getElementById('avatarPickerSwatches').innerHTML = avatarBgColors.map(color =>
        `<div class="avatar-bg-swatch ${color === _pendingBgColor ? 'selected' : ''}"
              style="background-color:${color};"
              onclick="changeStatusAvatarBg('${color}')"></div>`
    ).join('');

    document.getElementById('avatarPickerGrid').innerHTML = avatarOptions.map(path =>
        `<div class="profile-avatar-option ${path === p.avatar ? 'selected' : ''}"
              data-path="${path}"
              onclick="selectStatusAvatar('${path}')">
            <img src="${path}" alt="アバター">
        </div>`
    ).join('');
    document.getElementById('avatarPickerModal').classList.add('active');
}

function closeAvatarPickerModal() {
    document.getElementById('avatarPickerModal').classList.remove('active');
}

function selectStatusAvatar(path) {
    _pendingAvatar = path;
    document.getElementById('avatarPickerCurrent').innerHTML = `<img src="${path}" alt="アバター" class="player-avatar-img">`;
    document.querySelectorAll('#avatarPickerGrid .profile-avatar-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.path === path);
    });
}

function changeStatusAvatarBg(color) {
    _pendingBgColor = color;
    document.getElementById('avatarPickerCurrent').style.backgroundColor = color;
    const rgb = hexToRgb(color);
    document.querySelectorAll('.avatar-bg-swatch').forEach(el => {
        el.classList.toggle('selected', el.style.backgroundColor === rgb);
    });
}

function confirmAvatarPicker() {
    gameState.player.avatar = _pendingAvatar;
    gameState.player.avatarBgColor = _pendingBgColor;
    updateStatus();
    closeAvatarPickerModal();
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function readProfileFormValues() {
    const name = document.getElementById('profileName').value.trim();
    const genderRadio = document.querySelector('input[name="profileGender"]:checked');
    const gender = genderRadio ? genderRadio.value : '';
    const birthYear = document.getElementById('profileBirthYear').value;
    const birthMonth = document.getElementById('profileBirthMonth').value;
    const birthDay = document.getElementById('profileBirthDay').value;
    return { name, gender, birthYear, birthMonth, birthDay };
}

function showProfileConfirm() {
    const { name, gender, birthYear, birthMonth, birthDay } = readProfileFormValues();
    const nameHint = document.getElementById('profileNameHint');
    const genderHint = document.getElementById('profileGenderHint');
    const birthdayHint = document.getElementById('profileBirthdayHint');

    // ヒントをリセット
    nameHint.textContent = '';
    genderHint.textContent = '';
    birthdayHint.textContent = '';

    // バリデーション
    if (!name) {
        nameHint.textContent = '名前を入力してください';
        return;
    }
    if (name.length > 10) {
        nameHint.textContent = '名前は10文字以内で入力してください';
        return;
    }
    const isReserved = reservedNames.some(n => n.toLowerCase() === name.toLowerCase());
    if (isReserved) {
        nameHint.textContent = 'この名前はすでに使われています';
        return;
    }
    if (!gender) {
        genderHint.textContent = '性別を選択してください';
        return;
    }
    if (!birthYear || !birthMonth || !birthDay) {
        birthdayHint.textContent = '生年月日を選択してください';
        return;
    }

    // アイコン選択画面へ
    document.getElementById('profileFormView').style.display = 'none';
    showIconSelection();
}

function showIconSelection() {
    if (!_regPendingAvatar) _regPendingAvatar = avatarOptions[0];
    if (!_regPendingBgColor) _regPendingBgColor = '#FFB6C1';

    const previewEl = document.getElementById('regIconCurrent');
    previewEl.style.backgroundColor = _regPendingBgColor;
    previewEl.innerHTML = `<img src="${_regPendingAvatar}" alt="アバター" class="player-avatar-img">`;

    document.getElementById('regIconSwatches').innerHTML = avatarBgColors.map(color =>
        `<div class="avatar-bg-swatch ${color === _regPendingBgColor ? 'selected' : ''}"
              style="background-color:${color};"
              onclick="selectRegIconBg('${color}')"></div>`
    ).join('');

    document.getElementById('regIconGrid').innerHTML = avatarOptions.map(path =>
        `<div class="profile-avatar-option ${path === _regPendingAvatar ? 'selected' : ''}"
              data-path="${path}"
              onclick="selectRegIcon('${path}')">
            <img src="${path}" alt="アバター">
        </div>`
    ).join('');

    document.getElementById('profileIconView').style.display = 'block';
    document.querySelector('.registration-modal-content').classList.add('icon-step');
}

function selectRegIcon(path) {
    _regPendingAvatar = path;
    document.getElementById('regIconCurrent').innerHTML = `<img src="${path}" alt="アバター" class="player-avatar-img">`;
    document.querySelectorAll('#regIconGrid .profile-avatar-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.path === path);
    });
}

function selectRegIconBg(color) {
    _regPendingBgColor = color;
    document.getElementById('regIconCurrent').style.backgroundColor = color;
    const rgb = hexToRgb(color);
    document.querySelectorAll('#regIconSwatches .avatar-bg-swatch').forEach(el => {
        el.classList.toggle('selected', el.style.backgroundColor === rgb);
    });
}

function backToInfoForm() {
    document.getElementById('profileIconView').style.display = 'none';
    document.getElementById('profileFormView').style.display = 'block';
    document.querySelector('.registration-modal-content').classList.remove('icon-step');
}

function proceedToConfirm() {
    const { name, gender, birthYear, birthMonth, birthDay } = readProfileFormValues();

    const iconHtml = `<div class="reg-confirm-icon" style="background-color:${_regPendingBgColor};"><img src="${_regPendingAvatar}" alt="アイコン" class="player-avatar-img"></div>`;
    let html = '<div class="shokudo-eat-changes" style="width:100%;">';
    html += `<div class="shokudo-change-row"><span class="shokudo-change-label">アイコン</span><span class="shokudo-change-plus">${iconHtml}</span></div>`;
    html += `<div class="shokudo-change-row"><span class="shokudo-change-label">名前</span><span class="shokudo-change-plus">${escapeHtml(name)}</span></div>`;
    html += `<div class="shokudo-change-row"><span class="shokudo-change-label">性別</span><span class="shokudo-change-plus">${escapeHtml(gender)}</span></div>`;
    html += `<div class="shokudo-change-row"><span class="shokudo-change-label">生年月日</span><span class="shokudo-change-plus">${parseInt(birthYear)}年${parseInt(birthMonth)}月${parseInt(birthDay)}日</span></div>`;
    html += '</div>';

    document.getElementById('profileConfirmContent').innerHTML = html;
    document.getElementById('profileIconView').style.display = 'none';
    document.getElementById('profileConfirmView').style.display = 'block';
    document.querySelector('.registration-modal-content').classList.remove('icon-step');
}

function backToProfileForm() {
    document.getElementById('profileConfirmView').style.display = 'none';
    document.getElementById('profileIconView').style.display = 'none';
    document.getElementById('profileFormView').style.display = 'block';
    document.querySelector('.registration-modal-content').classList.remove('icon-step');
}

function submitProfile() {
    const { name, gender, birthYear, birthMonth, birthDay } = readProfileFormValues();

    // ゲームスタートまで一時保存（updateStatusに反映させない）
    const abilities = {};
    Object.keys(gameState.player.abilities).forEach(k => {
        abilities[k] = Math.floor(Math.random() * 11) + 10;
    });
    _regPendingData = {
        name,
        gender,
        birthday: { year: parseInt(birthYear), month: parseInt(birthMonth), day: parseInt(birthDay) },
        avatar: _regPendingAvatar || avatarOptions[0],
        avatarBgColor: _regPendingBgColor || '#FFB6C1',
        abilities,
    };

    showRegistrationResult();
}

function showRegistrationResult() {
    if (!_regPendingData) return;
    const p = gameState.player;
    const d = _regPendingData;
    const bmi = calculateBMI(p);

    let html = '<div class="profile-result-body-section">';
    html += `<div class="profile-result-stat-item"><span class="profile-result-stat-label">身長</span><span class="profile-result-stat-value">${p.height} cm</span></div>`;
    html += `<div class="profile-result-stat-item"><span class="profile-result-stat-label">体重</span><span class="profile-result-stat-value">${p.weight} kg</span></div>`;
    html += `<div class="profile-result-stat-item"><span class="profile-result-stat-label">BMI</span><span class="profile-result-stat-value">${bmi.toFixed(1)}</span></div>`;
    html += '</div>';
    html += '<div class="profile-result-ability-section">';
    html += '<div class="profile-result-ability-grid">';
    Object.entries(d.abilities).forEach(([key, val]) => {
        html += `<div class="profile-result-ability-item"><span class="profile-result-ability-label">${key}</span><span class="profile-result-ability-value">${val}</span></div>`;
    });
    html += '</div></div>';

    document.getElementById('profileResultContent').innerHTML = html;
    document.getElementById('profileFormView').style.display = 'none';
    document.getElementById('profileConfirmView').style.display = 'none';
    document.getElementById('profileResultView').style.display = 'block';
}

function startGame() {
    const p = gameState.player;
    const d = _regPendingData;
    p.name = d.name;
    p.gender = d.gender;
    p.birthday = d.birthday;
    p.avatar = d.avatar;
    p.avatarBgColor = d.avatarBgColor;
    Object.assign(p.abilities, d.abilities);
    _regPendingData = null;

    document.getElementById('registrationModal').classList.remove('active');
    updateStatus();
}

function openInformation() {
    // TODO: インフォメーション画面を表示
    showToast('インフォメーション（準備中）');
}

function openFeedback() {
    // TODO: ご意見・ご感想画面を表示
    showToast('ご意見・ご感想（準備中）');
}

function openNews() {
    // TODO: 最近のニュース画面を表示
    showToast('最近のニュース（準備中）');
}
