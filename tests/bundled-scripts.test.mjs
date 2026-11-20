// Builds the site and verifies that particles.js is bundled instead of
// loaded from cdnjs, and that the built bundle initializes particles
// cleanly in strict mode.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

let html;
let bundle;

before(() => {
    execSync('pnpm build', { stdio: 'ignore' });
    html = readFileSync('dist/index.html', 'utf8');
    const src = html.match(/<script type="module"[^>]*src="([^"]+)"/)?.[1];
    assert.ok(src && existsSync(`dist${src}`), `built module script missing from dist/: ${src}`);
    bundle = readFileSync(`dist${src}`, 'utf8');
});

function runBundle() {
    const canvas = {
        className: '',
        style: {},
        offsetWidth: 800,
        offsetHeight: 600,
        width: 800,
        height: 600,
        addEventListener() {},
        getContext() {
            return {
                clearRect() {},
                fillRect() {},
                beginPath() {},
                arc() {},
                fill() {},
                stroke() {},
                moveTo() {},
                lineTo() {},
                closePath() {},
                save() {},
                restore() {},
                translate() {},
                rotate() {},
            };
        },
        remove() {},
    };

    const rafCallbacks = [];
    const context = {
        console,
        setTimeout,
        clearTimeout,
        MutationObserver: class {
            observe() {}
        },
        document: {
            getElementById() {
                return {
                    getElementsByClassName: () => [],
                    appendChild: (el) => el,
                };
            },
            createElement: (tag) => (tag === 'link' ? { relList: { supports: () => true } } : canvas),
            querySelector: () => canvas,
        },
    };
    context.window = context;
    context.devicePixelRatio = 1;
    context.addEventListener = () => {};
    context.requestAnimationFrame = (cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
    };
    context.cancelAnimationFrame = () => {};

    vm.runInNewContext(`"use strict";\n${bundle}`, context);
    return { context };
}

test('dist/index.html has no cdnjs scripts', () => {
    assert.doesNotMatch(html, /cdnjs/i);
});

test('built bundle initializes particles.js in strict mode', () => {
    const { context } = runBundle();

    assert.equal(context.pJSDom?.length, 1, 'particlesJS should initialize one canvas instance');
    assert.ok(
        context.pJSDom[0].pJS.particles.array.length > 0,
        'particlesJS should populate particles',
    );
});
