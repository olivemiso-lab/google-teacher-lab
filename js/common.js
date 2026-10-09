// 모든 페이지가 같이 쓰는 도구: 머리말·꼬리말, 한국 날짜, 기수 달력, 내 기록(브라우저 저장).
(function () {
  const S = window.SITE;
  const C = window.CONTENT;

  const STAGES = {
    level1: { icon: '🌱', name: 'Level 1', who: 'Google 인증이 아직 없어요' },
    level2: { icon: '🚀', name: 'Level 2', who: 'Level 1이 있어요' },
    trainer: { icon: '🎓', name: 'Trainer', who: 'Level 1·2가 있거나 거의 다 왔어요' },
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

  // 내 기록: 이 브라우저에만 저장된다. 저장소가 막혀 있어도 화면은 그대로 동작한다.
  const KEY = 'gtl.v2'; // v2: 미션 형식이 바뀌어 예전 기록과 섞이지 않게
  let mem = { stage: '', missions: {}, quiz: {}, notes: {} };
  try { const raw = localStorage.getItem(KEY); if (raw) mem = Object.assign(mem, JSON.parse(raw)); } catch (e) { /* 저장 불가 환경 */ }
  const store = {
    get: () => mem,
    save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); return true; } catch (e) { return false; } },
    setStage(s) { mem.stage = STAGES[s] ? s : ''; return store.save(); },
    mission: (id) => mem.missions[id] || {},
    setMission(id, patch) { mem.missions[id] = Object.assign({}, mem.missions[id], patch); return store.save(); },
    answer(id, i) { if (id in mem.quiz) return false; mem.quiz[id] = i; store.save(); return true; },
    setNote(key, text) { if (text) mem.notes[key] = text; else delete mem.notes[key]; return store.save(); },
  };
  const isDone = (id) => !!store.mission(id).basic;
  function progress(track, upToWeek = 99) {
    const list = C.missions.filter((m) => m.track === track && m.week <= upToWeek);
    const done = list.filter((m) => isDone(m.id)).length;
    return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
  }

  function header(current) {
    const items = [
      ['index.html', '함께 준비하기'],
      ['start.html', '시작 준비'],
      ['path.html', '단계별 과정'],
      ['resources.html', '준비 자료'],
    ];
    const nav = items.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    const cta = `<a class="cta" href="join.html"${current === 'join.html' ? ' aria-current="page"' : ''}>${S.status === 'recruiting' ? S.cohort + ' 신청하기' : '참여 안내'}</a>`;
    document.getElementById('top').innerHTML = `<div class="wrap">
      <a class="brand" href="index.html"><b>${esc(S.name)}</b><span>${esc(S.subtitle)}</span></a>
      <nav class="nav" aria-label="주 메뉴">${nav}${cta}</nav></div>`;
    document.getElementById('foot').innerHTML = `<div class="wrap">
      <p>${esc(S.name)}는 Google과 관계없는 교사들의 독립 스터디입니다. 인증 시험 형식·비용·절차는 바뀔 수 있으니 응시 전에 꼭 공식 페이지에서 확인하세요. 실제 시험 문항은 다루지 않습니다.</p>
      <p>진도와 메모는 이 브라우저에만 저장되고 운영자에게 전송되지 않습니다. · 문의 <a href="mailto:${esc(S.email)}">${esc(S.email)}</a> · <a href="${esc(S.threadsUrl)}" rel="noopener" target="_blank">스레드</a></p></div>`;
  }

  window.GTL = { S, C, STAGES, DAY, esc, rich, kstToday, daysBetween, addDays, fmt, fmtShort, cohortNow, missionDate, store, isDone, progress, header };
})();
