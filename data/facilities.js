// ============================================
// 施設（ジム・スクール・温泉・病院）
// ============================================

// ジムモーダル
function openGymModal() {
    renderGymTable();
    document.getElementById('gymTableView').style.display = 'flex';
    document.getElementById('gymModal').classList.add('active');
}

function closeGymModal() {
    document.getElementById('gymModal').classList.remove('active');
    flushRandomEvent();
}

function closeGymResultModal() {
    document.getElementById('gymResultModal').classList.remove('active');
    closeGymModal();
}

// 習い事スクールモーダル
function openSchoolModal() {
    renderSchoolTable();
    document.getElementById('schoolTableView').style.display = 'flex';
    document.getElementById('schoolModal').classList.add('active');
}

function closeSchoolModal() {
    document.getElementById('schoolModal').classList.remove('active');
    flushRandomEvent();
}

function closeSchoolResultModal() {
    document.getElementById('schoolResultModal').classList.remove('active');
    closeSchoolModal();
}

// ジム
const gymMenus = [
    { name: 'スイミング',   image: 'public/gym/swimming.png',   stats: { 体力: 8, ルックス: 7, 素早さ: 6, エロさ: 9 },  price: 15000, bodyConsume: 20, bmi: [17, 35], calorie: 1000 },
    { name: 'ダンス',       image: 'public/gym/dance.png',       stats: { ルックス: 6, 素早さ: 7, 面白さ: 7, エロさ: 10 }, price: 15000, bodyConsume: 20, bmi: [17, 32], calorie: 800 },
    { name: 'ジョギング',   image: 'public/gym/Jogging.png',     stats: { 体力: 8, 気力: 8, ルックス: 7, 優しさ: 7 },  price: 15000, bodyConsume: 20, bmi: [17, 35], calorie: 700 },
    { name: 'フットサル',   image: 'public/gym/futsal.png',      stats: { 体力: 6, 素早さ: 9, 面白さ: 7, 優しさ: 8 },  price: 15000, bodyConsume: 20, bmi: [17, 33], calorie: 900 },
    { name: 'テニス',       image: 'public/gym/tennis.png',      stats: { 体力: 7, 気力: 6, 素早さ: 10, 面白さ: 7 },  price: 15000, bodyConsume: 20, bmi: [17, 33], calorie: 800 },
    { name: '空手',         image: 'public/gym/karate.png',      stats: { 体力: 8, 気力: 10, 優しさ: 7, エロさ: 5 },  price: 15000, bodyConsume: 20, bmi: [17, 35], calorie: 1000 },
    { name: 'ヨガ',         image: 'public/gym/yoga.png',        stats: { 気力: 7, ルックス: 8, 優しさ: 5, エロさ: 10 }, price: 15000, bodyConsume: 20, bmi: [17, 40], calorie: 600 },
    { name: 'ボクシング',   image: 'public/gym/boxing.png',      stats: { 体力: 8, 素早さ: 9, 面白さ: 5, エロさ: 8 },  price: 15000, bodyConsume: 20, bmi: [17, 35], calorie: 1200 },
    { name: 'トランポリン', image: 'public/gym/trampoline.png',  stats: { ルックス: 6, 素早さ: 5, 面白さ: 11, 優しさ: 8 }, price: 15000, bodyConsume: 20, bmi: [17, 30], calorie: 900 },
    { name: '弓道',         image: 'public/gym/kyudo.png',       stats: { 気力: 10, ルックス: 7, 面白さ: 5, 優しさ: 8 }, price: 15000, bodyConsume: 20, bmi: [17, 40], calorie: 600 },
    { name: 'バレエ',       image: 'public/gym/ballet.png',      stats: { 気力: 5, ルックス: 10, 素早さ: 6, エロさ: 9 }, price: 15000, bodyConsume: 20, bmi: [17, 25], calorie: 700 },
    { name: 'ボルダリング', image: 'public/gym/bouldering.png',  stats: { 体力: 7, 気力: 6, 面白さ: 9, 優しさ: 8 },  price: 15000, bodyConsume: 20, bmi: [17, 28], calorie: 1100 }
];

