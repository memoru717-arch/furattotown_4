// ============================================
// 会社
// ============================================

// 会社モーダル
let workCooldownInterval = null;

function openWorkModal() {
    const modal = document.getElementById('workModal');
    const messageEl = document.getElementById('workResultMessage');
    const detailsEl = document.getElementById('workResultDetails');
    const p = gameState.player;
    const buttonsEl = document.querySelector('.work-modal-buttons');
    const workOkBtn = document.getElementById('workOkBtn');
    const workModalBody = document.querySelector('.work-modal-body');
    buttonsEl.classList.remove('work-success');
    workOkBtn.classList.remove('work-ok-success');
    workModalBody.classList.remove('work-success');

    // 無職チェック
    if (p.job === '無職') {
        messageEl.innerHTML = '<span class="error-text">ERROR！</span><br>まだ職に就いていないようです。<br>H-10の職業安定所で職を探しましょう！';
        messageEl.classList.add('no-job');
        detailsEl.innerHTML = '';
    } else {
        // 現在の職業データを取得
        const job = jobsData.find(j => j.id === p.currentJobId);
        if (!job) {
            messageEl.innerHTML = '職業データが見つかりません。';
            messageEl.classList.add('no-job');
            detailsEl.innerHTML = '';
            modal.classList.add('active');
            return;
        }

        // 現在のクラスに応じたデータを取得（中級・上級は能力値・給料・消費が異なる）
        const currentClass = getPlayerCurrentClass();
        const tierData = getJobTierData(job, currentClass);

        // 出勤間隔チェック（1分 = 60000ミリ秒）
        const workInterval = 600000; // 10分のクールタイム
        if (p.lastWorkTime && Date.now() - p.lastWorkTime < workInterval) {
            messageEl.classList.add('no-job');
            detailsEl.innerHTML = '';

            // カウントダウン更新関数
            const updateWorkCooldown = () => {
                const remaining = workInterval - (Date.now() - p.lastWorkTime);
                if (remaining <= 0) {
                    if (workCooldownInterval) {
                        clearInterval(workCooldownInterval);
                        workCooldownInterval = null;
                    }
                    messageEl.innerHTML = '出勤できるようになりました！';
                    return;
                }
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                const timeText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
                messageEl.innerHTML = `<span class="error-text">ERROR！</span><br>出勤できる間隔は10分です。<br>次に出勤できるまであと <span style="color: #4EA840; font-weight: bold;">${timeText}</span>`;
            };

            updateWorkCooldown();
            if (workCooldownInterval) clearInterval(workCooldownInterval);
            workCooldownInterval = setInterval(updateWorkCooldown, 1000);

            modal.classList.add('active');
            return;
        }

        // コンディションチェック
        const condition = getCondition();
        if (condition.text === '絶不調') {
            messageEl.innerHTML = '<span class="error-text">ERROR！</span><br>コンディションが絶不調のため出勤できないようです。。。';
            messageEl.classList.add('no-job');
            detailsEl.innerHTML = '';
            modal.classList.add('active');
            return;
        }

        // BMIチェック（表示値と合わせるため小数点1桁で比較）
        const heightM = p.height / 100;
        const playerBMI = Math.round(p.weight / (heightM * heightM) * 10) / 10;
        const minBMI = job.conditions.bmi[0];
        const maxBMI = job.conditions.bmi[1];
        if (playerBMI < minBMI || playerBMI > maxBMI) {
            messageEl.innerHTML = '<span class="error-text">ERROR！</span><br>体格指数（BMI）が<br>条件を満たしていないため、出勤できません。。。';
            messageEl.classList.add('no-job');
            detailsEl.innerHTML = '';
            modal.classList.add('active');
            return;
        }

        // パワーチェック（クラスに応じた消費量を使用）
        const bodyConsume = tierData.bodyConsume;
        const brainConsume = tierData.brainConsume;

        if (p.health < bodyConsume && p.intelligence < brainConsume) {
            messageEl.innerHTML = '<span class="error-text">ERROR！</span><br>身体パワーと頭脳パワーが足りないようです！';
            messageEl.classList.add('no-job');
            detailsEl.innerHTML = '';
            modal.classList.add('active');
            return;
        } else if (p.health < bodyConsume) {
            messageEl.innerHTML = '<span class="error-text">ERROR！</span><br>身体パワーが足りないようです！';
            messageEl.classList.add('no-job');
            detailsEl.innerHTML = '';
            modal.classList.add('active');
            return;
        } else if (p.intelligence < brainConsume) {
            messageEl.innerHTML = '<span class="error-text">ERROR！</span><br>頭脳パワーが足りないようです！';
            messageEl.classList.add('no-job');
            detailsEl.innerHTML = '';
            modal.classList.add('active');
            return;
        }

        // 最終出勤時刻を記録
        p.lastWorkTime = Date.now();

        // 日付が変わっていたら出勤カウントをリセット（当日分のみでぎっくり腰判定）
        const _wNow = new Date();
        const _wToday = `${_wNow.getFullYear()}-${String(_wNow.getMonth() + 1).padStart(2, '0')}-${String(_wNow.getDate()).padStart(2, '0')}`;
        if (gameState.lastWorkCountDate !== _wToday) {
            gameState.lastWorkCountDate = _wToday;
            p.workCount = 0;
        }

        // 出勤回数をカウント（病気判定用）
        p.workCount++;

        // 経験値（コンディションに応じてランダム）
        const prevLevel = getCurrentJobLevel();
        const prevSalary = Math.floor(tierData.salary * prevLevel.salaryRate);

        let expGain;
        // 病気のときは経験値が減る
        const diseaseInfo = p.disease ? diseasesData.find(d => d.id === p.disease) : null;
        if (diseaseInfo) {
            if (diseaseInfo.severity === 1) {
                expGain = -(Math.floor(Math.random() * 3) + 2); // -2~-4
            } else if (diseaseInfo.severity === 2) {
                expGain = -(Math.floor(Math.random() * 4) + 5); // -5~-8
            } else {
                expGain = -(Math.floor(Math.random() * 4) + 9); // -9~-12
            }
        } else if (condition.text === '最高') {
            expGain = 20;
        } else if (condition.text === '良好') {
            expGain = Math.floor(Math.random() * 4) + 14; // 14~17
        } else if (condition.text === '普通') {
            expGain = Math.floor(Math.random() * 4) + 10; // 10~13
        } else if (condition.text === '悪い') {
            expGain = Math.floor(Math.random() * 4) + 6; // 6~9
        } else {
            expGain = Math.floor(Math.random() * 4) + 2; // 2~5（かなり悪い）
        }
        p.jobExp = Math.max(0, p.jobExp + expGain);

        // レベルアップチェック
        const newLevel = getCurrentJobLevel();
        const newSalary = Math.floor(tierData.salary * newLevel.salaryRate);
        const leveledUp = newLevel.level > prevLevel.level;

        // クラスアップチェック（給料計算前に実行し、クラスアップ時は新クラスの給料を適用）
        const classedUp = checkAndApplyClassUp();

        // 身体パワー・頭脳パワー消費
        p.health = Math.max(0, p.health - bodyConsume);
        p.intelligence = Math.max(0, p.intelligence - brainConsume);

        // 体重減少（ベース0.05 + 身体消費に応じた減少）
        const weightLoss = 0.05 + bodyConsume * 0.01;
        p.weight = Math.max(0, p.weight - weightLoss);

        // 給料計算（クラスアップ時は新クラスのtierDataとリセット後のレベルで計算）
        const salaryTierData = classedUp ? getJobTierData(job, classedUp) : tierData;
        const salaryLevel = classedUp ? getCurrentJobLevel() : newLevel;
        const baseSalary = Math.floor(salaryTierData.salary * salaryLevel.salaryRate);
        let salaryEarned = baseSalary;
        let bonusEarned = 0;

        // レベルアップボーナス（クラスアップ前の給料・クラス倍率で計算）
        if (leveledUp) {
            bonusEarned = prevSalary * classBonusRates[currentClass];
        }

        // 給料・ボーナスを銀行口座に追加（それぞれ加算→記録の順で正しい残高を記録する）
        if (salaryEarned > 0) {
            gameState.savings += salaryEarned;
            addBankHistory('deposit', salaryEarned, 'お給料');
        }
        if (bonusEarned > 0) {
            gameState.savings += bonusEarned;
            addBankHistory('deposit', bonusEarned, 'レベルアップボーナス');
        }

        // 表示を更新
        messageEl.innerHTML = `仕事に出かけました！`;
        messageEl.classList.remove('no-job');
        buttonsEl.classList.add('work-success');
        workOkBtn.classList.add('work-ok-success');
        workModalBody.classList.add('work-success');

        let detailsHTML = '';

        // ─── 上段：レベルアップ・クラスアップ・昇給（あるときだけ） ───
        let highlightHTML = '';
        if (leveledUp) {
            highlightHTML += `<p>おめでとうございます！</p>`;
            highlightHTML += `<p>★ レベルが${newLevel.level}へ上がりました！</p>`;
            highlightHTML += `<p>★ ${newSalary.toLocaleString()}円 / 1回に昇給しました！</p>`;
        }

        if (classedUp) {
            const prevTierData = getJobTierData(job, classedUp - 1);
            const classedUpTierData = getJobTierData(job, classedUp);
            const levelUpLine = leveledUp ? `<p class="work-classup-levelup">レベルが${newLevel.level}へ上がりました！</p>` : '';
            highlightHTML = `
                <div class="work-classup-content">
                    <p class="work-classup-title">＼ おめでとうございます！ ／</p>
                    ${levelUpLine}
                    <p class="work-classup-names"><span class="work-classup-em">${classedUpTierData.name}</span> へ<br>クラスアップしました！</p>
                    <p class="work-classup-amount">お給料が <span class="work-classup-em">${salaryEarned.toLocaleString()}円</span> に昇給しました！</p>
                </div>
            `;
            updateStatus();
        }
        if (highlightHTML) {
            const boxClass = classedUp ? 'work-highlight-section work-classup-box' : 'work-highlight-section';
            detailsHTML += `<div class="${boxClass}">${highlightHTML}</div>`;
        }

        // ─── 下段：結果テーブル ───
        detailsHTML += `<div class="shokudo-eat-changes work-result-table">`;
        // プラスブロック
        if (bonusEarned > 0) {
            detailsHTML += `<div class="shokudo-change-row"><span class="shokudo-change-label">レベルアップボーナス</span><span class="work-change-bonus">+${bonusEarned.toLocaleString()}円</span></div>`;
        }
        if (salaryEarned > 0) {
            detailsHTML += `<div class="shokudo-change-row"><span class="shokudo-change-label">お給料</span><span class="work-change-plus">+${salaryEarned.toLocaleString()}円</span></div>`;
        }
        detailsHTML += `<div class="shokudo-change-row"><span class="shokudo-change-label">経験値</span><span class="${expGain >= 0 ? 'work-change-plus' : 'work-change-minus'}">${expGain >= 0 ? '+' : ''}${expGain}</span></div>`;
        // セパレーター
        detailsHTML += `<div class="work-result-divider"></div>`;
        // マイナスブロック
        detailsHTML += `<div class="shokudo-change-row work-row-cost"><span class="shokudo-change-label">身体パワー</span><span class="work-change-minus">-${bodyConsume}</span></div>`;
        detailsHTML += `<div class="shokudo-change-row work-row-cost"><span class="shokudo-change-label">頭脳パワー</span><span class="work-change-minus">-${brainConsume}</span></div>`;
        detailsHTML += `<div class="shokudo-change-row work-row-cost"><span class="shokudo-change-label">体重</span><span class="work-change-minus">-${weightLoss.toFixed(2)}kg</span></div>`;
        detailsHTML += `</div>`;

        detailsEl.innerHTML = detailsHTML;

        // ステータス更新
        updateStatus();

        // 通勤成功時のみイベント判定フラグを立てる
        gameState.pendingRandomEvent = true;
    }

    modal.classList.add('active');
}

function closeWorkModal() {
    hideRandomEvent();
    if (workCooldownInterval) {
        clearInterval(workCooldownInterval);
        workCooldownInterval = null;
    }
    document.getElementById('workModal').classList.remove('active');
    // 通勤成功時のみランダムイベント判定
    flushRandomEvent();
}

