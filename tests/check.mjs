// 자료와 날짜 계산을 확인한다. 실행: node tests/check.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {}, document: undefined, localStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(ctx);
for (const f of ['js/config.js', 'data/content.js', 'js/common.js']) vm.runInContext(readFileSync(new URL('../' + f, import.meta.url), 'utf8'), ctx);
const { S, C, cohortNow, kstToday, missionDate, fmt, addDays } = ctx.window.GTL;

let fail = 0;
const ok = (cond, msg) => { if (!cond) { fail++; console.log('✗ ' + msg); } else console.log('✓ ' + msg); };

// 자료
ok(C.missions.length === 60, '미션 60개');
for (const t of ['level1', 'level2']) for (let w = 1; w <= 6; w++) {
  const days = C.missions.filter((m) => m.track === t && m.week === w).map((m) => m.day).join('');
  if (days !== '12345') ok(false, `${t} ${w}주차 요일 빠짐: ${days}`);
}
ok(C.missions.every((m) => !m.quiz || m.quiz.options[m.quiz.answer]), '1분 체크 정답이 모두 보기 안에 있음');
ok(C.missions.every((m) => !m.source || /^https:\/\//.test(m.source.url)), '공식 자료 링크는 모두 https');
ok(C.trainer.length === 8, 'Trainer 로드맵 8단계');
ok(C.guides.map((g) => g.slug).join() === 'level1,level2,trainer,gemini', '인증 가이드 4종');

// 한국 날짜: UTC 14:59는 같은 날, 15:00은 다음 날
ok(kstToday(new Date('2026-11-08T14:59:00Z')) === '2026-11-08', 'KST 자정 직전');
ok(kstToday(new Date('2026-11-08T15:00:00Z')) === '2026-11-09', 'KST 자정');

// 기수 달력 (시작일 기준)
ok(cohortNow(addDays(S.start, -1)).phase === 'before', '시작 전날은 시작 전');
ok(new Date(S.start + 'T00:00:00Z').getUTCDay() === 1, '설정의 시작일이 월요일');
const d0 = cohortNow(S.start);
ok(d0.week === 1 && d0.dow === 1, '시작일 = 1주차 월요일');
const sat = cohortNow(addDays(S.start, 5));
ok(sat.week === 1 && sat.dow === 6, '시작 5일 뒤 = 1주차 토요일');
ok(cohortNow(addDays(S.start, 7)).week === 2, '시작 7일 뒤 = 2주차');
ok(cohortNow(addDays(S.start, 42)).levelDone === true, '6주 뒤 Level 끝');
ok(missionDate(C.missions.find((m) => m.id === 'l1-1-5')) === addDays(S.start, 4), '1주차 금요일 미션 = 시작 4일 뒤');
ok(fmt('2026-11-09') === '11월 9일 (월)', '날짜 표기');

console.log(fail ? `\n${fail}개 실패` : '\n모두 통과');
process.exit(fail ? 1 : 0);
