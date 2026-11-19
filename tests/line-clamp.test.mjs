// Builds the site and checks that project descriptions (.item-container) are
// clamped to two lines with an ellipsis. Browsers only draw the "…" when
// -webkit-line-clamp is set together with display: -webkit-box.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

let css;

before(() => {
    execSync('pnpm build', { stdio: 'ignore' });
    css = readdirSync('dist/assets')
        .filter((f) => f.endsWith('.css'))
        .map((f) => readFileSync(`dist/assets/${f}`, 'utf8'))
        .join('\n');
});

test('.item-container clamps to two lines with an ellipsis', () => {
    const rule = css.match(/\.item-container\s*\{([^}]*)\}/)?.[1];
    assert.ok(rule, '.item-container rule missing from built CSS');
    assert.match(rule, /display:\s*-webkit-box/);
    assert.match(rule, /-webkit-box-orient:\s*vertical/);
    assert.match(rule, /-webkit-line-clamp:\s*2/, `no -webkit-line-clamp in: ${rule}`);
});
