(function () {
  const { S, C, STAGES, esc, rich, fmtShort, cohortNow, studyNow, addDays, store, isDone, progress, header } = window.GTL;
  header('path.html');
  const q = new URLSearchParams(location.search).get('stage');
  const stage = STAGES[q] ? q : (store.get().stage || 'level1');
  const now = studyNow();
  const curWeek = now.phase === 'running' ? now.week : 0;

  document.getElementById('tabs').innerHTML = Object.entries(STAGES).map(([k, s]) =>
    `<a href="?stage=${k}" aria-current="${k === stage}">${s.icon} ${s.name}</a>`).join('');
  const body = document.getElementById('body');
  const weekRange = (w) => S.status === 'open' ? '' : `${fmtShort(addDays(S.start, (w - 1) * 7))} ~ ${fmtShort(addDays(S.start, (w - 1) * 7 + 5))}`;

  function pickButton() {
    const mine = store.get().stage === stage;
    return mine
      ? '<span class="tag t-sun">선택한 과정</span>'
      : `<button class="btn small" id="pick" title="학습실에 이 과정을 표시합니다. 이 브라우저의 화면 설정입니다.">${STAGES[stage].icon} 이 과정 선택</button>`;
  }
  function bindPick() {
    const b = document.getElementById('pick');
    if (b) b.onclick = () => { store.setStage(stage); location.reload(); };
  }

  if (stage !== 'trainer') {
    const p = progress(stage);
    const titles = C.weeks[stage];
    const DAYS = ['월', '화', '수', '목', '금'];
    const intro = stage === 'level1'
      ? '공식 task card(2025-08)의 도구 12개를 연습 계정과 함께 실습합니다. 미션마다 판단 문제 3개, 금요일은 실전 시나리오, 6주차 금요일은 45분 실습 모의 연습입니다.'
      : '공식 task card(2025-12) 기준 심화 실습입니다. 미션마다 판단 문제 3개, 금요일은 실전 시나리오, 6주차 금요일은 45분 실습 모의 연습입니다.';
    body.innerHTML = `
      <div class="card" style="margin-bottom:20px">
        <div class="week-head"><h2 style="margin:0">${STAGES[stage].icon} ${STAGES[stage].name} · ${S.levelWeeks}주</h2>${pickButton()}</div>
        <p class="muted">${intro}</p>
        <div class="bar" aria-label="진행률 ${p.pct}%"><i style="width:${p.pct}%"></i></div>
        <p class="tiny" style="margin:6px 0 0">내 진행 ${p.done}/${p.total} · 이 브라우저에 저장</p>
      </div>
      ${titles.map((t, i) => {
        const w = i + 1;
        const list = C.missions.filter((m) => m.track === stage && m.week === w);
        return `<div class="card week${w === curWeek ? ' is-now' : ''}">
          <div class="week-head"><h3 style="margin:0">${w}주차 · ${esc(t)}</h3><span class="date">${w === curWeek ? '이번 주 · ' : ''}${weekRange(w)}</span></div>
          <ul class="mlist">${list.map((m) => `<li class="${m.type === 'daily' ? '' : 'fri'}"><a href="mission.html?id=${m.id}">
            <span class="d">${DAYS[m.day - 1]}</span>
            <span class="t">${m.type === 'friday' ? '<b>실전</b> · ' : m.type === 'mock' ? '<b>모의 시험</b> · ' : ''}${esc(m.title)}</span>
            <span class="m">${isDone(m.id) ? '<span class="ok">✓ 완료</span>' : window.GTL.isPracticed(m.id) ? '<span class="tiny">실습만 ✓</span>' : m.minutes + '분'}</span></a></li>`).join('')}</ul>
        </div>`;
      }).join('')}
      <p class="note green small">처음이라면 <a href="start.html">시작 준비</a>에서 연습 계정을 먼저 준비하세요.</p>
      <p class="note small">다음 단계: ${stage === 'level1' ? '<a href="?stage=level2">🚀 Level 2</a>' : '<a href="?stage=trainer">🎓 Trainer</a>'} · 시험 안내는 <a href="resources.html#g-${stage}">인증 가이드</a>에서 확인하세요.</p>`;
    bindPick();
    return;
  }

  // Trainer: 8주 스터디 계획 + 공식 로드맵 8단계
  const plan = [
    ['출발점 확인', 'Level 1·2 인증서의 이름·계정·만료일을 확인하고 트레이너 교육 과정을 시작합니다. 미니 연수 주제를 정합니다.', '서로의 주제를 1분씩 소개'],
    ['연수 계획서', '트레이너 과정을 이어 가며 미니 연수 계획서를 작성합니다.', '계획서 서로 읽고 한 가지씩 제안'],
    ['미니 연수 ①', '계획서대로 15분 미니 연수를 준비해요. 15분 연수 → 10분 실습 → 5분 피드백 순서로 짜고, 토요일 모임에서 해 볼 수 있는지 운영자와 이야기해요. 주제는 Level 과정에서 많이 막히는 곳에서 골라요.', '첫 미니 연수 · 참가자 피드백 받기'],
    ['역량 평가', '트레이너 역량 평가(Trainer Skills Assessment)를 응시해요. 학교나 동학년에서 할 연수도 한 번 계획해요.', '평가 후기 나누기 · 미니 연수'],
    ['영상 대본·촬영', '2~3분 시연 영상의 대본을 쓰고 촬영합니다. 3분을 넘기지 않습니다.', '대본 서로 읽기 · 미니 연수'],
    ['영상 다듬기', '서로의 영상을 검토하고 다시 촬영합니다.', '영상 함께 보기 · 미니 연수'],
    ['활동 3~5개 정리', '최근 1년간 내가 이끈 Google 관련 활동을 양식에 맞춰 정리해요. 스터디 미니 연수도 기록해 둬요.', '활동 기록 서로 점검'],
    ['지원서', '지원서 답변 초안을 쓰고 제출 전 점검표로 확인합니다.', '답변 서로 읽기 · 마무리'],
  ];
  const T = C.trainer;
  body.innerHTML = `
    <div class="card" style="margin-bottom:20px">
      <div class="week-head"><h2 style="margin:0">🎓 Trainer · ${S.trainerWeeks}주</h2>${pickButton()}</div>
      <p class="muted">${S.trainerWeeks}주 동안 지원서 준비를 마치는 것이 목표입니다. Level 1·2 인증이 있거나 곧 응시할 예정이면 적합합니다.</p>
      <p class="note small" style="margin:0">트레이너 지원에는 최근 1년간 직접 이끈 Google 관련 연수·활동 3~5개가 필요해요. 이 경험을 처음부터 쌓아야 한다면 Level 2부터 함께 공부하면서 경험을 쌓고 Trainer로 넘어가는 걸 추천해요. 스터디 미니 연수가 공식 사례로 인정되는지는 Google이 판단해요.</p>
      <p class="note green small" style="margin:10px 0 0"><b>이미 연수를 하고 계신 선생님께</b> · 최근 1년 안에 학교나 지역에서 직접 이끈 Google 도구 연수(Workspace for Education, Gemini 등)가 있다면, 그 연수가 지원서의 활동 기록이 될 수 있어요. 이런 경우에는 7주차 '활동 3~5개 정리'를 먼저 해 두고 트레이너 과정 → 역량 평가 → 시연 영상 순서로 준비하면 더 빨라요. 활동으로 인정되는지는 Google이 판단해요.</p>
    </div>
    <h2>주차별 계획</h2>
    <div class="grid g2" style="margin-bottom:28px">
      ${plan.map(([t, d, sat], i) => `<div class="card${i + 1 === curWeek ? ' is-now' : ''}">
        <div class="week-head"><h3 style="margin:0">${i + 1}주차 · ${esc(t)}</h3><span class="date">${weekRange(i + 1)}</span></div>
        <p class="muted small" style="margin:6px 0">${esc(d)}</p>
        <p class="tiny" style="margin:0">토요일 · ${esc(sat)}</p></div>`).join('')}
    </div>
    <div class="week-head"><h2 style="margin:0">공식 로드맵 8단계</h2><a class="btn small" href="kit.html">🧰 준비 양식 보기</a></div>
    <p class="muted small">각 단계의 '공식 안내'는 Google 공식 자료를 정리한 것이고, '준비 제안'은 이 스터디의 연습 방법입니다.</p>
    ${T.map((s, i) => {
      const key = 'road-' + (i + 1);
      const done = !!store.get().notes[key];
      return `<details class="card week"${i === 0 ? ' open' : ''}>
        <summary style="cursor:pointer;display:flex;justify-content:space-between;gap:10px"><b>${i + 1}. ${esc(s.title)}</b><span class="tiny">${done ? '✓ 체크함' : ''}</span></summary>
        <p class="muted small" style="margin-top:10px">${rich(s.summary)}</p>
        <ul class="checks small">${s.steps.map((x) => `<li>${rich(x)}</li>`).join('')}</ul>
        <p class="note green small">${rich(s.deliverable)}</p>
        <div class="btns"><a class="btn small" href="${esc(s.official_url)}" target="_blank" rel="noopener">공식 자료 ↗</a>
          <label class="check small" style="padding:6px 10px"><input type="checkbox" data-road="${key}"${done ? ' checked' : ''}> 완료</label></div>
      </details>`;
    }).join('')}`;
  body.querySelectorAll('[data-road]').forEach((el) => {
    el.onchange = () => { store.setNote(el.dataset.road, el.checked ? new Date().toISOString().slice(0, 10) : ''); };
  });
  bindPick();
})();