function updateGymPanel() {
    const selected = document.querySelector('input[name="gymMenu"]:checked');
    const panel = document.getElementById('gymPanel');
    const trainBtn = document.getElementById('gymTrainBtn');

    if (!selected) {
        panel.innerHTML = '<p class="shokudo-no-select">メニューを選んでください</p>';
        trainBtn.disabled = true;
        trainBtn.classList.remove('active');
        return;
    }

    const index = parseInt(selected.value);
    const menu = gymMenus[index];
    const p = gameState.player;
    const playerBmi = calculateBMI(p);
    const bmiOk = playerBmi >= menu.bmi[0] && playerBmi <= menu.bmi[1];
    const canTrain = p.health >= menu.bodyConsume && p.money >= menu.price && bmiOk && !p.disease;

    panel.innerHTML = `
        <div class="shokudo-selected-content">
            <p class="shokudo-select-name">${menu.name}</p>
            ${menu.image ? `<img src="${menu.image}" alt="${menu.name}" class="gym-select-img">` : ''}
            <div class="shokudo-select-divider"></div>
            <div class="shokudo-select-row">
                <span class="shokudo-select-key">消費カロリー</span>
                <span class="shokudo-select-val">${menu.calorie}kcal</span>
            </div>
            <div class="shokudo-select-row">
                <span class="shokudo-select-key">身体消費</span>
                <span class="shokudo-select-val">${menu.bodyConsume}</span>
            </div>
            <div class="shokudo-select-row shokudo-select-price-row">
                <span class="shokudo-select-key">金額</span>
                <span class="shokudo-select-val shokudo-select-price">${menu.price.toLocaleString()} 円</span>
            </div>
        </div>
    `;

    const bodyWarn = document.getElementById('gymBodyWarn');
    let warnMsg = '';
    if (p.disease) {
        warnMsg = '病気のためトレーニングできません';
    } else if (!bmiOk) {
        warnMsg = '体格指数の条件を満たしていません';
    } else if (p.money < menu.price) {
        warnMsg = '所持金が足りません';
    } else if (p.health < menu.bodyConsume) {
        warnMsg = '身体パワーが足りません';
    }
    if (warnMsg) {
        bodyWarn.textContent = warnMsg;
        bodyWarn.style.display = '';
    } else {
        bodyWarn.style.display = 'none';
    }

    trainBtn.disabled = !canTrain;
    trainBtn.classList.toggle('active', canTrain);
}

// テーブル列構成（11列）: 商品名(1) + 身体系能力値7(体力,気力,ルックス,素早さ,面白さ,優しさ,エロさ) + カロリー(1) + 価格(1) + 身体消費(1)
function renderGymTable() {
    const tbody = document.getElementById('gymTableBody');
    const abilities = gameState.player.abilities;
    const playerBmi = calculateBMI(gameState.player);

    const gymAbilityKeys = ['体力', '気力', 'ルックス', '素早さ', '面白さ', '優しさ', 'エロさ'];

    let targetAbilitiesGym = {};
    let targetJobRow = '';
    if (gameState.player.targetJob) {
        const targetJob = jobsData.find(j => j.id === gameState.player.targetJob);
        if (targetJob) {
            const tier = gameState.player.targetJobTier || 1;
            const tierData = getJobTierData(targetJob, tier);
            targetAbilitiesGym = tierData.abilities;
            const targetCells = gymAbilityKeys.map(k => `<td>${tierData.abilities[k] || ''}</td>`).join('');
            targetJobRow = `
        <tr class="target-job-stats">
            <td class="target-job-stats-label">目標の職業：${targetJob.names[tier - 1]}</td>
            ${targetCells}
            <td></td><td></td><td></td>
        </tr>`;
        }
    }

    let userCells = '';
    gymAbilityKeys.forEach(key => {
        const req = targetAbilitiesGym[key];
        userCells += `<td${req && abilities[key] >= req ? ' class="stat-achieved"' : ''}>${abilities[key]}</td>`;
    });
    const userStatsRow = `
        <tr class="gym-user-stats">
            <td class="gym-user-stats-label">現在の能力値</td>
            ${userCells}
            <td></td>
            <td></td>
            <td></td>
        </tr>
    `;

    // メニュー行
    let menuRows = '';
    gymMenus.forEach((menu, index) => {
        let abilityCells = '';
        gymAbilityKeys.forEach(key => {
            const val = menu.stats[key];
            abilityCells += `<td>${val ? val : ''}</td>`;
        });

        menuRows += `
            <tr>
                <td class="gym-menu-name"><label><input type="radio" name="gymMenu" class="gym-radio" value="${index}" onchange="updateGymPanel()"> ${menu.name}</label></td>
                ${abilityCells}
                <td>${menu.calorie > 0 ? menu.calorie + 'kcal' : '-'}</td>
                <td class="gym-price">${menu.price.toLocaleString()}円</td>
                <td>${menu.bodyConsume}</td>
            </tr>
        `;
    });

    tbody.innerHTML = userStatsRow + targetJobRow + menuRows;

    // 右パネル初期化
    document.getElementById('gymMoney').textContent = `${gameState.player.money.toLocaleString()}円`;
    document.getElementById('gymPanel').innerHTML = '<p class="shokudo-no-select">メニューを選んでください</p>';
    document.getElementById('gymBodyWarn').style.display = 'none';
    const trainBtn = document.getElementById('gymTrainBtn');
    trainBtn.disabled = true;
    trainBtn.classList.remove('active');
}

