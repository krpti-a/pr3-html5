// Frame loop, input and rendering for the flash-lite runtime.
import { Stage, DisplayObject, DisplayObjectContainer, MovieClip, Sprite, SimpleButton, InteractiveObject, renderObject, frameScriptQueue, BASE } from './display.ts';
import { TextField } from './text.ts';
import { Event, MouseEvent, KeyboardEvent, TextEvent, broadcastEvent } from './events.ts';
import { Matrix, Point, ColorTransform } from './geom.ts';
import { clock, runTimers, reportError, safeUrl } from './utils.ts';
import { resumeAudio } from './media.ts';
import { canvasStats } from './canvas.ts';
import { Mouse } from './misc.ts';

const FRAME_MS = 1000 / 30;
export const stage = new Stage();
// maxScale: render resolution cap (stage pixels -> canvas pixels), ?scale=N in the URL overrides it
const qs = typeof location !== 'undefined' ? +new URLSearchParams(location.search).get('scale')! : NaN;
export const runtime = { paused: false, smooth: true, onFrame: [] as (() => void)[], scale: 1, maxScale: qs > 0 ? qs : 2, renders: 0, forceHidden: false };
let canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D;
let last = 0, acc = 0;

function runFrameScripts() {
  for (let i = 0; i < frameScriptQueue.length && i < 10000; i++) try { frameScriptQueue[i]._runScript(); } catch (e) { reportError(e); }
  frameScriptQueue.length = 0;
}
export function runFrame() {
  clock.frame++;
  clock.now = Math.floor((clock.frame * 100) / 3);
  try { runTimers(); } catch (e) { reportError(e); }
  // Frame scripts of clips constructed since the last frame (in network/timer/input handlers) run before
  // any timeline advances, as in Flash: a `stop()` on frame 1 always takes effect.
  runFrameScripts();
  // advance timelines of playing clips on the display list
  const clips: MovieClip[] = [];
  const walk = (o: DisplayObjectContainer) => {
    for (const c of o._ch) {
      if (c instanceof MovieClip && c._playing && c._frames.length > 1) clips.push(c);
      if (c instanceof DisplayObjectContainer) walk(c);
    }
  };
  walk(stage);
  for (const c of clips) try { c._advance(); } catch (e) { reportError(e); }
  try { broadcastEvent(Event.ENTER_FRAME); } catch (e) { reportError(e); }
  runFrameScripts();
  try { broadcastEvent(Event.EXIT_FRAME); } catch (e) { reportError(e); }
  stage._updateDrag();
  for (const f of runtime.onFrame) f();
}

export function render() {
  const dpr = window.devicePixelRatio || 1;
  let cw = canvas.clientWidth * dpr, ch = canvas.clientHeight * dpr;
  // cap the backing store at runtime.maxScale x the 675x480 stage; the browser scales the canvas up
  // beyond that (rasterization cost grows with pixel count, e.g. a maximized Retina window)
  const k = Math.min(1, runtime.maxScale / Math.min(cw / 675, ch / 480));
  cw *= k; ch *= k;
  if (canvas.width !== Math.round(cw) || canvas.height !== Math.round(ch)) { canvas.width = Math.round(cw); canvas.height = Math.round(ch); }
  const s = Math.min(canvas.width / 675, canvas.height / 480);
  runtime.scale = s;
  const ox = (canvas.width - 675 * s) / 2, oy = (canvas.height - 480 * s) / 2;
  BASE.setTo(s, 0, 0, s, ox, oy);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.beginPath(); ctx.rect(ox, oy, 675 * s, 480 * s); ctx.clip();
  ctx.fillStyle = '#' + stage.color.toString(16).padStart(6, '0');
  ctx.fillRect(ox, oy, 675 * s, 480 * s);
  const ct = new ColorTransform();
  for (const c of stage._ch) renderObject(c, ctx, BASE, ct);
  ctx.restore();
}

