/* 현공 용어 각주. 카드·구역마다 용어가 처음 나올 때 한 번만 번호를 단다. */
(function (root) {
  'use strict';

  const TERMS = Object.freeze([
    ['24산', '나침반을 스물네 방향으로 나눈 눈금'],
    ['좌향', '집이 등진 쪽과 바라보는 쪽'],
    ['정향', '바라보는 각도가 한 방향의 한가운데인 경우'],
    ['겸향', '바라보는 각도가 두 방향의 경계 쪽에 걸린 경우'],
    ['하괘', '정향일 때 쓰는 궁반 잡는 법'],
    ['체괘', '겸향일 때 쓰는 궁반 잡는 법'],
    ['궁반', '집을 아홉 칸으로 나눈 방향 판'],
    ['택반', '그 집의 궁반. 집이 생긴 시기의 운으로 잡음'],
    ['택운', '이 집이 속한 20년 주기'],
    ['원운', '20년마다 바뀌는 시간 주기 하나'],
    ['비성', '궁반의 아홉 칸을 차례로 옮겨 다니는 아홉 별'],
    ['산성', '쉬는 자리와 사람을 보는 별'],
    ['향성', '문, 활동, 재물을 보는 별'],
    ['영성', '지금 20년 주기에서 가장 중요한 별'],
    ['승탁', '집 뒤를 받쳐 주는 높은 지형이나 건물'],
    ['승접', '집 앞의 길, 물, 빈터가 향성의 기를 이어받는 일'],
    ['승기', '향성이 바깥의 기를 이어받는 일'],
    ['유년', '올해 한 해 동안 겹쳐 보는 별'],
    ['유월', '이번 절기 달 동안 겹쳐 보는 별'],
    ['납기', '대문과 창으로 바깥 기가 집 안에 들어오는 길'],
    ['왕정', '산성이 집 뒤에서 사람에게 이롭게 쓰인다는 말. 뒤가 받쳐 줄 때 해당'],
    ['조만', '집 앞이 높은 것으로 가득 차 트임이 막힌 형세'],
    ['천당', '앞과 뒤가 뚫려 기가 집을 그대로 빠져나가는 형태'],
    ['육사', '문, 길, 부엌, 침상, 우물, 화장실처럼 집 안팎에서 실제로 살피는 여섯 자리']
  ]);
  const BY_TERM = Object.freeze(Object.fromEntries(TERMS));
  const ORDERED = Object.freeze([...TERMS].sort((a, b) => b[0].length - a[0].length).map(row => row[0]));
  const PARTICLES = '은는이가을를과와로의에도만';
  const SCOPES = '.card, .explainable-insight-card, .analysis-block, .goal-card, .flow-item, .palace-report, .professional-item, .summary-advice-card, .advisor-action, .capability-item, .guide-wrap, .home-placement-report';
  const SKIP = 'script, style, textarea, input, select, option, .fn-list, .fn-mark, .compass, .star-grid, .detail-grid, .mountain-label-layer, .dial';

  function depth(node) {
    let n = 0;
    while (node) {
      n += 1;
      node = node.parentElement;
    }
    return n;
  }

  function nextEnd(text, index, term) {
    let end = index + term.length;
    const hanja = text.slice(end).match(/^\([一-龥·／]{1,16}\)/);
    if (hanja) return { end: end + hanja[0].length, bounded: true };
    if (term === '비성' && text[end] === '반') return { end: end + 1, bounded: true };
    return { end, bounded: false };
  }

  function findTerm(text, seen) {
    let best = null;
    for (const term of ORDERED) {
      if (seen && seen.has(term)) continue;
      let from = 0;
      while (from < text.length) {
        const at = text.indexOf(term, from);
        if (at < 0) break;
        const prev = at > 0 ? text[at - 1] : '';
        if (prev && /[가-힣]/.test(prev)) {
          from = at + 1;
          continue;
        }
        if (term === '24산' && prev && /[0-9]/.test(prev)) {
          from = at + 1;
          continue;
        }
        const span = nextEnd(text, at, term);
        const next = text[span.end] || '';
        if (!span.bounded && next && /[가-힣]/.test(next) && !PARTICLES.includes(next)) {
          from = at + 1;
          continue;
        }
        if (!best || at < best.at) best = { at, end: span.end, term };
        break;
      }
    }
    return best;
  }

  function clearScope(scope) {
    scope.querySelectorAll(':scope > .fn-list').forEach(node => node.remove());
    [...scope.querySelectorAll('.fn-mark')].forEach(node => {
      if (closestScope(node) === scope) node.remove();
    });
  }

  function closestScope(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    return el && el.closest(SCOPES);
  }

  function markText(node, seen) {
    const hit = findTerm(node.nodeValue || '', seen);
    if (!hit) return;
    split(node, hit.at, hit.end, hit.term, seen);
  }

  function split(node, at, end, term, seen) {
    const text = node.nodeValue;
    const num = seen.size + 1;
    seen.set(term, num);
    const mark = document.createElement('sup');
    mark.className = 'fn-mark';
    mark.textContent = num + ')';
    const after = document.createTextNode(text.slice(end));
    node.nodeValue = text.slice(0, end);
    const parent = node.parentNode;
    parent.insertBefore(mark, node.nextSibling);
    parent.insertBefore(after, mark.nextSibling);
    markText(after, seen);
  }

  function shouldSkip(node) {
    const el = node.parentElement;
    if (!el) return true;
    if (el.closest(SKIP)) return true;
    return false;
  }

  function applyScope(scope) {
    clearScope(scope);
    const seen = new Map();
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
        if (closestScope(node) !== scope) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(node => markText(node, seen));
    if (!seen.size) return;
    const list = document.createElement('ol');
    list.className = 'fn-list';
    [...seen.entries()].sort((a, b) => a[1] - b[1]).forEach(([term, num]) => {
      const item = document.createElement('li');
      item.textContent = num + ') ' + term + ': ' + BY_TERM[term];
      list.append(item);
    });
    scope.append(list);
  }

  let applying = false;
  let scheduled = false;
  let observer = null;
  let watchHost = null;
  const watchOptions = { subtree: true, childList: true, characterData: true };
  function apply(root) {
    if (typeof document === 'undefined') return;
    if (observer) observer.disconnect();
    applying = true;
    try {
      const host = root && root.querySelectorAll ? root : document;
      const scopes = [...host.querySelectorAll(SCOPES)].sort((a, b) => depth(b) - depth(a));
      scopes.forEach(applyScope);
    } finally {
      applying = false;
      if (observer && watchHost) observer.observe(watchHost, watchOptions);
    }
  }

  function schedule() {
    if (applying || scheduled || typeof document === 'undefined') return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      apply(document);
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
    else setTimeout(run, 16);
  }

  function boot() {
    watchHost = document.querySelector('main') || document.body;
    if (!watchHost || watchHost.dataset.fnWatch) return;
    watchHost.dataset.fnWatch = '1';
    observer = new MutationObserver(() => {
      if (!applying) schedule();
    });
    observer.observe(watchHost, watchOptions);
    schedule();
  }

  const api = Object.freeze({ TERMS, BY_TERM, apply, schedule });
  root.TermFootnotes = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})(typeof window !== 'undefined' ? window : globalThis);