// ============================================
// 習い事スクール
// ============================================
const schoolMenus = [
    { name: '英会話教室',         image: 'public/school/english.png', stats: { 国語: 8, 社会: 7, 英語: 9, 音楽: 6 },         price: 15000, brainConsume: 20 },
    { name: 'ピアノレッスン',      image: 'public/school/piano.png',   stats: { 数学: 5, 理科: 7, 音楽: 9, 美術: 9 },         price: 15000, brainConsume: 20 },
    { name: 'プログラミング講座',   image: 'public/school/program.png', stats: { 数学: 10, 理科: 8, 社会: 5, 英語: 7 },       price: 15000, brainConsume: 20 },
    { name: 'お料理教室',          image: 'public/school/cook.png',    stats: { 国語: 6, 理科: 8, 社会: 8, 美術: 8 },         price: 15000, brainConsume: 20 },
    { name: 'イラスト講座',        image: 'public/school/illust.png',  stats: { 国語: 7, 数学: 6, 音楽: 7, 美術: 10 },        price: 15000, brainConsume: 20 },
    { name: 'ボーカルレッスン',    image: 'public/school/vocal.png',   stats: { 国語: 6, 英語: 7, 音楽: 10, 美術: 7 },        price: 15000, brainConsume: 20 },
    { name: '写真教室',            image: 'public/school/photo.png',   stats: { 理科: 7, 社会: 8, 音楽: 7, 美術: 8 },         price: 15000, brainConsume: 20 },
    { name: 'コーヒー講座',        image: 'public/school/coffee.png',  stats: { 国語: 8, 数学: 8, 理科: 7, 社会: 7 },         price: 15000, brainConsume: 20 },
    { name: '心理学講座',          image: 'public/school/psy.png',     stats: { 国語: 9, 数学: 8, 社会: 8, 英語: 5 },         price: 15000, brainConsume: 20 },
    { name: 'ペン字・美文字',      image: 'public/school/bimoji.png',  stats: { 国語: 8, 数学: 5, 英語: 7, 美術: 10 },        price: 15000, brainConsume: 20 },
    { name: '占い講座',            image: 'public/school/fotune.png',  stats: { 理科: 7, 社会: 8, 英語: 9, 音楽: 6 },         price: 15000, brainConsume: 20 },
    { name: 'マネーリテラシー講座', image: 'public/school/money.png',   stats: { 数学: 9, 理科: 7, 英語: 8, 音楽: 6 },        price: 15000, brainConsume: 20 }
];

