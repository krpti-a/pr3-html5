// Drives the real game in an isolated headless Chromium (see cdp.mjs for the memory watchdog).
// Usage: node tools/headless/chrome.mjs [script] [--limit-mb=2500] [--shots=dir]
// Env: CHROME (binary), PR3_ORIGIN (default http://localhost:8080).
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launchChrome } from './cdp.mjs';

const args = Object.fromEntries(process.argv.slice(3).map(a => a.replace(/^--/, '').split('=')));
const script = process.argv[2] ?? 'chrome-tutorial';
const ORIGIN = process.env.PR3_ORIGIN ?? 'http://localhost:8080';
const c = await launchChrome({ limitMb: +(args['limit-mb'] ?? 2500), shots: args.shots ?? join(tmpdir(), 'pr3-shots') });
const { evaluate, send, shot, consoleLines, rssMb } = c;

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function stats(tag = '') {
  const s = await evaluate(`(() => { const h = performance.memory; return { heap: h ? Math.round(h.usedJSHeapSize / 1048576) : -1, fps: window.__fps ?? 0, errs: (window.__errs || []).length, canvasMB: Math.round(window.pr3?.runtime && window.__canvasMB ? window.__canvasMB() : -1) }; })()`);
  console.log(`[${tag}] rss=${rssMb().toFixed(0)}MB peak=${c.peak.toFixed(0)}MB heap=${s.heap}MB fps=${s.fps} errs=${s.errs}`);
  return s;
}
// helpers available in the page
const HELPERS = `
window.__h = {
  findType(name, o = pr3.stage, C = pr3.getDefinitionByName(name)) { if (o instanceof C) return o; for (const c of o._ch ?? []) { const r = this.findType(name, c, C); if (r) return r; } return null; },
  // page (CSS) coordinates of the center of a display object, for real mouse input
  center(o) {
    const b = o.getBounds(pr3.stage), c = document.getElementById('c'), r = c.getBoundingClientRect();
    const B = pr3.runtime.base ?? pr3.BASE, kx = r.width / c.width, ky = r.height / c.height;
    const sx = b.x + b.width / 2, sy = b.y + b.height / 2;
    return { x: r.left + (B.a * sx + B.tx) * kx, y: r.top + (B.d * sy + B.ty) * ky, w: b.width, h: b.height };
  },
  find(pred, o = pr3.stage) { if (pred(o)) return o; for (const c of o._ch ?? []) { const r = this.find(pred, c); if (r) return r; } return null; },
  findAll(pred, o = pr3.stage, out = []) { if (pred(o)) out.push(o); for (const c of o._ch ?? []) this.findAll(pred, c, out); return out; },
  texts(o = pr3.stage, out = []) { if (typeof o.text === 'string' && o.text) out.push(o.text); for (const c of o._ch ?? []) this.texts(c, out); return out; },
};
if (!window.__fpsT) { let n = 0, t0 = performance.now(); const tick = () => { n++; const t = performance.now(); if (t - t0 >= 1000) { window.__fps = Math.round(n * 1000 / (t - t0)); n = 0; t0 = t; } requestAnimationFrame(tick); }; window.__fpsT = requestAnimationFrame(tick); }
true`;
async function until(expr, ms = 15000, label = expr) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await evaluate(expr).catch(() => false)) return true; await sleep(250); }
  console.log('until timeout:', label); return false;
}
async function key(type, k, code = k, keyCode = 0) {
  await send('Input.dispatchKeyEvent', { type: type === 'down' ? 'rawKeyDown' : 'keyUp', key: k, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
}
// real mouse click on the display object returned by a page expression (evaluated with __h in scope)
async function clickObj(expr, label = expr) {
  const p = await evaluate(`(() => { const o = (${expr}); return o ? __h.center(o) : null; })()`);
  if (!p) { console.log('clickObj: not found:', label); return false; }
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1 });
  lastMouse = p;
  console.log(`clicked ${label} @${Math.round(p.x)},${Math.round(p.y)}`);
  return true;
}
// real mouse move onto the display object returned by a page expression (in `steps` moves from the last position)
let lastMouse = { x: 0, y: 0 };
async function hoverObj(expr, label = expr, steps = 4) {
  const p = await evaluate(`(() => { const o = (${expr}); return o ? __h.center(o) : null; })()`);
  if (!p) { console.log('hoverObj: not found:', label); return false; }
  for (let i = 1; i <= steps; i++) await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: lastMouse.x + (p.x - lastMouse.x) * i / steps, y: lastMouse.y + (p.y - lastMouse.y) * i / steps, buttons: 0 });
  lastMouse = p;
  return true;
}
async function open(path = '/') {
  await send('Page.navigate', { url: ORIGIN + path });
  await until('!!window.pr3', 30000, 'game boot');
  await evaluate(HELPERS);
}

const ctx = { evaluate, send, shot, stats, until, key, sleep, open, clickObj, hoverObj, consoleLines, rssMb };
try {
  const mod = await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'scripts', `${script}.mjs`)).href);
  await mod.default(ctx);
  await stats('end');
  for (const e of (await evaluate('window.__errs || []')).slice(-15)) console.log('ERR', e);
  for (const l of consoleLines.slice(-15)) console.log('CONSOLE', l);
} catch (e) {
  console.log('SCRIPT ERROR', e.message);
} finally {
  console.log(`peak rss ${c.peak.toFixed(0)}MB`);
  c.close();
  process.exit(0);
}
