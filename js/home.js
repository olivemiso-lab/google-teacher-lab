(function () {
  const { S, C, STAGES, esc, fmt, fmtShort, kstToday, cohortNow, addDays, daysBetween, nextMeeting, store, isDone, progress, stats, reviewQueue, weakSkills, nextMission, header } = window.GTL;
  // ?pick=level1 처럼 들어오면 단계를 정하고 학습실을 연다
  const pick = new URLSearchParams(location.search).get('pick');
  if (pick && STAGES[pick]) { store.setStage(pick); history.replaceState(null, '', 'index.html'); }
  header('index.html');
  const today = kstToday();
  const now = cohortNow(today);
  const meetShort = `${S.meeting.day.slice(0, 1)} 21:00`;

  // 상단 상태
  const pill = document.getElementById('status-pill');
  const cta = document.getElementById('hero-cta');
  if (S.status === 'recruiting') {
    pill.textContent = (S.full || []).length >= 3
      ? `${S.cohort} 함께반 정원 마감 · 혼자 도전 신청 가능`
      : (() => { const r = window.GTL.recruitState();
          if (r.state === 'before') return `${S.cohort} 신청 ${window.GTL.openLabel()} 시작 · ${fmt(S.recruitEnd)} ${S.recruitEndTime || ''} 마감`;
          if (r.state === 'closed') return `${S.cohort} 함께반 신청 마감 · 혼자 도전 신청 가능`;
          return `${S.cohort} 신청 받는 중 · ${fmt(S.recruitEnd)} ${S.recruitEndTime || ''} 마감`; })();
    cta.textContent = `${S.cohort} 신청하기`;
  } else if (S.status === 'running') {
    pill.textContent = now.phase === 'running' ? `${S.cohort} 진행 중 · ${now.week}주차` : `${S.cohort} 진행 중`;
    cta.textContent = '참여 안내';
  } else {
    pill.textContent = '다음 기수 준비 중';
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
    level1: ['실습 미션 30개', '판단 문제 90개, 모의고사', '토요일 정기 모임'],
    level2: ['심화 실습 미션 30개', '판단 문제 90개, 모의고사', '토요일 정기 모임'],
    trainer: ['트레이너 과정과 역량 평가', '2~3분 시연 영상', '활동 기록과 지원서'],
  };
  const goal = { level1: '🏁 Level 1 시험 응시', level2: '🏁 Level 2 시험 응시', trainer: '🏁 트레이너 지원서 제출' };
  const weeks = { level1: S.levelWeeks, level2: S.levelWeeks, trainer: S.trainerWeeks };
  document.getElementById('stages').innerHTML = Object.entries(STAGES).map(([k, s], i) => `
    <a class="card step${mine === k ? ' mine' : ''}" href="?pick=${k}" aria-label="${s.name}로 학습실 열기">
      <span><span class="tag s-${k}">${s.icon} ${i + 1}단계 · ${weeks[k]}주</span>${mine === k ? ' <span class="tag t-sun">내 단계</span>' : ''}</span>
      <h3 style="margin:6px 0 0">${s.name}</h3>
      <span class="who">${esc(s.who)}</span>
      <ul>${detail[k].map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <span class="goal">${goal[k]}</span>
      <span class="btn small" style="align-self:flex-start;margin-top:10px">${mine === k ? '학습실 열기' : '이 과정 선택'}</span>
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
  const otFirst = S.orientation === sat(1); // 오리엔테이션을 첫 토요일 모임과 같이 하는 경우
  const rows = [
    ...(S.recruitOpen ? [[S.recruitOpen.slice(0, 10), '신청 시작 · ' + window.GTL.openLabel().replace(/^오늘 /, '')]] : []),
    [S.recruitEnd, `모집 마감 · ${S.recruitEndTime || ''}`],
    [S.orientation, `${otFirst ? '첫 토요일 모임 · 오리엔테이션' : '오리엔테이션'} · ${S.meeting.time.split(' ~')[0]} · 2~3명씩 짝 정하기`],
    [S.start, '1주차 시작'],
    ...(otFirst ? [] : [[sat(1), '첫 토요일 모임']]),
    [sat(S.levelWeeks), `Level 1·2반 마지막 모임 · ${S.levelWeeks}주 마무리`],
    [sat(S.trainerWeeks), `Trainer반 마지막 모임 · 지원서 서로 읽기`],
  ];
  document.getElementById('sched-title').textContent = `${S.cohort} 일정`;
  document.getElementById('sched').innerHTML = rows.sort((a, b) => a[0].localeCompare(b[0])).map(([d, t]) =>
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
      <p class="muted small">${esc(m.scenario)}</p>
      <a class="btn small" href="mission.html?id=${m.id}">${m.type === 'daily' ? '실습 시작' : '실전 시작'} →</a></div>`;
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
      box.innerHTML = tracks.map((t) => card(find(t, now.week, d), d === 5 ? '이번 주 실전' : '오늘의 실습')).join('');
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

// ── 내 학습실: 단계를 고른 사람에게 가장 먼저 보여 주는 화면
(function () {
  const { S, C, STAGES, esc, fmt, kstToday, cohortNow, daysBetween, nextMeeting, store, isDone, progress, stats, reviewQueue, weakSkills, nextMission } = window.GTL;
  const stage = store.get().stage;
  if (!stage) return;
  const dash = document.getElementById('dash');
  const today = kstToday();
  const now = cohortNow(today);
  const meet = nextMeeting(today);
  const dday = daysBetween(today, meet);
  const meetText = dday === 0 ? '오늘 밤 9시' : `${fmt(meet)} 밤 9시 · D-${dday}`;
  const where = now.phase === 'before' ? `${S.cohort} 시작까지 ${now.daysLeft}일` : now.levelDone && stage !== 'trainer' ? '과정을 모두 마쳤어요 · 자유 복습' : `${now.week}주차 ${'월화수목금토일'[now.dow - 1]}요일`;
  document.getElementById('landing-hero').hidden = true;
  document.getElementById('today-sec').hidden = true;
  document.getElementById('pick-title').textContent = '단계 바꾸기';

  if (stage === 'trainer') {
    const done = C.trainer.filter((_, i) => store.get().notes['road-' + (i + 1)]).length;
    const nextStep = C.trainer.find((_, i) => !store.get().notes['road-' + (i + 1)]);
    dash.innerHTML = `
      <div class="dash-hero"><div>
        <span class="tag" style="background:rgba(255,255,255,.18);color:#fff">🎓 Trainer · ${esc(where)}</span>
        <h1>${nextStep ? esc(nextStep.title.split('·')[0].trim()) + ' 단계' : '로드맵 8단계 완료'}</h1>
        <p>공식 로드맵 ${done}/8단계 완료</p>
        <div class="btns" style="margin-top:14px"><a class="btn" href="path.html?stage=trainer">로드맵 이어가기 →</a><a class="btn ghost" href="kit.html">준비 양식</a></div>
      </div><div class="ring" style="--p:${Math.round((done / 8) * 100)}"><b>${done}/8<small>로드맵</small></b></div></div>
      <div class="tiles" style="margin-top:14px">
        <div class="tile"><div class="k">다음 모임</div><div class="v" style="font-size:1.15rem">${esc(meetText)}</div><div class="s">Google Meet</div></div>
        <a class="tile" href="kit.html#plan"><div class="k">미니 연수 계획서</div><div class="v" style="font-size:1.15rem">양식 열기</div><div class="s">2주차까지</div></a>
        <a class="tile" href="kit.html#video"><div class="k">시연 영상</div><div class="v" style="font-size:1.15rem">2~3분</div><div class="s">체크리스트 →</div></a>
      </div>
      <p class="small" style="margin:12px 0 0"><a href="start.html">시작 준비</a> · <a href="resources.html#g-trainer">트레이너 공식 요건</a></p>`;
    dash.hidden = false;
    return;
  }

  const p = progress(stage), s = stats(stage), q = reviewQueue(stage), wk2 = window.GTL.weakness(stage), weak = wk2.weak;
  const nm = nextMission(stage);
  const wk = now.phase === 'running' && !now.levelDone ? now.week : (nm ? nm.week : 1);
  const weekList = C.missions.filter((m) => m.track === stage && m.week === wk);
  const weekDone = weekList.filter((m) => isDone(m.id)).length;
  const first = !Object.keys(store.get().missions).length && !s.answered;
  dash.innerHTML = `
    <div class="dash-hero"><div>
      <span class="tag" style="background:rgba(255,255,255,.18);color:#fff">${STAGES[stage].icon} ${STAGES[stage].name} · ${esc(where)}</span>
      <h1>${first ? '첫 미션' : nm ? '이어서 학습하기' : '미션 30개 완료'}</h1>
      <p>${nm ? `${nm.week}주차 ${'월화수목금'[nm.day - 1]} · ${esc(nm.title)}` : '모의고사와 복습으로 마무리하세요.'}</p>
      <div class="btns" style="margin-top:14px">
        ${nm ? `<a class="btn" href="mission.html?id=${nm.id}">▶ ${first ? '시작하기' : '이어서 학습하기'}</a>` : `<a class="btn" href="exam.html?stage=${stage}">📝 모의고사 보기</a>`}
        ${q.length ? `<a class="btn ghost" href="review.html?stage=${stage}">🔁 복습 ${q.length}문제</a>` : ''}
        ${first ? '<a class="btn ghost" href="start.html">연습 계정 준비 →</a>' : ''}
      </div>
    </div><div class="ring" style="--p:${p.pct}"><b>${p.pct}%<small>${p.done}/${p.total} 미션</small></b></div></div>

    <div class="tiles" style="margin-top:14px">
      <div class="tile"><div class="k">${wk}주차 진행</div><div class="v">${weekDone}<small>/ ${weekList.length}</small></div><div class="s">${esc(C.weeks[stage][wk - 1])}</div></div>
      <div class="tile"><div class="k">판단 문제 정답률</div><div class="v">${s.answered ? s.pct + '%' : '–'}</div><div class="s">${s.answered ? `첫 시도 ${s.right}/${s.answered}` : '미션에서 풀 수 있습니다'}</div></div>
      <a class="tile" href="review.html?stage=${stage}"><div class="k">복습할 문제</div><div class="v">${q.length}</div><div class="s">${q.length ? '복습함 열기' : '틀린 문제가 모입니다'}</div></a>
      <div class="tile"><div class="k">다음 모임</div><div class="v" style="font-size:1.15rem">${esc(meetText)}</div><div class="s">Google Meet</div></div>
    </div>

    <div class="grid g2" style="margin-top:14px">
      <div class="card"><h2 style="font-size:1.05rem">${wk}주차 미션</h2>
        <ul class="mlist">${weekList.map((m) => `<li class="${m.type === 'daily' ? '' : 'fri'}"><a href="mission.html?id=${m.id}"><span class="d">${'월화수목금'[m.day - 1]}</span><span class="t">${esc(m.title)}</span><span class="m">${isDone(m.id) ? '<span class="ok">✓</span>' : window.GTL.isPracticed(m.id) ? '<span class="tiny">실습✓</span>' : m.minutes + '분'}</span></a></li>`).join('')}</ul></div>
      <div class="card"><h2 style="font-size:1.05rem">다시 볼 개념</h2>
        ${weak.length ? `<ul class="chiplist">${weak.map((w) => `<li><a href="review.html?stage=${stage}">${esc(w.k)} · ${w.pct}%</a></li>`).join('')}</ul><p class="tiny" style="margin:8px 0 0">첫 시도 정답률 70% 미만인 개념</p>` : ''}
        ${wk2.recent.length ? `<p class="small" style="margin:${weak.length ? '12px' : '0'} 0 6px"><b>최근에 틀린 개념</b></p><ul class="chiplist">${wk2.recent.map((k) => `<li><a href="review.html?stage=${stage}">${esc(k)}</a></li>`).join('')}</ul>` : ''}
        ${!weak.length && !wk2.recent.length ? `<p class="muted small" style="margin:0">${!wk2.answered ? '판단 문제를 풀면 약한 개념이 표시됩니다.' : !wk2.enough ? `분석할 기록이 부족합니다. 판단 문제를 ${6 - wk2.answered}개 더 풀면 표시됩니다.` : '틀린 개념이 없습니다.'}</p>` : ''}
        <p class="small" style="margin:14px 0 0"><a href="my.html?stage=${stage}">📊 내 기록 전체 보기</a> · <a href="exam.html?stage=${stage}">📝 모의고사</a></p></div>
    </div>`;
  dash.hidden = false;
})();
