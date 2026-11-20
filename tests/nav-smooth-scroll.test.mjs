// Regression test for #8: nav links must prevent the browser's default
// anchor jump so Jump.js can animate the scroll.
// Run with: pnpm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initNav } from '../src/nav.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function fakeLink(hash) {
  const listeners = {};
  return {
    hash,
    addEventListener: (type, fn) => (listeners[type] = fn),
    click() {
      let prevented = false;
      const event = {
        target: this,
        currentTarget: this,
        preventDefault: () => (prevented = true),
      };
      listeners.click?.call(this, event);
      return prevented;
    },
  };
}

function run(links, hash = '') {
  const jumps = [];
  const pushed = [];
  initNav((target) => jumps.push(target), {
    document: { querySelectorAll: (sel) => (sel === '#mainNav a' ? links : []) },
    window: { location: { hash } },
    history: { pushState: (...args) => pushed.push(args), replaceState() {} },
  });
  return { jumps, pushed };
}

test('index.html loads /src/main.js as a module script', () => {
  assert.match(html, /<script type="module" src="\/src\/main\.js"><\/script>/);
});

test('clicking a nav hash link prevents the default jump and animates with Jump', () => {
  const link = fakeLink('#projects');
  const { jumps, pushed } = run([link]);
  const prevented = link.click();
  assert.deepEqual(jumps, ['#projects'], 'Jump should be called with the link hash');
  assert.deepEqual(pushed, [[null, '', '#projects']], 'history.pushState should update the URL hash');
  assert.equal(
    prevented,
    true,
    'click default must be prevented, otherwise the browser jumps instantly',
  );
});

test('deep-linking with an initial location.hash triggers Jump on load', () => {
  const { jumps } = run([], '#about');
  assert.deepEqual(jumps, ['#about']);
});