function updateSchoolPanel() {
    const selected = document.querySelector('input[name="schoolMenu"]:checked');
    const panel = document.getElementById('schoolPanel');
    const lessonBtn = document.getElementById('schoolLessonBtn');

    if (!selected) {
        panel.innerHTML = '<p class="shokudo-no-select">メニューを選んでください</p>';
        lessonBtn.disabled = true;
        lessonBtn.classList.remove('active');
        return;
    }

    const index = parseInt(selected.value);
    const menu = schoolMenus[index];
    const p = gameState.player;
    const canLesson = p.intelligence >= menu.brainConsume && p.money >= menu.price && !p.disease;

    panel.innerHTML = `
        <div class="shokudo-selected-content">
            <p class="shokudo-select-name">${menu.name}</p>
            ${menu.image ? `<img src="${menu.image}" alt="${menu.name}" class="gym-select-img">` : ''}
            <div class="shokudo-select-divider"></div>
            <div class="shokudo-select-row">
                <span class="shokudo-select-key">頭脳消費</span>
                <span class="shokudo-select-val">${menu.brainConsume}</span>
            </div>
            <div class="shokudo-select-row shokudo-select-price-row">
                <span class="shokudo-select-key">金額</span>
                <span class="shokudo-select-val shokudo-select-price">${menu.price.toLocaleString()} 円</span>
            </div>
        </div>
    `;

    const brainWarn = document.getElementById('schoolBrainWarn');
    let warnMsg = '';
    if (p.disease) {
        warnMsg = '病気のためレッスンを受けられません';
    } else if (p.money < menu.price) {
        warnMsg = '所持金が足りません';
    } else if (p.intelligence < menu.brainConsume) {
        warnMsg = '頭脳パワーが足りません';
    }
    if (warnMsg) {
        brainWarn.textContent = warnMsg;
        brainWarn.style.display = '';
    } else {
        brainWarn.style.display = 'none';
    }

    lessonBtn.disabled = !canLesson;
    lessonBtn.classList.toggle('active', canLesson);
}

// テーブル列構成（10列）: 商品名(1) + 頭脳系能力値7(国語,数学,理科,社会,英語,音楽,美術) + 価格(1) + 頭脳消費(1)
function renderSchoolTable() {
    const tbody = document.getElementById('schoolTableBody');
    const abilities = gameState.player.abilities;

    const schoolAbilityKeys = ['国語', '数学', '理科', '社会', '英語', '音楽', '美術'];

    let targetAbilitiesSchool = {};
    let targetJobRow = '';
    if (gameState.player.targetJob) {
        const targetJob = jobsData.find(j => j.id === gameState.player.targetJob);
        if (targetJob) {
            const tier = gameState.player.targetJobTier || 1;
            const tierData = getJobTierData(targetJob, tier);
            targetAbilitiesSchool = tierData.abilities;
            const targetCells = schoolAbilityKeys.map(k => `<td>${tierData.abilities[k] || ''}</td>`).join('');
            targetJobRow = `
        <tr class="target-job-stats">
            <td class="target-job-stats-label">目標の職業：${targetJob.names[tier - 1]}</td>
            ${targetCells}
            <td></td><td></td>
        </tr>`;
        }
    }

    let userCells = '';
    schoolAbilityKeys.forEach(key => {
        const req = targetAbilitiesSchool[key];
        userCells += `<td${req && abilities[key] >= req ? ' class="stat-achieved"' : ''}>${abilities[key]}</td>`;
    });
    const userStatsRow = `
        <tr class="gym-user-stats">
            <td class="gym-user-stats-label">現在の能力値</td>
            ${userCells}
            <td></td>
            <td></td>
        </tr>
    `;

    // メニュー行
    let menuRows = '';
    schoolMenus.forEach((menu, index) => {
        let abilityCells = '';
        schoolAbilityKeys.forEach(key => {
            const val = menu.stats[key];
            abilityCells += `<td>${val ? val : ''}</td>`;
        });

        menuRows += `
            <tr>
                <td class="gym-menu-name"><label><input type="radio" name="schoolMenu" class="gym-radio" value="${index}" onchange="updateSchoolPanel()"> ${menu.name}</label></td>
                ${abilityCells}
                <td class="gym-price">${menu.price.toLocaleString()}円</td>
                <td>${menu.brainConsume}</td>
            </tr>
        `;
    });

    tbody.innerHTML = userStatsRow + targetJobRow + menuRows;

    // 右パネル初期化
    document.getElementById('schoolMoney').textContent = `${gameState.player.money.toLocaleString()}円`;
    document.getElementById('schoolPanel').innerHTML = '<p class="shokudo-no-select">メニューを選んでください</p>';
    document.getElementById('schoolBrainWarn').style.display = 'none';
    const lessonBtn = document.getElementById('schoolLessonBtn');
    lessonBtn.disabled = true;
    lessonBtn.classList.remove('active');
}

