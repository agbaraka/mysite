// Guards against Hugo-era leftovers now that the site builds with Vite and
// ships via Docker + Caddy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import jsYaml from 'js-yaml';

const dockerignore = readFileSync('.dockerignore', 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));

test('Hugo config.toml is gone', () => {
    assert.equal(existsSync('config.toml'), false);
});

test('Personal Website project lists the current stack', () => {
    const { projects } = jsYaml.load(readFileSync('data.yml', 'utf8'));
    const site = projects.find((p) => p.name === 'Personal Website');
    assert.deepEqual(site.tags, ['Vite', 'Tailwind CSS', 'Docker', 'Caddy']);
});

test('.dockerignore keeps public/ in the build context (Vite static assets)', () => {
    assert.ok(!dockerignore.includes('public/'));
    assert.ok(!dockerignore.includes('resources/'));
});

test('.dockerignore names files that actually exist', () => {
    assert.ok(dockerignore.includes('docker-compose.yaml'));
    assert.ok(!dockerignore.includes('docker-compose.yml'));
    assert.ok(existsSync('docker-compose.yaml'));
});
