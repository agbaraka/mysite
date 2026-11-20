// mailto: links must not open in a new tab: with target="_blank" some
// browsers open an empty tab next to the mail client.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');

test('mailto links do not use target="_blank"', () => {
    const mailtoLinks = html.match(/<a\b[^>]*href="mailto:[^>]*>/g) ?? [];
    assert.ok(mailtoLinks.length > 0, 'expected at least one mailto link');
    for (const link of mailtoLinks) {
        assert.doesNotMatch(link, /target="_blank"/, link);
    }
});
