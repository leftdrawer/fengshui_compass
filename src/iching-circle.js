/*
 * 주역의 원(iching-circle.pages.dev) 자료를 나침반에 붙이는 계산.
 * DOM은 다루지 않는다. 텍스트는 data/*.json 그대로 쓰고, 여기에는 배열 규칙만 있다.
 *
 * 콘텐츠 버전: data/content-manifest.json 의 2026.11.07-draft.1
 * 64괘는 모두 review.status = "draft". 8괘 JSON에는 review 필드가 없다.
 * 사이트 설명대로 자료 전체가 검토 전 초안이다.
 *
 * 좌향 → 64괘 쌓기. 이 값만 바꾸면 상괘/하괘가 바뀐다.
 *   'facing-upper'  향(向) = 상괘, 좌(坐) = 하괘   ← 기본
 *   'sitting-upper' 좌(坐) = 상괘, 향(向) = 하괘
 *
 * 기본을 facing-upper 로 둔 이유:
 * 주역에서 하괘는 안·가까운 곳, 상괘는 바깥·먼 곳으로 읽는다.
 * 집의 좌(坐)는 집이 기대 앉은 뒤쪽이고, 향(向)은 집이 열어 바라보는 앞쪽이다.
 * 그래서 좌를 하괘, 향을 상괘로 둔다.
 * 현공비성 배반과는 별도의 보조 해석이다. 주역의 원에는 좌향으로 괘를 만드는 규칙이 없다.
 * 좌와 향은 항상 180° 반대 궁이므로, 이 규칙은 후천팔괘의 맞짝 8괘만 나온다.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.IChingCircle = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const HOUSE_HEXAGRAM_STACK = 'facing-upper';
  const CONTENT_VERSION = '2026.11.07-draft.1';
  const SOURCE_NAME = '주역의 원';
  const SOURCE_URL = 'https://iching-circle.pages.dev/';
  const DAILY_METHOD = 'uniform-crypto-v1';
  const DATA_VERSION = '130';

  // 나침반 궁 키 → 후천 괘 한자. xuankong-engine PALACE_DEFINITIONS.name 과 같아야 한다.
  const PALACE_TRIGRAM_HANJA = Object.freeze({
    N: '坎', NE: '艮', E: '震', SE: '巽', S: '離', SW: '坤', W: '兌', NW: '乾'
  });

  // 후천 원판을 남에서 시계 방향. 주역의 원 wheel.json innerRing 과 같다.
  const PALACE_RING_ORDER = Object.freeze(['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE']);

  const STACK_MODES = Object.freeze({
    'facing-upper': Object.freeze({ upper: 'facing', lower: 'sitting', label: '향(向) 상괘 · 좌(坐) 하괘' }),
    'sitting-upper': Object.freeze({ upper: 'sitting', lower: 'facing', label: '좌(坐) 상괘 · 향(向) 하괘' })
  });

  const memoryDaily = new Map();

  function stackSpec(mode) {
    const spec = STACK_MODES[mode || HOUSE_HEXAGRAM_STACK];
    if (!spec) throw new Error('HOUSE_HEXAGRAM_STACK 는 facing-upper 또는 sitting-upper 만 쓸 수 있습니다');
    return spec;
  }

  function seoulDateKey(now) {
    const date = now instanceof Date ? now : new Date(now || Date.now());
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const pick = type => parts.find(part => part.type === type).value;
    return `${pick('year')}-${pick('month')}-${pick('day')}`;
  }

  function defaultRandomUint32() {
    const cryptoObj = globalThis.crypto;
    if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
      const error = new Error('crypto.getRandomValues 를 쓸 수 없습니다');
      error.code = 'NO_CRYPTO';
      throw error;
    }
    const buffer = new Uint32Array(1);
    cryptoObj.getRandomValues(buffer);
    return buffer[0];
  }

  // 주역의 원 K(n): limit = floor(2^32 / n) * n, limit 이상이면 버리고 최대 64번.
  // 64번을 넘기면 치우친 나머지를 쓰지 않고 실패로 둔다. 저장하지 않으면 다음에 다시 뽑는다.
  function uniformIndex(n, randomUint32, maxAttempts) {
    if (!Number.isInteger(n) || n < 1 || n > 0x100000000) throw new Error('균등 추첨 범위가 잘못되었습니다');
    const draw = randomUint32 || defaultRandomUint32;
    const attempts = maxAttempts == null ? 64 : maxAttempts;
    const limit = Math.floor(0x100000000 / n) * n;
    for (let i = 0; i < attempts; i += 1) {
      const value = draw() >>> 0;
      if (value < limit) return value % n;
    }
    const error = new Error('uniform-crypto-v1 거절 샘플링이 한도를 넘었습니다');
    error.code = 'REJECTION_EXHAUSTED';
    throw error;
  }

  function browserStore() {
    return {
      get(key) { try { return localStorage.getItem(key); } catch { return null; } },
      set(key, value) { try { localStorage.setItem(key, value); } catch { /* 저장 불가면 이번 실행만 유지 */ } }
    };
  }

  function readUnit(raw, unit) {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const value = parsed && parsed.value;
      const max = unit === 'hexagram' ? 64 : 383;
      const min = unit === 'hexagram' ? 1 : 0;
      if (parsed.unit !== unit || parsed.method !== DAILY_METHOD) return null;
      if (!Number.isInteger(value) || value < min || value > max) return null;
      return value;
    } catch {
      return null;
    }
  }

  function writeUnit(store, key, unit, value) {
    store.set(key, JSON.stringify({ value, unit, method: DAILY_METHOD }));
  }

  // 오늘의 뽑기. 날짜는 Asia/Seoul 의 YYYY-MM-DD 이고 시드가 아니다.
  // hexagram 은 1–64 (K(64)+1), lineIndex 는 0–383 (K(384)). 단위마다 따로 저장한다.
  function ensureDaily(options) {
    const opts = options || {};
    const date = opts.date || seoulDateKey(opts.now || new Date());
    const store = opts.store || browserStore();
    const memory = opts.memory || (opts.store ? null : memoryDaily);
    if (memory && memory.has(date)) return memory.get(date);
    const hexKey = `iching-circle-daily|${date}|hexagram`;
    const lineKey = `iching-circle-daily|${date}|line`;
    let hexagram = readUnit(store.get(hexKey), 'hexagram');
    let lineIndex = readUnit(store.get(lineKey), 'line');
    const random = opts.randomUint32 || defaultRandomUint32;
    if (hexagram == null) hexagram = uniformIndex(64, random) + 1;
    if (lineIndex == null) lineIndex = uniformIndex(384, random);
    writeUnit(store, hexKey, 'hexagram', hexagram);
    writeUnit(store, lineKey, 'line', lineIndex);
    const record = Object.freeze({ date, hexagram, lineIndex, method: DAILY_METHOD });
    if (memory) memory.set(date, record);
    return record;
  }

  function lineLocation(index384) {
    if (!Number.isInteger(index384) || index384 < 0 || index384 > 383) throw new Error('효 번호는 0–383 입니다');
    return Object.freeze({
      index384,
      hexagram: Math.floor(index384 / 6) + 1,
      position: index384 % 6 + 1
    });
  }

  // 64괘 고리에서 나침반 각도가 가리키는 칸.
  // 1번 괘는 판의 0°(자, 북)에 있고 시계 방향으로 5.625°씩. 전통 복희 원도가 아니다.
  // 선천(복희·소옹) 64괘 원도 순서는 넣지 않았다.
  // 주역의 원 추출 README(2026-11-10)는 사이트에 그 순서가 없고
  // "복희·소옹 원도와 다른 배열"이라는 안내만 있다고 적는다.
  // data/wheel.json 의 outerRing 도 문왕괘서 1–64 를 12시부터 시계 방향으로 둔다.
  function ringIndexAt(degrees) {
    const step = 360 / 64;
    const turn = ((Number(degrees) % 360) + 360) % 360;
    return Math.floor((turn + step / 2) / step) % 64;
  }

  function indexCorpus(trigrams, hexagrams) {
    if (!Array.isArray(trigrams) || trigrams.length !== 8) throw new Error('8괘 자료가 없습니다');
    if (!Array.isArray(hexagrams) || hexagrams.length !== 64) throw new Error('64괘 자료가 없습니다');
    const trigramById = new Map(trigrams.map(item => [item.id, item]));
    const trigramByHanja = new Map(trigrams.map(item => [item.hanja, item]));
    const trigramByPalace = {};
    Object.entries(PALACE_TRIGRAM_HANJA).forEach(([palace, hanja]) => {
      const trigram = trigramByHanja.get(hanja);
      if (!trigram) throw new Error(`후천 괘가 없습니다: ${hanja}`);
      trigramByPalace[palace] = trigram;
    });
    const byNumber = new Map();
    const byTrigrams = new Map();
    hexagrams.forEach(item => {
      if (byNumber.has(item.number)) throw new Error(`괘 번호가 겹칩니다: ${item.number}`);
      byNumber.set(item.number, item);
      const key = `${item.upper}|${item.lower}`;
      if (byTrigrams.has(key)) throw new Error(`상하괘가 겹칩니다: ${key}`);
      byTrigrams.set(key, item);
    });
    const kingWen = [];
    for (let number = 1; number <= 64; number += 1) {
      const item = byNumber.get(number);
      if (!item) throw new Error(`문왕괘서 ${number}번이 없습니다`);
      kingWen.push(item);
    }
    return Object.freeze({
      trigrams, hexagrams, trigramById, trigramByHanja, trigramByPalace, byNumber, byTrigrams, kingWen
    });
  }

  function houseHexagram(corpus, input) {
    const source = input || {};
    const mode = source.stack || HOUSE_HEXAGRAM_STACK;
    const spec = stackSpec(mode);
    const sitting = corpus.trigramByPalace[source.sittingPalace] || null;
    const facing = corpus.trigramByPalace[source.facingPalace] || null;
    if (!sitting || !facing) {
      return { ok: false, reason: 'no-trigram', stack: mode, spec, sitting, facing };
    }
    const upper = spec.upper === 'sitting' ? sitting : facing;
    const lower = spec.lower === 'sitting' ? sitting : facing;
    const hexagram = corpus.byTrigrams.get(`${upper.id}|${lower.id}`) || null;
    if (!hexagram) {
      return { ok: false, reason: 'no-hexagram', stack: mode, spec, sitting, facing, upper, lower };
    }
    return { ok: true, stack: mode, spec, sitting, facing, upper, lower, hexagram };
  }

  function fetchJson(url) {
    return fetch(url).then(response => {
      if (!response.ok) throw new Error(`자료를 불러오지 못했습니다: ${url}`);
      return response.json();
    });
  }

  function loadCorpus(baseUrl) {
    const root = baseUrl || './data/';
    return Promise.all([
      fetchJson(`${root}trigrams.json?v=${DATA_VERSION}`),
      fetchJson(`${root}hexagrams.json?v=${DATA_VERSION}`)
    ]).then(([trigrams, hexagrams]) => indexCorpus(trigrams, hexagrams));
  }

  return Object.freeze({
    HOUSE_HEXAGRAM_STACK, CONTENT_VERSION, SOURCE_NAME, SOURCE_URL, DAILY_METHOD, DATA_VERSION,
    PALACE_TRIGRAM_HANJA, PALACE_RING_ORDER, STACK_MODES,
    stackSpec, seoulDateKey, uniformIndex, ensureDaily, lineLocation, ringIndexAt,
    indexCorpus, houseHexagram, loadCorpus
  });
});
