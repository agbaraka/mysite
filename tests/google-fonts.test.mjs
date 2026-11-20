// Builds the site and checks that the Google Fonts stylesheet uses
// display=swap and is preceded by preconnect hints.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

let html;

before(() => {
    execSync('pnpm build', { stdio: 'ignore' });
    html = readFileSync('dist/index.html', 'utf8');
});

const stylesheet = () => html.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)" rel="stylesheet">/);

test('Google Fonts stylesheet uses display=swap', () => {
    assert.ok(stylesheet(), 'Google Fonts stylesheet link not found');
    assert.ok(stylesheet()[1].endsWith('&display=swap'));
});

test('preconnect hints come before the Google Fonts stylesheet', () => {
    const googleapis = html.indexOf('<link rel="preconnect" href="https://fonts.googleapis.com">');
    const gstatic = html.indexOf('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    assert.ok(googleapis !== -1, 'missing preconnect to fonts.googleapis.com');
    assert.ok(gstatic !== -1, 'missing preconnect (crossorigin) to fonts.gstatic.com');
    assert.ok(googleapis < stylesheet().index && gstatic < stylesheet().index);
});
