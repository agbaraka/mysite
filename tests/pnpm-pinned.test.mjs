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