// Safety net: canvas memory (often GPU-side, invisible to GC pressure) and JS heap are capped.
// If a budget is exceeded the game pauses itself rather than letting the browser balloon.
const CANVAS_BUDGET_MB = 768, HEAP_BUDGET_MB = 1536;
let guardTripped = false;
function memoryGuard() {
  if (guardTripped) return;
  const heap = (performance as any).memory?.usedJSHeapSize / 1048576 || 0;
  const cv = canvasStats.liveMB;
  if (cv < CANVAS_BUDGET_MB && heap < HEAP_BUDGET_MB) return;
  guardTripped = true;
  runtime.paused = true;
  const msg = `PR3 paused to protect your computer: memory use too high (canvases ${cv.toFixed(0)} MB, JS heap ${heap.toFixed(0)} MB). Reload the page to continue.`;
  console.error(msg);
  reportError(new Error(msg));
  const d = document.createElement('div');
  d.textContent = msg;
  Object.assign(d.style, { position: 'fixed', left: '0', right: '0', top: '0', padding: '12px', background: '#b00', color: '#fff', font: '14px sans-serif', zIndex: '9' });
  document.body.appendChild(d);
}

// Fixed 30 fps steps from wall-clock time, shared by the display loop and the background ticker.
function advance(now: number, maxFrames: number, maxGap: number) {
  if (!last) last = now;
  acc += Math.min(maxGap, now - last);
  last = now;
  // run a bounded number of catch-up frames; drop the rest rather than spiral when slow
  let n = 0;
  while (acc >= FRAME_MS && n < maxFrames) { if (!runtime.paused) runFrame(); acc -= FRAME_MS; n++; }
  if (acc >= FRAME_MS) acc = 0;
  if (clock.frame % 15 === 0) memoryGuard();
}
const isHidden = () => (typeof document !== 'undefined' && document.hidden) || runtime.forceHidden;
function loop(_t: number) {
  if (guardTripped) return; // stop the loop entirely
  requestAnimationFrame(loop);
  if (isHidden()) return; // the background ticker drives the game meanwhile
  advance(performance.now(), 3, 250);
  if (!guardTripped) { render(); runtime.renders++; }
}
// Browsers stop requestAnimationFrame (and throttle page timers) in hidden tabs, which would freeze the
// game: other players' updates pile up and hits on you wait until you come back. The original ran in a
// desktop window that kept going in the background, so keep the game logic running (without drawing) on
// ticks from a worker, whose timers aren't throttled.
function startBackgroundTicker() {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined') return;
  try {
    const src = URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 1000 / 30);'], { type: 'text/javascript' }));
    const w = new Worker(src);
    w.onmessage = () => { if (!guardTripped && isHidden()) advance(performance.now(), 10, 1000); };
  } catch (e) { reportError(e); }
}

// ---------------------------------------------------------------- input
let overChain: DisplayObject[] = [];
let downTarget: InteractiveObject | null = null;
let lastClick = { t: 0, o: null as any };
let buttonDown = false;
const keyMods = { ctrl: false, alt: false, shift: false };

