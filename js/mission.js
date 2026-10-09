(function () {
  const { S, C, STAGES, DAY, esc, rich, fmt, missionDate, store, header } = window.GTL;
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
  const label = { daily: '오늘의 실습', friday: '이번 주 실전', mock: '모의 시험' }[m.type];
  document.title = `${m.title} · ${S.name}`;
  const rec = () => store.mission(m.id);
  const block = (icon, title, inner) => `<div class="card block"><h2>${icon} ${title}</h2>${inner}</div>`;
  const prev = C.missions[idx - 1]?.track === m.track ? C.missions[idx - 1] : null;
  const next = C.missions[idx + 1]?.track === m.track ? C.missions[idx + 1] : null;
  const code = `${m.track === 'level1' ? 'L1' : 'L2'} ${m.week}주차 ${DAY[m.day]}`;
  const video = (C.videos || {})[m.id];
  const report = `mailto:${S.email}?subject=${encodeURIComponent(`[화면이 달라요] ${code} ${m.title}`)}&body=${encodeURIComponent('어느 지시사항에서 무엇이 다른지 적어 주세요.\n(학생 이름 등 개인정보는 넣지 마세요)\n\n')}`;

  body.innerHTML = `
    <p class="small"><a href="path.html?stage=${m.track}">← ${st.icon} ${st.name} 과정</a></p>
    <div class="m-head">
      <div class="m-meta">
        <span class="tag s-${m.track}">${st.icon} ${st.name}</span>
        <span class="tag t-sun">${m.week}주차 ${DAY[m.day]}요일 · ${label}</span>
        <span class="tag" style="border:1px solid var(--line)">⏱ ${m.minutes}분</span>
        ${m.tools.map((t) => `<span class="tag" style="border:1px solid var(--line)">${esc(t)}</span>`).join('')}
      </div>
      <h1 style="font-size:1.7rem">${esc(m.title)}</h1>
      <p class="tiny">${S.cohort} 달력으로는 ${fmt(missionDate(m))} 미션이에요. 공식 평가 목표 ${esc(m.objectives.join(', '))}</p>
    </div>

    <p class="note green small">👥 <b>연습 계정</b>과 함께 해요. 시험처럼 시크릿 창에 연습 계정을 열어 두고, 공유·초대·제출을 실제로 주고받아요. 이 페이지는 평소 창에서 열어야 진도가 남아요. <a href="start.html">처음이라면 연습 계정 만들기 →</a></p>

    ${block('📋', '상황', `<p style="margin:0">${rich(m.scenario)}</p>`)}
    ${block('✍️', '지시사항', `<p class="tiny" style="margin:-4px 0 8px">하나씩 끝낼 때마다 체크하세요.</p><div id="steps">${m.steps.map((s, i) => `<label class="check" style="margin:6px 0"><input type="checkbox" data-s="${i}"><span>${rich(s)}</span></label>`).join('')}</div>
      ${m.type !== 'daily' ? `<div class="btns" style="margin-top:12px"><button class="btn small" id="timer">⏱ ${m.minutes}분 타이머 시작</button><span class="small" id="timer-out" role="timer"></span></div>` : ''}
      ${video ? `<p style="margin:12px 0 0"><a class="btn small" href="${esc(video)}" target="_blank" rel="noopener">▶ 영상으로 보기</a></p>` : ''}`)}
    ${m.tip ? `<p class="note small">💡 ${rich(m.tip)}</p>` : ''}
    ${m.limit ? `<p class="note warn small">⚠️ ${rich(m.limit)}</p>` : ''}
    ${block('✅', '스스로 점검', `<ul class="checks">${m.check.map((c) => `<li>${rich(c)}</li>`).join('')}</ul>`)}
    ${block('🧠', '판단 문제 3개', `<p class="tiny" style="margin:-4px 0 8px">시험은 "상황에 맞는 올바른 방법"을 물어요. 문제마다 한 번만 답할 수 있어요.</p><div id="quiz"></div>`)}
    ${m.source ? `<p class="small">📚 공식 자료: <a href="${esc(m.source.url)}" target="_blank" rel="noopener">${esc(m.source.title)} ↗</a></p>` : ''}
    <p class="note green small">💬 막히면 카톡 질문방에 <b>${code}</b>처럼 미션 번호를 붙여 물어보세요.</p>
    <p class="small muted">🐞 지금 화면과 다른가요? <a href="${report}">운영자에게 알려 주기</a></p>
    <div class="pager">
      ${prev ? `<a class="btn small" href="mission.html?id=${prev.id}">← ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="btn small" href="mission.html?id=${next.id}">${esc(next.title)} →</a>` : `<a class="btn small" href="path.html?stage=${m.track}">과정 목록 →</a>`}
    </div>`;

  // 지시사항: 모두 체크하면 미션 완료
  const boxes = [...body.querySelectorAll('[data-s]')];
  const saved = rec().steps || [];
  boxes.forEach((el, i) => {
    el.checked = !!saved[i];
    el.onchange = () => {
      const now = boxes.map((b) => b.checked);
      const all = now.every(Boolean);
      store.setMission(m.id, { steps: now, basic: all, at: all ? (rec().at || new Date().toISOString()) : undefined });
    };
  });

  // 실전·모의: 카운트다운 (시험 감각 연습용, 끝나도 계속할 수 있음)
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

  // 판단 문제 3개: 문제마다 한 번만 답한다
  const qBox = document.getElementById('quiz');
  qBox.innerHTML = m.quiz.map((q, n) => `
    <div class="qitem" style="margin:${n ? '18px' : '0'} 0 0">
      <p style="font-weight:700;margin-bottom:4px">${n + 1}. ${rich(q.q)}</p>
      <div>${q.options.map((o, i) => `<button class="quiz-opt" data-q="${n}" data-i="${i}">${String.fromCharCode(9312 + i)} ${rich(o)}</button>`).join('')}</div>
      <div data-res="${n}" role="status"></div>
    </div>`).join('');
  const show = (n, picked) => {
    const q = m.quiz[n];
    qBox.querySelectorAll(`[data-q="${n}"]`).forEach((b) => {
      const i = +b.dataset.i;
      b.disabled = true;
      if (i === q.answer) b.classList.add('right');
      else if (i === picked) b.classList.add('wrong');
    });
    const right = picked === q.answer;
    qBox.querySelector(`[data-res="${n}"]`).innerHTML = `<p class="note ${right ? 'green' : 'warn'} small" style="margin:6px 0 0"><b>${right ? '정답이에요.' : '다시 볼까요?'}</b> ${rich(q.why)}</p>`;
  };
  m.quiz.forEach((q, n) => {
    const key = `${m.id}#${n}`;
    const prevAns = store.get().quiz[key];
    if (typeof prevAns === 'number') show(n, prevAns);
    else qBox.querySelectorAll(`[data-q="${n}"]`).forEach((b) => { b.onclick = () => { const i = +b.dataset.i; store.answer(key, i); show(n, i); }; });
  });
})();
