// Regression tests for #34: social icon links need accessible names, the page
// needs landmarks, and the profile photo needs descriptive alt text and
// intrinsic dimensions so the browser can reserve space before CSS loads.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

let html;

before(() => {
    execSync('pnpm build', { stdio: 'ignore' });
    html = readFileSync('dist/index.html', 'utf8');
});

const anchors = () => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];

test('every link has text content or an aria-label', () => {
    const links = anchors();
    assert.ok(links.length > 0, 'expected links in dist/index.html');

    for (const [, attrs, inner] of links) {
        const ariaLabel = attrs.match(/\baria-label="([^"]*)"/)?.[1] ?? '';
        const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        assert.ok(
            text.length > 0 || ariaLabel.trim().length > 0,
            `link has no accessible name: <a${attrs}>`,
        );
    }
});

for (const label of ['GitHub', 'LinkedIn', 'X']) {
    test(`social link for ${label} has an aria-label`, () => {
        assert.match(
            html,
            new RegExp(`<a\\b[^>]*aria-label="${label}"[^>]*>\\s*<svg\\b[^>]*aria-hidden="true"`),
            `expected a link with aria-label="${label}" and a decorative SVG`,
        );
    });
}

test('page exposes main, nav, and footer landmarks', () => {
    assert.match(html, /<main\b/, 'missing <main> landmark');
    assert.match(html, /<nav\b[^>]*aria-label="Main"/, 'missing <nav aria-label="Main"> landmark');
    assert.match(html, /<footer\b/, 'missing <footer> landmark');
});

test('footer email is a mailto link that does not open a new tab', () => {
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer, 'missing <footer>');
    const link = footer.match(/<a\b[^>]*href="mailto:[^"]+"[^>]*>/)?.[0];
    assert.ok(link, 'footer email should be a mailto: link');
    assert.doesNotMatch(link, /target="_blank"/, link);
});

test('profile photo has descriptive alt text and intrinsic dimensions', () => {
    const img = html.match(/<img\b[^>]*class="[^"]*\bh-24\b[^"]*"[^>]*>/)?.[0];
    assert.ok(img, 'profile photo missing from built HTML');
    assert.match(img, /\balt="Albert Shirima"/);
    assert.match(img, /\bwidth="96"/);
    assert.match(img, /\bheight="96"/);
});
