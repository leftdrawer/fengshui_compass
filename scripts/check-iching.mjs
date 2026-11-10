#!/usr/bin/env node
// 주역 고리·오늘의 괘·좌향 괘 계산이 자료와 맞는지 확인한다. 브라우저 없음.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iching = require(join(root, 'src/iching-circle.js'));
const engine = require(join(root, 'src/xuankong-engine.js'));
const read = name => JSON.parse(readFileSync(join(root, 'data', name), 'utf8'));

const trigrams = read('trigrams.json');
const hexagrams = read('hexagrams.json');
const lines = read('lines.json');
const wheel = read('wheel.json');
const manifest = read('content-manifest.json');
const corpus = iching.indexCorpus(trigrams, hexagrams);

assert.equal(iching.CONTENT_VERSION, manifest.contentVersion);
assert.equal(iching.HOUSE_HEXAGRAM_STACK, 'facing-upper');
assert.deepEqual(wheel.outerRing_numbers, corpus.kingWen.map(item => item.number));
assert.deepEqual(wheel.innerRing_laterHeaven_clockwiseFromTop_southUp, ['ri', 'gon', 'tae', 'geon', 'gam', 'gan', 'jin', 'son']);

Object.entries(iching.PALACE_TRIGRAM_HANJA).forEach(([palace, hanja]) => {
  assert.equal(engine.PALACE_DEFINITIONS[palace].name, hanja);
  assert.equal(corpus.trigramByPalace[palace].hanja, hanja);
});

assert.equal(corpus.byTrigrams.size, 64);
hexagrams.forEach(item => {
  assert.equal(item.review.status, 'draft');
  assert.equal(item.binary_bottomToTop.length, 6);
  assert.equal(item.lines.length, 6);
  item.lines.forEach((line, index) => assert.equal(line.position, index + 1));
});

assert.equal(lines.length, 384);
lines.forEach(row => {
  const hexagram = corpus.byNumber.get(row.hexagram);
  const line = hexagram.lines[row.position - 1];
  assert.equal(row.index384, (row.hexagram - 1) * 6 + (row.position - 1));
  assert.equal(line.original, row.original);
  assert.equal(line.reading, row.reading);
  assert.equal(line.translation, row.translation);
  assert.equal(line.explanation, row.explanation);
  const located = iching.lineLocation(row.index384);
  assert.equal(located.hexagram, row.hexagram);
  assert.equal(located.position, row.position);
});

const facingSouth = iching.houseHexagram(corpus, { sittingPalace: 'N', facingPalace: 'S' });
assert.equal(facingSouth.ok, true);
assert.equal(facingSouth.upper.id, 'ri');
assert.equal(facingSouth.lower.id, 'gam');
assert.equal(facingSouth.hexagram.number, 64);

const facingNorth = iching.houseHexagram(corpus, { sittingPalace: 'S', facingPalace: 'N' });
assert.equal(facingNorth.hexagram.number, 63);

const swapped = iching.houseHexagram(corpus, { sittingPalace: 'N', facingPalace: 'S', stack: 'sitting-upper' });
assert.equal(swapped.hexagram.number, 63);
assert.equal(iching.houseHexagram(corpus, { sittingPalace: 'C', facingPalace: 'N' }).ok, false);

const opposite = { N: 'S', S: 'N', E: 'W', W: 'E', NE: 'SW', SW: 'NE', SE: 'NW', NW: 'SE' };
const seen = new Set();
for (let degrees = 0; degrees < 360; degrees += 15) {
  const chart = engine.buildChart({ year: 2026, facingDegrees: degrees, school: 'shen' });
  assert.equal(chart.valid, true);
  assert.equal(chart.sittingPalace, opposite[chart.facingPalace]);
  const house = iching.houseHexagram(corpus, { sittingPalace: chart.sittingPalace, facingPalace: chart.facingPalace });
  assert.equal(house.ok, true);
  seen.add(house.hexagram.number);
}
assert.equal(seen.size, 8);
const pairs = [...seen].sort((a, b) => a - b).map(number => {
  const item = corpus.byNumber.get(number);
  return `${number} ${item.fullNameKo}`;
});
console.log('맞짝 8괘:', pairs.join(', '));

