// ============================================
// ふらっとタウン - 掲示板・つぶやき機能
// ============================================
// ============================================
// 掲示板機能
// ============================================

// 現在の返信先を記録する変数
let currentReplyTarget = null;
let currentReplyTargetIndex = null;
const answerDrafts = {};
let selectedCategory = null;
let boardSearchKeyword = '';
let currentPostId = null;
let boardNavStack = [];
let _boardGoingBack = false;

const ICONS = {
    comment:       'public/keiziban/Comment.svg',
    commentActive: 'public/keiziban/Comment2.svg',
    like:          'public/keiziban/like.svg',
    likeActive:    'public/keiziban/like2.svg',
    secret:        'public/keiziban/secret3.svg',
    secretActive:  'public/keiziban/secret4.svg',
};
const ANSWER_TEXT_LIMIT = 80;
const TWEET_COOLDOWN_MS = 3 * 60 * 1000;

// サンプルデータ（後でgameState.boardPostsを使う）
const sampleBoardPosts = [
    { id: 1, authorName: 'のん', authorJob: 'ネイリスト', authorAvatar: 'Profile/Profile3.png', authorAvatarBg: '#FFD1DC', date: '2026/02/04', title: 'おすすめの稼ぎ方ってありますか？', categories: ['お金', '仕事', 'ゲーム'], body: '仕事はしているのですが、なかなかお金が貯まらなくて困っています。効率よく稼ぐ方法があれば教えていただきたいです！' },
    { id: 2, authorName: 'たろう', authorJob: 'プログラマー', authorAvatar: 'Profile/Profile7.png', authorAvatarBg: '#B5D5FF', date: '2026/02/03', title: '銀行の利息っていつ入りますか？', categories: ['お金'], body: '銀行にお金を預けているのですが、利息がつくタイミングがわかりません。毎日ですか？それとも月に1回でしょうか？' },
    { id: 3, authorName: 'はなこ', authorJob: 'パティシエ', authorAvatar: 'Profile/Profile12.png', authorAvatarBg: '#D4EDDA', date: '2026/02/02', title: '体力の回復方法を教えてください！', categories: ['健康・美容', 'ゲーム'], body: '仕事をしすぎると体力がなくなってしまいます。温泉以外で体力を回復する方法があれば知りたいです。' },
    { id: 4, authorName: 'ゆうき', authorJob: 'ゲームクリエイター', authorAvatar: 'Profile/Profile15.png', authorAvatarBg: '#FFF3CD', date: '2026/02/01', title: 'レベル上げのコツを知りたいです', categories: ['ゲーム', '趣味'], body: 'なかなかレベルが上がらなくて悩んでいます。効率よくレベルアップするコツがあれば教えてください！' },
    { id: 5, authorName: 'みさき', authorJob: 'フラワーデザイナー', authorAvatar: 'Profile/Profile20.png', authorAvatarBg: '#E8D5F5', date: '2026/01/31', title: '友達の作り方がわかりません...', categories: ['人間関係', '暮らし'], body: 'この街に来たばかりでまだ誰とも仲良くなれていません。みなさんはどうやってフレンドを増やしましたか？' },
];

// 回答データ（postIdごとに管理）
const sampleAnswers = {
    1: [
        { id: 1, authorName: 'たろう', authorJob: 'プログラマー', authorAvatar: '😄', date: '2026/2/4 18:15', text: 'おすすめは仕事をたくさんすることです！\nあとは銀行に預けておくと利息がつきますよ！' },
        { id: 2, authorName: 'はなこ', authorJob: 'パティシエ', authorAvatar: '🌸', date: '2026/2/4 19:30', text: '私はコンビニでアイテムを買って転売してます！\n意外と儲かりますよ〜' },
        { id: 3, authorName: 'ゆうき', authorJob: 'ゲームクリエイター', authorAvatar: '🎮', date: '2026/2/4 20:45', text: '稼ぎ方についてはいくつかおすすめがあります！\n\nまず、序盤は「ハローワーク」でお仕事を見つけるのが一番です。仕事によって給料が違うので、体力と相談しながら選んでくださいね。\n\n次に、銀行預金もおすすめです。利息が毎日つくので、使わないお金は預けておきましょう！\n\nあとは、イベントにも積極的に参加するといいですよ。報酬がもらえることがあります！\n\n長くなりましたが、参考になれば嬉しいです！' },
    ]
};


function _nowDateStr() {
    const n = new Date();
    return `${n.getFullYear()}/${String(n.getMonth()+1).padStart(2,'0')}/${String(n.getDate()).padStart(2,'0')} ${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
}

function _truncateAnswerText(answer) {
    const full = escapeHtml(answer.text).replace(/\n/g, '<br>');
    if (answer.text.length <= ANSWER_TEXT_LIMIT) return full;
    return escapeHtml(answer.text.slice(0, ANSWER_TEXT_LIMIT)).replace(/\n/g, '<br>')
        + `…<span class="board-read-more" id="readMore-${answer.id}" onclick="toggleReadMore(${answer.id})">もっと読む</span>`;
}

function _buildBoardReplyItem(reply, replyIndex, answerId) {
    const replyAvatar = reply.authorAvatar || '😊';
    const replyAvatarBg = reply.authorAvatarBg || '#FFB6C1';
    const replyAvatarHtml = replyAvatar.includes('/')
        ? `<img src="${replyAvatar}" alt="アバター" class="board-reply-avatar-img">`
        : replyAvatar;
    const heartId = `reply-${answerId}-${replyIndex}`;
    const isLiked = gameState.likedAnswers.includes(heartId);
    const isSecretLiked = gameState.secretLikedAnswers && gameState.secretLikedAnswers.includes(heartId);
    return `
        <div class="board-reply-item">
            <div class="board-reply-avatar" style="background-color:${replyAvatarBg}">${replyAvatarHtml}</div>
            <div class="board-reply-body">
                <div class="board-reply-head">
                    <span class="board-reply-author-name">${reply.authorName}</span>
                    <span class="board-reply-date">${reply.date}</span>
                </div>
                <div class="board-reply-text">${reply.replyTo ? `<span class="board-reply-mention">&gt;&gt;${escapeHtml(reply.replyTo)}</span><br>` : ''}${escapeHtml(reply.text).replace(/\n/g, '<br>')}</div>
                <div class="board-answer-actions">
                    <button class="board-answer-action-btn" onclick="toggleReplyItemForm(${answerId}, ${replyIndex}, '${reply.authorName.replace(/'/g, "\\'")}')">
                        <img src="${ICONS.comment}" class="board-answer-action-icon" id="commentIcon-reply-${answerId}-${replyIndex}" alt="返信">
                        <span class="board-answer-action-label">返信する</span>
                    </button>
                    <button class="board-answer-action-btn" onclick="toggleHeart('${heartId}')">
                        <img src="${isLiked ? ICONS.likeActive : ICONS.like}" class="board-answer-action-icon" id="heartIcon-${heartId}" alt="いいね">
                        <span class="board-answer-action-label"${isLiked ? ' style="color:#c9546a"' : ''}>いいね</span>
                    </button>
                    <button class="board-answer-action-btn" onclick="toggleSecretHeart('${heartId}')">
                        <img src="${isSecretLiked ? ICONS.secretActive : ICONS.secret}" class="board-answer-action-icon" id="secretIcon-${heartId}" alt="こっそりいいね">
                        <span class="board-answer-action-label"${isSecretLiked ? ' style="color:#e08898"' : ''}>こっそりいいね</span>
                    </button>
                </div>
                <div class="board-reply-form" id="replyFormR-${answerId}-${replyIndex}" style="display:none;">
                    <textarea class="board-reply-textarea" id="replyTextR-${answerId}-${replyIndex}" placeholder="返信を入力..." maxlength="150" oninput="updateReplyItemCharCount(${answerId}, ${replyIndex})"></textarea>
                    <div class="board-reply-btns">
                        <span class="board-reply-char-count"><span id="replyCharCountR-${answerId}-${replyIndex}">0</span>/150</span>
                        <div class="board-reply-btn-group">
                            <button class="board-reply-cancel-btn" onclick="toggleReplyItemForm(${answerId}, ${replyIndex})">キャンセル</button>
                            <button class="board-reply-submit-btn" onclick="submitBoardReplyItem(${answerId}, ${replyIndex})">返信する</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openBoard(boardType) {
    if (boardType === 'oekaki') {
        openOekakiBoard();
        return;
    }
    if (boardType === 'intro') {
        openProfileBoard();
        return;
    }
    if (boardType !== 'question') {
        showToast('この掲示板は準備中です。');
        return;
    }
    (gameState.boardPosts || []).forEach(p => {
        if (!sampleBoardPosts.find(s => s.id === p.id)) {
            sampleBoardPosts.unshift(p);
        }
    });

    const modal = document.getElementById('boardModal');
    currentReplyTarget = null;
    currentReplyTargetIndex = null;
    selectedCategory = null;
    boardSearchKeyword = '';
    boardNavStack = [];
    const searchInput = document.getElementById('boardSearchInput');
    const categorySelect = document.getElementById('boardCategorySelect');
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
    renderBoardPostList();
    modal.classList.add('active');
}