function doSchoolLesson() {
    const selected = document.querySelector('input[name="schoolMenu"]:checked');
    if (!selected) {
        showToast('メニューを選択してください');
        return;
    }

    const menu = schoolMenus[selected.value];
    const p = gameState.player;

    // 病気チェック
    if (p.disease) {
        const diseaseInfo = diseasesData.find(d => d.id === p.disease);
        showToast(`${diseaseInfo ? diseaseInfo.name : '病気'}のためレッスンを受けられません。。。`, 2000);
        return;
    }

    // クールダウンチェック（30分）
    if (gameState.lastSchoolTime) {
        const elapsed = Date.now() - new Date(gameState.lastSchoolTime).getTime();
        const cooldownMs = 30 * 60 * 1000;
        if (elapsed < cooldownMs) {
            const remaining = cooldownMs - elapsed;
            const min = Math.floor(remaining / 60000);
            const sec = Math.floor((remaining % 60000) / 1000);
            showToast(`まだ30分経過していません。\n次のレッスンまであと ${min}分${sec.toString().padStart(2, '0')}秒`, 3000);
            return;
        }
    }

    // 所持金チェック
    if (p.money < menu.price) {
        showToast('所持金が足りません');
        return;
    }

    // 頭脳パワーチェック
    if (p.intelligence < menu.brainConsume) {
        showToast('頭脳パワーが足りません');
        return;
    }

    // 支払い＆消費
    changeMoney(-menu.price);
    changeIntelligence(-menu.brainConsume);

    // クールダウン開始時刻を記録
    gameState.lastSchoolTime = new Date().toISOString();

    // 能力値を加算
    const abilities = p.abilities;
    for (const key in menu.stats) {
        if (key in abilities && menu.stats[key]) {
            abilities[key] += menu.stats[key];
        }
    }

    updateStatus();

    // 結果表示
    let schoolStatsHtml = '<div class="shokudo-eat-changes">';
    for (const [key, value] of Object.entries(menu.stats)) {
        if (value > 0) {
            schoolStatsHtml += `<div class="shokudo-change-row">
                <span class="shokudo-change-label">${key}</span>
                <span class="shokudo-change-plus">+${value}</span>
            </div>`;
        }
    }
    schoolStatsHtml += `<div class="shokudo-change-row">
        <span class="shokudo-change-label">頭脳パワー消費</span>
        <span class="work-change-minus">-${menu.brainConsume}</span>
    </div>`;
    schoolStatsHtml += '</div>';

    const resultHtml = `<div class="shokudo-eat-result">
        <div class="shokudo-eat-heading">${menu.name}を受講しました！</div>
        ${menu.image ? `<img src="${menu.image}" alt="${menu.name}" class="shokudo-result-img">` : ''}
        ${schoolStatsHtml}
    </div>`;
    document.getElementById('schoolResultContent').innerHTML = resultHtml;
    document.getElementById('schoolResultModal').classList.add('active');

    gameState.pendingRandomEvent = true;
    afterAction();
}

// はてなツールチップ（position:fixed で overflow の影響を回避）
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.gym-hatena-wrapper').forEach(wrapper => {
        const icon = wrapper.querySelector('.gym-hatena-icon');
        const tooltip = wrapper.querySelector('.gym-hatena-tooltip');
        if (icon && tooltip) {
            icon.addEventListener('mouseenter', () => {
                const rect = icon.getBoundingClientRect();
                tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                tooltip.style.top = (rect.top - 8) + 'px';
                tooltip.style.transform = 'translate(-50%, -100%)';
                tooltip.style.display = 'block';
            });
            icon.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        }
    });
});

