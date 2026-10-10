import test from 'node:test';
import assert from 'node:assert/strict';
import { options, updateStudio } from './status.mjs';
const fixture = 'before<div class="studio-live-status" data-studio-status="inactive" role="status" aria-live="polite"><span>STUDIO LIVE STATUS</span><p class="studio-live-status-message">Old message</p></div>after';
test('all statuses update only the display', () => {
  for (const key of Object.keys(options)) {
    const html = updateStudio(fixture, key);
    assert.ok(html.startsWith('before'));
    assert.ok(html.endsWith('after'));
    assert.ok(html.includes(`data-studio-status="${key}"`));
    assert.ok(html.includes(options[key]));
    assert.equal(updateStudio(html, key), html);
  }
});
test('invalid status and changed or duplicated displays fail closed', () => {
  assert.throws(() => updateStudio(fixture, 'unknown'));
  assert.throws(() => updateStudio('unrelated', 'inactive'));
  assert.throws(() => updateStudio(fixture + fixture, 'inactive'));
});