assert.equal(iching.ringIndexAt(0), 0);
assert.equal(iching.ringIndexAt(2.8), 0);
assert.equal(iching.ringIndexAt(2.8125), 1);
assert.equal(iching.ringIndexAt(5.625), 1);
assert.equal(iching.ringIndexAt(359), 0);
assert.equal(iching.ringIndexAt(357.1), 63);

const xiantian = iching.xiantianSlots(hexagrams);
assert.equal(xiantian[0].hexagram.nameHanja, '乾');
assert.equal(xiantian[31].hexagram.nameHanja, '復');
assert.equal(xiantian[32].hexagram.nameHanja, '姤');
assert.equal(xiantian[63].hexagram.nameHanja, '坤');
assert.equal(xiantian[0].hexagram.number, 1);
assert.equal(xiantian[63].hexagram.number, 2);
const at = heading => iching.slotAtAngle(heading, xiantian).hexagram.nameHanja;
assert.equal(at(180), '乾');
assert.equal(at(0), '坤');
assert.equal(at(90), '同人');
assert.equal(at(270), '師');
assert.equal(at(177.1875), '乾');
assert.equal(at(182.8125), '姤');
assert.equal(at(2.8125), '復');
function circDist(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}
xiantian.forEach(slot => {
  const opposite = xiantian[63 - slot.rank];
  const distance = circDist(slot.angle, opposite.angle);
  assert.ok(Math.abs(distance - 180) < 1e-6, `${slot.hexagram.nameHanja} opposite ${distance}`);
});
assert.equal(corpus.kingWen[0].number, 1);
assert.equal(corpus.kingWen[63].number, 64);

const limit384 = Math.floor(2 ** 32 / 384) * 384;
assert.notEqual(limit384, 2 ** 32);
assert.equal(Math.floor(2 ** 32 / 64) * 64, 2 ** 32);
let draws = 0;
const scripted = [limit384, limit384 + 10, 1000];
assert.equal(iching.uniformIndex(384, () => scripted[draws++], 64), 1000 % 384);
assert.equal(draws, 3);
assert.throws(() => iching.uniformIndex(384, () => limit384, 4), error => error.code === 'REJECTION_EXHAUSTED');

assert.equal(iching.seoulDateKey(new Date('2026-11-09T14:59:00Z')), '2026-11-09');
assert.equal(iching.seoulDateKey(new Date('2026-11-09T15:00:00Z')), '2026-11-10');

const memory = new Map();
const saved = new Map();
const store = { get: key => saved.get(key) ?? null, set: (key, value) => saved.set(key, value) };
let randomCalls = 0;
const sequence = [7, 100];
const first = iching.ensureDaily({
  date: '2026-11-10',
  store,
  memory,
  randomUint32: () => sequence[randomCalls++]
});
assert.equal(first.hexagram, 8);
assert.equal(first.lineIndex, 100);
assert.equal(first.method, 'uniform-crypto-v1');
const second = iching.ensureDaily({
  date: '2026-11-10',
  store,
  memory: new Map(),
  randomUint32: () => { throw new Error('다시 뽑으면 안 됩니다'); }
});
assert.deepEqual(second, first);
assert.equal(JSON.parse(saved.get('iching-circle-daily|2026-11-10|hexagram')).unit, 'hexagram');
assert.equal(JSON.parse(saved.get('iching-circle-daily|2026-11-10|line')).unit, 'line');

assert.equal(engine.SCHOOL.SHEN, 'shen');
console.log(`주역 자료 대조 통과: 64괘 ${seen.size}맞짝, 384효, 서울 날짜, 균등 추첨.`);