function doGymTraining() {
    const selected = document.querySelector('input[name="gymMenu"]:checked');
    if (!selected) {
        showToast('メニューを選択してください');
        return;
    }

    const menu = gymMenus[selected.value];
    const p = gameState.player;

    // 病気チェック
    if (p.disease) {
        const diseaseInfo = diseasesData.find(d => d.id === p.disease);
        showToast(`${diseaseInfo ? diseaseInfo.name : '病気'}のためトレーニングできません。。。`, 2000);
        return;
    }

    // クールダウンチェック（30分）※テスト用: 無効化
    /* if (gameState.lastGymTime) {
        const elapsed = Date.now() - new Date(gameState.lastGymTime).getTime();
        const cooldownMs = 30 * 60 * 1000;
        if (elapsed < cooldownMs) {
            const remaining = cooldownMs - elapsed;
            const min = Math.floor(remaining / 60000);
            const sec = Math.floor((remaining % 60000) / 1000);
            showToast(`まだ30分経過していません。\n次のトレーニングまであと ${min}分${sec.toString().padStart(2, '0')}秒`, 3000);
            return;
        }
    } */

    const playerBmi = calculateBMI(p);

    // BMIチェック
    if (playerBmi < menu.bmi[0] || playerBmi > menu.bmi[1]) {
        showToast('体格指数（BMI）が条件を満たしていません');
        return;
    }

    // 所持金チェック
    if (p.money < menu.price) {
        showToast('所持金が足りません');
        return;
    }

    // 身体パワーチェック
    if (p.health < menu.bodyConsume) {
        showToast('身体パワーが足りません');
        return;
    }

    // 支払い＆消費
    changeMoney(-menu.price);
    changeHealth(-menu.bodyConsume);
    const weightLoss = menu.calorie / 1000;
    changeWeight(-weightLoss);

    // クールダウン開始時刻を記録
    gameState.lastGymTime = new Date().toISOString();

    // 能力値を加算
    const abilities = p.abilities;
    for (const key in menu.stats) {
        if (key in abilities && menu.stats[key]) {
            abilities[key] += menu.stats[key];
        }
    }

    updateStatus();

    // 結果表示（画面切り替え）
    let statsHtml = '<div class="shokudo-eat-changes">';
    for (const [key, value] of Object.entries(menu.stats)) {
        if (value > 0) {
            statsHtml += `<div class="shokudo-change-row">
                <span class="shokudo-change-label">${key}</span>
                <span class="shokudo-change-plus">+${value}</span>
            </div>`;
        }
    }
    statsHtml += `<div class="shokudo-change-row">
        <span class="shokudo-change-label">消費カロリー</span>
        <span class="work-change-minus">${menu.calorie}kcal</span>
    </div>
    <div class="shokudo-change-row">
        <span class="shokudo-change-label">体重</span>
        <span class="work-change-minus">-${weightLoss.toFixed(1)}kg</span>
    </div>`;
    statsHtml += '</div>';

    const resultHtml = `<div class="shokudo-eat-result">
        <div class="shokudo-eat-heading">${menu.name}をしました！</div>
        ${menu.image ? `<img src="${menu.image}" alt="${menu.name}" class="shokudo-result-img">` : ''}
        ${statsHtml}
    </div>`;
    document.getElementById('gymResultContent').innerHTML = resultHtml;
    document.getElementById('gymResultModal').classList.add('active');

    gameState.pendingRandomEvent = true;
    afterAction();
}

// BGM
// ↓ここに曲を追加するだけでランダム再生されます♪
const onsenBgmList = [
    'BGM/onsen-ryokan-1.mp3',
    'BGM/onsen-ryokan-3.mp3',
    'BGM/onsen-ryokan-6.mp3',
    'BGM/onsen-ryokan-7.mp3',
    'BGM/onsen-ryokan-8.mp3',
    'BGM/onsen-ryokan-9.mp3',
    'BGM/onsen-ryokan-15.mp3',
    'BGM/onsen-ryokan-16.mp3',
    'BGM/onsen-ryokan-17.mp3',
    'BGM/onsen-ryokan-18.mp3',
    'BGM/onsen-ryokan-19.mp3',
    'BGM/onsen-ryokan-20.mp3',
];

let bgmPlaying = false;
let lastBgmIndex = -1;
const bgmAudio = new Audio();
bgmAudio.volume = 0.50;

function playRandomBgm() {
    let index;
    if (onsenBgmList.length === 1) {
        index = 0;
    } else {
        do {
            index = Math.floor(Math.random() * onsenBgmList.length);
        } while (index === lastBgmIndex);
    }
    lastBgmIndex = index;
    bgmAudio.src = onsenBgmList[index];
    bgmAudio.play();
}

