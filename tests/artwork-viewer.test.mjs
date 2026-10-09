import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../artwork-viewer.js', import.meta.url), 'utf8');
function element() {
  return {
    children: [], attributes: {}, events: {},
    append(...children) { this.children.push(...children); },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(type, callback) { this.events[type] = callback; },
    replaceWith(replacement) { this.replacement = replacement; },
    focus() { this.focused = true; },
    showModal() { this.open = true; },
    close() { this.open = false; this.events.close(); },
  };
}
for (const className of ['soul-portrait', 'creature-portrait']) {
  const portrait = Object.assign(element(), { className, alt: 'Artwork description', src: 'portrait.webp', dataset: { fullSrc: 'portrait-full.webp' } });
  const content = element();
  const classes = new Set();
  runInNewContext(source, {
    HTMLDialogElement: function () {},
    document: {
      querySelector: selector => selector === 'h1' ? { textContent: 'Test profile' } : portrait,
      createElement: element,
      getElementById: () => content,
      documentElement: { classList: { add: value => classes.add(value), remove: value => classes.delete(value) } },
    },
  });
  const dialog = content.children[0];
  const [close, image] = dialog.children;
  const trigger = portrait.replacement;
  assert(trigger.className.includes(className));
  assert.equal(trigger.attributes['aria-haspopup'], 'dialog');
  trigger.events.click();
  assert(dialog.open && close.focused && classes.has('artwork-open'));
  assert.equal(image.src, portrait.dataset.fullSrc);
  assert.equal(image.alt, portrait.alt);
  close.events.click();
  assert(!dialog.open && trigger.focused && !classes.has('artwork-open'));
  trigger.events.click();
  dialog.events.click({ target: dialog });
  assert(!dialog.open);
  assert.equal(dialog.events.cancel, undefined, 'Native Escape dismissal must not be prevented');
}
for (const page of ['index.html', 'souls/index.html', 'creatures/index.html']) {
  assert(!readFileSync(new URL(`../dist/${page}`, import.meta.url), 'utf8').includes('artwork-viewer.js'));
}
for (const page of ['souls/the-host', 'creatures/the-charred']) {
  assert(readFileSync(new URL(`../dist/${page}/index.html`, import.meta.url), 'utf8').includes('artwork-viewer.js'));
}
console.log('Artwork viewer behavior and page scope checks passed.');
