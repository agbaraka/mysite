// Builds the site and checks that the favicon referenced by index.html
// is actually emitted into dist/ (otherwise every page load logs a 404).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

let html;

before(() => {
    execSync('pnpm build', { stdio: 'ignore' });
    html = readFileSync('dist/index.html', 'utf8');
});

test('every <link rel="icon"> points at a file in dist/', () => {
    const hrefs = [...html.matchAll(/<link[^>]*rel="icon"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of hrefs) {
        assert.ok(existsSync(`dist${href}`), `icon ${href} is missing from dist/`);
    }
});
