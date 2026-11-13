// 사이트를 고친 뒤 올리기 전에 실행: node tools/bump-version.mjs "바뀐 내용 한 줄"
// 1) version.json과 js/config.js의 버전을 새로 정하고
// 2) 모든 페이지의 css·js 주소 뒤에 ?v=버전을 붙여, 방문자 브라우저가 예전 파일을 쓰지 않게 한다.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const note = process.argv.slice(2).join(' ').trim() || '사이트 내용이 새로 바뀌었습니다.';
const kst = new Date(Date.now() + 9 * 3600e3).toISOString();
const v = kst.slice(0, 16).replace(/[-:T]/g, '').replace(/^(\d{8})/, '$1-'); // 예: 20261114-2130

writeFileSync(join(root, 'version.json'), JSON.stringify({ v, note }, null, 2) + '\n');

const cfgPath = join(root, 'js', 'config.js');
const cfg = readFileSync(cfgPath, 'utf8');
if (!/  version: '[^']*',/.test(cfg)) throw new Error('config.js에 version 줄이 없습니다');
const safe = note.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
writeFileSync(cfgPath, cfg.replace(/  version: '[^']*',/, `  version: '${v}',`).replace(/  updateNote: '(?:[^'\\]|\\.)*',/, `  updateNote: '${safe}',`));

for (const f of readdirSync(root).filter((n) => n.endsWith('.html'))) {
  const p = join(root, f);
  const s = readFileSync(p, 'utf8')
    .replace(/(href="css\/[^"?]+\.css)(\?v=[^"]*)?"/g, `$1?v=${v}"`)
    .replace(/(src="(?:js|data)\/[^"?]+\.js)(\?v=[^"]*)?"/g, `$1?v=${v}"`);
  writeFileSync(p, s);
}
console.log('새 버전', v, '·', note);
