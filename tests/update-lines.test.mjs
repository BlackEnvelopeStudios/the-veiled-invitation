import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateLines } from '../update-lines.mjs';

test('formats multiline updates and existing bullet entries without duplicate markers', () => {
  assert.deepEqual(updateLines({ text: 'First notice\r\n\n- Second notice\n• Third notice', bullets: ['* Existing bullet', '- - Already marked', 'Life-Tithe Emporium'] }),
    ['First notice', 'Second notice', 'Third notice', 'Existing bullet', 'Already marked', 'Life-Tithe Emporium']);
});
