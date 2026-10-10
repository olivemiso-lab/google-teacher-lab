// 원본 자료(tools/source)를 사이트가 읽는 data/content.js 하나로 묶는다.
// 실행: node tools/build-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const src = (f) => JSON.parse(readFileSync(new URL('./source/' + f, import.meta.url), 'utf8'));
const trainer = src('trainer.json');
const live = src('live-2026-10-09.json');
const guideFix = src('guides-2026-10-10.json'); // 공식 FAQ로 다시 확인한 시험 형식
const videos = src('videos.json');              // 미션 id → 영상 링크 (운영자가 채움)

// 미션 v2 (2026-10-10): 시험처럼 상황 + 지시사항 + 판단 문제 3개
const missions = ['l1a', 'l1b', 'l2a', 'l2b'].flatMap((f) => src(`missions/${f}.json`));

const fail = (id, msg) => { throw new Error(`${id}: ${msg}`); };
const seen = new Set();
for (const m of missions) {
  if (!/^l[12]-[1-6]-[1-5]$/.test(m.id)) fail(m.id, 'id 형식');
  if (seen.has(m.id)) fail(m.id, '중복'); seen.add(m.id);
  if (m.track !== (m.id[1] === '1' ? 'level1' : 'level2')) fail(m.id, 'track');
  if (`${m.track === 'level1' ? 'l1' : 'l2'}-${m.week}-${m.day}` !== m.id) fail(m.id, '주차·요일');
  const want = m.day < 5 ? 'daily' : m.week === 6 ? 'mock' : 'friday';
  if (m.type !== want) fail(m.id, `type은 ${want}`);
  for (const k of ['title', 'scenario']) if (!m[k]) fail(m.id, k);
  if (!Array.isArray(m.steps) || m.steps.length < 3) fail(m.id, '지시사항 3개 이상');
  if (!Array.isArray(m.check) || !m.check.length) fail(m.id, '점검');
  if (!Array.isArray(m.tools) || !m.tools.length) fail(m.id, 'tools');
  if (!Array.isArray(m.objectives) || !m.objectives.length) fail(m.id, 'objectives');
  if (!(m.minutes > 0)) fail(m.id, 'minutes');
  if (m.source && !/^https:\/\//.test(m.source.url)) fail(m.id, 'source url');
  if (!Array.isArray(m.quiz) || m.quiz.length !== 3) fail(m.id, '판단 문제 3개');
  m.quiz.forEach((q, i) => {
    if (!q.q || !q.why || q.options?.length !== 4 || !Number.isInteger(q.answer) || !q.options[q.answer]) fail(m.id, `문제 ${i + 1}`);
  });
  if (m.material && (!['text', 'table'].includes(m.material.kind) || !m.material.title || !m.material.body)) fail(m.id, 'material 형식');
  if (m.material?.kind === 'table') {
    const cols = m.material.body.trim().split('\n').map((r) => r.split('\t').length);
    if (cols.some((c) => c !== cols[0])) fail(m.id, 'material 표의 칸 수가 줄마다 달라요');
  }
  m.tip = m.tip || ''; m.limit = m.limit || ''; m.source = m.source || null;
}
missions.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));

const weeks = {
  level1: ['Drive와 Docs 공유·권한', 'Classroom 과제와 피드백', 'Gmail·Chat·Meet로 소통', 'Calendar와 Sites', 'Slides와 Forms', 'Sheets·접근성·실습 모의 연습'],
  level2: ['Docs 심화', 'Forms 심화', 'Slides로 참여하는 수업', 'Classroom 심화 1', 'Classroom 심화 2와 Calendar', 'Sheets·Sites·Gmail·Meet·실습 모의 연습'],
};
const guides = live.guides.map((g) => Object.assign({}, g, guideFix[g.slug] || {}));
const content = { builtFrom: '2026-10-10', weeks, missions, trainer, guides, news: live.news, videos };

writeFileSync(
  new URL('../data/content.js', import.meta.url),
  '// 자동 생성 파일: tools/build-content.mjs 로 다시 만드세요.\nwindow.CONTENT = ' + JSON.stringify(content) + ';\n',
);
const n = (t) => missions.filter((m) => m.track === t).length;
console.log(`미션 ${missions.length}개 (Level 1 ${n('level1')}, Level 2 ${n('level2')}), 판단 문제 ${missions.length * 3}개, 가이드 ${guides.length}, 소식 ${live.news.length}`);