// 曲が終わったら次のランダム曲を再生
bgmAudio.addEventListener('ended', () => {
    if (bgmPlaying) {
        playRandomBgm();
    }
});

function toggleBgm() {
    if (bgmPlaying) {
        bgmAudio.pause();
        bgmPlaying = false;
    } else {
        playRandomBgm();
        bgmPlaying = true;
    }
}

// 温泉施設
let onsenBgTimer = null;
let onsenRecoveryTimer = null;

function openOnsenLobby() {
    document.getElementById('onsenLobbyView').style.display = '';
    document.getElementById('onsenBathView').style.display = 'none';
    document.getElementById('onsenShopView').style.display = 'none';
    document.getElementById('onsenShopCompleteView').style.display = 'none';
    document.getElementById('onsenLobbyCloseBtn').style.display = '';
    const mc = document.querySelector('#onsenModal .modal-content');
    mc.classList.add('onsen-lobby-mode');
    mc.classList.remove('onsen-shop-mode');
    document.getElementById('onsenModal').classList.add('active');

    // 時間帯別背景画像
    const hour = new Date().getHours();
    let bgImg = 'haikei/onsen3.jpg';
    if (hour >= 5 && hour < 15) bgImg = 'haikei/onsen3.jpg';
    else if (hour >= 15 && hour < 18) bgImg = 'haikei/onsen4.jpg';
    else bgImg = 'haikei/onsen5.jpg';
    const imgEl = document.getElementById('onsenLobbyImg');
    if (imgEl) imgEl.src = bgImg;
}

function closeOnsenLobbyAndOpenShop() {
    openOnsenShop();
}

function normalBath() {
    if (gameState.player.money < 1500) {
        showToast('所持金が足りません（入浴料：1,500円）');
        return;
    }
    changeMoney(-1500);
    updateStatus();

    const p = gameState.player;
    const healthPercent = p.health / p.maxHealth * 100;
    const intelligencePercent = p.intelligence / p.maxIntelligence * 100;
    document.getElementById('onsenHealth').textContent = p.health;
    document.getElementById('onsenMaxHealth').textContent = p.maxHealth;
    document.getElementById('onsenHealthBar').style.width = healthPercent + '%';
    document.getElementById('onsenHealthBar').style.background = getBarColor(healthPercent);

    document.getElementById('onsenIntelligence').textContent = p.intelligence;
    document.getElementById('onsenMaxIntelligence').textContent = p.maxIntelligence;
    document.getElementById('onsenIntelligenceBar').style.width = intelligencePercent + '%';
    document.getElementById('onsenIntelligenceBar').style.background = getBarColor(intelligencePercent);

    // ロビーを隠して入浴ビューを表示
    document.getElementById('onsenLobbyView').style.display = 'none';
    document.getElementById('onsenBathView').style.display = '';
    document.getElementById('onsenLobbyCloseBtn').style.display = 'none';
    document.querySelector('#onsenModal .modal-content').classList.remove('onsen-lobby-mode');
    document.getElementById('onsenModal').classList.add('active');

    // 背景画像の交互切り替え開始
    const img = document.getElementById('onsenBgImg');
    let isFirst = true;
    img.src = 'haikei/onsen.png';
    onsenBgTimer = setInterval(() => {
        isFirst = !isFirst;
        img.src = isFirst ? 'haikei/onsen.png' : 'haikei/onsen2.png';
    }, 2000);

    // 10倍速回復（3秒に1ポイント）
    onsenRecoveryTimer = setInterval(() => {
        const pl = gameState.player;
        let recovered = false;
        if (pl.health < pl.maxHealth) {
            pl.health = Math.min(pl.maxHealth, pl.health + 1);
            recovered = true;
        }
        if (pl.intelligence < pl.maxIntelligence) {
            pl.intelligence = Math.min(pl.maxIntelligence, pl.intelligence + 1);
            recovered = true;
        }
        if (recovered) {
            const hp = pl.health / pl.maxHealth * 100;
            const ip = pl.intelligence / pl.maxIntelligence * 100;
            document.getElementById('onsenHealth').textContent = pl.health;
            document.getElementById('onsenHealthBar').style.width = hp + '%';
            document.getElementById('onsenHealthBar').style.background = getBarColor(hp);
            document.getElementById('onsenIntelligence').textContent = pl.intelligence;
            document.getElementById('onsenIntelligenceBar').style.width = ip + '%';
            document.getElementById('onsenIntelligenceBar').style.background = getBarColor(ip);
            updateStatus();
        }
    }, 3000);
}

