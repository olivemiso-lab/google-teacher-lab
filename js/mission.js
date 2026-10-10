// 미션 연습실: 준비 → 실습 → 점검 → 판단 문제 → 결과를 한 단계씩.
(function () {
  const { S, C, STAGES, DAY, esc, rich, fmt, missionDate, store, qKey, header } = window.GTL;
  header('path.html');
  const body = document.getElementById('body');
  const id = new URLSearchParams(location.search).get('id');
  const idx = C.missions.findIndex((m) => m.id === id);
  if (idx < 0) {
    body.innerHTML = `<h1 style="font-size:1.6rem">미션을 찾을 수 없어요</h1><p class="muted">주소가 바뀌었거나 없는 미션이에요.</p><a class="btn" href="path.html">단계별 과정으로</a>`;
    return;
  }
  const m = C.missions[idx];
  const st = STAGES[m.track];
  const label = { daily: '오늘의 실습', friday: '이번 주 실전', mock: '실습 모의 연습' }[m.type];
  document.title = `${m.title} · ${S.name}`;
  const rec = () => store.mission(m.id);
  const next = C.missions[idx + 1]?.track === m.track ? C.missions[idx + 1] : null;
  const code = `${m.track === 'level1' ? 'L1' : 'L2'} ${m.week}주차 ${DAY[m.day]}`;
  const video = (C.videos || {})[m.id];
  const report = `mailto:${S.email}?subject=${encodeURIComponent(`[화면이 달라요] ${code} ${m.title}`)}&body=${encodeURIComponent('어느 지시사항에서 무엇이 다른지 적어 주세요.\n(학생 이름 등 개인정보는 넣지 마세요)\n\n')}`;
  const STEPS = ['준비', '실습', '점검', '판단 문제', '결과'];

  // 실습 재료: 글은 그대로, 표는 탭으로 나눈 줄을 표로 보여 주고 그대로 복사(Sheets에 붙이면 칸이 나뉨)
  function materialHtml(mt) {
    if (!mt) return '';
    let view;
    if (mt.kind === 'table') {
      const rows = mt.body.trim().split('\n').map((r) => r.split('\t'));
      view = `<div class="scroll"><table><thead><tr>${rows[0].map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    } else view = `<pre>${esc(mt.body)}</pre>`;
    return `<div class="card block material"><h2>🧾 실습 재료 · ${esc(mt.title)}</h2>
      <p class="tiny" style="margin:-4px 0 0">${mt.kind === 'table' ? '복사한 뒤 Sheets의 A1 칸에 붙여 넣으면 칸이 나뉘어 들어가요.' : '복사해서 문서에 붙여 넣고 시작하세요.'}</p>
      ${view}<button class="btn small" id="copy-mat">📋 재료 복사</button></div>`;
  }

  body.innerHTML = `
    <p class="small"><a href="path.html?stage=${m.track}">← ${st.icon} ${st.name} 과정</a></p>
    <div class="m-head">
      <div class="m-meta">
        <span class="tag s-${m.track}">${st.icon} ${st.name}</span>
        <span class="tag t-sun">${m.week}주차 ${DAY[m.day]}요일 · ${label}</span>
        <span class="tag" style="border:1px solid var(--line)">⏱ ${m.minutes}분</span>
        ${m.tools.map((t) => `<span class="tag" style="border:1px solid var(--line)">${esc(t)}</span>`).join('')}
      </div>
      <h1 style="font-size:1.6rem">${esc(m.title)}</h1>
      <p class="tiny">${S.cohort} 달력 ${fmt(missionDate(m))} · 공식 평가 목표 ${esc(m.objectives.join(', '))}</p>
    </div>
    <ol class="stepper" id="stepper">${STEPS.map((s, i) => `<li><button data-go="${i}">${i + 1}. ${s}</button></li>`).join('')}</ol>

    <section class="panel" data-p="0">
      ${block('📋', '상황', `<p style="margin:0">${rich(m.scenario)}</p>`)}
      ${materialHtml(m.material)}
      <p class="note green small">👥 <b>연습 계정</b>을 시크릿 창에 열어 두세요. 이 페이지는 평소 창에서 열어야 기록이 남아요. <a href="start.html#account">연습 계정 만들기 →</a></p>
    </section>

    <section class="panel" data-p="1" hidden>
      ${block('✍️', '지시사항', `<p class="tiny" style="margin:-4px 0 8px">하나씩 해내고 체크하세요. 시험의 실습 시나리오와 같은 방식이에요.</p><div id="steps">${m.steps.map((s, i) => `<label class="check" style="margin:6px 0"><input type="checkbox" data-s="${i}"><span>${rich(s)}</span></label>`).join('')}</div>
        ${m.type !== 'daily' ? `<div class="btns" style="margin-top:12px"><button class="btn small" id="timer">⏱ ${m.minutes}분 타이머 시작</button><span class="small" id="timer-out" role="timer"></span></div>` : ''}
        ${video ? `<p style="margin:12px 0 0"><a class="btn small" href="${esc(video)}" target="_blank" rel="noopener">▶ 영상으로 보기</a></p>` : ''}`)}
      ${m.tip ? `<details class="card block"><summary style="cursor:pointer;font-weight:700">💡 막히면 도움말 보기</summary><p style="margin:10px 0 0">${rich(m.tip)}</p></details>` : ''}
      ${m.limit ? `<p class="note warn small">⚠️ ${rich(m.limit)}</p>` : ''}
      ${m.source ? `<p class="small">📚 공식 자료: <a href="${esc(m.source.url)}" target="_blank" rel="noopener">${esc(m.source.title)} ↗</a></p>` : ''}
    </section>

    <section class="panel" data-p="2" hidden>
      ${block('✅', '결과 확인', `<p class="tiny" style="margin:-4px 0 8px">연습 계정 화면에서 직접 확인하고 체크하세요. 이 체크는 스스로 점검하는 기록이에요.</p><div id="checks">${m.check.map((c, i) => `<label class="check" style="margin:6px 0"><input type="checkbox" data-c="${i}"><span>${rich(c)}</span></label>`).join('')}</div>`)}
      <p class="small muted">🐞 지금 화면과 다른가요? <a href="${report}">운영자에게 알려 주기</a> · 💬 카톡 질문방에 <b>${code}</b>처럼 번호를 붙여 물어보세요.</p>
    </section>

    <section class="panel" data-p="3" hidden><div id="quiz"></div></section>
    <section class="panel" data-p="4" hidden><div id="result"></div></section>

    <div class="panel-nav"><button class="btn" id="prev">← 이전</button><button class="btn primary" id="nextp">다음 →</button></div>`;

  function block(icon, title, inner) { return `<div class="card block"><h2>${icon} ${title}</h2>${inner}</div>`; }

  // 단계 이동
  let cur = 0;
  const panels = [...body.querySelectorAll('.panel')];
  const stepBtns = [...body.querySelectorAll('[data-go]')];
  function go(i) {
    cur = Math.max(0, Math.min(4, i));
    panels.forEach((p, k) => { p.hidden = k !== cur; });
    stepBtns.forEach((b, k) => { b.toggleAttribute('aria-current', k === cur); if (k === cur) b.setAttribute('aria-current', 'step'); });
    document.getElementById('prev').style.visibility = cur ? 'visible' : 'hidden';
    const nb = document.getElementById('nextp');
    nb.style.display = cur === 4 ? 'none' : '';
    nb.textContent = cur === 3 ? '결과 보기 →' : '다음 →';
    if (cur === 3) renderQuiz();
    if (cur === 4) renderResult();
    markSteps();
    window.scrollTo({ top: document.getElementById('stepper').offsetTop - 80, behavior: 'smooth' });
  }
  stepBtns.forEach((b) => { b.onclick = () => go(+b.dataset.go); });
  document.getElementById('prev').onclick = () => go(cur - 1);
  document.getElementById('nextp').onclick = () => go(cur + 1);

  const allChecked = (sel) => [...body.querySelectorAll(sel)].every((x) => x.checked);
  const answeredAll = () => m.quiz.every((_, n) => store.rec(qKey(m, n)));
  function markSteps() {
    const ok = [true, allChecked('[data-s]'), allChecked('[data-c]'), answeredAll(), false];
    stepBtns.forEach((b, k) => b.classList.toggle('ok', ok[k] && k !== cur && k > 0));
  }

  // 재료 복사
  const cm = document.getElementById('copy-mat');
  if (cm) cm.onclick = async () => {
    try { await navigator.clipboard.writeText(m.material.body); cm.textContent = '복사했어요 ✓'; }
    catch (e) { cm.textContent = '복사가 막혔어요. 위 내용을 직접 선택해 복사하세요'; }
    setTimeout(() => { cm.textContent = '📋 재료 복사'; }, 2500);
  };

  // 지시사항·점검 체크 저장. 지시사항을 모두 해내면 미션 완료.
  function bindChecks(sel, field) {
    const boxes = [...body.querySelectorAll(sel)];
    const saved = rec()[field] || [];
    boxes.forEach((el, i) => {
      el.checked = !!saved[i];
      el.onchange = () => {
        const now = boxes.map((b) => b.checked);
        const patch = { [field]: now };
        if (field === 'steps') { const all = now.every(Boolean); patch.basic = all; patch.at = all ? (rec().at || new Date().toISOString()) : undefined; }
        store.setMission(m.id, patch);
        markSteps();
      };
    });
  }
  bindChecks('[data-s]', 'steps');
  bindChecks('[data-c]', 'checks');

  // 타이머 (실전·모의)
  const tb = document.getElementById('timer');
  if (tb) {
    let end = 0, h = 0;
    const out = document.getElementById('timer-out');
    const tick = () => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      out.textContent = left ? `남은 시간 ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '시간이 다 됐어요. 남은 지시사항은 이어서 해 보세요.';
      if (!left) { clearInterval(h); tb.textContent = '⏱ 다시 시작'; }
    };
    tb.onclick = () => { clearInterval(h); end = Date.now() + m.minutes * 60e3; tb.textContent = '⏱ 처음부터'; tick(); h = setInterval(tick, 1000); };
  }

  // 판단 문제: 한 문제씩, 바로 채점, 틀리면 다시 풀기
  let qi = 0;
  const qBox = document.getElementById('quiz');
  function renderQuiz() {
    const q = m.quiz[qi];
    const key = qKey(m, qi);
    const r = store.rec(key);
    qBox.innerHTML = `<div class="card qcard">
      <p class="qnum">문제 ${qi + 1} / ${m.quiz.length}${q.skill ? `<span class="tag t-sun skill">${esc(q.skill)}</span>` : ''}</p>
      <p style="font-weight:700;font-size:1.05rem">${rich(q.q)}</p>
      <div>${q.options.map((o, i) => `<button class="quiz-opt" data-i="${i}">${String.fromCharCode(9312 + i)} ${rich(o)}</button>`).join('')}</div>
      <div id="qres" role="status"></div>
      <div class="btns" style="margin-top:12px">
        ${qi > 0 ? '<button class="btn small" id="qprev">← 앞 문제</button>' : ''}
        ${qi < m.quiz.length - 1 ? '<button class="btn small" id="qnext">다음 문제 →</button>' : ''}
      </div></div>
      <p class="tiny" style="margin-top:8px">첫 번째로 고른 답이 기록에 남아요. 틀린 문제는 다시 풀 수 있고, 연속 두 번 맞히면 복습함에서 빠져요.</p>`;
    const opts = [...qBox.querySelectorAll('.quiz-opt')];
    const show = (picked) => {
      opts.forEach((b) => {
        const i = +b.dataset.i; b.disabled = true;
        if (i === q.answer) b.classList.add('right'); else if (i === picked) b.classList.add('wrong');
      });
      const right = picked === q.answer;
      qBox.querySelector('#qres').innerHTML = `<p class="note ${right ? 'green' : 'warn'} small" style="margin:8px 0 0"><b>${right ? '정답이에요.' : '다시 볼까요?'}</b> ${rich(q.why)}</p>
        ${right ? '' : '<button class="btn small" id="retry" style="margin-top:8px">🔁 다시 풀기</button>'}`;
      const rt = qBox.querySelector('#retry');
      if (rt) rt.onclick = () => { opts.forEach((b) => { b.disabled = false; b.classList.remove('right', 'wrong'); }); qBox.querySelector('#qres').innerHTML = ''; bindOpts(); };
      markSteps();
    };
    const bindOpts = () => opts.forEach((b) => { b.onclick = () => { const i = +b.dataset.i; store.answer(key, i, i === q.answer); show(i); }; });
    if (r) show(r.last); else bindOpts();
    const p = qBox.querySelector('#qprev'); if (p) p.onclick = () => { qi -= 1; renderQuiz(); };
    const n = qBox.querySelector('#qnext'); if (n) n.onclick = () => { qi += 1; renderQuiz(); };
  }

  // 결과: 실습과 문제를 나눠 보여 주고, 개념별 피드백
  function renderResult() {
    const stepsDone = (rec().steps || []).filter(Boolean).length;
    const recs = m.quiz.map((q, n) => ({ q, n, r: store.rec(qKey(m, n)) }));
    const answered = recs.filter((x) => x.r);
    const firstRight = answered.filter((x) => x.r.firstRight);
    const good = firstRight.map((x) => x.q.skill || `문제 ${x.n + 1}`);
    const again = answered.filter((x) => !x.r.firstRight).map((x) => x.q.skill || `문제 ${x.n + 1}`);
    const firstWrong = answered.find((x) => !x.r.firstRight || !x.r.lastRight);
    document.getElementById('result').innerHTML = `<div class="card">
      <div class="tiles" style="margin-bottom:14px">
        <div class="tile"><div class="k">실습</div><div class="v">${stepsDone}<small>/ ${m.steps.length}</small></div><div class="s">${stepsDone === m.steps.length ? '모두 해냈어요' : '남은 지시사항이 있어요'}</div></div>
        <div class="tile"><div class="k">판단 문제 (첫 시도)</div><div class="v">${firstRight.length}<small>/ ${m.quiz.length}</small></div><div class="s">${answered.length < m.quiz.length ? `${m.quiz.length - answered.length}문제 남음` : '모두 풀었어요'}</div></div>
      </div>
      ${good.length ? `<div class="fb-good">👍 <b>익힌 것</b> · ${good.map(esc).join(', ')}</div>` : ''}
      ${again.length ? `<div class="fb-again">🔁 <b>다시 볼 것</b> · ${again.map(esc).join(', ')}</div>` : ''}
      ${!answered.length ? '<p class="muted">판단 문제를 풀면 여기에 개념별 피드백이 나와요.</p>' : ''}
      <div class="btns" style="margin-top:14px">
        ${firstWrong ? `<button class="btn" id="redo">🔁 틀린 문제 다시 풀기</button>` : ''}
        ${stepsDone < m.steps.length ? '<button class="btn" id="back-steps">✍️ 실습 이어서 하기</button>' : ''}
        ${next ? `<a class="btn primary" href="mission.html?id=${next.id}">다음 미션: ${esc(next.title)} →</a>` : `<a class="btn primary" href="path.html?stage=${m.track}">과정 목록으로 →</a>`}
      </div>
      <p class="small" style="margin:12px 0 0"><a href="review.html">복습함 열기</a> · <a href="index.html">학습실로</a></p></div>`;
    const rd = document.getElementById('redo'); if (rd) rd.onclick = () => { qi = firstWrong.n; go(3); };
    const bs = document.getElementById('back-steps'); if (bs) bs.onclick = () => go(1);
  }

  const start = location.hash === '#quiz' ? 3 : 0;
  go(start);
})();
