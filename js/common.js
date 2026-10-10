// 모든 페이지가 같이 쓰는 도구: 머리말·탭, 한국 날짜, 기수 달력, 내 학습 기록(브라우저 저장)과 분석.
(function () {
  const S = window.SITE;
  const C = window.CONTENT;

  const STAGES = {
    level1: { icon: '🌱', name: 'Level 1', who: 'Google 인증이 없는 경우' },
    level2: { icon: '🚀', name: 'Level 2', who: 'Level 1 보유' },
    trainer: { icon: '🎓', name: 'Trainer', who: 'Level 1·2 보유 또는 응시 예정' },
  };
  // 공식 시험 가이드의 영역 (평가 목표 번호의 앞자리)
  const DOMAINS = {
    level1: { 1: '만들기', 2: '공유', 3: '소통', 4: '협업', 5: '정리' },
    level2: { 1: '만들기', 2: '소통', 3: '협업', 4: '정리' },
  };
  const DAY = ['', '월', '화', '수', '목', '금', '토', '일'];

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // 미션 본문의 `이름` 표기만 강조로 바꾼다. 나머지는 모두 글자 그대로.
  const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

  // 날짜는 언제나 한국 시간 기준 YYYY-MM-DD 문자열로 다룬다.
  function kstToday(now = new Date()) {
    return new Date(now.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
  }
  const toUTC = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
  const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / 864e5);
  const addDays = (d, n) => new Date(toUTC(d) + n * 864e5).toISOString().slice(0, 10);
  const dowOf = (d) => DAY[((new Date(toUTC(d)).getUTCDay() + 6) % 7) + 1];
  const fmt = (d) => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일 (${dowOf(d)})`;
  const fmtShort = (d) => `${+d.slice(5, 7)}/${+d.slice(8, 10)} (${dowOf(d)})`;

  // 기수 달력: 시작일 기준으로 지금이 몇 주차 무슨 요일인지.
  function cohortNow(today = kstToday()) {
    const diff = daysBetween(S.start, today);
    if (diff < 0) return { phase: 'before', daysLeft: -diff };
    const week = Math.floor(diff / 7) + 1;
    const dow = (diff % 7) + 1; // 1=월 … 7=일
    return { phase: 'running', week, dow, levelDone: week > S.levelWeeks, trainerDone: week > S.trainerWeeks };
  }
  const missionDate = (m) => addDays(S.start, (m.week - 1) * 7 + (m.day - 1));
  // 신청 상태: before(열리기 전) · open(받는 중) · closed(마감)
  function recruitState(now = Date.now()) {
    if (S.status !== 'recruiting') return { state: 'none' };
    const open = S.recruitOpen ? Date.parse(S.recruitOpen) : 0;
    if (now < open) return { state: 'before', ms: open - now };
    const close = S.recruitClose ? Date.parse(S.recruitClose) : Date.parse(S.recruitEnd + 'T23:59:59+09:00');
    if (now >= close) return { state: 'closed' };
    return { state: 'open' };
  }
  const openLabel = () => {
    if (!S.recruitOpen) return '';
    const d = new Date(Date.parse(S.recruitOpen) + 9 * 3600e3);
    const day = d.toISOString().slice(0, 10);
    const h = d.getUTCHours(), mi = d.getUTCMinutes();
    const t = `${h < 12 ? '오전' : h < 18 ? '오후' : '저녁'} ${h % 12 || 12}시${mi ? ` ${mi}분` : ''}`;
    return `${day === kstToday() ? '오늘' : fmt(day)} ${t}`;
  };
  // 다음 토요일 모임 (오늘이 토요일이면 오늘)
  function nextMeeting(today = kstToday()) {
    const first = addDays(S.start, 5);
    if (today <= first) return first;
    const d = daysBetween(first, today) % 7;
    return d === 0 ? today : addDays(today, 7 - d);
  }

  // ── 내 기록: 이 브라우저에만 저장된다. 저장소가 막혀 있어도 화면은 그대로 동작한다.
  const KEY = 'gtl.v3'; // v3: 문제마다 첫 시도·다시 풀기 기록
  const blank = () => ({ stage: '', missions: {}, answers: {}, notes: {}, exams: [] });
  let mem = blank();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) mem = Object.assign(blank(), JSON.parse(raw));
    else { const old = JSON.parse(localStorage.getItem('gtl.v2') || 'null'); if (old && old.stage) mem.stage = old.stage; } // 예전 버전에서 고른 단계는 이어받기 (미션 형식이 바뀌어 진도는 새로 시작)
  } catch (e) { /* 저장 불가 환경 */ }
  const store = {
    get: () => mem,
    save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); return true; } catch (e) { return false; } },
    setStage(s) { mem.stage = STAGES[s] ? s : ''; return store.save(); },
    mission: (id) => mem.missions[id] || {},
    setMission(id, patch) { mem.missions[id] = Object.assign({}, mem.missions[id], patch); return store.save(); },
    setNote(key, text) { if (text) mem.notes[key] = text; else delete mem.notes[key]; return store.save(); },
    // 문제 풀이 기록: 첫 시도는 그대로 남기고, 다시 풀 때마다 연속 정답(streak)을 센다.
    answer(key, i, right) {
      const r = mem.answers[key] || { first: i, firstRight: right, n: 0, streak: 0, wrongEver: false };
      r.n += 1; r.last = i; r.lastRight = right; r.at = Date.now();
      r.streak = right ? (r.streak || 0) + 1 : 0;
      if (!right) r.wrongEver = true;
      mem.answers[key] = r; store.save(); return r;
    },
    rec: (key) => mem.answers[key],
    addExam(x) { mem.exams.push(x); mem.exams = mem.exams.slice(-20); return store.save(); },
    exportText: () => JSON.stringify({ app: 'google-teacher-lab', v: 3, savedAt: new Date().toISOString(), data: mem }),
    importText(txt) {
      const o = JSON.parse(txt);
      if (!o || o.app !== 'google-teacher-lab' || !o.data) throw new Error('이 앱의 백업 파일이 아닙니다.');
      try { localStorage.setItem(KEY + '.before-import', JSON.stringify(mem)); } catch (e) { /* 보관 실패해도 진행 */ }
      mem = Object.assign(blank(), o.data); return store.save();
    },
    reset() { try { localStorage.setItem(KEY + '.before-reset', JSON.stringify(mem)); } catch (e) { /* 무시 */ } mem = blank(); return store.save(); },
    // 모의고사 진행 중 상태 (새로고침해도 이어서)
    examDraft: () => mem.examDraft || null,
    setExamDraft(d) { if (d) mem.examDraft = d; else delete mem.examDraft; return store.save(); },
  };
  const isPracticed = (id) => !!store.mission(id).basic; // 지시사항을 모두 해냄
  const quizDone = (id) => { const m = C.missions.find((x) => x.id === id); return !!m && m.quiz.every((_, n) => mem.answers[`${id}#${n}`]); };
  const isDone = (id) => isPracticed(id) && quizDone(id); // 학습 완료 = 실습 + 판단 문제
  function progress(track, upToWeek = 99) {
    const list = C.missions.filter((m) => m.track === track && m.week <= upToWeek);
    const done = list.filter((m) => isDone(m.id)).length;
    return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  }

  // ── 분석
  const qKey = (m, n) => `${m.id}#${n}`;
  const domainOf = (m) => +String(m.objectives[0] || '').replace(/^L\d\s*/, '').split('.')[0] || 0;
  const questions = (track) => C.missions.filter((m) => !track || m.track === track)
    .flatMap((m) => m.quiz.map((q, n) => ({ m, n, q, key: qKey(m, n), skill: q.skill || m.tools.join('·'), domain: q.domain || domainOf(m) })));
  function stats(track) {
    const qs = questions(track);
    const done = qs.filter((x) => store.rec(x.key));
    const right = done.filter((x) => store.rec(x.key).firstRight).length;
    const group = (fn) => {
      const g = {};
      for (const x of done) {
        const k = fn(x); g[k] = g[k] || { k, n: 0, right: 0 };
        g[k].n += 1; if (store.rec(x.key).firstRight) g[k].right += 1;
      }
      return Object.values(g).map((v) => Object.assign(v, { pct: Math.round((v.right / v.n) * 100) }));
    };
    return {
      total: qs.length, answered: done.length, right,
      pct: done.length ? Math.round((right / done.length) * 100) : 0,
      byDomain: track ? group((x) => x.domain) : [],
      bySkill: group((x) => x.skill),
    };
  }
  // 복습할 문제: 한 번이라도 틀렸고, 아직 연속 2번 맞히지 못한 문제
  const reviewQueue = (track) => questions(track).filter((x) => { const r = store.rec(x.key); return r && r.wrongEver && (r.streak || 0) < 2; });
  const weakSkills = (track, max = 3) => stats(track).bySkill.filter((s) => s.n >= 2 && s.pct < 70).sort((a, b) => a.pct - b.pct).slice(0, max);
  // 약한 개념 요약: 기록이 적으면 '부족'으로, 아니면 약한 개념 + 최근에 틀린 개념
  function weakness(track) {
    const s = stats(track);
    const recent = [...new Set(reviewQueue(track).map((x) => x.skill))].slice(0, 5);
    return { answered: s.answered, enough: s.answered >= 6, weak: weakSkills(track, 4), recent };
  }
  function nextMission(track) {
    const list = C.missions.filter((m) => m.track === track);
    const now = cohortNow();
    const open = now.phase === 'running' ? list.filter((m) => missionDate(m) <= kstToday()) : [];
    return open.find((m) => !isDone(m.id)) || list.find((m) => !isDone(m.id)) || null;
  }

  // ── 머리말(데스크톱 메뉴) + 휴대폰 아래 탭
  const TABS = [
    ['index.html', '🏠', '학습실'],
    ['path.html', '🗺️', '과정'],
    ['review.html', '🔁', '복습'],
    ['exam.html', '📝', '모의고사'],
    ['resources.html', '📚', '자료'],
  ];
  function header(current) {
    const nav = TABS.map(([href, , label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    const cta = `<a class="cta" href="join.html"${current === 'join.html' ? ' aria-current="page"' : ''}>${S.status === 'recruiting' ? S.cohort + ' 신청' : '참여 안내'}</a>`;
    const q = reviewQueue().length;
    document.getElementById('top').innerHTML = `<div class="wrap">
      <a class="brand" href="index.html"><span class="logo" aria-hidden="true">G</span><b>${esc(S.name)}</b><span class="sub">${esc(S.subtitle)}</span></a>
      <nav class="nav" aria-label="주 메뉴">${nav}${cta}</nav></div>`;
    const tabbar = document.createElement('nav');
    tabbar.className = 'tabbar'; tabbar.setAttribute('aria-label', '아래 탭');
    tabbar.innerHTML = TABS.map(([href, icon, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}><span aria-hidden="true">${icon}</span>${label}${href === 'review.html' && q ? `<i class="badge">${q}</i>` : ''}</a>`).join('');
    document.body.appendChild(tabbar);
    document.getElementById('foot').innerHTML = `<div class="wrap">
      <p>${esc(S.name)}는 Google과 관계없는 교사들의 독립 스터디입니다. 인증 시험 형식·비용·절차는 바뀔 수 있으니 응시 전에 꼭 공식 페이지에서 확인하세요. 실제 시험 문항은 다루지 않습니다.</p>
      <p>학습 기록은 이 브라우저에만 저장되고 운영자에게 전송되지 않습니다. <a href="my.html">내 기록·백업</a> · <a href="start.html">시작 준비</a> · 문의 <a href="mailto:${esc(S.email)}">${esc(S.email)}</a> · <a href="${esc(S.threadsUrl)}" rel="noopener" target="_blank">스레드</a></p></div>`;
  }

  window.GTL = { S, C, STAGES, DOMAINS, DAY, esc, rich, kstToday, daysBetween, addDays, fmt, fmtShort, cohortNow, missionDate, nextMeeting, recruitState, openLabel,
    store, isDone, isPracticed, quizDone, weakness, progress, qKey, domainOf, questions, stats, reviewQueue, weakSkills, nextMission, header };
})();
