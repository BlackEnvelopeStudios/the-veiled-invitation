import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../creatures.js', import.meta.url), 'utf8');
function gallery({ saved = null, hash = '', blocked = false } = {}) {
  const ids = ['depth-i', 'depth-ii', 'depth-iii', 'depth-iv', 'alpha'];
  const panels = Object.fromEntries(ids.map(id => [id, { hidden: false }]));
  const buttons = ids.map(id => ({
    dataset: { category: id },
    setAttribute(key, value) { this[key] = value; },
    addEventListener(type, callback) { this[type] = callback; },
  }));
  const controls = { hidden: true, querySelectorAll: () => buttons };
  const location = { hash };
  const handlers = {};
  runInNewContext(source, {
    document: { querySelector: () => controls, getElementById: id => panels[id] },
    sessionStorage: {
      getItem() { if (blocked) throw Error('Blocked'); return saved; },
      setItem(key, value) { if (blocked) throw Error('Blocked'); saved = value; },
    },
    history: { state: null, replaceState(state, title, url) { if (blocked) throw Error('Blocked'); location.hash = url; } },
    location,
    window: { addEventListener(type, callback) { handlers[type] = callback; } },
  });
  return { panels, buttons, controls, location, handlers, saved: () => saved };
}
function selected(g, id) {
  assert(!g.controls.hidden);
  for (const button of g.buttons) {
    const active = button.dataset.category === id;
    assert.equal(button['aria-pressed'], String(active));
    assert.equal(g.panels[button.dataset.category].hidden, !active);
  }
}
selected(gallery(), 'depth-i');
selected(gallery({ saved: 'depth-ii' }), 'depth-ii');
selected(gallery({ saved: 'alpha', hash: '#depth-iii' }), 'depth-iii');
selected(gallery({ saved: 'invalid', hash: '#unknown' }), 'depth-i');
selected(gallery({ blocked: true, hash: '#depth-iv' }), 'depth-iv');
const g = gallery();
g.buttons[1].click();
selected(g, 'depth-ii');
assert.equal(g.saved(), 'depth-ii');
assert.equal(g.location.hash, '#depth-ii');
selected(gallery({ saved: g.saved(), hash: g.location.hash }), 'depth-ii');
g.location.hash = '#alpha';
g.handlers.hashchange();
selected(g, 'alpha');
console.log('Depth selection, persistence, URL priority, and blocked-storage checks passed.');
