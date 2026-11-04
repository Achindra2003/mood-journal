import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateMood } from '../config/validate.js';

test('accepts a valid mood', () => {
  assert.deepEqual(validateMood({ mood: 4, note: ' ok ' }).value, { mood: 4, note: 'ok' });
});

test('rejects out-of-range mood', () => {
  assert.ok(validateMood({ mood: 9 }).error);
  assert.ok(validateMood({ mood: 'x' }).error);
});

test('rejects an over-long note', () => {
  assert.ok(validateMood({ mood: 3, note: 'a'.repeat(501) }).error);
});
