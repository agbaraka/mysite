// Regression test for #8 (and #31): smooth scrolling is handled natively via
// CSS scroll-behavior: smooth instead of jump.js, and nav anchor links target
// existing section IDs so both clicks and deep links land on the section.
// Run with: pnpm test
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

let html;
let css;
let pkg;

before(() => {
    execSync('pnpm build', { stdio: 'ignore' });
    html = readFileSync('dist/index.html', 'utf8');
    css = readdirSync('dist/assets')
        .filter((f) => f.endsWith('.css'))
        .map((f) => readFileSync(`dist/assets/${f}`, 'utf8'))
        .join('\n');
    pkg = JSON.parse(readFileSync('package.json', 'utf8'));
});

test('built CSS enables scroll-behavior: smooth for prefers-reduced-motion: no-preference', () => {
    assert.match(
        css,
        /@media\s*\(\s*prefers-reduced-motion:\s*no-preference\s*\)\s*\{[^{}]*html\s*\{[^}]*scroll-behavior:\s*smooth\b[^}]*\}/,
        'built CSS should set html { scroll-behavior: smooth } inside @media (prefers-reduced-motion: no-preference)',
    );
});

test('#mainNav hash links target existing section IDs in built HTML', () => {
    const navMatch = html.match(/<div id="mainNav"[\s\S]*?<\/div>/);
    assert.ok(navMatch, '#mainNav container missing from built HTML');

    const hashes = [...navMatch[0].matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    assert.ok(hashes.length >= 2, `expected nav hash links in #mainNav, got: ${hashes.join(', ')}`);
    assert.ok(hashes.includes('about'), '#mainNav should link to #about');
    assert.ok(hashes.includes('projects'), '#mainNav should link to #projects');

    for (const id of hashes) {
        assert.match(html, new RegExp(`id="${id}"`), `target section id="${id}" missing from built HTML`);
    }
});

test('jump.js and the custom #mainNav scroll handler are removed', () => {
    assert.equal(pkg.dependencies?.['jump.js'], undefined, 'jump.js should not be in dependencies');
    assert.equal(pkg.devDependencies?.['jump.js'], undefined, 'jump.js should not be in devDependencies');
    assert.doesNotMatch(html, /jump\.js/i, 'built HTML should not reference jump.js');
    assert.equal(existsSync('src/nav.js'), false, 'src/nav.js should be removed');
});
