// Builds the site and verifies that particles.js and jump.js are bundled
// instead of loaded from cdnjs, and that the built bundle initializes both
// particles and nav smooth-scrolling cleanly in strict mode.
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

function runBundle({ initialHash = '' } = {}) {
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

    const navListeners = {};
    const link = {
        hash: '#projects',
        addEventListener(type, fn) {
            navListeners[type] = fn;
        },
    };

    const pushed = [];
    const rafCallbacks = [];
    const context = {
        console,
        setTimeout,
        clearTimeout,
        MutationObserver: class {
            observe() {}
        },
        history: {
            pushState(...args) {
                pushed.push(args);
            },
            replaceState() {},
        },
        document: {
            getElementById() {
                return {
                    getElementsByClassName: () => [],
                    appendChild: (el) => el,
                };
            },
            createElement: (tag) => (tag === 'link' ? { relList: { supports: () => true } } : canvas),
            querySelector(sel) {
                if (sel === '#projects' || sel === '#about') {
                    return { getBoundingClientRect: () => ({ top: 500 }) };
                }
                return canvas;
            },
            querySelectorAll(sel) {
                return sel === '#mainNav a' ? [link] : [];
            },
        },
    };
    context.window = context;
    context.location = { hash: initialHash };
    context.scrollY = 0;
    context.pageYOffset = 0;
    context.scrollTo = () => {};
    context.devicePixelRatio = 1;
    context.addEventListener = () => {};
    context.requestAnimationFrame = (cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
    };
    context.cancelAnimationFrame = () => {};

    vm.runInNewContext(`"use strict";\n${bundle}`, context);
    return { context, navListeners, pushed, rafCallbacks };
}

test('dist/index.html has no cdnjs scripts', () => {
    assert.doesNotMatch(html, /cdnjs/i);
});

test('built bundle initializes particles.js and #mainNav smooth scroll in strict mode', () => {
    const { context, navListeners, pushed, rafCallbacks } = runBundle();

    assert.equal(context.pJSDom?.length, 1, 'particlesJS should initialize one canvas instance');
    assert.ok(
        context.pJSDom[0].pJS.particles.array.length > 0,
        'particlesJS should populate particles',
    );

    const rafBeforeClick = rafCallbacks.length;
    let prevented = false;
    navListeners.click({ preventDefault: () => (prevented = true) });

    assert.equal(prevented, true, 'nav link click should prevent default jump');
    assert.deepEqual(pushed, [[null, '', '#projects']]);
    assert.ok(
        rafCallbacks.length > rafBeforeClick,
        'Jump.js should schedule a requestAnimationFrame scroll loop',
    );
});