function closeBoard() {
    document.getElementById('boardModal').classList.remove('active');
    currentReplyTarget = null;
    currentReplyTargetIndex = null;
    selectedCategory = null;
    boardNavStack = [];
    boardSearchKeyword = '';

    document.getElementById('newPostTitle').value = '';
    document.getElementById('newPostBody').value = '';
    document.getElementById('newPostCategory1').value = '';
    document.getElementById('newPostCategory2').value = '';
    document.getElementById('newPostCategory3').value = '';
    document.getElementById('bodyCharCount').textContent = '0';

    document.getElementById('boardNewPostView').style.display = 'none';
    document.getElementById('boardConfirmView').style.display = 'none';
    document.getElementById('boardCompleteView').style.display = 'none';
    document.getElementById('boardAnswerOverlay').style.display = 'none';
    document.getElementById('boardEditOverlay').style.display = 'none';
    document.getElementById('boardDetailView').style.display = 'none';
    document.getElementById('boardHeader').style.display = 'block';
    document.getElementById('boardMainView').style.display = 'flex';
    document.getElementById('boardBackBtn').style.display = 'none';
}

const BOARD_CATEGORIES = ['トレンド', '趣味', '暮らし', '健康・美容', '仕事', '人間関係・恋愛', 'ゲーム', 'ファッション', 'グルメ', '子育て', '家電・ガジェット', '学問', 'お金', 'スポーツ', '乗り物・旅行', '雑談', 'その他'];

function _rebuildCategorySelects(prefix) {
    const ids = [`${prefix}Category1`, `${prefix}Category2`, `${prefix}Category3`];
    const selects = ids.map(id => document.getElementById(id));
    const values = selects.map(s => s.value);
    selects.forEach((select, i) => {
        const current = values[i];
        const used = values.filter((v, j) => j !== i && v !== '');
        select.innerHTML = '<option value="">選択してください</option>';
        BOARD_CATEGORIES.forEach(cat => {
            if (!used.includes(cat) || cat === current) {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                if (cat === current) opt.selected = true;
                select.appendChild(opt);
            }
        });
    });
}

function updateCategorySelects() { _rebuildCategorySelects('newPost'); }

function openNewPostForm() {
    document.getElementById('newPostTitle').value = '';
    document.getElementById('newPostBody').value = '';
    document.getElementById('bodyCharCount').textContent = '0';
    document.getElementById('boardMainView').style.display = 'none';
    document.getElementById('boardNewPostView').style.display = 'flex';
    document.getElementById('boardBackBtn').style.display = '';
    const ids = ['newPostCategory1', 'newPostCategory2', 'newPostCategory3'];
    ids.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">選択してください</option>';
        BOARD_CATEGORIES.forEach(cat => {
            select.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        select.onchange = updateCategorySelects;
    });
}

function closeNewPostForm() {
    document.getElementById('boardNewPostView').style.display = 'none';
    document.getElementById('boardMainView').style.display = 'flex';
    document.getElementById('boardBackBtn').style.display = 'none';
}

function updateBodyCharCount() {
    const body = document.getElementById('newPostBody');
    const count = document.getElementById('bodyCharCount');
    count.textContent = body.value.length;
}

function showPostConfirm() {
    const title = document.getElementById('newPostTitle').value.trim();
    const category1 = document.getElementById('newPostCategory1').value;
    const category2 = document.getElementById('newPostCategory2').value;
    const category3 = document.getElementById('newPostCategory3').value;
    const body = document.getElementById('newPostBody').value.trim();

    if (!title) {
        alert('タイトルを入力してください');
        return;
    }
    if (!category1 && !category2 && !category3) {
        alert('カテゴリを1つ以上選択してください');
        return;
    }
    if (!body) {
        alert('本文を入力してください');
        return;
    }

    const categories = [...new Set([category1, category2, category3].filter(c => c))];
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmCategories').textContent = categories.join(' / ');
    document.getElementById('confirmBody').textContent = body;
    document.getElementById('boardNewPostView').style.display = 'none';
    document.getElementById('boardHeader').style.display = 'none';
    document.getElementById('boardConfirmView').style.display = 'flex';
    document.getElementById('boardBackBtn').onclick = backToEditForm;
}

function backToEditForm() {
    document.getElementById('boardConfirmView').style.display = 'none';
    document.getElementById('boardHeader').style.display = 'block';
    document.getElementById('boardNewPostView').style.display = 'flex';
    document.getElementById('boardBackBtn').onclick = closeNewPostForm;
    updateCategorySelects();
}

