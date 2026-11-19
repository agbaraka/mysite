// Builds the site and checks that the social links in dist/index.html
// match the URLs in data.yml (catches empty or mistyped template bindings).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import jsYaml from 'js-yaml';

let html;
const { resource } = jsYaml.load(readFileSync('data.yml', 'utf8'));

before(() => {
    execSync('pnpm build', { stdio: 'ignore' });
    html = readFileSync('dist/index.html', 'utf8');
});

test('built page has no empty href attributes', () => {
    assert.equal(html.match(/href=""/g)?.length ?? 0, 0);
});

for (const key of ['github', 'twitter', 'linkedin']) {
    test(`links to resource.${key} from data.yml`, () => {
        assert.ok(html.includes(`href="${resource[key]}"`), `missing href="${resource[key]}"`);
    });
}
