/**
 * MBTI测试 - 核心逻辑
 */

// ===== 状态 =====
var state = {
  current: 0,
  answers: [],
  started: false
};

// 选项字母
var OPT_LETTERS = ['A', 'B', 'C', 'D'];
// 维度图标映射
var DIM_ICONS = {
  EI: { icon: '🌐', label: '能量来源' },
  SN: { icon: '👁️', label: '认知方式' },
  TF: { icon: '⚖️', label: '决策依据' },
  JP: { icon: '📅', label: '生活态度' }
};

// ===== 页面切换 =====
function showPage(id) {
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove('active');
  }
  document.getElementById(id).classList.add('active');
}

// ===== 初始化 =====
function initQuiz() {
  state.current = 0;
  state.answers = [];
  for (var i = 0; i < QUESTIONS.length; i++) {
    state.answers.push(null);
  }
  state.started = true;
  renderQuestion();
  showPage('page-quiz');
}

// ===== 渲染题目 =====
function renderQuestion() {
  var q = QUESTIONS[state.current];
  var total = QUESTIONS.length;
  var idx = state.current;

  // 进度
  var pct = Math.round(((idx) / total) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('counter-text').textContent = (idx + 1) + ' / ' + total;

  // 维度标签 + 图标
  var dimInfo = DIM_ICONS[q.dim] || { icon: '', label: q.dim };
  var dimTag = document.getElementById('dim-tag');
  dimTag.innerHTML = dimInfo.icon + ' ' + dimInfo.label;

  // 题目
  document.getElementById('q-number').textContent = '第 ' + (idx + 1) + ' 题';
  document.getElementById('q-text').textContent = q.text;

  // 4个选项
  var sel = state.answers[idx];
  for (var i = 0; i < 4; i++) {
    var btn = document.getElementById('opt-' + OPT_LETTERS[i]);
    if (!btn) continue;
    btn.querySelector('.opt-text').textContent = q.opts[i];
    btn.querySelector('.opt-label').textContent = OPT_LETTERS[i];
    btn.classList.remove('selected', 'a-side', 'b-side');
    if (sel === OPT_LETTERS[i]) {
      btn.classList.add('selected');
    }
  }

  // 上一题按钮
  var btnPrev = document.getElementById('btn-prev');
  btnPrev.disabled = (idx === 0);

  // 下一题/提交
  var btnNext = document.getElementById('btn-next');
  if (idx === total - 1) {
    btnNext.textContent = '查看结果';
  } else {
    btnNext.textContent = '下一题';
  }
  updateNextBtn();
}

// ===== 选项点击 =====
function selectOption(choice) {
  state.answers[state.current] = choice;
  renderQuestion();
  if (state.current < QUESTIONS.length - 1) {
    setTimeout(function() {
      goNext();
    }, 300);
  } else {
    updateNextBtn();
  }
}

// ===== 控制下一题按钮状态 =====
function updateNextBtn() {
  var btnNext = document.getElementById('btn-next');
  btnNext.disabled = (state.answers[state.current] === null);
}

// ===== 上一题 =====
function goPrev() {
  if (state.current > 0) {
    state.current--;
    renderQuestion();
  }
}

// ===== 下一题 / 提交 =====
function goNext() {
  if (!state.answers[state.current]) return;
  if (state.current < QUESTIONS.length - 1) {
    state.current++;
    renderQuestion();
  } else {
    submitQuiz();
  }
}

// ===== 计算结果 =====
function calcResult() {
  var scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (var i = 0; i < QUESTIONS.length; i++) {
    var q = QUESTIONS[i];
    var ans = state.answers[i];
    if (!ans) continue;
    var idx = OPT_LETTERS.indexOf(ans);
    if (idx >= 0) {
      scores[q.scores[idx]]++;
    }
  }

  var type =
    (scores.E >= scores.I ? 'E' : 'I') +
    (scores.S >= scores.N ? 'S' : 'N') +
    (scores.T >= scores.F ? 'T' : 'F') +
    (scores.J >= scores.P ? 'J' : 'P');

  return { type: type, scores: scores };
}

// ===== 提交测试 =====
function submitQuiz() {
  showPage('page-loading');
  setTimeout(function() {
    var result = calcResult();
    renderResult(result);
    showPage('page-result');
  }, 1800);
}

// ===== 渲染结果 =====
function renderResult(result) {
  var type = result.type;
  var scores = result.scores;
  var info = MBTI_RESULTS[type];

  if (!info) return;

  // 顶部英雄区
  var hero = document.getElementById('result-hero');
  hero.style.background = info.gradient;
  hero.style.color = info.textColor;

  document.getElementById('result-emoji').textContent = info.emoji;
  document.getElementById('result-type').textContent = type;
  document.getElementById('result-type').style.color = info.textColor;
  document.getElementById('result-name').textContent = info.name;
  document.getElementById('result-name').style.color = info.textColor;
  document.getElementById('result-nickname').textContent = info.nickname;
  document.getElementById('result-nickname').style.color = 'rgba(255,255,255,0.85)';

  // 维度得分条
  var dims = [
    { key: 'EI', left: 'E 外向', right: 'I 内向', leftVal: scores.E, rightVal: scores.I, leftKey: 'E', color: '#6C63FF' },
    { key: 'SN', left: 'S 实感', right: 'N 直觉', leftVal: scores.S, rightVal: scores.N, leftKey: 'S', color: '#43C6E8' },
    { key: 'TF', left: 'T 思考', right: 'F 情感', leftVal: scores.T, rightVal: scores.F, leftKey: 'T', color: '#FF6584' },
    { key: 'JP', left: 'J 判断', right: 'P 感知', leftVal: scores.J, rightVal: scores.P, leftKey: 'J', color: '#43E8C8' }
  ];

  var dimContainer = document.getElementById('dim-bars');
  dimContainer.innerHTML = '';

  dims.forEach(function(d) {
    var total = d.leftVal + d.rightVal;
    var leftPct = total > 0 ? Math.round((d.leftVal / total) * 100) : 50;
    var typeChar = type[dims.indexOf(d)];
    var isLeft = (typeChar === d.leftKey);
    var barId = 'bar-' + d.key;

    var row = document.createElement('div');
    row.className = 'dim-row';
    row.innerHTML =
      '<div class="dim-labels">' +
        '<span class="dim-label-left' + (isLeft ? ' active' : '') + '">' + d.left + '</span>' +
        '<span class="dim-label-right' + (!isLeft ? ' active' : '') + '">' + d.right + '</span>' +
      '</div>' +
      '<div class="dim-bar-track">' +
        '<div class="dim-bar-fill" id="' + barId + '" style="width:0%;background:' + d.color + '"></div>' +
      '</div>' +
      '<div class="dim-bar-pct">' + typeChar + ' ' + (isLeft ? leftPct + '%' : (100 - leftPct) + '%') + '</div>';
    dimContainer.appendChild(row);

    setTimeout(function(id, pct) {
      return function() {
        var el = document.getElementById(id);
        if (el) el.style.width = pct + '%';
      };
    }(barId, leftPct), 100);
  });

  // 性格描述
  document.getElementById('result-desc').textContent = info.desc;

  // 特质标签
  var tagsEl = document.getElementById('result-tags');
  tagsEl.innerHTML = '';
  info.traits.forEach(function(t) {
    var tag = document.createElement('span');
    tag.className = 'trait-tag';
    tag.textContent = t;
    tagsEl.appendChild(tag);
  });

  document.getElementById('result-strengths').textContent = info.strengths;
  document.getElementById('result-growth').textContent = info.growth;
  document.getElementById('result-careers').textContent = info.careers;

  // 匹配类型
  var matchEl = document.getElementById('result-matches');
  matchEl.innerHTML = '';
  info.matches.forEach(function(m) {
    var item = document.createElement('div');
    item.className = 'match-item';
    item.innerHTML = m.type + '<span>' + m.label + '</span>';
    matchEl.appendChild(item);
  });

  // 滚动到顶部
  var scrollEl = document.getElementById('result-scroll');
  if (scrollEl) scrollEl.scrollTop = 0;
}

// ===== 重新测试 =====
function retryQuiz() {
  showPage('page-intro');
}

// ===== 页面加载 =====
window.onload = function() {
  showPage('page-intro');
};