function submitPost() {
    try {
    const title = document.getElementById('newPostTitle').value.trim();
    const category1 = document.getElementById('newPostCategory1').value;
    const category2 = document.getElementById('newPostCategory2').value;
    const category3 = document.getElementById('newPostCategory3').value;
    const body = document.getElementById('newPostBody').value.trim();
    const categories = [category1, category2, category3].filter(c => c);

    const playerName = (gameState && gameState.player && gameState.player.name) ? gameState.player.name : 'ゲスト';
    const newPost = {
        id: Date.now(),
        authorName: playerName,
        authorJob: gameState.player.job || '',
        authorAvatar: gameState.player.avatar,
        authorAvatarBg: gameState.player.avatarBgColor,
        date: _nowDateStr(),
        title: title,
        categories: categories,
        body: body
    };

    sampleBoardPosts.unshift(newPost);
    if (!gameState.boardPosts) gameState.boardPosts = [];
    gameState.boardPosts.unshift(newPost);
    saveGame(true);

    document.getElementById('newPostTitle').value = '';
    document.getElementById('newPostCategory1').value = '';
    document.getElementById('newPostCategory2').value = '';
    document.getElementById('newPostCategory3').value = '';
    document.getElementById('newPostBody').value = '';
    renderBoardPostList();
    document.getElementById('boardCompleteView').style.display = 'flex';
    document.getElementById('boardBackBtn').style.display = 'none';
    currentPostId = newPost.id;
    } catch (e) {
        alert('エラー: ' + e.message);
    }
}

function backToBoardTop() {
    document.getElementById('boardCompleteView').style.display = 'none';
    document.getElementById('boardConfirmView').style.display = 'none';
    document.getElementById('boardHeader').style.display = 'block';
    document.getElementById('boardMainView').style.display = 'flex';
    document.getElementById('boardBackBtn').style.display = 'none';
    document.getElementById('boardBackBtn').onclick = closeNewPostForm;
}

function viewMyPost() {
    document.getElementById('boardCompleteView').style.display = 'none';
    document.getElementById('boardConfirmView').style.display = 'none';
    document.getElementById('boardHeader').style.display = 'block';
    document.getElementById('boardMainView').style.display = 'flex';
    document.getElementById('boardBackBtn').onclick = closeNewPostForm;
    selectPost(currentPostId);
}

function showPostToast() {
    const existingToast = document.querySelector('.post-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'post-toast';
    toast.textContent = '投稿しました！';

    document.querySelector('.board-modal-content').appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 1500);
}