function toStage(e: { clientX: number; clientY: number }) {
  const r = canvas.getBoundingClientRect();
  const kx = r.width ? canvas.width / r.width : 1, ky = r.height ? canvas.height / r.height : 1;
  const x = (e.clientX - r.left) * kx, y = (e.clientY - r.top) * ky;
  return new Point((x - BASE.tx) / BASE.a, (y - BASE.ty) / BASE.d);
}
// Mouse picking as Flash/Ruffle do it (Ruffle's mouse_pick_avm2): a hit on a non-interactive shape is
// claimed by its nearest container ('shape'); a hit on an object that isn't mouse-enabled propagates
// ('prop'): the search continues with siblings underneath, and the parent claims it only if nothing
// below is hit. So mouseEnabled=false overlays let clicks through to what's under them.
type Pick = { t: InteractiveObject } | 'shape' | 'prop' | null;
function pick(o: DisplayObject, x: number, y: number, m: Matrix): Pick {
  if (!o._visible || o._maskOf) return null;
  const wm = new Matrix(); wm.copyFrom(o._matrix()); wm.concat(m);
  if (o._mask && !o._mask._hitShape(x, y)) return null;
  if (o._scrollRect) { const inv = wm.clone(); inv.invert(); const p = inv.transformPoint(new Point(x, y)); const r = o._scrollRect; if (p.x < 0 || p.y < 0 || p.x > r.width || p.y > r.height) return null; }
  if (o instanceof DisplayObjectContainer) {
    const sm = o._scrollRect ? new Matrix(1, 0, 0, 1, -o._scrollRect.x, -o._scrollRect.y) : null;
    const cm = sm ? (() => { const k = sm.clone(); k.concat(wm); return k; })() : wm;
    const self = (): Pick => (o.mouseEnabled ? { t: o } : 'prop');
    if (o instanceof Sprite && o.hitArea) return o.hitArea._hitShape(x, y) ? self() : null;
    const ch = o._ch;
    let propagated = false;
    for (let i = ch.length - 1; i >= 0; i--) {
      const c = ch[i];
      if (c._clipDepth) continue;
      // timeline masks: skip children outside their clip
      const maskC = clipFor(o, i);
      if (maskC && !maskC._hitShape(x, y)) continue;
      const r = pick(c, x, y, cm);
      if (!r) continue;
      if (r === 'prop') { propagated = true; continue; }
      if (r === 'shape') return self();
      return o.mouseChildren ? r : self();
    }
    if (o instanceof Sprite && o._g) {
      const inv = cm.clone(); inv.invert(); const p = inv.transformPoint(new Point(x, y));
      if (o._ownHit(p.x, p.y)) return self();
    }
    return propagated ? self() : null;
  }
  const inv = wm.clone(); inv.invert();
  const p = inv.transformPoint(new Point(x, y));
  if (!o._hitLocal(p.x, p.y)) return null;
  if (o instanceof InteractiveObject) return o.mouseEnabled ? { t: o } : 'prop';
  return 'shape';
}
function clipFor(o: DisplayObjectContainer, i: number) {
  const c = o._ch[i]; if (c._depth === undefined) return null;
  for (let k = i - 1; k >= 0; k--) { const m = o._ch[k]; if (m._clipDepth && m._depth !== undefined && m._depth < c._depth && m._clipDepth >= c._depth) return m; }
  return null;
}
// debugging aid: what the mouse would hit at a stage point
(runtime as any).pick = (x: number, y: number) => targetAt(x, y);
function targetAt(x: number, y: number): InteractiveObject {
  const r = pick(stage, x, y, new Matrix());
  return r && typeof r === 'object' ? r.t : stage;
}
function mouseEvt(type: string, target: InteractiveObject, p: Point, bubbles = true, related: any = null, delta = 0) {
  const lp = target.globalToLocal(p);
  const e = new MouseEvent(type, bubbles, false, lp.x, lp.y, related, keyMods.ctrl, keyMods.alt, keyMods.shift, buttonDown, delta);
  e.stageX = p.x; e.stageY = p.y;
  try { target.dispatchEvent(e); } catch (err) { reportError(err); }
}
function chain(o: DisplayObject | null) { const a: DisplayObject[] = []; for (; o; o = o._parent) a.push(o); return a; }
function updateOver(p: Point) {
  const t = targetAt(p.x, p.y);
  const prev = overChain[0] ?? null;
  const next = chain(t);
  if (prev !== t) {
    if (prev && prev.stage) mouseEvt(MouseEvent.MOUSE_OUT, prev as InteractiveObject, p, true, t);
    for (const o of overChain) if (!next.includes(o) && o.stage) mouseEvt(MouseEvent.ROLL_OUT, o as InteractiveObject, p, false, t);
    for (const o of next.slice().reverse()) if (!overChain.includes(o)) mouseEvt(MouseEvent.ROLL_OVER, o as InteractiveObject, p, false, prev);
    if (t) mouseEvt(MouseEvent.MOUSE_OVER, t, p, true, prev);
  }
  // button states (like Ruffle: rolling out -> up; the pressed button shows over when dragged out, down when back on it)
  const pressed = buttonDown ? chain(downTarget ?? t) : [];
  for (const o of overChain) if (o instanceof SimpleButton && !next.includes(o)) o._state = pressed.includes(o) ? 'over' : 'up';
  for (const o of next) if (o instanceof SimpleButton) o._state = !buttonDown ? 'over' : pressed.includes(o) ? 'down' : 'up';
  overChain = next;
  // cursor
  let cur = 'default';
  for (const o of next) {
    if ((o instanceof Sprite && o.buttonMode && o.useHandCursor) || (o instanceof SimpleButton && o.useHandCursor && o.enabled)) { cur = 'pointer'; break; }
    if (o instanceof TextField && o._linkAt(p.x, p.y)) { cur = 'pointer'; break; }
    if (o instanceof TextField && (o.type === 'input' || o.selectable) && o.type === 'input') { cur = 'text'; break; }
  }
  canvas.style.cursor = Mouse._hidden ? 'none' : cur;
  return t;
}
function resetButtons(o: DisplayObject) {
  if (o instanceof SimpleButton && !overChain.includes(o)) o._state = 'up';
  if (o instanceof DisplayObjectContainer) for (const c of o._ch) resetButtons(c);
}

