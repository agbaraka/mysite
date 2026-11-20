// Regression test for #8: nav links must prevent the browser's default
// anchor jump so Jump.js can animate the scroll.
// Run with: pnpm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

// The inline script that wires up #mainNav (the one calling particlesJS).
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .find((s) => s.includes('#mainNav'))

function run(link, hash = '') {
  const jumps = []
  const context = {
    particlesJS() {},
    Jump: (target) => jumps.push(target),
    document: { querySelectorAll: (sel) => (sel === '#mainNav a' ? [link] : []) },
    window: { location: { hash } },
    history: { pushState() {}, replaceState() {} },
  }
  vm.runInNewContext(script, context)
  return jumps
}

function fakeLink(hash) {
  const listeners = {}
  return {
    hash,
    addEventListener: (type, fn) => (listeners[type] = fn),
    click() {
      let prevented = false
      const event = { target: this, currentTarget: this, preventDefault: () => (prevented = true) }
      listeners.click?.call(this, event)
      return prevented
    },
  }
}

test('nav script is present in index.html', () => {
  assert.ok(script, 'inline #mainNav script not found')
})

test('clicking a nav hash link prevents the default jump and animates with Jump', () => {
  const link = fakeLink('#projects')
  const jumps = run(link)
  const prevented = link.click()
  assert.deepEqual(jumps, ['#projects'], 'Jump should be called with the link hash')
  assert.equal(prevented, true, 'click default must be prevented, otherwise the browser jumps instantly')
})
