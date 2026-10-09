(function () {
  const { S, C, STAGES, esc, fmt, fmtShort, kstToday, cohortNow, addDays, store, isDone, progress, header } = window.GTL;
  header('index.html');
  const today = kstToday();
  const now = cohortNow(today);
  const meetShort = `${S.meeting.day.slice(0, 1)} 21:00`;

  // 상단 상태
  const pill = document.getElementById('status-pill');
  const cta = document.getElementById('hero-cta');
  if (S.status === 'recruiting') {
    pill.textContent = `${S.cohort} 모집 중 · ${fmt(S.recruitEnd)} 마감`;
    cta.textContent = `${S.cohort} 신청하기`;
  } else if (S.status === 'running') {
    pill.textContent = now.phase === 'running' ? `${S.cohort} 진행 중 · ${now.week}주차` : `${S.cohort} 진행 중`;
    cta.textContent = '참여 안내';
  } else {
    pill.textContent = '다음 기수를 준비하고 있어요';
    cta.textContent = '소식 받기';
  }
  const facts = [`${fmt(S.start)} 시작`, `매주 ${S.meeting.day} ${S.meeting.time}`, S.meeting.place, '무료'];
  if (S.capacity) facts.push(S.capacity);
  document.getElementById('facts').innerHTML = facts.map((f) => `<li>${esc(f)}</li>`).join('');
  document.getElementById('meet-day').textContent = meetShort;
  document.getElementById('who-meet').textContent = `${S.meeting.day} ${S.meeting.time.split(' ~')[0]}`;

  // 단계 카드
  const mine = store.get().stage;
  const detail = {
    level1: ['평일 5분 미션 6주', '금요일 실전 미션', '토요일 모임에서 막힌 곳 풀기'],
    level2: ['도구를 연결하는 미션 6주', '금요일 실전 미션', '첫 미니 연수 해 보기'],
    trainer: ['트레이너 과정·역량 평가', '2~3분 시연 영상', '활동 3~5개 정리, 지원서'],
  };
  const goal = { level1: '🏁 Level 1 시험 응시', level2: '🏁 Level 2 시험 응시', trainer: '🏁 트레이너 지원서 제출' };
  const weeks = { level1: S.levelWeeks, level2: S.levelWeeks, trainer: S.trainerWeeks };
  document.getElementById('stages').innerHTML = Object.entries(STAGES).map(([k, s], i) => `
    <a class="card step${mine === k ? ' mine' : ''}" href="path.html?stage=${k}">
      <span><span class="tag s-${k}">${s.icon} ${i + 1}단계 · ${weeks[k]}주</span>${mine === k ? ' <span class="tag t-sun">내 단계</span>' : ''}</span>
      <h3 style="margin:6px 0 0">${s.name}</h3>
      <span class="who">${esc(s.who)}</span>
      <ul>${detail[k].map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <span class="goal">${goal[k]}</span>
    </a>`).join('');

  // 함께 걷는 사람
  const L = S.leader;
  document.getElementById('leader').innerHTML = `
    <div class="avatar" aria-hidden="true">${esc(L.name.slice(0, 1))}</div>
    <div><b>${esc(L.name)}</b> <span class="muted small">· ${esc(L.line)}</span>
      <ul class="chips">${L.badges.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <p class="muted small" style="margin:0">${esc(L.note)}</p>
      <p class="small" style="margin:8px 0 0"><a href="${esc(S.threadsUrl)}" target="_blank" rel="noopener">스레드에서 만나기 ↗</a></p></div>`;

  // 기수 일정: 설정의 시작일에서 계산
  const sat = (w) => addDays(S.start, (w - 1) * 7 + 5);
  const rows = [
    [S.recruitEnd, '모집 마감'],
    [S.orientation, `오리엔테이션 · ${S.meeting.time.split(' ~')[0]} · 내 단계 확인, 2~3명씩 짝 정하기`],
    [S.start, '1주차 시작 · 첫 5분 미션이 열려요'],
    [sat(1), '첫 토요일 모임'],
    [sat(S.levelWeeks), `Level 1·2반 마지막 모임 · ${S.levelWeeks}주 마무리`],
    [sat(S.trainerWeeks), `Trainer반 마지막 모임 · 지원서 서로 읽기`],
  ];
  document.getElementById('sched-title').textContent = `${S.cohort} 일정`;
  document.getElementById('sched').innerHTML = rows.map(([d, t]) =>
    `<li${d < today ? ' class="muted"' : ''}><span class="when">${fmtShort(d)}</span><span>${esc(t)}</span></li>`).join('');

  // 오늘 영역: 기수 시작 전에는 1주차 미리보기, 진행 중에는 오늘 미션
  const sec = document.getElementById('today-sec');
  const box = document.getElementById('today');
  const tracks = mine === 'level1' || mine === 'level2' ? [mine] : ['level1', 'level2'];
  const card = (m, label) => {
    const s = STAGES[m.track];
    return `<div class="card${isDone(m.id) ? '' : ' is-now'}">
      <div class="m-meta"><span class="tag s-${m.track}">${s.icon} ${s.name}</span><span class="tag t-sun">${esc(label)}</span>${isDone(m.id) ? '<span class="tag s-level1">✓ 완료</span>' : ''}</div>
      <h3><a href="mission.html?id=${m.id}">${esc(m.title)}</a></h3>
      <p class="muted small">${esc(m.story)}</p>
      <a class="btn small" href="mission.html?id=${m.id}">${m.type === 'friday' ? '실전 시작' : '5분 시작'} →</a></div>`;
  };
  const find = (t, w, d) => C.missions.find((m) => m.track === t && m.week === w && m.day === d);

  if (now.phase === 'before') {
    if (now.daysLeft <= 60) {
      document.getElementById('today-title').textContent = `${S.cohort} 시작까지 ${now.daysLeft}일 · 1주차 미리 보기`;
      box.innerHTML = tracks.map((t) => card(find(t, 1, 1), '1주차 월요일')).join('');
      sec.hidden = false;
    }
  } else if (!now.levelDone && tracks.length) {
    const d = now.dow;
    document.getElementById('today-title').textContent = `${now.week}주차 ${'월화수목금토일'[d - 1]}요일`;
    if (d <= 5) {
      box.innerHTML = tracks.map((t) => card(find(t, now.week, d), d === 5 ? '이번 주 실전' : '오늘의 5분')).join('');
    } else {
      // 주말: 새 미션 없이 이번 주 실전 다시 보기 + 못 한 미션
      box.innerHTML = tracks.map((t) => {
        const left = C.missions.filter((m) => m.track === t && m.week === now.week && !isDone(m.id));
        const p = progress(t, now.week);
        return `<div class="card"><div class="m-meta"><span class="tag s-${t}">${STAGES[t].icon} ${STAGES[t].name}</span><span class="tag t-sun">${d === 6 ? '오늘 밤 모임' : '쉬는 날'}</span></div>
          <h3>${left.length ? `이번 주 남은 미션 ${left.length}개` : '이번 주 완료 🎉'}</h3>
          <ul class="checks small">${left.slice(0, 5).map((m) => `<li><a href="mission.html?id=${m.id}">${esc(m.title)}</a></li>`).join('')}</ul>
          <div class="bar" style="margin-top:10px" aria-label="지금까지 ${p.pct}%"><i style="width:${p.pct}%"></i></div>
          <p class="tiny" style="margin:6px 0 0">${now.week}주차까지 ${p.done}/${p.total}</p></div>`;
      }).join('');
    }
    sec.hidden = false;
  }
})();