function closeOnsenModal() {
    // タイマー停止
    if (onsenBgTimer) {
        clearInterval(onsenBgTimer);
        onsenBgTimer = null;
    }
    if (onsenRecoveryTimer) {
        clearInterval(onsenRecoveryTimer);
        onsenRecoveryTimer = null;
    }
    // BGM停止
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgmPlaying = false;
    document.getElementById('onsenModal').classList.remove('active');
    // ビューをロビーに戻す
    document.getElementById('onsenLobbyView').style.display = '';
    document.getElementById('onsenBathView').style.display = 'none';
    document.getElementById('onsenShopView').style.display = 'none';
    document.getElementById('onsenShopCompleteView').style.display = 'none';
    document.getElementById('onsenLobbyCloseBtn').style.display = '';
    const mc = document.querySelector('#onsenModal .modal-content');
    mc.classList.add('onsen-lobby-mode');
    mc.classList.remove('onsen-shop-mode');
    // ランダムイベント判定
    flushRandomEvent();
}

function adBath() {
    // TODO: 広告風呂の処理
}

// ============================================
// 病院
// ============================================
function openHospitalModal() {
    const p = gameState.player;
    const diseaseInfo = p.disease ? diseasesData.find(d => d.id === p.disease) : null;

    // 診察画面をリセット
    document.getElementById('hospitalMainView').style.display = 'block';
    document.getElementById('hospitalCompleteView').style.display = 'none';

    if (diseaseInfo) {
        document.getElementById('hospitalModalDesc').innerHTML = diseaseInfo.doctorMsg;
        document.getElementById('hospitalModalButtons').innerHTML = `
            <button class="btn btn-primary hospital-action-btn" onclick="treatDisease()">お願いします</button>
            <button class="btn hospital-cancel-btn" onclick="closeHospitalModal()">ぼったくりっぽいのでやめる</button>
        `;
    } else {
        document.getElementById('hospitalModalDesc').innerHTML = 'どこも悪いところはないようです。<br>念のため注射を打っておきますか？<br>10,000円かかりますが。。。';
        document.getElementById('hospitalModalButtons').innerHTML = `
            <button class="btn btn-primary hospital-action-btn" onclick="preventiveShot()">お願いします</button>
            <button class="btn hospital-cancel-btn" onclick="closeHospitalModal()">金を取られる前に退散する</button>
        `;
    }

    document.getElementById('hospitalModal').classList.add('active');
}

function closeHospitalModal() {
    document.getElementById('hospitalModal').classList.remove('active');
    flushRandomEvent();
}

function treatDisease() {
    const p = gameState.player;
    const diseaseInfo = p.disease ? diseasesData.find(d => d.id === p.disease) : null;
    if (!diseaseInfo) return;

    if (p.money < diseaseInfo.cost) {
        showToast('お金が足りません。。。', 2000);
        return;
    }

    p.money -= diseaseInfo.cost;
    p.disease = null;
    gameState.pendingRandomEvent = true;
    updateStatus();

    document.getElementById('hospitalMainView').style.display = 'none';
    document.getElementById('hospitalCompleteMsg').innerHTML = '病気の治療が完了しました。<br>これでもう安心です。<br>病気の際はまた当院をご利用くださいませ。';
    document.getElementById('hospitalCompleteView').style.display = 'block';
}

function preventiveShot() {
    const p = gameState.player;

    if (p.money < 10000) {
        showToast('お金が足りません。。。', 2000);
        return;
    }

    p.money -= 10000;
    gameState.pendingRandomEvent = true;
    updateStatus();

    document.getElementById('hospitalMainView').style.display = 'none';
    document.getElementById('hospitalCompleteMsg').innerHTML = 'これで風邪予防は万全です。<br>まぁ、だからと言って体調に何の変化もありませんがね。<br>ぜひまたお待ちしております。';
    document.getElementById('hospitalCompleteView').style.display = 'block';
}

