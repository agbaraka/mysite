// Several test files run `pnpm build` in before(), and each Vite build empties
// dist/. If node --test runs those files in parallel, one can read dist/ while
// another build has just wiped it (flaky ENOENT on dist/index.html in CI).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

test('test files that build dist/ do not run in parallel', () => {
    const builders = readdirSync('tests').filter((f) =>
        readFileSync(`tests/${f}`, 'utf8').includes("execSync('pnpm build'"),
    );
    if (builders.length < 2) return;
    const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'));
    assert.match(scripts.test, /--test-concurrency=1\b/, `${builders.join(', ')} all rebuild dist/`);
});
