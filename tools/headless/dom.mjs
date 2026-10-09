// Minimal fake browser environment for running the game in Node without a real canvas.
// Every canvas allocation is tracked so memory blowups can be found without a browser.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const stats = { canvasesCreated: 0, maxCanvas: [0, 0], imageDataBytes: 0, calls: {}, bigCanvases: [] };
const live = new Set(); // WeakRef<FakeCanvas>

export function liveCanvases() {
  let n = 0, px = 0;
  for (const r of live) { const c = r.deref(); if (!c) { live.delete(r); continue; } n++; px += c._w * c._h; }
  return { n, mb: (px * 4) / 1048576 };
}

function count(k) { stats.calls[k] = (stats.calls[k] ?? 0) + 1; }

export const gpu = { gid: new Map(), filters: new Map(), maxScale: 0, maxScaleAt: '' };
class FakeCtx {
  constructor(canvas) { this.canvas = canvas; this.globalAlpha = 1; this._filter = 'none'; this.imageSmoothingEnabled = true; this._m = [1, 0, 0, 1, 0, 0]; }
  get filter() { return this._filter; }
  set filter(v) { this._filter = v; if (v !== 'none') gpu.filters.set(v, (gpu.filters.get(v) ?? 0) + 1); }
  setTransform(a, b, c, d, e, f) { this._m = [a, b, c, d, e, f]; this._sc(); }
  transform(a, b, c, d, e, f) { const m = this._m; this._m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]]; this._sc(); }
  _sc() { const s = Math.sqrt(Math.abs(this._m[0] * this._m[3] - this._m[1] * this._m[2])); if (s > gpu.maxScale) { gpu.maxScale = s; gpu.maxScaleAt = new Error().stack.split('\n').slice(2, 6).join(' | '); } }
  getImageData(x, y, w, h) { if (globalThis.__trackGID) { const k = new Error().stack.split('\n').slice(2, 5).map(l => l.trim().replace(/\(.*\.out\//, '(')).join(' < ') + ` [${w}x${h}]`; gpu.gid.set(k, (gpu.gid.get(k) ?? 0) + 1); } const n = Math.max(1, w * h * 4); stats.imageDataBytes += n; count('getImageData'); return { data: new Uint8ClampedArray(n), width: w, height: h }; }
  createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; }
  putImageData() { count('putImageData'); }
  createPattern() { count('createPattern'); return { setTransform() {} }; }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
  measureText(t) { return { width: String(t).length * 6, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }; }
  isPointInPath() { return false; }
  isPointInStroke() { return false; }
  getTransform() { return new DOMMatrix(); }
  drawImage() { count('drawImage'); }
  fill() { count('fill'); }
  stroke() { count('stroke'); }
  fillRect() { count('fillRect'); }
  fillText() { count('fillText'); }
}
for (const m of ['save', 'restore', 'translate', 'scale', 'rotate', 'resetTransform', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'rect', 'arc', 'quadraticCurveTo', 'bezierCurveTo', 'clip', 'clearRect', 'strokeRect', 'strokeText', 'setLineDash'])
  FakeCtx.prototype[m] = function () {};

class FakeCanvas {
  constructor() { this._w = 300; this._h = 150; this.style = {}; this.clientWidth = 675; this.clientHeight = 480; stats.canvasesCreated++; live.add(new WeakRef(this)); }
  get width() { return this._w; }
  set width(v) { this._w = v | 0; this._track(); }
  get height() { return this._h; }
  set height(v) { this._h = v | 0; this._track(); }
  _track() {
    if (this._w * this._h > stats.maxCanvas[0] * stats.maxCanvas[1]) stats.maxCanvas = [this._w, this._h];
    if (this._w * this._h > 4096 * 4096 && stats.bigCanvases.length < 20) stats.bigCanvases.push([this._w, this._h, new Error().stack.split('\n').slice(2, 7).join(' | ')]);
  }
  getContext() { return (this._ctx ??= new FakeCtx(this)); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 675, height: 480 }; }
  addEventListener(t, f) { ((this._ls ??= {})[t] ??= []).push(f); }
  _emit(t, e) { for (const f of this._ls?.[t] ?? []) f(e); }
  setPointerCapture() {} focus() {} setAttribute() {}
}

export function install(publicDir, serverOrigin) {
  const g = globalThis;
  const listeners = {};
  g.window = g;
  g.devicePixelRatio = 1;
  g.screen = { width: 1920, height: 1080 };
  g.addEventListener = (t, f) => { (listeners[t] ??= []).push(f); };
  g.removeEventListener = () => {};
  g.__dispatchWindow = (t, e) => { for (const f of listeners[t] ?? []) f(e); };
  g.requestAnimationFrame = () => 0;
  g.location = { href: serverOrigin + '/', protocol: 'http:', host: new URL(serverOrigin).host, origin: serverOrigin, search: '' };
  const store = new Map();
  g.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), clear: () => store.clear() };
  const body = { appendChild() {}, removeChild() {} };
  g.document = {
    body, activeElement: body,
    createElement: t => (t === 'canvas' ? new FakeCanvas() : { style: {}, setAttribute() {}, focus() {}, addEventListener() {}, remove() {}, value: '' }),
    getElementById: () => null, addEventListener() {},
  };
  Object.defineProperty(g, 'navigator', { value: { platform: 'MacIntel', language: 'en', clipboard: { writeText: async () => {}, readText: async () => '' } }, configurable: true });
  g.Path2D = class { addPath() {} rect() {} moveTo() {} lineTo() {} closePath() {} };
  g.DOMMatrix ??= class { constructor(a) { [this.a, this.b, this.c, this.d, this.e, this.f] = a ?? [1, 0, 0, 1, 0, 0]; } };
  g.HTMLCanvasElement = FakeCanvas;
  g.HTMLImageElement = class {};
  let pack = null;
  g.Image = class extends g.HTMLImageElement {
    set src(u) {
      this._src = u;
      pack ??= JSON.parse(readFileSync(join(publicDir, 'assets/pack.json'), 'utf8'));
      const id = +u.match(/(\d+)\.\w+(\?|$)/)?.[1];
      const c = pack.chars[id];
      this.width = c?.w ?? 1; this.height = c?.h ?? 1;
      setTimeout(() => this.onload?.(), 0);
    }
    get src() { return this._src; }
  };
  const realFetch = g.fetch;
  const cookies = new Map();
  g.__cookies = cookies;
  g.fetch = async (url, init) => {
    const u = String(url);
    if (process.env.DEBUG_FETCH && u.includes('/api')) console.log('FETCH', u, init?.body?.slice?.(0, 200) ?? '');
    if (u.startsWith('/api') || u.startsWith('http')) {
      // per-process cookie jar, so session logins work like in a browser
      const headers = new Headers(init?.headers ?? {});
      if (cookies.size) headers.set('cookie', [...cookies].map(([k, v]) => `${k}=${v}`).join('; '));
      const res = await realFetch(u.startsWith('/') ? serverOrigin + u : u, { ...init, headers });
      for (const c of res.headers.getSetCookie?.() ?? []) { const [kv] = c.split(';'); const i = kv.indexOf('='); const k = kv.slice(0, i).trim(), v = kv.slice(i + 1); if (/max-age=0/i.test(c) || !v) cookies.delete(k); else cookies.set(k, v); }
      return res;
    }
    const path = join(publicDir, u.split('?')[0]);
    return new Response(readFileSync(path));
  };
  g.AudioContext = class {
    constructor() { this.state = 'running'; this.destination = {}; this.currentTime = 0; }
    createGain() { return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} }, connect() {}, disconnect() {} }; }
    createBufferSource() { return { buffer: null, loop: false, connect() {}, disconnect() {}, start() {}, stop() {}, addEventListener() {}, onended: null }; }
    createStereoPanner() { return { pan: { value: 0 }, connect() {}, disconnect() {} }; }
    decodeAudioData() { return Promise.resolve({ duration: 1, length: 44100, sampleRate: 44100 }); }
    resume() { return Promise.resolve(); }
  };
  g.Audio = class { addEventListener() {} play() { return Promise.resolve(); } pause() {} };
  const RealWS = g.WebSocket;
  g.WebSocket = class extends RealWS { constructor(u, p) { super(String(u).replace(/^ws:\/\/[^/]+/, serverOrigin.replace(/^http/, 'ws')), p); } };
  return new FakeCanvas();
}
