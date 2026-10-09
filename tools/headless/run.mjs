// Runs the game headless in Node with a fake canvas, scripted input and memory tracking.
// Usage: node --expose-gc --max-old-space-size=1536 tools/headless/run.mjs [script] (server must run on PR3_ORIGIN, default http://localhost:8080)
import { build } from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { install, stats, liveCanvases, gpu } from './dom.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const out = join(root, 'tools/headless/.out/headless.mjs');
mkdirSync(dirname(out), { recursive: true });
await build({ entryPoints: [join(root, 'client/src/headless.ts')], bundle: true, format: 'esm', outfile: out, define: { __BUILD__: '"headless"' }, tsconfigRaw: { compilerOptions: { useDefineForClassFields: false } }, logLevel: 'error' });

globalThis.__trackGID = true;
const canvas = globalThis.__canvas = install(join(root, 'public'), process.env.PR3_ORIGIN ?? 'http://localhost:8080');
const G = await import(pathToFileURL(out).href);
await G.boot(canvas);

const HEAP_LIMIT = 1200 * 1048576, CANVAS_LIMIT_MB = 1024;
let frame = 0, lastCalls = {};
const REALTIME = !!process.env.REALTIME; let t30 = performance.now();
const sleep = ms => new Promise(r => setTimeout(r, ms));
function report(tag = '') {
  globalThis.gc?.();
  const h = process.memoryUsage().heapUsed, lc = liveCanvases();
  const d = {}; for (const [k, v] of Object.entries(stats.calls)) d[k] = v - (lastCalls[k] ?? 0); lastCalls = { ...stats.calls };
  console.log(`[f${frame}] ${tag} heap=${(h / 1048576).toFixed(0)}MB canvases=${lc.n} (${lc.mb.toFixed(0)}MB) created=${stats.canvasesCreated} max=${stats.maxCanvas.join('x')} getImageData=${(stats.imageDataBytes / 1048576).toFixed(0)}MB calls=${JSON.stringify(d)}`);
  if (h > HEAP_LIMIT || lc.mb > CANVAS_LIMIT_MB) { console.log('MEMORY LIMIT HIT', stats.bigCanvases); dumpErrors(); process.exit(2); }
}
function dumpErrors() { for (const e of G.errors.splice(0)) console.log('ERR', e); }
async function frames(n, every = 150) {
  for (let i = 0; i < n; i++) {
    frame++;
    const t0 = performance.now();
    G.runFrame(); G.render();
    const dt = performance.now() - t0;
    if (dt > 200) console.log(`[f${frame}] slow frame ${dt.toFixed(0)}ms`);
    if (frame % every === 0) report();
    // REALTIME=1 paces frames at 30 fps wall-clock (needed when several clients must stay in sync)
    if (REALTIME) { t30 += 1000 / 30; const w = t30 - performance.now(); if (w > 0) await sleep(w); else if (w < -500) t30 = performance.now(); }
    else await sleep(1);
  }
  dumpErrors();
}
function find(name, o = G.stage) {
  if (o.name === name) return o;
  for (const c of o._ch ?? []) { const r = find(name, c); if (r) return r; }
  return null;
}
function tree(depth = 3, o = G.stage, ind = '') {
  let s = `${ind}${o.constructor?.__qname ?? o.constructor?.name}${o.name ? ' "' + o.name + '"' : ''}${o._visible === false ? ' (hidden)' : ''}${o._frames?.length > 1 ? ` f${o.currentFrame}/${o._frames.length}` : ''}\n`;
  if (depth > 0) for (const c of o._ch ?? []) s += tree(depth - 1, c, ind + '  ');
  return s;
}
function texts(o = G.stage, out = []) {
  if (typeof o.text === 'string' && o.text) out.push(o.text);
  for (const c of o._ch ?? []) texts(c, out);
  return out;
}
function findType(name, o = G.stage, C = G.getDefinitionByName(name)) {
  if (o instanceof C) return o;
  for (const c of o._ch ?? []) { const r = findType(name, c, C); if (r) return r; }
  return null;
}
function click(name) {
  const o = typeof name === 'string' ? find(name) : name;
  if (!o) { console.log('click: not found', name); return false; }
  const b = o.getBounds(G.stage);
  const e = { clientX: b.x + b.width / 2, clientY: b.y + b.height / 2, button: 0, pointerId: 1, shiftKey: false, preventDefault() {} };
  canvas._emit('pointermove', e); canvas._emit('pointerdown', e); canvas._emit('pointerup', e);
  console.log(`click ${typeof name === 'string' ? name : o.name} @${e.clientX.toFixed(0)},${e.clientY.toFixed(0)}`);
  return true;
}
function key(type, k, code) { globalThis.__dispatchWindow(type, { key: k, code: code ?? k, keyCode: 0, location: 0, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, preventDefault() {} }); }
async function until(fn, max = 600, label = '') {
  for (let i = 0; i < max; i++) { if (fn()) return true; await frames(1); }
  console.log('until timeout', label); return false;
}

const ctx = { G, tree, texts, frames, find, findType, click, key, until, report, stats, sleep };
const script = process.argv[2] ?? 'tutorial';
const mod = await import(pathToFileURL(join(root, `tools/headless/scripts/${script}.mjs`)).href);
await mod.default(ctx);
report('end');
console.log('getImageData callers', [...gpu.gid].sort((a, b) => b[1] - a[1]).slice(0, 8));
console.log('filters', [...gpu.filters].sort((a, b) => b[1] - a[1]).slice(0, 15));
console.log('max transform scale', gpu.maxScale.toFixed(1), gpu.maxScaleAt);
process.exit(0);
