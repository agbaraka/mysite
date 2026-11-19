// Regression test for #23: every test file in tests/ must match the
// `pnpm test` glob (tests/**/*.test.mjs), or it silently never runs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';

test('every tests/*.test.* file is picked up by pnpm test', () => {
    const skipped = readdirSync('tests', { recursive: true })
        .filter((f) => /\.test\.[^/]+$/.test(f) && !f.endsWith('.test.mjs'));
    assert.deepEqual(skipped, []);
});
