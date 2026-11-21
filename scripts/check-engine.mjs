#!/usr/bin/env node
// 현공 택반 계산이 정해 둔 운·경계·자오 좌향과 맞는지 확인한다. 브라우저 없음.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const engine = require(join(root, 'src/xuankong-engine.js'));

assert.equal(engine.periodForYear(1864), 1);
assert.deepEqual(engine.periodRange(1864), [1864, 1883]);
assert.equal(engine.periodForYear(1884), 2);
assert.equal(engine.periodForYear(2024), 9);
assert.equal(engine.periodForYear(2026), 9);
assert.equal(engine.periodForYear(2043), 9);
assert.deepEqual(engine.periodRange(2026), [2024, 2043]);
assert.equal(engine.periodForYear(2044), 1);
assert.deepEqual(engine.periodRange(2044), [2044, 2063]);

const flown = engine.fly(9, true);
assert.equal(new Set(flown).size, 9);
assert.deepEqual([...flown].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9]);

const chart = engine.buildChart({ year: 2026, facingDegrees: 0, school: 'shen' });
assert.equal(chart.valid, true);
assert.equal(chart.official, true);
assert.equal(chart.period, 9);
assert.equal(chart.facing, '子');
assert.equal(chart.sitting, '午');
assert.equal(chart.facingPalace, 'N');
assert.equal(chart.sittingPalace, 'S');
assert.equal(chart.mode, 'lower');
assert.deepEqual(chart.mountainChart, [3, 8, 1, 2, 4, 6, 7, 9, 5]);
assert.deepEqual(chart.facingChart, [6, 1, 8, 7, 5, 3, 2, 9, 4]);

const boundary = engine.buildChart({ year: 2026, facingDegrees: 7.5 });
assert.equal(boundary.valid, false);
assert.equal(boundary.status, 'mountain_boundary');
assert.equal(boundary.official, false);

assert.throws(() => engine.periodForYear('운'), error => error instanceof Error);
console.log('현공 계산 대조 통과: 9운 구간, 자오 하괘, 산계 경계.');
