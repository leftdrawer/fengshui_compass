#!/usr/bin/env node
// 개발 보조 스크립트 (배포 산출물 아님).
// compass-app.js 의 els 바인딩 id 집합을 추출하여
// compass.html / compass-mobile.html 양쪽이 그 id 를 모두 제공하는지 대조한다.
// 누락이 하나라도 있으면 비정상 종료코드(1)와 목록을 출력한다.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appSrc = readFileSync(join(root, 'src', 'compass-app.js'), 'utf8');

// els=Object.fromEntries([ ... ].map(id=>[id,document.getElementById(id)]))
const elsMatch = appSrc.match(/const els=Object\.fromEntries\(\[([^\]]*)\]\.map\(id=>\[id,document\.getElementById\(id\)\]\)\)/);
if (!elsMatch) {
  console.error('els 바인딩 배열을 compass-app.js 에서 찾지 못했습니다.');
  process.exit(2);
}
const ids = Array.from(elsMatch[1].matchAll(/'([^']+)'/g)).map(m => m[1]);

// goalDirections 처럼 개별 getElementById 로 바인딩되는 id 도 포함.
const extraIds = Array.from(
  appSrc.matchAll(/els\.[A-Za-z0-9_]+\s*=\s*document\.getElementById\('([^']+)'\)/g)
).map(m => m[1]);

const required = Array.from(new Set([...ids, ...extraIds]));

const htmlFiles = ['compass.html', 'compass-mobile.html'];
let totalMissing = 0;

for (const file of htmlFiles) {
  const html = readFileSync(join(root, file), 'utf8');
  const present = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g)).map(m => m[1]));
  const missing = required.filter(id => !present.has(id));
  if (missing.length) {
    totalMissing += missing.length;
    console.error(`[${file}] 누락 id ${missing.length}개: ${missing.join(', ')}`);
  } else {
    console.log(`[${file}] OK — 필요한 ${required.length}개 id 모두 존재`);
  }
}

if (totalMissing > 0) {
  console.error(`대조 실패: 총 누락 ${totalMissing}건`);
  process.exit(1);
}
console.log(`대조 통과: 필요한 id ${required.length}개가 두 HTML 모두에 존재 (누락 0).`);
