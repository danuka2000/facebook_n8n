import test from 'node:test';
import assert from 'node:assert/strict';

import { validateApiKey } from './_api-key.js';

const originalEnv = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
}

function makeRequest(headers = {}) {
  return new Request('https://example.com/api/news/v1/list-feed-digest', {
    headers: new Headers(headers),
  });
}

test.afterEach(() => {
  restoreEnv();
});

test('accepts trimmed keys from WORLDMONITOR_VALID_KEYS', () => {
  process.env.WORLDMONITOR_VALID_KEYS = '  danuka123  ';
  delete process.env.WORLDMONITOR_API_KEY;

  const result = validateApiKey(makeRequest({
    'X-WorldMonitor-Key': 'danuka123',
  }));

  assert.equal(result.valid, true);
  assert.equal(result.required, true);
});

test('falls back to WORLDMONITOR_API_KEY when no allowlist is configured', () => {
  delete process.env.WORLDMONITOR_VALID_KEYS;
  process.env.WORLDMONITOR_API_KEY = 'danuka123';

  const result = validateApiKey(makeRequest({
    'X-WorldMonitor-Key': 'danuka123',
  }));

  assert.equal(result.valid, true);
  assert.equal(result.required, true);
});