// 投稿一覧を描画（左下ブロック）
function renderBoardPostList() {
    const container = document.getElementById('boardPostList');

    // カテゴリ・キーワードで絞り込み
    let posts = sampleBoardPosts;
    if (selectedCategory) {
        posts = posts.filter(post => post.categories.includes(selectedCategory));
    }
    if (boardSearchKeyword) {
        const kw = boardSearchKeyword.toLowerCase();
        posts = posts.filter(post =>
            post.title.toLowerCase().includes(kw) ||
            (post.body && post.body.toLowerCase().includes(kw))
        );
    }

    if (posts.length === 0) {
        container.innerHTML = '<div class="board-post-list-empty">該当する投稿がありません</div>';
        return;
    }

    let html = '';
    posts.forEach(post => {
        const categoriesText = post.categories.join(' , ');
        const avatarInner = post.authorAvatar
            ? (post.authorAvatar.includes('/')
                ? `<img src="${post.authorAvatar}" alt="${post.authorName}" class="board-post-item-avatar-img">`
                : post.authorAvatar)
            : '';
        const avatarHtml = post.authorAvatar
            ? `<div class="board-post-item-avatar" style="background-color:${post.authorAvatarBg || '#FFB6C1'}">${avatarInner}</div>`
            : '';
        html += `
            <div class="board-post-item" onclick="selectPost(${post.id})">
                <div class="board-post-item-header">
                    ${avatarHtml}
                    <span class="board-post-item-author">${post.authorName} さん</span>
                    <span class="board-post-item-date">${post.date.split(' ')[0]}</span>
                </div>
                <div class="board-post-item-title">${escapeHtml(post.title)}</div>
                ${post.body ? `<div class="board-post-item-body">${escapeHtml(post.body)}</div>` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

function selectPost(postId) {
    const post = sampleBoardPosts.find(p => p.id === postId);
    if (!post) return;

    currentPostId = postId;

    const detailNameEl = document.getElementById('detailAuthorName');
    detailNameEl.innerHTML = post.authorJob
        ? `${escapeHtml(post.authorName)}<span class="board-author-job">（${escapeHtml(post.authorJob)}）</span>`
        : escapeHtml(post.authorName);
    document.getElementById('detailDate').textContent = post.date;
    const categoriesEl = document.getElementById('detailCategories');
    categoriesEl.innerHTML = post.categories.map(cat =>
        `<span class="board-detail-category-tag" onclick="filterByCategory('${escapeAttr(cat)}')">${cat}</span>`
    ).join('');

    const detailAvatarEl = document.getElementById('detailAvatar');
    detailAvatarEl.style.backgroundColor = post.authorAvatarBg || '#FFB6C1';
    if (post.authorAvatar && post.authorAvatar.includes('/')) {
        detailAvatarEl.innerHTML = `<img src="${post.authorAvatar}" alt="${post.authorName}">`;
    } else {
        detailAvatarEl.textContent = post.authorAvatar || '😊';
    }
    document.getElementById('detailTitle').textContent = post.title;
    document.getElementById('detailBody').textContent = post.body || 'ここに本文が入ります。サンプルテキストです。\n\nみなさんのご回答お待ちしております！';

    document.getElementById('boardMainView').style.display = 'none';
    document.getElementById('boardHeader').style.display = 'none';
    document.getElementById('boardDetailView').style.display = 'flex';

    if (!_boardGoingBack) {
        const savedCategory = selectedCategory;
        boardNavStack.push(() => {
            _hideDetailView();
            selectedCategory = savedCategory;
            renderBoardPostList();
        });
    }
    _updateBoardBackBtn();

    const isMyPost = post.authorName === gameState.player.name;
    const answerBtn = document.getElementById('detailAnswerBtn');
    const myPostBtns = document.getElementById('detailMyPostBtns');
    if (answerBtn) answerBtn.style.display = isMyPost ? 'none' : '';
    if (myPostBtns) myPostBtns.style.display = isMyPost ? 'flex' : 'none';
    if (isMyPost) {
        const editBtn = document.getElementById('detailEditBtn');
        const answers = sampleAnswers[postId] || [];
        if (editBtn) {
            editBtn.disabled = answers.length > 0;
            editBtn.title = answers.length > 0 ? '回答が付いているため編集できません' : '';
        }
    }

    // 回答一覧を描画
    renderAnswers(postId);
}

function _hideDetailView() {
    document.getElementById('boardAnswerOverlay').style.display = 'none';
    document.getElementById('boardDetailView').style.display = 'none';
    document.getElementById('boardHeader').style.display = 'block';
    document.getElementById('boardMainView').style.display = 'flex';
}

function closeDetailView() {
    boardNavStack = [];
    _hideDetailView();
    _updateBoardBackBtn();
}

function _updateBoardBackBtn() {
    const btn = document.getElementById('boardBackBtn');
    if (boardNavStack.length > 0) {
        btn.style.display = '';
        btn.onclick = _boardGoBack;
    } else {
        btn.style.display = 'none';
        btn.onclick = closeNewPostForm;
    }
}

function _boardGoBack() {
    if (boardNavStack.length === 0) return;
    const fn = boardNavStack.pop();
    _boardGoingBack = true;
    fn();
    _boardGoingBack = false;
    _updateBoardBackBtn();
}


function openAnswerOverlay() {
    const post = sampleBoardPosts.find(p => p.id === currentPostId);
    if (post) {
        const preview = document.getElementById('answerQuestionPreview');
        const body = post.body || '';
        preview.innerHTML = `<div class="board-answer-question-preview-title">Q. ${escapeHtml(post.title)}</div>${escapeHtml(body)}`;
    }
    const draft = answerDrafts[currentPostId] || '';
    document.getElementById('answerText').value = draft;
    document.getElementById('answerCharCount').textContent = draft.length;
    document.getElementById('boardAnswerOverlay').style.display = 'flex';
    document.getElementById('answerText').focus();
}

function closeAnswerOverlay() {
    const text = document.getElementById('answerText').value;
    if (currentPostId) answerDrafts[currentPostId] = text;
    document.getElementById('boardAnswerOverlay').style.display = 'none';
}

function updateAnswerCharCount() {
    const len = document.getElementById('answerText').value.length;
    document.getElementById('answerCharCount').textContent = len;
}

function submitAnswer() {
    const answerText = document.getElementById('answerText').value.trim();
    if (!answerText) return;
    if (!currentPostId) return;

    const newAnswer = {
        id: Date.now(),
        authorName: gameState.player.name,
        authorJob: gameState.player.job || '',
        authorAvatar: gameState.player.avatar,
        date: _nowDateStr(),
        text: answerText
    };

    if (!sampleAnswers[currentPostId]) {
        sampleAnswers[currentPostId] = [];
    }
    sampleAnswers[currentPostId].unshift(newAnswer);
    delete answerDrafts[currentPostId];
    closeAnswerOverlay();
    renderAnswers(currentPostId);
}

function renderAnswers(postId) {
    const container = document.getElementById('boardAnswersSection');
    const answers = sampleAnswers[postId] || [];

    if (answers.length === 0) {
        container.innerHTML = `
            <h4 class="board-answers-title">回答</h4>
            <p style="color: rgba(255,255,255,0.7); text-align: center;">まだ回答がありません</p>
        `;
        return;
    }

    let html = `<h4 class="board-answers-title">回答</h4>`;
    html += `<div class="board-answer-list">`;

    answers.forEach((answer, index) => {
        const avatarBg = answer.authorAvatarBg || '#FFB6C1';
        const avatarHtml = answer.authorAvatar && answer.authorAvatar.includes('/')
            ? `<img src="${answer.authorAvatar}" alt="アバター" class="board-answer-avatar-img">`
            : (answer.authorAvatar || '😊');

        let repliesHtml = '';
        if (answer.replies && answer.replies.length > 0) {
            // 直接返信ごとにネスト返信をグループ化
            const replyGroups = [];
            answer.replies.forEach((reply, index) => {
                const isNested = reply.replyTo && reply.replyTo !== answer.authorName;
                if (!isNested || replyGroups.length === 0) {
                    replyGroups.push({ main: { reply, index }, nested: [] });
                } else {
                    // replyToIndexがあればそのインデックスのグループへ、なければ名前で最後のグループを検索
                    let targetGroup = null;
                    if (reply.replyToIndex !== undefined && reply.replyToIndex !== null) {
                        // direct返信のグループを検索
                        targetGroup = replyGroups.find(g => g.main.index === reply.replyToIndex);
                        // nested返信へのさらなる返信の場合、そのnestedが属するグループを検索
                        if (!targetGroup) {
                            targetGroup = replyGroups.find(g => g.nested.some(n => n.index === reply.replyToIndex));
                        }
                    }
                    if (!targetGroup) {
                        for (let i = replyGroups.length - 1; i >= 0; i--) {
                            if (replyGroups[i].main.reply.authorName === reply.replyTo) {
                                targetGroup = replyGroups[i];
                                break;
                            }
                        }
                    }
                    (targetGroup || replyGroups[replyGroups.length - 1]).nested.push({ reply, index });
                }
            });

            let replyItems = '';
            replyGroups.forEach(group => {
                replyItems += _buildBoardReplyItem(group.main.reply, group.main.index, answer.id);
                if (group.nested.length > 0) {
                    let nestedHtml = '';
                    group.nested.forEach(n => {
                        nestedHtml += _buildBoardReplyItem(n.reply, n.index, answer.id);
                    });
                    replyItems += `<div class="board-reply-nested-group">${nestedHtml}</div>`;
                }
            });

            repliesHtml = `
                <div class="board-reply-list" id="replyList-${answer.id}" style="display:none;">
                    ${replyItems}
                </div>
            `;
        }

        html += `
            <div class="board-answer-item">
                <div class="board-answer-author-row">
                    <div class="board-answer-avatar" style="background-color:${avatarBg}">${avatarHtml}</div>
                    <div class="board-answer-author-info">
                        <div class="board-answer-author-name">${escapeHtml(answer.authorName)}${answer.authorJob ? `<span class="board-author-job">（${escapeHtml(answer.authorJob)}）</span>` : ''}</div>
                        <div class="board-answer-date">${answer.date}</div>
                    </div>
                </div>
                <div class="board-answer-text" id="answerText-${answer.id}">${_truncateAnswerText(answer)}</div>
                <div class="board-answer-actions">
                    <button class="board-answer-action-btn" id="commentBtn-answer-${answer.id}" onclick="toggleReplyForm(${answer.id})">
                        <img src="${ICONS.comment}" class="board-answer-action-icon" id="commentIcon-answer-${answer.id}" alt="返信">
                        <span class="board-answer-action-label">返信する</span>
                    </button>
                    <button class="board-answer-action-btn" onclick="toggleHeart('answer-${answer.id}')">
                        <img src="${gameState.likedAnswers.includes('answer-' + answer.id) ? ICONS.likeActive : ICONS.like}" class="board-answer-action-icon" id="heartIcon-answer-${answer.id}" alt="いいね">
                        <span class="board-answer-action-label"${gameState.likedAnswers.includes('answer-' + answer.id) ? ' style="color:#c9546a"' : ''}>いいね</span>
                    </button>
                    <button class="board-answer-action-btn" onclick="toggleSecretHeart('answer-${answer.id}')">
                        <img src="${gameState.secretLikedAnswers && gameState.secretLikedAnswers.includes('answer-' + answer.id) ? ICONS.secretActive : ICONS.secret}" class="board-answer-action-icon" id="secretIcon-answer-${answer.id}" alt="こっそりいいね">
                        <span class="board-answer-action-label"${gameState.secretLikedAnswers && gameState.secretLikedAnswers.includes('answer-' + answer.id) ? ' style="color:#e08898"' : ''}>こっそりいいね</span>
                    </button>
                    ${answer.replies && answer.replies.length > 0 ? `<span class="board-reply-toggle" id="replyToggle-${answer.id}" onclick="toggleReplies(${answer.id})">${answer.replies.length}件の返信</span>` : ''}
                </div>
                ${repliesHtml}
                <div class="board-reply-form" id="replyForm-${answer.id}" style="display:none;">
                    <textarea class="board-reply-textarea" id="replyText-${answer.id}" placeholder="返信を入力..." maxlength="150" oninput="updateReplyCharCount(${answer.id})"></textarea>
                    <div class="board-reply-btns">
                        <span class="board-reply-char-count"><span id="replyCharCount-${answer.id}">0</span>/150</span>
                        <div class="board-reply-btn-group">
                            <button class="board-reply-cancel-btn" onclick="toggleReplyForm(${answer.id})">キャンセル</button>
                            <button class="board-reply-submit-btn" onclick="submitBoardReply(${answer.id})">返信する</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // 4行を超えるテキストに「もっと読む」を表示
    answers.forEach(answer => {
        const textEl = document.getElementById(`answerText-${answer.id}`);
        const readMoreEl = document.getElementById(`readMore-${answer.id}`);
        if (textEl && readMoreEl) {
            // scrollHeightがclientHeightより大きければ切り詰められている
            if (textEl.scrollHeight > textEl.clientHeight) {
                readMoreEl.style.display = 'block';
            }
        }
    });
}

function toggleReadMore(answerId) {
    const answers = sampleAnswers[currentPostId];
    if (!answers) return;
    const answer = answers.find(a => a.id === answerId);
    if (!answer) return;
    const textEl = document.getElementById(`answerText-${answerId}`);
    if (!textEl) return;

    const readMoreEl = document.getElementById(`readMore-${answerId}`);
    const isExpanded = readMoreEl && readMoreEl.textContent.includes('閉じる');

    if (isExpanded) {
        textEl.innerHTML = escapeHtml(answer.text.slice(0, ANSWER_TEXT_LIMIT)).replace(/\n/g, '<br>')
            + `…<span class="board-read-more" id="readMore-${answerId}" onclick="toggleReadMore(${answerId})">もっと読む</span>`;
    } else {
        textEl.innerHTML = escapeHtml(answer.text).replace(/\n/g, '<br>')
            + `<span class="board-read-more" id="readMore-${answerId}" onclick="toggleReadMore(${answerId})">閉じる</span>`;
    }
}

function updateReplyCharCount(answerId) {
    const len = document.getElementById(`replyText-${answerId}`)?.value.length || 0;
    const el = document.getElementById(`replyCharCount-${answerId}`);
    if (el) el.textContent = len;
}

function updateReplyItemCharCount(answerId, replyIndex) {
    const len = document.getElementById(`replyTextR-${answerId}-${replyIndex}`)?.value.length || 0;
    const el = document.getElementById(`replyCharCountR-${answerId}-${replyIndex}`);
    if (el) el.textContent = len;
}

function toggleReplyItemForm(answerId, replyIndex, replyToName) {
    const formId = `replyFormR-${answerId}-${replyIndex}`;
    const form = document.getElementById(formId);
    if (!form) return;

    if (form.style.display === 'none') {
        document.querySelectorAll('.board-reply-form').forEach(f => f.style.display = 'none');
        document.querySelectorAll('[id^="commentIcon-answer-"],[id^="commentIcon-reply-"]').forEach(img => {
            img.src = ICONS.comment;
            if (img.nextElementSibling) img.nextElementSibling.style.color = '';
        });
        currentReplyTarget = replyToName;
        currentReplyTargetIndex = replyIndex;
        form.style.display = 'block';
        const icon = document.getElementById(`commentIcon-reply-${answerId}-${replyIndex}`);
        if (icon) {
            icon.src = ICONS.commentActive;
            if (icon.nextElementSibling) icon.nextElementSibling.style.color = '#664118';
        }
        const ta = document.getElementById(`replyTextR-${answerId}-${replyIndex}`);
        if (ta) ta.focus();
        const countEl = document.getElementById(`replyCharCountR-${answerId}-${replyIndex}`);
        if (countEl) countEl.textContent = ta?.value.length || 0;
    } else {
        form.style.display = 'none';
        const icon = document.getElementById(`commentIcon-reply-${answerId}-${replyIndex}`);
        if (icon) {
            icon.src = ICONS.comment;
            if (icon.nextElementSibling) icon.nextElementSibling.style.color = '';
        }
        currentReplyTarget = null;
        currentReplyTargetIndex = null;
    }
}

function _doSubmitBoardReply(answerId, textAreaId) {
    const textArea = document.getElementById(textAreaId);
    if (!textArea) return;
    const replyText = textArea.value.trim();
    if (!replyText || !currentPostId) return;
    const answers = sampleAnswers[currentPostId];
    if (!answers) return;
    const answer = answers.find(a => a.id === answerId);
    if (!answer) return;
    if (!answer.replies) answer.replies = [];
    answer.replies.push({
        id: Date.now(),
        authorName: gameState.player.name || 'ゲスト',
        authorJob:   gameState.player.job   || '',
        authorAvatar: gameState.player.avatar || '😊',
        date: _nowDateStr(),
        text: replyText,
        replyTo: currentReplyTarget || answer.authorName,
        replyToIndex: currentReplyTargetIndex
    });
    currentReplyTarget = null;
    currentReplyTargetIndex = null;
    renderAnswers(currentPostId);
    const replyList = document.getElementById(`replyList-${answerId}`);
    if (replyList) replyList.style.display = 'block';
}

function submitBoardReplyItem(answerId, replyIndex) {
    _doSubmitBoardReply(answerId, `replyTextR-${answerId}-${replyIndex}`);
}

function toggleReplies(answerId) {
    const list = document.getElementById(`replyList-${answerId}`);
    const toggle = document.getElementById(`replyToggle-${answerId}`);
    if (!list || !toggle) return;
    if (list.style.display === 'none') {
        list.style.display = 'block';
        toggle.classList.add('open');
    } else {
        list.style.display = 'none';
        toggle.classList.remove('open');
    }
}

function _popIcon(icon, cls) {
    icon.classList.remove(cls);
    void icon.offsetWidth;
    icon.classList.add(cls);
    icon.addEventListener('animationend', () => icon.classList.remove(cls), { once: true });
}

function toggleHeart(answerId) {
    const icon = document.getElementById(`heartIcon-${answerId}`);
    if (!icon) return;
    const label = icon.nextElementSibling;
    const liked = gameState.likedAnswers;
    const idx = liked.indexOf(answerId);
    if (idx >= 0) {
        liked.splice(idx, 1);
        icon.src = ICONS.like;
        if (label) label.style.color = '';
    } else {
        liked.push(answerId);
        icon.src = ICONS.likeActive;
        if (label) label.style.color = '#c9546a';
        _popIcon(icon, 'like-pop');
    }
}

function toggleSecretHeart(answerId) {
    if (!gameState.secretLikedAnswers) gameState.secretLikedAnswers = [];
    const icon = document.getElementById(`secretIcon-${answerId}`);
    if (!icon) return;
    const label = icon.nextElementSibling;
    const liked = gameState.secretLikedAnswers;
    const idx = liked.indexOf(answerId);
    if (idx >= 0) {
        liked.splice(idx, 1);
        icon.src = ICONS.secret;
        if (label) label.style.color = '';
    } else {
        liked.push(answerId);
        icon.src = ICONS.secretActive;
        if (label) label.style.color = '#e08898';
        _popIcon(icon, 'like-pop-small');
    }
}

function toggleReplyForm(answerId, replyToName, replyToIndex) {
    const form = document.getElementById(`replyForm-${answerId}`);
    if (!form) return;

    if (form.style.display === 'none') {
        // 他の返信フォームを閉じてアイコンをリセット
        document.querySelectorAll('.board-reply-form').forEach(f => {
            f.style.display = 'none';
        });
        document.querySelectorAll('[id^="commentIcon-answer-"],[id^="commentIcon-reply-"]').forEach(img => {
            img.src = ICONS.comment;
            if (img.nextElementSibling) img.nextElementSibling.style.color = '';
        });
        currentReplyTarget = replyToName || null;
        currentReplyTargetIndex = (replyToIndex !== undefined) ? replyToIndex : null;
        form.style.display = 'block';
        const commentIcon = document.getElementById(`commentIcon-answer-${answerId}`);
        if (commentIcon) {
            commentIcon.src = ICONS.commentActive;
            if (commentIcon.nextElementSibling) commentIcon.nextElementSibling.style.color = '#664118';
        }
        const ta = document.getElementById(`replyText-${answerId}`);
        const countEl = document.getElementById(`replyCharCount-${answerId}`);
        if (countEl) countEl.textContent = ta?.value.length || 0;
        ta.focus();
    } else {
        form.style.display = 'none';
        const commentIcon = document.getElementById(`commentIcon-answer-${answerId}`);
        if (commentIcon) {
            commentIcon.src = ICONS.comment;
            if (commentIcon.nextElementSibling) commentIcon.nextElementSibling.style.color = '';
        }
        currentReplyTarget = null;
        currentReplyTargetIndex = null;
    }
}

function submitBoardReply(answerId) {
    _doSubmitBoardReply(answerId, `replyText-${answerId}`);
}

function selectCategory(category) {
    selectedCategory = category;
    renderBoardPostList();
}

function filterByCategory(category) {
    const prevPostId = currentPostId;
    _hideDetailView();
    selectedCategory = category;
    renderBoardPostList();
    if (!_boardGoingBack) {
        boardNavStack.push(() => selectPost(prevPostId));
    }
    _updateBoardBackBtn();
}

let _searchDebounce = null;
function searchBoardPosts(keyword) {
    clearTimeout(_searchDebounce);
    _searchDebounce = setTimeout(() => {
        boardSearchKeyword = keyword.trim();
        renderBoardPostList();
    }, 200);
}

function selectBoardStatus(status, el) {
    document.querySelectorAll('.board-status-tab').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    // TODO: status filtering（回答受付中 / 解決済み / すべて）
}

// ============================================
// 質問の削除
// ============================================

function confirmDeleteBoardPost() {
    let overlay = document.getElementById('boardDeleteConfirmOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'boardDeleteConfirmOverlay';
        overlay.className = 'diary-post-overlay';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
        <div class="board-delete-confirm-modal">
            <div class="board-complete-header">
                <button class="win-titlebar-btn win-titlebar-facility-close" onclick="closeBoardDeleteConfirm()">✕</button>
            </div>
            <div class="board-delete-confirm-body">
                <p class="board-delete-confirm-text">この質問を削除しますか？</p>
                <p class="board-delete-confirm-sub">※削除した投稿は元に戻せません。</p>
                <div class="board-delete-confirm-btns">
                    <button class="diary-confirm-delete" onclick="closeBoardDeleteConfirm(); deleteBoardPost()">削除する</button>
                    <button class="board-delete-confirm-cancel" onclick="closeBoardDeleteConfirm()">キャンセル</button>
                </div>
            </div>
        </div>`;
    overlay.style.display = 'flex';
}

function closeBoardDeleteConfirm() {
    const overlay = document.getElementById('boardDeleteConfirmOverlay');
    if (overlay) overlay.style.display = 'none';
}

function deleteBoardPost() {
    if (!currentPostId) return;
    const id = currentPostId;
    const idx = sampleBoardPosts.findIndex(p => p.id === id);
    if (idx !== -1) sampleBoardPosts.splice(idx, 1);
    if (gameState.boardPosts) {
        gameState.boardPosts = gameState.boardPosts.filter(p => p.id !== id);
    }
    delete sampleAnswers[id];
    saveGame(true);
    currentPostId = null;
    boardNavStack = [];
    _hideDetailView();
    _updateBoardBackBtn();
    renderBoardPostList();
    showToast('質問を削除しました');
}

// ============================================
// 質問の編集
// ============================================

function openBoardEditOverlay() {
    const post = sampleBoardPosts.find(p => p.id === currentPostId);
    if (!post) return;

    document.getElementById('editPostTitle').value = post.title || '';
    document.getElementById('editPostBody').value = post.body || '';
    document.getElementById('editBodyCharCount').textContent = (post.body || '').length;

    _initEditCategorySelects(post.categories || []);

    document.getElementById('boardEditOverlay').style.display = 'flex';
}

function closeBoardEditOverlay() {
    document.getElementById('boardEditOverlay').style.display = 'none';
}

function _initEditCategorySelects(selectedCats) {
    const ids = ['editPostCategory1', 'editPostCategory2', 'editPostCategory3'];
    ids.forEach((id, i) => {
        const sel = document.getElementById(id);
        sel.innerHTML = '<option value="">選択してください</option>';
        BOARD_CATEGORIES.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            if (cat === (selectedCats[i] || '')) opt.selected = true;
            sel.appendChild(opt);
        });
    });
}

function updateEditCategorySelects() { _rebuildCategorySelects('editPost'); }

function updateEditBodyCharCount() {
    const len = document.getElementById('editPostBody').value.length;
    document.getElementById('editBodyCharCount').textContent = len;
}

function submitBoardEdit() {
    const title = document.getElementById('editPostTitle').value.trim();
    if (!title) { showToast('タイトルを入力してください'); return; }

    const body = document.getElementById('editPostBody').value.trim();
    const cat1 = document.getElementById('editPostCategory1').value;
    const cat2 = document.getElementById('editPostCategory2').value;
    const cat3 = document.getElementById('editPostCategory3').value;
    const categories = [cat1, cat2, cat3].filter(c => c);

    // sampleBoardPosts を更新
    const post = sampleBoardPosts.find(p => p.id === currentPostId);
    if (post) {
        post.title = title;
        post.body = body;
        post.categories = categories;
    }
    // gameState.boardPosts も更新
    const savedPost = (gameState.boardPosts || []).find(p => p.id === currentPostId);
    if (savedPost) {
        savedPost.title = title;
        savedPost.body = body;
        savedPost.categories = categories;
    }
    saveGame(true);

    closeBoardEditOverlay();
    selectPost(currentPostId);
    showToast('質問を更新しました');
}

function formatBoardDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${min}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttr(text) {
    return String(text ?? '').replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}


// ============================================
// つぶやき機能
// ============================================
let tweetCooldownInterval = null;
let isChallengeReply = false; // チャレンジ経由フラグ

function openTweetModal(challengeTopic = null) {
    document.getElementById('tweetModal').classList.add('active');

    // プレイヤー情報を更新
    document.getElementById('tweetComposeAvatar').innerHTML = `<img src="${gameState.player.avatar}" alt="アバター" class="tweet-avatar-img">`;
    document.getElementById('tweetComposeAvatar').style.backgroundColor = gameState.player.avatarBgColor;
    document.getElementById('tweetComposeName').textContent = gameState.player.name;
    document.getElementById('tweetComposeJob').textContent = gameState.player.job || '無職';

    // タグエリア・入力欄・フラグをリセット
    resetTweetTag();
    document.getElementById('tweetInput').value = '';
    updateTweetCharCount();

    // チャレンジ経由で開かれた場合は自動でハッシュタグを挿入
    if (challengeTopic) {
        insertChallengeHashtag();
    }

    // 報酬結果ビューを隠して入力欄を表示
    document.getElementById('tweetComposeContent').style.display = '';
    document.getElementById('challengeRewardView').style.display = 'none';

    // クールダウンチェック
    checkTweetCooldown();

    // 文字数カウントイベント
    document.getElementById('tweetInput').oninput = updateTweetCharCount;
}

// タグエリアに表示中のハッシュタグ文字列を返す（先頭スペース付き・末尾に付ける用）
function getActiveTag() {
    const chip = document.getElementById('tweetTagChip');
    return chip && chip.textContent ? '\n' + chip.textContent : '';
}

// タグエリアをリセット
function resetTweetTag() {
    document.getElementById('tweetTagArea').style.display = 'none';
    document.getElementById('tweetTagChip').textContent = '';
    const challengeCard = document.getElementById('tweetChallengeCard');
    if (challengeCard) challengeCard.classList.remove('used');
    isChallengeReply = false;
    updateTweetMaxLength();
}

// textareaのmaxlengthをタグの有無に応じて調整
function updateTweetMaxLength() {
    document.getElementById('tweetInput').maxLength = 60;
}

// チャレンジピルを押したときにタグエリアへ追加
function insertChallengeHashtag() {
    if (document.getElementById('tweetTagChip').textContent) return; // 既にある
    const topic = getTodaysTopic();
    document.getElementById('tweetTagChip').textContent = topic;
    document.getElementById('tweetTagArea').style.display = 'flex';
    const challengeCard = document.getElementById('tweetChallengeCard');
    if (challengeCard) challengeCard.classList.add('used');
    isChallengeReply = true;
    updateTweetMaxLength();
    updateTweetCharCount();
    document.getElementById('tweetInput').focus();
}

// タグを削除する×ボタン
function removeChallengeTag() {
    resetTweetTag();
    updateTweetCharCount();
    document.getElementById('tweetInput').focus();
}

function formatTweetContent(content) {
    const escaped = escapeHtml(content);
    return escaped
        .replace(/\n/g, '<br>')  // 改行を表示
        .replace(/#([^\s#]+)/g, '<span class="tweet-hashtag">#$1</span>');
}

function closeTweetModal() {
    document.getElementById('tweetModal').classList.remove('active');
    document.getElementById('tweetComposeContent').style.display = '';
    document.getElementById('challengeRewardView').style.display = 'none';
    isChallengeReply = false;
    if (tweetCooldownInterval) {
        clearInterval(tweetCooldownInterval);
        tweetCooldownInterval = null;
    }
    renderPinnedChallenge();
}

function closeChallengeReward() {
    closeTweetModal();
}

function updateTweetCharCount() {
    const input = document.getElementById('tweetInput');
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
    const count = input.value.length;
    const countEl = document.getElementById('tweetCharCount');
    countEl.textContent = count;
    countEl.style.color = count > 60 ? '#cc0000' : '';

    const countContainer = countEl.parentElement;
    countContainer.classList.remove('near-limit', 'at-limit');
    if (count >= 60) {
        countContainer.classList.add('at-limit');
    } else if (count >= 50) {
        countContainer.classList.add('near-limit');
    }
}

function checkTweetCooldown() {
    const btn = document.getElementById('tweetSubmitBtn');
    const msg = document.getElementById('tweetCooldownMsg');
    const timeEl = document.getElementById('tweetCooldownTime');

    if (!gameState.lastTweetTime) {
        btn.disabled = false;
        msg.style.display = 'none';
        return;
    }

    const now = new Date().getTime();
    const lastTweet = new Date(gameState.lastTweetTime).getTime();
    const remaining = TWEET_COOLDOWN_MS - (now - lastTweet);

    if (remaining <= 0) {
        btn.disabled = false;
        msg.style.display = 'none';
        if (tweetCooldownInterval) {
            clearInterval(tweetCooldownInterval);
            tweetCooldownInterval = null;
        }
        return;
    }

    btn.disabled = true;
    msg.style.display = 'block';

    // 残り時間を更新
    const updateRemaining = () => {
        const nowUpdate = new Date().getTime();
        const remainingUpdate = TWEET_COOLDOWN_MS - (nowUpdate - lastTweet);

        if (remainingUpdate <= 0) {
            btn.disabled = false;
            msg.style.display = 'none';
            if (tweetCooldownInterval) {
                clearInterval(tweetCooldownInterval);
                tweetCooldownInterval = null;
            }
            return;
        }

        const minutes = Math.floor(remainingUpdate / 60000);
        const seconds = Math.floor((remainingUpdate % 60000) / 1000);
        timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    updateRemaining();
    if (tweetCooldownInterval) clearInterval(tweetCooldownInterval);
    tweetCooldownInterval = setInterval(updateRemaining, 1000);
}

function submitTweet() {
    const input = document.getElementById('tweetInput');
    const content = input.value.replace(/\n{2,}/g, '\n').trim();
    const activeTopic = isChallengeReply ? getTodaysTopic() : null;


    // クールダウンチェック
    if (gameState.lastTweetTime) {
        const now = new Date().getTime();
        const lastTweet = new Date(gameState.lastTweetTime).getTime();
        if (now - lastTweet < TWEET_COOLDOWN_MS) return;
    }

    // つぶやきを追加
    const tweet = {
        id: gameState.tweetNextId++,
        authorName: gameState.player.name,
        authorJob: gameState.player.job,
        authorAvatar: gameState.player.avatar,
        authorAvatarBgColor: gameState.player.avatarBgColor,
        content: content,
        topic: activeTopic,
        date: new Date().toISOString()
    };

    gameState.tweets.unshift(tweet); // 先頭に追加
    gameState.lastTweetTime = tweet.date;

    // チャレンジフラグをリセット前に保存
    const wasChallenge = isChallengeReply;

    // 入力をクリア
    input.value = '';
    resetTweetTag();
    updateTweetCharCount();

    // 左側の掲示板を更新
    renderTweetList();

    // クールダウン表示を更新
    checkTweetCooldown();

    // チャレンジ報酬処理
    if (wasChallenge) {
        isChallengeReply = false;
        const today = todayStr();
        if (gameState.lastChallengeRewardDate !== today) {
            // 1000〜2000円のランダム報酬（100円単位）
            const reward = (Math.floor(Math.random() * 11) + 10) * 100;
            changeMoney(reward);
            gameState.lastChallengeRewardDate = today;
            // 結果画面を表示
            document.getElementById('tweetComposeContent').style.display = 'none';
            document.getElementById('challengeRewardView').style.display = '';
            document.getElementById('challengeRewardMessage').innerHTML =
                `チャレンジ報酬で<span style="color:#d8b42a;">${reward.toLocaleString()}円</span>の<br>おこづかいをもらいました！`;
            return;
        }
    }

    // モーダルを閉じる
    closeTweetModal();
}

// 表示するつぶやき数（無限スクロール用）
let tweetDisplayCount = 10;

function renderTweetList(reset = true) {
    const container = document.getElementById('tweetList');

    if (reset) {
        tweetDisplayCount = 10;
        renderPinnedChallenge();
    }

    if (gameState.tweets.length === 0) {
        container.innerHTML = '';
        return;
    }

    // 表示するつぶやきを制限
    const tweetsToShow = gameState.tweets.slice(0, tweetDisplayCount);
    const likes = gameState.tweetLikes || [];

    let html = '';
    tweetsToShow.forEach(tweet => {
        const bgColor = tweet.authorAvatarBgColor || '#FFB6C1';
        const avatarHtml = tweet.authorAvatar.includes('/')
            ? `<img src="${tweet.authorAvatar}" alt="アバター" class="tweet-avatar-img">`
            : tweet.authorAvatar;
        const jobText = tweet.authorJob || '無職';
        const isLiked = likes.includes(tweet.id);
        html += `
            <div class="tweet-item">
                <div class="tweet-header">
                    <span class="tweet-avatar" style="background-color: ${bgColor}">${avatarHtml}</span>
                    <div class="tweet-author-info">
                        <span class="tweet-name">${escapeHtml(tweet.authorName)}</span>
                        <span class="tweet-job">${escapeHtml(jobText)}</span>
                    </div>
                    <span class="tweet-time">${formatTweetTime(tweet.date)}</span>
                </div>
                ${tweet.topic ? `<div class="tweet-topic-label">${tweet.topic}</div>` : ''}
                <div class="tweet-body">
                    <div class="tweet-content">${formatTweetContent(tweet.content)}</div>
                    <div class="tweet-heart-area">
                        <img src="status/Heart2.png" alt="いいね" class="tweet-heart-icon${isLiked ? ' liked' : ''}" id="tweetHeart-${tweet.id}" onclick="toggleTweetHeart(${tweet.id})">
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 無限スクロール：もっと読み込む
function loadMoreTweets() {
    if (tweetDisplayCount >= gameState.tweets.length) {
        return; // もう全部表示済み
    }
    tweetDisplayCount += 10;
    renderTweetList(false); // リセットしない
}

let _tweetScrollListenerAttached = false;
function setupTweetInfiniteScroll() {
    if (_tweetScrollListenerAttached) return;
    _tweetScrollListenerAttached = true;
    document.getElementById('tweetList').addEventListener('scroll', () => {
        const c = document.getElementById('tweetList');
        if (c.scrollHeight - c.scrollTop - c.clientHeight < 50) loadMoreTweets();
    });
}

// ============================================
// 今日のつぶやきチャレンジ
// ============================================
const todaysTopics = [
    '動物と話せるなら何を話す？',
    '日常で愛用しているものは？',
    'もし1日だけ違う職業になれるとしたら？',
    '今一番欲しいものは何？',
    '子どもの頃の夢は何でしたか？',
    'もし空を飛べるとしたら、最初にどこへ行く？',
    '最近うれしかったことを教えてください',
    'あなたのリラックス方法は？',
    '好きな季節とその理由は？',
    '無人島に1つだけ持っていくとしたら？',
    '今日のご飯、何が食べたい？',
    'もし魔法が使えるとしたら？',
];

function getTodaysTopic() {
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % todaysTopics.length;
    return todaysTopics[dayIndex];
}

function renderPinnedChallenge() {
    const container = document.getElementById('tweetPinnedChallenge');
    if (!container) return;
    const today = todayStr();
    if (gameState.lastChallengeRewardDate === today) {
        container.innerHTML = '';
        return;
    }
    const topic = getTodaysTopic();
    container.innerHTML = `
        <div class="tweet-pin-card">
            <div class="tweet-pin-tag">\\ 今日のつぶやきチャレンジ /</div>
            <div class="tweet-pin-topic">${topic}</div>
            <button class="tweet-pin-btn" onclick="openChallengeReply()">投稿する</button>
        </div>
    `;
}

function openChallengeReply() {
    openTweetModal(getTodaysTopic());
}

// ============================================
// ハート（いいね）機能
// ============================================
function toggleTweetHeart(tweetId) {
    if (!gameState.tweetLikes) gameState.tweetLikes = [];
    const idx = gameState.tweetLikes.indexOf(tweetId);
    const icon = document.getElementById(`tweetHeart-${tweetId}`);
    if (idx >= 0) {
        gameState.tweetLikes.splice(idx, 1);
        if (icon) icon.classList.remove('liked');
    } else {
        gameState.tweetLikes.push(tweetId);
        if (icon) icon.classList.add('liked');
    }
}

function formatTweetTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);

    if (diffMin < 1) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    if (diffHour < 24) return `${diffHour}時間前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

