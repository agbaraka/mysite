// Guards against unpinned pnpm in the Docker build: a new pnpm major could
// change the lockfile format and break `pnpm install --frozen-lockfile`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const dockerfile = readFileSync('Dockerfile', 'utf8');

test('package.json pins pnpm with an exact packageManager version', () => {
    assert.match(pkg.packageManager ?? '', /^pnpm@\d+\.\d+\.\d+/);
});

test('Dockerfile does not install pnpm@latest', () => {
    assert.doesNotMatch(dockerfile, /pnpm@latest/);
});

// node:lts-alpine (Node 25+) no longer bundles corepack, so a bare
// `corepack enable` fails with "corepack: not found".
test('Dockerfile installs a pinned corepack before enabling it', () => {
    const install = dockerfile.search(/npm install -g corepack@\d+\.\d+\.\d+/);
    const enable = dockerfile.indexOf('corepack enable');
    assert.ok(enable !== -1, 'Dockerfile no longer runs `corepack enable`');
    assert.ok(install !== -1 && install < enable, 'install a pinned corepack before `corepack enable`');
});
