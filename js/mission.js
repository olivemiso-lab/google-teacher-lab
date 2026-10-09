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
  const fri = m.type === 'friday';
  document.title = `${m.title} · ${S.name}`;
  const rec = () => store.mission(m.id);
  const list = (arr, tag = 'ol', cls = 'steps') => `<${tag} class="${cls}">${arr.map((x) => `<li>${rich(x)}</li>`).join('')}</${tag}>`;
  const block = (icon, title, inner, extra = '') => `<div class="card block"${extra}><h2>${icon} ${title}</h2>${inner}</div>`;

  const prev = C.missions[idx - 1]?.track === m.track ? C.missions[idx - 1] : null;
  const next = C.missions[idx + 1]?.track === m.track ? C.missions[idx + 1] : null;
  const report = `mailto:${S.email}?subject=${encodeURIComponent(`[화면이 달라요] ${m.id} ${m.title}`)}&body=${encodeURIComponent('어느 단계에서 무엇이 다른지 적어 주세요.\n(학생 이름 등 개인정보는 넣지 마세요)\n\n')}`;

  body.innerHTML = `
    <p class="small"><a href="path.html?stage=${m.track}">← ${st.icon} ${st.name} 과정</a></p>
    <div class="m-head">
      <div class="m-meta">
        <span class="tag s-${m.track}">${st.icon} ${st.name}</span>
        <span class="tag t-sun">${m.week}주차 ${DAY[m.day]}요일${fri ? ' · 이번 주 실전' : ''}</span>
        <span class="tag" style="border:1px solid var(--line)">⏱ ${m.minutes || 5}분</span>
        ${m.tools.map((t) => `<span class="tag" style="border:1px solid var(--line)">${esc(t)}</span>`).join('')}
      </div>
      <h1 style="font-size:1.7rem">${esc(m.title)}</h1>
      <p class="lead" style="font-size:1.02rem">${fri ? '<b>상황</b> · ' : ''}${esc(m.story)}</p>
      <p class="tiny">${S.cohort} 달력으로는 ${fmt(missionDate(m))}에 하는 미션이에요. 언제 해도 괜찮아요.</p>
    </div>

    ${block('☕', fri ? '해야 할 일' : '오늘의 5분', list(m.basic))}
    ${m.solo ? `<p class="note green small">🙋 혼자 연습할 때 · ${esc(m.solo)}</p>` : ''}
    ${block('✅', '완료 조건', `<div id="conds">${m.done.map((d, i) => `<label class="check" style="margin:6px 0"><input type="checkbox" data-c="${i}"><span>${rich(d)}</span></label>`).join('')}</div>
      <p class="tiny" style="margin:8px 0 0">모두 체크하면 이 미션이 완료로 표시돼요.</p>`)}
    ${m.advanced.length ? block('🚀', '조금 더 해보기 <span class="tiny">선택 · 10~20분</span>', list(m.advanced, 'ul', 'checks') + `<label class="check" style="margin-top:10px"><input type="checkbox" id="adv"><span>조금 더 해보기도 했어요</span></label>`) : ''}
    ${fri ? block('📝', '한 줄 성찰', `<p class="muted small">다음 주 실제 수업이나 업무에서 이번 주 기능 중 무엇을 가장 먼저 써 보고 싶나요?</p>
      <textarea id="reflect" maxlength="300" placeholder="예) 동학년 공유 폴더를 만들어 다음 주 자료를 같이 넣어 보고 싶어요"></textarea>
      <p class="muted small" style="margin:14px 0 6px">결과물 링크 (선택)</p>
      <input type="text" id="link" inputmode="url" placeholder="https://docs.google.com/..." maxlength="500">
      <label class="check small" style="margin-top:8px"><input type="checkbox" id="privacy"><span>실제 학생 이름, 사진, 연락처, 성적 등 개인정보가 들어 있지 않은 것을 확인했어요.</span></label>
      <div class="btns" style="margin-top:10px"><button class="btn small" id="save-note">저장</button><span class="tiny" id="note-msg" role="status"></span></div>
      <p class="tiny" style="margin:8px 0 0">이 브라우저에만 저장돼요. 토요일 모임에서 보여 주고 싶을 때 꺼내 보세요.</p>`) : ''}
    ${m.classroom ? block('🏫', '교실에서는 이렇게', `<p style="margin:0">${rich(m.classroom)}</p>`) : ''}
    ${block('👤', '계정 조건', `<p style="margin:0">${rich(m.account)}</p>`)}
    ${m.privacy ? `<p class="note warn small">🔐 ${esc(m.privacy)}</p>` : ''}
    ${m.source ? block('📚', '공식 Google 자료', `<p style="margin:0"><a href="${esc(m.source.url)}" target="_blank" rel="noopener">${esc(m.source.title)} ↗</a></p><p class="tiny" style="margin:4px 0 0">마지막 확인 ${esc(m.checked || '-')}</p>`) : ''}
    ${m.quiz ? block('🧠', '1분 체크', `<p style="font-weight:700">${esc(m.quiz.text)}</p><div id="quiz"></div><div id="quiz-res" role="status"></div>`) : ''}
    <p class="small muted">🐞 지금 화면과 다른가요? <a href="${report}">운영자에게 알려 주기</a></p>
    <div class="pager">
      ${prev ? `<a class="btn small" href="mission.html?id=${prev.id}">← ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="btn small" href="mission.html?id=${next.id}">${esc(next.title)} →</a>` : `<a class="btn small" href="path.html?stage=${m.track}">과정 목록 →</a>`}
    </div>`;

  // 완료 조건 체크: 모두 체크하면 기본 완료
  const conds = [...body.querySelectorAll('[data-c]')];
  const saved = rec().conds || (rec().basic ? m.done.map(() => true) : []);
  conds.forEach((el, i) => {
    el.checked = !!saved[i];
    el.onchange = () => {
      const now = conds.map((c) => c.checked);
      const all = now.every(Boolean);
      store.setMission(m.id, { conds: now, basic: all, at: all ? (rec().at || new Date().toISOString()) : undefined });
    };
  });
  const adv = document.getElementById('adv');
  if (adv) { adv.checked = !!rec().advanced; adv.onchange = () => store.setMission(m.id, { advanced: adv.checked }); }

  // 금요일 성찰·링크
  const saveBtn = document.getElementById('save-note');
  if (saveBtn) {
    const r = rec();
    const ref = document.getElementById('reflect'), link = document.getElementById('link'), pv = document.getElementById('privacy'), msg = document.getElementById('note-msg');
    ref.value = r.reflection || ''; link.value = r.link || ''; pv.checked = !!r.link;
    saveBtn.onclick = () => {
      const url = link.value.trim();
      if (url && !/^https:\/\/[^\s]+$/.test(url)) { msg.textContent = 'https:// 로 시작하는 주소를 넣어 주세요.'; return; }
      if (url && !pv.checked) { msg.textContent = '링크를 저장하려면 개인정보 확인에 체크해 주세요.'; return; }
      const ok = store.setMission(m.id, { reflection: ref.value.trim(), link: url });
      msg.textContent = ok ? '저장했어요.' : '이 브라우저에서는 저장할 수 없어요. 내용을 따로 복사해 두세요.';
    };
  }

  // 1분 체크: 미션당 한 번만 답한다
  if (m.quiz) {
    const qBox = document.getElementById('quiz'), res = document.getElementById('quiz-res');
    const show = (picked) => {
      qBox.querySelectorAll('button').forEach((b, i) => {
        b.disabled = true;
        if (i === m.quiz.answer) b.classList.add('right');
        else if (i === picked) b.classList.add('wrong');
      });
      const right = picked === m.quiz.answer;
      res.innerHTML = `<p class="note ${right ? 'green' : 'warn'} small" style="margin:8px 0 0"><b>${right ? '정답이에요.' : '다시 볼까요?'}</b> ${esc(m.quiz.explanation)}</p>`;
    };
    qBox.innerHTML = m.quiz.options.map((o, i) => `<button class="quiz-opt" data-i="${i}">${String.fromCharCode(9312 + i)} ${esc(o)}</button>`).join('');
    const prevAns = store.get().quiz[m.id];
    if (typeof prevAns === 'number') show(prevAns);
    else qBox.querySelectorAll('button').forEach((b) => { b.onclick = () => { const i = +b.dataset.i; store.answer(m.id, i); show(i); }; });
  }
})();
