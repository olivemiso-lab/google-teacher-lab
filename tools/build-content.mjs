// 원본 자료(tools/source)를 사이트가 읽는 data/content.js 하나로 묶는다.
// 실행: node tools/build-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const src = (f) => JSON.parse(readFileSync(new URL('./source/' + f, import.meta.url), 'utf8'));
const release = src('release.json');
const answers = Object.fromEntries(src('answers.json').missions.map((m) => [m.id, m]));
const trainer = src('trainer.json');
const live = src('live-2026-10-09.json');
const solo = src('solo.json'); // 혼자 연습할 때의 대안 안내

const TRACK = { level1: 'l1', level2: 'l2' };
const seen = new Set();

const missions = release.missions
  .slice()
  .sort((a, b) => a.track.localeCompare(b.track) || a.week - b.week || a.day - b.day || a.sort_order - b.sort_order)
  .map((m) => {
    const id = `${TRACK[m.track]}-${m.week}-${m.day}`;
    if (seen.has(id)) throw new Error('같은 주·요일 미션이 둘 있음: ' + id);
    seen.add(id);
    const a = answers[m.id] || {};
    const q = m.question_text
      ? { text: m.question_text, options: m.question_options, answer: a.correct_answer, explanation: a.explanation || '' }
      : null;
    if (q && (typeof q.answer !== 'number' || !q.options?.[q.answer])) throw new Error('정답 확인 필요: ' + id);
    return {
      id, track: m.track, week: m.week, day: m.day, type: m.mission_type,
      title: m.title, story: m.story, tools: m.tool_tags, minutes: m.estimated_minutes,
      account: m.account_requirement,
      basic: m.basic_steps, done: m.completion_conditions, advanced: m.advanced_steps || [],
      classroom: m.classroom_use, privacy: m.privacy_warning || '', solo: solo[m.id] || '',
      source: m.official_source_url ? { title: m.official_source_title, url: m.official_source_url } : null,
      checked: m.verification_date, quiz: q,
    };
  });

const weeks = Object.fromEntries(release.seasons.map((s) => [s.track, s.week_titles]));
const content = { builtFrom: '2026-10-09', weeks, missions, trainer, guides: live.guides, news: live.news };

writeFileSync(
  new URL('../data/content.js', import.meta.url),
  '// 자동 생성 파일: tools/build-content.mjs 로 다시 만드세요.\nwindow.CONTENT = ' + JSON.stringify(content) + ';\n',
);
console.log(`미션 ${missions.length}개 (Level 1 ${missions.filter((m) => m.track === 'level1').length}, Level 2 ${missions.filter((m) => m.track === 'level2').length}), 가이드 ${live.guides.length}, 소식 ${live.news.length}`);