function setupInput() {
  canvas.addEventListener('pointermove', e => {
    const p = toStage(e); stage._mx = p.x; stage._my = p.y;
    const t = updateOver(p);
    if (buttonDown && stage._focus instanceof TextField && downTarget === stage._focus) (stage._focus as TextField)._mouseDrag(p.x, p.y);
    mouseEvt(MouseEvent.MOUSE_MOVE, t, p);
  });
  canvas.addEventListener('pointerdown', e => {
    resumeAudio();
    canvas.setPointerCapture?.(e.pointerId);
    if (e.button !== 0) return;
    const p = toStage(e); stage._mx = p.x; stage._my = p.y;
    buttonDown = true;
    const t = updateOver(p);
    downTarget = t;
    if (t instanceof TextField && (t.type === 'input' || t.selectable)) { stage.focus = t; t._mouseDown(p.x, p.y, e.shiftKey); }
    else if (stage._focus instanceof TextField) stage.focus = null;
    mouseEvt(MouseEvent.MOUSE_DOWN, t, p);
    e.preventDefault();
    hiddenInput.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointerup', e => {
    if (e.button !== 0) return;
    const p = toStage(e);
    buttonDown = false;
    const t = updateOver(p);
    mouseEvt(MouseEvent.MOUSE_UP, t, p);
    if (downTarget && t === downTarget) {
      mouseEvt(MouseEvent.CLICK, t, p);
      if (t instanceof TextField) {
        const url = t._linkAt(p.x, p.y);
        if (url.startsWith('event:')) { try { t.dispatchEvent(new TextEvent(TextEvent.LINK, true, false, url.slice(6))); } catch (err) { reportError(err); } }
        else if (safeUrl(url)) window.open(url, '_blank', 'noopener');
      }
      const now = performance.now();
      if (t.doubleClickEnabled && lastClick.o === t && now - lastClick.t < 500) mouseEvt(MouseEvent.DOUBLE_CLICK, t, p);
      lastClick = { t: now, o: t };
    }
    downTarget = null;
    resetButtons(stage);
  });
  canvas.addEventListener('pointerleave', () => { if (!buttonDown) { const p = new Point(-100, -100); updateOver(p); resetButtons(stage); } });
  canvas.addEventListener('wheel', e => {
    const p = toStage(e);
    const t = updateOver(p);
    const delta = Math.max(-3, Math.min(3, Math.round(-e.deltaY / 33) || (e.deltaY > 0 ? -3 : 3)));
    mouseEvt(MouseEvent.MOUSE_WHEEL, t, p, true, null, delta);
    if (t instanceof TextField && t.mouseWheelEnabled) t.scrollV -= Math.sign(delta);
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  const keyEvt = (type: string, e: globalThis.KeyboardEvent) => {
    keyMods.ctrl = e.ctrlKey || e.metaKey; keyMods.alt = e.altKey; keyMods.shift = e.shiftKey;
    const code = keyCodeOf(e);
    const ke = new KeyboardEvent(type, true, false, e.key.length === 1 ? e.key.charCodeAt(0) : code === 13 ? 13 : code === 8 ? 8 : 0, code,
      e.location === 1 ? 1 : e.location === 2 ? 2 : e.location === 3 ? 3 : 0, keyMods.ctrl, keyMods.alt, keyMods.shift);
    const target: any = stage._focus && stage._focus.stage ? stage._focus : stage;
    try { target.dispatchEvent(ke); } catch (err) { reportError(err); }
  };
  addEventListener('keydown', e => {
    if (document.activeElement && document.activeElement !== hiddenInput && document.activeElement !== document.body && document.activeElement !== canvas) return;
    resumeAudio();
    const f = stage._focus;
    let handled = false;
    if (f instanceof TextField) handled = f._keyDown(e);
    keyEvt(KeyboardEvent.KEY_DOWN, e);
    const nav = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Tab', 'PageUp', 'PageDown', 'Home', 'End'];
    if (handled || nav.includes(e.key) || (e.key === 'v' && (e.ctrlKey || e.metaKey) && f instanceof TextField) === false && nav.includes(e.key)) e.preventDefault();
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) return; // allow paste event
    if (handled && e.key !== 'c') e.preventDefault();
  });
  addEventListener('keyup', e => {
    if (document.activeElement && document.activeElement !== hiddenInput && document.activeElement !== document.body && document.activeElement !== canvas) return;
    keyEvt(KeyboardEvent.KEY_UP, e);
  });
  addEventListener('paste', e => {
    const f = stage._focus;
    if (f instanceof TextField && f.type === 'input') { f._insert(e.clipboardData?.getData('text') ?? ''); e.preventDefault(); }
  });
  addEventListener('blur', () => { broadcastEvent(Event.DEACTIVATE); });
  addEventListener('focus', () => { broadcastEvent(Event.ACTIVATE); });
}
const KEYMAP: Record<string, number> = { ' ': 32, Enter: 13, Escape: 27, Backspace: 8, Tab: 9, Shift: 16, Control: 17, Alt: 18, Meta: 15, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Delete: 46, Home: 36, End: 35, PageUp: 33, PageDown: 34 };
function keyCodeOf(e: globalThis.KeyboardEvent) {
  if (e.code?.startsWith('Key')) return e.code.charCodeAt(3);
  if (e.code?.startsWith('Digit')) return e.code.charCodeAt(5);
  return KEYMAP[e.key] ?? e.keyCode ?? 0;
}

let hiddenInput: HTMLTextAreaElement;
export function startPlayer(cv: HTMLCanvasElement, main: DisplayObject) {
  canvas = cv;
  ctx = canvas.getContext('2d', { alpha: false })!;
  hiddenInput = document.createElement('textarea');
  hiddenInput.setAttribute('aria-hidden', 'true');
  Object.assign(hiddenInput.style, { position: 'fixed', left: '-1000px', top: '0', opacity: '0', width: '1px', height: '1px' });
  document.body.appendChild(hiddenInput);
  setupInput();
  stage.addChild(main);
  requestAnimationFrame(loop);
  startBackgroundTicker();
}
