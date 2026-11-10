/*
 * 주역의 원 자료 화면.
 * 1. 8궁 카드 — 설괘전과 가족·몸·동물. 오행은 나침반의 기존 값.
 * 2. 좌향 보조 괘 — 현공비성과 별도.
 * 3. 오늘의 괘 — Asia/Seoul 날짜 키, crypto 균등 추첨, localStorage.
 * 4. 64괘 고리 — 문왕괘서 1–64, 나침반 0°부터 시계 방향. 판과 함께 회전.
 *
 * 선천(복희·소옹) 원도 순서는 만들지 않는다.
 * 출처: 주역의 원 추출 README, data/wheel.json outerRing.
 * 사이트는 그 고리를 "앱의 탐색 배열"이라고 하고 전통 원도가 아니라고 밝힌다.
 */
(function (root) {
  'use strict';

  const core = root.IChingCircle;
  if (!core) throw new Error('주역 계산 모듈이 없습니다');

  const ELEMENT_KO = { '水': '수', '木': '목', '火': '화', '土': '토', '金': '금' };
  const RING_KEY = 'iching-circle-ring';
  const RING_LAYOUT_KEY = 'iching-circle-ring-layout';

  let api = null;
  let corpus = null;
  let loadError = '';
  let started = false;
  let latestChart = null;
  let latestSelected = null;
  let pendingPalace = null;
  let ringOn = false;
  let ringBuilt = false;
  let ringLayout = 'kingwen';
  let lastRingKey = '';
  let nodes = {};

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function storeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function storeSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* 설정 저장 실패는 무시 */ }
  }

  function creditHtml(review) {
    const status = review && review.status ? review.status : 'draft';
    const note = review && review.note ? ` ${esc(review.note)}` : '';
    return `<p class="iching-credit"><span class="iching-draft">${esc(status)}</span> <a href="${esc(core.SOURCE_URL)}" target="_blank" rel="noopener noreferrer">${esc(core.SOURCE_NAME)}</a> · 콘텐츠 ${esc(core.CONTENT_VERSION)} · 검토 전 초안.${note} 한국어 독음·번역·풀이는 제작자 초안입니다.</p>`;
  }

  function elementChip(palace) {
    const element = api && api.palaceElement ? api.palaceElement[palace] : '';
    if (!element) return '';
    const ko = ELEMENT_KO[element] || '';
    return `<span class="iching-chip quiet">오행 ${esc(element)}${ko ? ` ${esc(ko)}` : ''} · 나침반</span>`;
  }

  function palaceTitle(palace) {
    const label = api && api.labels ? api.labels[palace] : palace;
    const [hanja, direction] = String(label || '').split('｜');
    return { hanja: hanja || '', direction: direction || palace };
  }

  function trigramFacts(trigram) {
    const rows = [
      ['가족', trigram.family],
      ['몸', trigram.body],
      ['동물', trigram.animal],
      ['성질', trigram.quality],
      ['자연', `${trigram.nature || ''}${trigram.natureHanja ? ` · ${trigram.natureHanja}` : ''}`],
      ['후천 방위', trigram.laterHeavenDirection]
    ];
    return `<ul class="iching-facts">${rows.filter(([, value]) => value).map(([name, value]) => `<li><span>${esc(name)}</span><b>${esc(value)}</b></li>`).join('')}</ul>`;
  }

  function shuoguaHtml(trigram) {
    const lines = Array.isArray(trigram.shuogua) ? trigram.shuogua : [];
    if (!lines.length) return '';
    return `<div class="iching-quote">${lines.map(line => `<p class="iching-original">${esc(line.original)}</p><p>${esc(line.translation)}</p>`).join('')}</div>`;
  }

  function keywordsHtml(keywords) {
    if (!Array.isArray(keywords) || !keywords.length) return '';
    return `<div class="iching-meta">${keywords.map(word => `<span class="iching-chip">${esc(word)}</span>`).join('')}</div>`;
  }

  function textBlock(label, value) {
    if (!value) return '';
    return `<span class="iching-label">${esc(label)}</span><p class="iching-text">${esc(value)}</p>`;
  }

  function judgmentHtml(block, title) {
    if (!block) return '';
    return `<section>${textBlock(`${title} 원문`, block.original)}${textBlock('독음', block.reading)}${textBlock('번역', block.translation)}${block.meaning ? textBlock('풀이', block.meaning) : ''}</section>`;
  }

  function hexagramName(hexagram) {
    return `${hexagram.number} ${esc(hexagram.fullNameKo || hexagram.nameKo)} · ${esc(hexagram.nameKo)}(${esc(hexagram.nameHanja)})`;
  }

  function openButton(number, position, label) {
    const line = position ? ` data-iching-line="${Number(position)}"` : '';
    return `<button type="button" class="iching-button" data-iching-open="${Number(number)}"${line}>${esc(label)}</button>`;
  }

  function buildShell() {
    const layout = document.querySelector('.layout');
    if (layout && !document.getElementById('ichingDaily')) {
      const daily = document.createElement('section');
      daily.className = 'card iching-daily';
      daily.id = 'ichingDaily';
      daily.setAttribute('aria-live', 'polite');
      layout.parentElement.insertBefore(daily, layout);
    }
    const wrap = document.querySelector('.compass-wrap');
    if (wrap && !document.getElementById('ichingRingToggle')) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'ghost iching-ring-toggle';
      toggle.id = 'ichingRingToggle';
      toggle.setAttribute('aria-pressed', 'false');
      toggle.textContent = '64괘 고리 켜기';
      const caption = document.createElement('p');
      caption.className = 'iching-note iching-ring-caption';
      caption.id = 'ichingRingCaption';
      caption.hidden = true;
      const readout = document.createElement('p');
      readout.className = 'iching-ring-readout';
      readout.id = 'ichingRingReadout';
      readout.hidden = true;
      const layouts = document.createElement('div');
      layouts.className = 'iching-ring-layouts';
      layouts.id = 'ichingRingLayouts';
      layouts.hidden = true;
      layouts.setAttribute('role', 'group');
      layouts.setAttribute('aria-label', '64괘 고리 배열');
      layouts.innerHTML = '<button type="button" data-ring-layout="kingwen">문왕괘서</button><button type="button" data-ring-layout="xiantian">선천원도</button>';
      wrap.insertAdjacentElement('afterend', readout);
      wrap.insertAdjacentElement('afterend', caption);
      wrap.insertAdjacentElement('afterend', layouts);
      wrap.insertAdjacentElement('afterend', toggle);
    }
    const chart = document.getElementById('chartStep');
    if (chart && !document.getElementById('ichingHouse')) {
      const house = document.createElement('section');
      house.className = 'iching-house';
      house.id = 'ichingHouse';
      const palaces = document.createElement('section');
      palaces.className = 'iching-palaces';
      palaces.id = 'ichingPalaces';
      chart.append(house, palaces);
    }
    if (!document.getElementById('ichingDetail')) {
      const dialog = document.createElement('dialog');
      dialog.className = 'iching-dialog';
      dialog.id = 'ichingDetail';
      dialog.innerHTML = '<div class="iching-dialog-body" id="ichingDetailBody"></div>';
      document.body.append(dialog);
    }
    nodes = {
      daily: document.getElementById('ichingDaily'),
      house: document.getElementById('ichingHouse'),
      palaces: document.getElementById('ichingPalaces'),
      toggle: document.getElementById('ichingRingToggle'),
      caption: document.getElementById('ichingRingCaption'),
      readout: document.getElementById('ichingRingReadout'),
      layouts: document.getElementById('ichingRingLayouts'),
      dialog: document.getElementById('ichingDetail'),
      detailBody: document.getElementById('ichingDetailBody'),
      dial: document.getElementById('dial'),
      wrap: document.querySelector('.compass-wrap')
    };
  }

  function polar(cx, cy, radius, degrees) {
    const radians = degrees * Math.PI / 180;
    return [cx + radius * Math.sin(radians), cy - radius * Math.cos(radians)];
  }

  function ringLine(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'iching-ring-stroke');
    line.setAttribute('x1', x1.toFixed(2));
    line.setAttribute('y1', y1.toFixed(2));
    line.setAttribute('x2', x2.toFixed(2));
    line.setAttribute('y2', y2.toFixed(2));
    return line;
  }

  function annulusPath(cx, cy, inner, outer) {
    const circle = radius => `M ${(cx - radius).toFixed(2)} ${cy} a ${radius} ${radius} 0 1 0 ${(radius * 2).toFixed(2)} 0 a ${radius} ${radius} 0 1 0 ${(-radius * 2).toFixed(2)} 0`;
    return `${circle(outer)} ${circle(inner)}`;
  }

  function ringSlots() {
    if (!corpus) return [];
    if (ringLayout === 'xiantian') return core.xiantianSlots(corpus.hexagrams);
    return corpus.kingWen.map((hexagram, index) => ({ hexagram, rank: index, angle: index * 5.625 }));
  }

  function ringCaption() {
    if (ringLayout === 'xiantian') {
      return '선천원도. 주희 《주역본의》 복희육십사괘방위. 건과 구가 만나는 선이 남(오, 180°), 곤과 복이 만나는 선이 북(자, 0°). 동쪽은 건에서 복, 서쪽은 구에서 곤. 안쪽 획이 초효입니다. 고리는 24산 안쪽에서 판과 함께 돕니다.';
    }
    return '문왕괘서 1–64. 1번 건을 나침반 0°(자)에 두고 시계 방향으로 한 칸 5.625°. 주역의 원의 탐색 배열이며 복희·소옹 원도가 아닙니다. 안쪽 획이 초효, 바깥 획이 상효입니다. 고리는 24산 안쪽에서 판과 함께 돕니다.';
  }

  function paintLayoutButtons() {
    if (!nodes.layouts) return;
    nodes.layouts.hidden = !ringOn;
    nodes.layouts.querySelectorAll('[data-ring-layout]').forEach(button => {
      const active = button.getAttribute('data-ring-layout') === ringLayout;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  // 고리는 #dial 안에 둔다. 나침반 회전 transform 하나만 타고, 칸마다 JS로 다시 그리지 않는다.
  function buildRing() {
    if (!nodes.dial || !corpus) return;
    if (ringBuilt && nodes.ring && nodes.ring.dataset.layout === ringLayout) return;
    if (nodes.ring) nodes.ring.remove();
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('class', 'iching-ring');
    svg.dataset.layout = ringLayout;
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    const band = document.createElementNS(svgNs, 'path');
    band.setAttribute('class', 'iching-ring-band');
    band.setAttribute('fill-rule', 'evenodd');
    band.setAttribute('d', annulusPath(50, 50, 25.6, 33.2));
    svg.append(band);
    ringSlots().forEach(slot => {
      const degrees = slot.angle;
      const bits = String(slot.hexagram.binary_bottomToTop || '');
      const group = document.createElementNS(svgNs, 'g');
      for (let lineIndex = 0; lineIndex < 6; lineIndex += 1) {
        const radius = 26.2 + lineIndex * (29.4 - 26.2) / 5;
        const yang = bits[lineIndex] !== '0';
        const spans = yang ? [[-1.55, 1.55]] : [[-1.55, -0.42], [0.42, 1.55]];
        spans.forEach(([from, to]) => {
          const a = polar(50, 50, radius, degrees + from);
          const b = polar(50, 50, radius, degrees + to);
          group.append(ringLine(a[0], a[1], b[0], b[1]));
        });
      }
      const point = polar(50, 50, 31.4, degrees);
      const text = document.createElementNS(svgNs, 'text');
      text.setAttribute('class', 'iching-ring-glyph');
      text.setAttribute('x', point[0].toFixed(2));
      text.setAttribute('y', point[1].toFixed(2));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', '2.45');
      text.setAttribute('transform', `rotate(${degrees.toFixed(2)} ${point[0].toFixed(2)} ${point[1].toFixed(2)})`);
      text.textContent = slot.hexagram.nameHanja || '';
      group.append(text);
      svg.append(group);
    });
    nodes.dial.append(svg);
    ringBuilt = true;
    nodes.ring = svg;
    lastRingKey = '';
  }

  function setRingLayout(layout) {
    ringLayout = layout === 'xiantian' ? 'xiantian' : 'kingwen';
    storeSet(RING_LAYOUT_KEY, ringLayout);
    paintLayoutButtons();
    if (nodes.caption) nodes.caption.textContent = ringCaption();
    if (ringOn) {
      buildRing();
      if (api && typeof api.getHeading === 'function') syncHeading(api.getHeading());
    }
  }

  function setRing(on) {
    ringOn = Boolean(on);
    storeSet(RING_KEY, ringOn ? 'on' : 'off');
    if (nodes.wrap) nodes.wrap.classList.toggle('ring-on', ringOn);
    if (nodes.toggle) {
      nodes.toggle.setAttribute('aria-pressed', String(ringOn));
      nodes.toggle.textContent = ringOn ? '64괘 고리 끄기' : '64괘 고리 켜기';
    }
    if (nodes.caption) {
      nodes.caption.hidden = !ringOn;
      nodes.caption.textContent = ringCaption();
    }
    if (nodes.readout) nodes.readout.hidden = !ringOn;
    paintLayoutButtons();
    if (ringOn) {
      buildRing();
      if (api && typeof api.getHeading === 'function') syncHeading(api.getHeading());
    }
  }

  function renderDaily() {
    if (!nodes.daily) return;
    if (loadError) {
      nodes.daily.innerHTML = `<p class="eyebrow">오늘의 괘</p><p class="iching-status">${esc(loadError)}</p>`;
      return;
    }
    if (!corpus) {
      nodes.daily.innerHTML = '<p class="eyebrow">오늘의 괘</p><p class="iching-status">주역 자료를 불러오는 중입니다.</p>';
      return;
    }
    let daily;
    try {
      daily = core.ensureDaily();
    } catch (error) {
      const reason = error && error.code === 'NO_CRYPTO'
        ? '이 브라우저는 crypto.getRandomValues 를 쓸 수 없어 오늘의 괘를 뽑지 않았습니다. 날짜로 대신 뽑지 않습니다.'
        : '오늘의 괘를 뽑지 못했습니다. 다시 열면 아직 저장되지 않은 항목만 뽑습니다.';
      nodes.daily.innerHTML = `<p class="eyebrow">오늘의 괘</p><p class="iching-status">${esc(reason)}</p>${creditHtml(null)}`;
      return;
    }
    const hexagram = corpus.byNumber.get(daily.hexagram);
    const located = core.lineLocation(daily.lineIndex);
    const lineHex = corpus.byNumber.get(located.hexagram);
    const line = lineHex && lineHex.lines ? lineHex.lines[located.position - 1] : null;
    const same = hexagram && lineHex && hexagram.number === lineHex.number;
    nodes.daily.innerHTML = `<div class="iching-kicker"><p class="eyebrow">오늘의 괘</p><span class="iching-draft">${esc(hexagram && hexagram.review ? hexagram.review.status : 'draft')}</span></div>
      <h2>${esc(daily.date)} · 서울 날짜</h2>
      <p class="iching-lead">날짜는 저장 키일 뿐 시드가 아닙니다. 64괘와 384효를 각각 균등하게 뽑아 이 브라우저에 하루 동안 저장합니다. 새로고침해도 바뀌지 않고, 기기마다 다를 수 있습니다.</p>
      <div class="iching-split">
        <article class="iching-panel">
          <h3>오늘의 괘 · 1/64</h3>
          <p class="iching-name">${hexagramName(hexagram)}<small>${esc(hexagram.summary || '')}</small></p>
          ${keywordsHtml(hexagram.keywords)}
          ${judgmentHtml(hexagram.judgment, '괘사')}
          <div class="iching-actions">${openButton(hexagram.number, null, '괘 자세히')}</div>
        </article>
        <article class="iching-panel">
          <h3>오늘의 효 · 0–383</h3>
          <p class="iching-name">${line ? `${esc(line.name)} ${esc(line.nameKo)}` : ''}<small>${hexagramName(lineHex)} · ${esc(String(located.position))}효 · 번호 ${esc(String(daily.lineIndex))}</small></p>
          ${same ? '<p class="iching-note">이 효는 왼쪽 괘에 속합니다. 두 뽑기는 따로 저장됩니다.</p>' : '<p class="iching-note">이 효는 왼쪽 괘와 다른 뽑기입니다. 효가 속한 괘를 따로 보여 줍니다.</p>'}
          ${line ? `${textBlock('원문', line.original)}${textBlock('독음', line.reading)}${textBlock('번역', line.translation)}${textBlock('풀이', line.explanation)}` : ''}
          <div class="iching-actions">${openButton(lineHex.number, located.position, '이 효의 괘 보기')}</div>
        </article>
      </div>
      ${creditHtml(hexagram.review)}`;
  }

  let houseKey = '';
  function renderHouse() {
    if (!nodes.house) return;
    const chartKey = !latestChart || !latestChart.valid ? 'invalid' : `${latestChart.sPalace}|${latestChart.fPalace}|${latestChart.sitting}|${latestChart.facing}`;
    const nextKey = `${corpus ? 'ready' : 'wait'}|${loadError}|${chartKey}`;
    if (nextKey === houseKey) return;
    houseKey = nextKey;
    const spec = core.stackSpec(core.HOUSE_HEXAGRAM_STACK);
    const intro = `<div class="iching-house-head"><div><p class="eyebrow">보조 해석</p><h3>좌향으로 본 집의 괘</h3></div><span class="iching-supplement">현공비성 아님</span></div>
      <p class="iching-note">쌓기: ${esc(spec.label)}. 현공 비성 배반이 아닙니다. 좌와 향은 반대 궁이라 맞짝 8괘 중 하나이고, 같은 궁의 세 산은 같은 괘입니다.</p>`;
    if (!corpus) {
      nodes.house.innerHTML = `${intro}<p class="iching-status">${esc(loadError || '주역 자료를 불러오는 중입니다.')}</p>`;
      return;
    }
    const chart = latestChart;
    if (!chart || !chart.valid) {
      nodes.house.innerHTML = `${intro}<p class="iching-status">각도가 산의 경계에 있어 좌·향 궁을 하나로 정하지 못했습니다. 궁이 정해지면 보조 괘를 표시합니다.</p>${creditHtml(null)}`;
      return;
    }
    const result = core.houseHexagram(corpus, { sittingPalace: chart.sPalace, facingPalace: chart.fPalace });
    if (!result.ok) {
      nodes.house.innerHTML = `${intro}<p class="iching-status">이 좌향에는 팔괘를 겹친 보조 괘가 없습니다.</p>`;
      return;
    }
    const hexagram = result.hexagram;
    const sit = palaceTitle(chart.sPalace);
    const face = palaceTitle(chart.fPalace);
    nodes.house.innerHTML = `${intro}
      <p class="iching-stack">좌 ${esc(sit.direction)} ${esc(result.sitting.ko)}(${esc(result.sitting.hanja)}) ${result.spec.lower === 'sitting' ? '하괘' : '상괘'} · 향 ${esc(face.direction)} ${esc(result.facing.ko)}(${esc(result.facing.hanja)}) ${result.spec.upper === 'facing' ? '상괘' : '하괘'}</p>
      <p class="iching-name">${hexagramName(hexagram)}<small>${esc(chart.sitting || '')}산 ${esc(chart.facing || '')}향</small></p>
      ${keywordsHtml(hexagram.keywords)}
      ${judgmentHtml(hexagram.judgment, '괘사')}
      ${judgmentHtml(hexagram.image, '대상전')}
      ${textBlock('쉬운 풀이', hexagram.explanation)}
      <div class="iching-actions">${openButton(hexagram.number, null, '괘 자세히')}</div>
      ${creditHtml(hexagram.review)}`;
  }

  function renderPalaces() {
    if (!nodes.palaces || !corpus || nodes.palaces.dataset.ready === 'yes') return;
    const cards = core.PALACE_RING_ORDER.map(palace => {
      const trigram = corpus.trigramByPalace[palace];
      const title = palaceTitle(palace);
      const more = [trigram.explanation, trigram.daily, trigram.yinYang].filter(Boolean);
      return `<article class="iching-palace-card" id="ichingPalace-${esc(palace)}" data-palace-trigram="${esc(palace)}">
        <header>
          <h4><button type="button" class="linkish" data-select-palace="${esc(palace)}">${esc(title.direction)} · ${esc(trigram.ko)}(${esc(trigram.hanja)})</button></h4>
          ${elementChip(palace)}
        </header>
        <p class="iching-text">${esc(trigram.summary || '')}</p>
        ${keywordsHtml(trigram.keywords)}
        ${trigramFacts(trigram)}
        <p class="iching-label">설괘전</p>
        ${shuoguaHtml(trigram)}
        <details>
          <summary>풀이 더 보기</summary>
          ${more.map(text => `<p class="iching-text">${esc(text)}</p>`).join('')}
        </details>
      </article>`;
    }).join('');
    const center = api && api.palaceElement ? api.palaceElement.C : '土';
    nodes.palaces.innerHTML = `<div class="iching-house-head"><div><p class="eyebrow">8궁</p><h3>궁마다 붙인 팔괘 풀이</h3></div><span class="iching-draft">draft</span></div>
      <p class="iching-note">각 궁의 후천 괘 풀이입니다. 오행은 주역의 원에 없는 값이라 나침반에 원래 있던 오행을 그대로 둡니다. 8괘 자료에는 개별 review 필드가 없고, 출처 사이트는 콘텐츠 전체를 검토 전 초안으로 둡니다. 남에서 시계 방향입니다.</p>
      <div class="iching-palace-grid">${cards}<p class="iching-center-note">중궁은 후천팔괘에 없습니다. 나침반 오행 ${esc(center)}(${esc(ELEMENT_KO[center] || '')})은 바꾸지 않습니다.</p></div>
      ${creditHtml(null)}`;
    nodes.palaces.dataset.ready = 'yes';
    markPalaces();
  }

  function markPalaces() {
    const chart = latestChart;
    document.querySelectorAll('[data-palace-trigram]').forEach(card => {
      const palace = card.getAttribute('data-palace-trigram');
      card.classList.toggle('is-selected', palace === latestSelected);
      card.classList.toggle('is-facing', Boolean(chart && chart.valid && palace === chart.fPalace));
      card.classList.toggle('is-sitting', Boolean(chart && chart.valid && palace === chart.sPalace));
    });
  }

  function attachPalace(palace) {
    pendingPalace = palace || pendingPalace;
    const host = document.getElementById('dualStarDetail');
    if (!host || !pendingPalace) return;
    let slot = host.querySelector('.iching-attach');
    if (!corpus) {
      if (!slot) {
        slot = document.createElement('section');
        slot.className = 'iching-attach';
        host.prepend(slot);
      }
      slot.innerHTML = `<p class="iching-status">${esc(loadError || '팔괘 풀이를 불러오는 중입니다.')}</p>`;
      return;
    }
    const trigram = corpus.trigramByPalace[pendingPalace];
    if (!trigram) {
      if (slot) slot.remove();
      return;
    }
    if (!slot) {
      slot = document.createElement('section');
      slot.className = 'iching-attach';
      host.prepend(slot);
    }
    const title = palaceTitle(pendingPalace);
    const first = Array.isArray(trigram.shuogua) && trigram.shuogua[0] ? trigram.shuogua[0] : null;
    slot.innerHTML = `<p class="eyebrow">이 궁의 팔괘 · 보조</p>
      <p class="iching-name">${esc(title.direction)} · ${esc(trigram.ko)}(${esc(trigram.hanja)}) <small>${esc(trigram.summary || '')}</small></p>
      <p class="iching-note">가족 ${esc(trigram.family || '')} · 몸 ${esc(trigram.body || '')} · 동물 ${esc(trigram.animal || '')} · ${elementChip(pendingPalace)}</p>
      ${first ? `<p class="iching-original">${esc(first.original)}</p><p>${esc(first.translation)}</p>` : ''}
      <div class="iching-actions"><button type="button" class="iching-button" data-iching-scroll="${esc(pendingPalace)}">8궁 풀이 보기</button></div>`;
  }

  function lineCard(line, active) {
    return `<article class="iching-line${active ? ' is-today-line' : ''}">
      <h4>${esc(line.name || '')} ${esc(line.nameKo || '')}${active ? ' · 오늘의 효' : ''}</h4>
      ${textBlock('원문', line.original)}
      ${textBlock('독음', line.reading)}
      ${textBlock('번역', line.translation)}
      ${textBlock('풀이', line.explanation)}
      ${textBlock('태도', line.attitude)}
      ${textBlock('질문', line.question)}
    </article>`;
  }

  function openDetail(number, position) {
    if (!corpus || !nodes.dialog || !nodes.detailBody) return;
    const hexagram = corpus.byNumber.get(Number(number));
    if (!hexagram) return;
    const lines = Array.isArray(hexagram.lines) ? hexagram.lines : [];
    const extra = hexagram.extra;
    nodes.detailBody.innerHTML = `<header><div><p class="eyebrow">${esc(core.SOURCE_NAME)}</p><h2>${hexagramName(hexagram)}</h2></div><button type="button" class="iching-button" data-iching-close>닫기</button></header>
      <p class="iching-text">${esc(hexagram.summary || '')}</p>
      ${keywordsHtml(hexagram.keywords)}
      ${judgmentHtml(hexagram.judgment, '괘사')}
      ${judgmentHtml(hexagram.image, '대상전')}
      ${textBlock('쉬운 풀이', hexagram.explanation)}
      ${Array.isArray(hexagram.applications) && hexagram.applications.length ? `<span class="iching-label">일상</span>${hexagram.applications.map(item => `<p class="iching-text">${esc(item)}</p>`).join('')}` : ''}
      ${textBlock('질문', hexagram.question)}
      <span class="iching-label">효사</span>
      ${lines.map(line => lineCard(line, Number(line.position) === Number(position))).join('')}
      ${extra ? `<section><span class="iching-label">${esc(extra.nameKo || '')} ${esc(extra.name || '')}</span>${textBlock('원문', extra.original)}${textBlock('독음', extra.reading)}${textBlock('번역', extra.translation)}${textBlock('풀이', extra.explanation)}</section>` : ''}
      ${hexagram.sequence && hexagram.sequence.xugua ? `<details><summary>서괘전</summary>${textBlock('원문', hexagram.sequence.xugua.original)}${textBlock('번역', hexagram.sequence.xugua.translation)}${textBlock('현대적 연결', hexagram.sequence.modern)}</details>` : ''}
      ${textBlock('주석', hexagram.notes)}
      ${creditHtml(hexagram.review)}`;
    if (typeof nodes.dialog.showModal === 'function' && !nodes.dialog.open) nodes.dialog.showModal();
    const current = nodes.detailBody.querySelector('.is-today-line');
    if (current) current.scrollIntoView({ block: 'center' });
  }

  function paint() {
    renderDaily();
    renderHouse();
    renderPalaces();
    markPalaces();
    if (pendingPalace) attachPalace(pendingPalace);
  }

  function syncChart(chart, selected) {
    latestChart = chart || null;
    if (selected !== undefined) latestSelected = selected;
    if (started && corpus) {
      renderHouse();
      markPalaces();
    }
  }

  function syncHeading(heading) {
    if (!ringOn || !corpus || !nodes.readout) return;
    const slots = ringSlots();
    const slot = ringLayout === 'xiantian'
      ? core.slotAtAngle(heading, slots)
      : slots[core.ringIndexAt(heading)];
    const hexagram = slot && slot.hexagram;
    if (!hexagram) return;
    const key = `${ringLayout}:${hexagram.number}`;
    if (key === lastRingKey) return;
    lastRingKey = key;
    const layoutName = ringLayout === 'xiantian' ? '선천' : '문왕';
    nodes.readout.textContent = `고리 12시 · ${layoutName} · ${hexagram.number} ${hexagram.fullNameKo || hexagram.nameKo} (${hexagram.nameHanja})`;
  }

  function onClick(event) {
    const open = event.target.closest('[data-iching-open]');
    if (open) {
      openDetail(open.getAttribute('data-iching-open'), open.getAttribute('data-iching-line'));
      return;
    }
    if (event.target.closest('[data-iching-close]')) {
      nodes.dialog && nodes.dialog.close();
      return;
    }
    const select = event.target.closest('[data-select-palace]');
    if (select && api && typeof api.selectPalace === 'function') {
      api.selectPalace(select.getAttribute('data-select-palace'));
      return;
    }
    const scroll = event.target.closest('[data-iching-scroll]');
    if (scroll) {
      document.getElementById(`ichingPalace-${scroll.getAttribute('data-iching-scroll')}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const layoutButton = event.target.closest('[data-ring-layout]');
    if (layoutButton) {
      setRingLayout(layoutButton.getAttribute('data-ring-layout'));
      return;
    }
    if (event.target.closest('#ichingRingToggle')) setRing(!ringOn);
  }

  function start(options) {
    if (started) return;
    started = true;
    api = options || {};
    buildShell();
    document.addEventListener('click', onClick);
    if (nodes.dialog) {
      nodes.dialog.addEventListener('click', event => {
        if (event.target === nodes.dialog) nodes.dialog.close();
      });
    }
    ringOn = storeGet(RING_KEY) === 'on';
    ringLayout = storeGet(RING_LAYOUT_KEY) === 'xiantian' ? 'xiantian' : 'kingwen';
    if (api.getChart) latestChart = api.getChart();
    if (api.getSelected) latestSelected = api.getSelected();
    renderDaily();
    renderHouse();
    core.loadCorpus().then(loaded => {
      corpus = loaded;
      renderPalaces();
      paint();
      if (ringOn) setRing(true);
      else if (nodes.wrap) nodes.wrap.classList.remove('ring-on');
    }).catch(error => {
      loadError = '주역 자료를 불러오지 못했습니다. 저장소 루트에서 정적 서버로 열어 주세요.';
      console.warn(error);
      paint();
    });
  }

  root.IChingCircleUI = Object.freeze({
    start, syncChart, syncHeading, attachPalace, openDetail
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
