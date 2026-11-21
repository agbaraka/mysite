// Builds the site and checks that every skill group in data.yml is rendered
// in dist/index.html with exactly the same visible text.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import jsYaml from 'js-yaml';

let html;
const { skills } = jsYaml.load(readFileSync('data.yml', 'utf8'));

before(() => {
    execSync('pnpm build', { stdio: 'ignore' });
    html = readFileSync('dist/index.html', 'utf8');
});

const normalize = (text) => text.replace(/\s+/g, ' ').trim();

const decodeEntities = (text) =>
    text
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

test('data.yml defines the skills list', () => {
    assert.ok(Array.isArray(skills) && skills.length > 0, 'expected a non-empty skills list in data.yml');
    for (const group of skills) {
        assert.equal(typeof group.name, 'string', 'every skill group needs a name');
        assert.ok(Array.isArray(group.items) && group.items.length > 0, `"${group.name}" needs items`);
    }
});

for (const group of skills) {
    test(`renders "${group.name}" from data.yml`, () => {
        const expected = normalize(`${group.name}: ${group.items.join(', ')}`);
        const listItems = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((match) =>
            normalize(decodeEntities(match[1].replace(/<[^>]+>/g, ''))),
        );
        assert.ok(listItems.includes(expected), `missing skills text in dist/index.html: ${expected}`);
    });
}
