// flash.display: display list, MovieClip timelines built from the converted SWF, bitmaps and rendering.
import { newCanvas, freeCanvas } from './canvas.ts';
import { drawCached } from './rastercache.ts';
import { EventDispatcher, Event } from './events.ts';
import { Matrix, Point, Rectangle, ColorTransform, mul } from './geom.ts';
import { Graphics } from './graphics.ts';
import { pack, images, classForChar } from './assets.ts';
import { drawDraws, hitDraws, path, ID_CT, worldScale, blendOp, BLEND_IDS, recolor } from './draw.ts';

const DEG = Math.PI / 180;
const twip = (v: number) => (v === v && v !== Infinity && v !== -Infinity ? Math.trunc(v * 20) / 20 : 0);
const IDM = new Matrix();
export const BASE = new Matrix(); // stage -> device pixels

// Placement data handed from a timeline to a child constructor (Flash applies the
// placement transform/name before the AS3 constructor body runs).
let PENDING: any = null;
export const frameScriptQueue: MovieClip[] = [];
export const factories: Record<string, (def: any) => DisplayObject> = {};
export let stageRef: Stage | null = null;

// cached world-space matrices for culling / mouse etc.
export abstract class DisplayObject extends EventDispatcher {
  [key: string]: any;
  _parent: DisplayObjectContainer | null = null;
  _name = '';
  _x = 0; _y = 0; _sx = 1; _sy = 1; _r1 = 0; _r2 = 0; // r1: x-axis angle, r2: y-axis angle (deg)
  _alpha = 1; _visible = true;
  _ct: ColorTransform | null = null;
  _m = new Matrix(); _mDirty = false;
  _filters: any[] = [];
  _blend = 'normal';
  _mask: DisplayObject | null = null; _maskOf: DisplayObject | null = null;
  _scrollRect: Rectangle | null = null;
  _depth: number | undefined = undefined; _clipDepth = 0; _placeFrame = 0; _scripted = false; _ratio = 0;
  _grid: Rectangle | null = null;
  cacheAsBitmap = false; opaqueBackground: any = null;
  accessibilityProperties: any = null;
  z = 0; rotationX = 0; rotationY = 0; rotationZ = 0; scaleZ = 1;

  constructor() {
    super();
    const p = PENDING;
    if (p) { PENDING = null; this._applyPlace(p.o, true); this._depth = p.o.d; this._placeFrame = p.frame; if (p.parent) p.parent._insertTimeline(this); }
  }
  get name() { return this._name; }
  set name(v) { this._name = v ?? ''; }
  get parent() { return this._parent; }
  get root(): DisplayObject | null {
    let o: DisplayObject = this;
    while (o._parent && !(o._parent instanceof Stage)) o = o._parent;
    return o._parent instanceof Stage ? o : this instanceof Stage ? this : null;
  }
  get stage(): Stage | null {
    let o: DisplayObject | null = this;
    while (o) { if (o instanceof Stage) return o; o = o._parent; }
    return null;
  }
  get loaderInfo() { return loaderInfo; }
  get x() { return this._x; }
  set x(v: number) { this._x = twip(+v); this._mDirty = true; this._scripted = true; }
  get y() { return this._y; }
  set y(v: number) { this._y = twip(+v); this._mDirty = true; this._scripted = true; }
  get scaleX() { return this._sx; }
  set scaleX(v: number) { this._sx = +v; this._mDirty = true; this._scripted = true; }
  get scaleY() { return this._sy; }
  set scaleY(v: number) { this._sy = +v; this._mDirty = true; this._scripted = true; }
  get rotation() { return this._r1; }
  set rotation(v: number) {
    v = +v;
    if (v !== v) v = 0;
    v %= 360;
    if (v > 180) v -= 360; else if (v < -180) v += 360;
    const d = v - this._r1;
    this._r1 = v; this._r2 += d;
    this._mDirty = true; this._scripted = true;
  }
  get alpha() { return this._alpha; }
  set alpha(v: number) { this._alpha = Math.trunc(+v * 256) / 256; }
  get visible() { return this._visible; }
  set visible(v: boolean) { this._visible = !!v; }
  get blendMode() { return this._blend; }
  set blendMode(v: string) { this._blend = v || 'normal'; }
  get filters() { return this._filters.slice(); }
  set filters(v: any[]) { this._filters = v ? v.map(f => (f.clone ? f.clone() : f)) : []; }
  get mask() { return this._mask; }
  set mask(v: DisplayObject | null) {
    if (this._mask) this._mask._maskOf = null;
    this._mask = v ?? null;
    if (v) v._maskOf = this;
  }
  get scrollRect() { return this._scrollRect?.clone() ?? null; }
  set scrollRect(v: Rectangle | null) { this._scrollRect = v ? v.clone() : null; }
  get scale9Grid() { return this._grid?.clone() ?? null; }
  set scale9Grid(v: Rectangle | null) { this._grid = v ? v.clone() : null; }
  get transform() { return new Transform(this); }
  set transform(t: Transform) { this._setMatrix(t.matrix); this._ct = t.colorTransform; }

  _setMatrix(m: Matrix) {
    this._x = twip(m.tx); this._y = twip(m.ty);
    this._sx = Math.sqrt(m.a * m.a + m.b * m.b);
    this._sy = Math.sqrt(m.c * m.c + m.d * m.d);
    const r1 = Math.atan2(m.b, m.a), r2 = Math.atan2(-m.c, m.d);
    this._r1 = r1 / DEG; this._r2 = r2 / DEG;
    if (m.a * m.d - m.b * m.c < 0) { this._sy = -this._sy; this._r2 = this._r2 + (this._r2 > 0 ? -180 : 180); }
    this._m.setTo(m.a, m.b, m.c, m.d, this._x, this._y);
    this._mDirty = false;
  }
  _matrix(): Matrix {
    if (this._mDirty) {
      const r1 = this._r1 * DEG, r2 = this._r2 * DEG;
      this._m.setTo(this._sx * Math.cos(r1), this._sx * Math.sin(r1), -this._sy * Math.sin(r2), this._sy * Math.cos(r2), this._x, this._y);
      this._mDirty = false;
    }
    return this._m;
  }
  _applyPlace(o: any, fresh: boolean) {
    if (fresh || !this._scripted) {
      if (o.m) this._setMatrix(Matrix.from(o.m));
      if (o.x !== undefined) {
        if (o.x) { const c = ColorTransform.from(o.x); this._alpha = c.alphaMultiplier; c.alphaMultiplier = 1; this._ct = c.isIdentity() ? null : c; }
        else { this._ct = null; this._alpha = 1; }
      }
    }
    if (o.n !== undefined) this._name = o.n;
    if (o.r !== undefined) this._ratio = o.r;
    if (o.cd !== undefined) this._clipDepth = o.cd;
    if (o.f) this._filters = o.f.map(toFilter);
    if (o.bm !== undefined) this._blend = BLEND_IDS[o.bm] ?? 'normal';
    if (o.v !== undefined) this._visible = !!o.v;
    if (o.cab !== undefined) this.cacheAsBitmap = !!o.cab;
  }
  // concatenated matrix up to (but excluding) `stop`
  _worldMatrix(stop: DisplayObject | null = null): Matrix {
    const m = this._matrix().clone();
    for (let p = this._parent; p && p !== stop; p = p._parent) mul(m, p._matrix(), m);
    return m;
  }
  _worldCt(): ColorTransform {
    const ct = new ColorTransform();
    const chain: DisplayObject[] = [];
    for (let o: DisplayObject | null = this; o; o = o._parent) chain.push(o);
    for (let i = chain.length - 1; i >= 0; i--) { const o = chain[i]; if (o._ct) ct.concat(o._ct); ct.alphaMultiplier *= o._alpha; }
    return ct;
  }
  localToGlobal(p: Point) { return this._worldMatrix().transformPoint(p); }
  globalToLocal(p: Point) { const m = this._worldMatrix(); m.invert(); return m.transformPoint(p); }
  get mouseX() { return this.globalToLocal(new Point(stageRef?._mx ?? 0, stageRef?._my ?? 0)).x; }
  get mouseY() { return this.globalToLocal(new Point(stageRef?._mx ?? 0, stageRef?._my ?? 0)).y; }

  // local content bounds (untransformed)
  _localBounds(): Rectangle | null { return null; }
  getBounds(target: DisplayObject | null = null): Rectangle {
    const b = this._localBounds();
    if (!b) { const p = this.localToGlobal(new Point()); const q = target ? target.globalToLocal(p) : p; return new Rectangle(q.x, q.y, 0, 0); }
    let m = this._worldMatrix();
    if (target) { const t = target._worldMatrix(); t.invert(); m = mul(m, t); }
    return xformRect(b, m);
  }
  getRect(target: DisplayObject | null = null) { return this.getBounds(target); }
  _parentBounds(): Rectangle | null { const b = this._localBounds(); return b ? xformRect(b, this._matrix()) : null; }
  get width() { return this._parentBounds()?.width ?? 0; }
  set width(v: number) {
    v = +v; if (!(v >= 0)) return; // NaN / negative assignments are ignored (as in Flash/Ruffle)
    const b = this._localBounds();
    if (!b || !b.width) return;
    const cos = Math.abs(Math.cos(this._r1 * DEG)), sin = Math.abs(Math.sin(this._r1 * DEG));
    const cur = b.width * cos * Math.abs(this._sx) + b.height * sin * Math.abs(this._sy);
    if (!cur) { this.scaleX = v / b.width; return; }
    this.scaleX = (Math.abs(this._sx) * v) / cur;
  }
  get height() { return this._parentBounds()?.height ?? 0; }
  set height(v: number) {
    v = +v; if (!(v >= 0)) return;
    const b = this._localBounds();
    if (!b || !b.height) return;
    const cos = Math.abs(Math.cos(this._r1 * DEG)), sin = Math.abs(Math.sin(this._r1 * DEG));
    const cur = b.height * cos * Math.abs(this._sy) + b.width * sin * Math.abs(this._sx);
    if (!cur) { this.scaleY = v / b.height; return; }
    this.scaleY = (Math.abs(this._sy) * v) / cur;
  }
  hitTestPoint(x: number, y: number, shapeFlag = false): boolean {
    if (!shapeFlag) return this.getBounds(stageRef).contains(x, y);
    return this._hitShape(x, y);
  }
  hitTestObject(o: DisplayObject) { return this.getBounds(stageRef).intersects(o.getBounds(stageRef)); }
  // stage-space point test against actual geometry
  _hitShape(x: number, y: number): boolean {
    const m = this._worldMatrix(); m.invert();
    const p = m.transformPoint(new Point(x, y));
    return this._hitLocal(p.x, p.y);
  }
  _hitLocal(x: number, y: number): boolean { const b = this._localBounds(); return !!b && b.contains(x, y); }
  // render own content (children/shapes) with world matrix m and world color transform ct
  _draw(_ctx: CanvasRenderingContext2D, _m: Matrix, _ct: ColorTransform) {}
  _clip(_p: Path2D, _m: Matrix) { const b = this._localBounds(); if (b) { const r = new Path2D(); r.rect(b.x, b.y, b.width, b.height); _p.addPath(r, dom(_m)); } }
  _onStage(_on: boolean) {}
}

export class Transform {
  o: DisplayObject;
  constructor(o: DisplayObject) { this.o = o; }
  get matrix() { return this.o._matrix().clone(); }
  set matrix(m: Matrix) { this.o._setMatrix(m); this.o._scripted = true; }
  get colorTransform() { const c = this.o._ct?.clone() ?? new ColorTransform(); c.alphaMultiplier = this.o._alpha; return c; }
  set colorTransform(c: ColorTransform) { const x = c.clone(); this.o._alpha = Math.trunc(x.alphaMultiplier * 256) / 256; x.alphaMultiplier = 1; this.o._ct = x.isIdentity() ? null : x; }
  get concatenatedMatrix() { return this.o._worldMatrix(); }
  get concatenatedColorTransform() { return this.o._worldCt(); }
  get pixelBounds() { return this.o.getBounds(stageRef); }
}

export const dom = (m: Matrix) => new DOMMatrix([m.a, m.b, m.c, m.d, m.tx, m.ty]);
export function xformRect(b: Rectangle, m: Matrix) {
  const xs = [b.x, b.right, b.x, b.right], ys = [b.y, b.y, b.bottom, b.bottom];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < 4; i++) {
    const x = m.a * xs[i] + m.c * ys[i] + m.tx, y = m.b * xs[i] + m.d * ys[i] + m.ty;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return new Rectangle(x0, y0, x1 - x0, y1 - y0);
}
function toFilter(f: any) { return { ...f, _swf: true }; }

export class InteractiveObject extends DisplayObject {
  mouseEnabled = true; doubleClickEnabled = false; tabEnabled = false; tabIndex = -1; focusRect: any = null;
  contextMenu: any = null; needsSoftKeyboard = false;
}

export class DisplayObjectContainer extends InteractiveObject {
  _ch: DisplayObject[] = [];
  mouseChildren = true; tabChildren = true;
  get numChildren() { return this._ch.length; }
  addChild<T extends DisplayObject>(c: T): T { return this.addChildAt(c, c._parent === this ? this._ch.length - 1 : this._ch.length); }
  addChildAt<T extends DisplayObject>(c: T, i: number): T {
    if (!c) throw new TypeError('Parameter child must be non-null.');
    if (c === (this as any) || (c instanceof DisplayObjectContainer && c.contains(this))) throw new Error('An object cannot be added as a child of itself or one of its children.');
    if (c._parent === this) { this.setChildIndex(c, Math.min(i, this._ch.length - 1)); return c; }
    if (c._parent) c._parent.removeChild(c);
    if (i < 0 || i > this._ch.length) throw new RangeError('The supplied index is out of bounds.');
    this._ch.splice(i, 0, c);
    c._parent = this;
    c._depth = undefined; // script-placed
    this._added(c);
    return c;
  }
  _added(c: DisplayObject) {
    c.dispatchEvent(new Event(Event.ADDED, true));
    if (this.stage) dispatchStage(c, Event.ADDED_TO_STAGE);
  }
  removeChild<T extends DisplayObject>(c: T): T {
    const i = this._ch.indexOf(c);
    if (i < 0) throw new Error('The supplied DisplayObject must be a child of the caller.');
    return this.removeChildAt(i) as T;
  }
  removeChildAt(i: number): DisplayObject {
    const c = this._ch[i];
    if (!c) throw new RangeError('The supplied index is out of bounds.');
    c.dispatchEvent(new Event(Event.REMOVED, true));
    if (this.stage) dispatchStage(c, Event.REMOVED_FROM_STAGE);
    const j = this._ch.indexOf(c);
    if (j >= 0) this._ch.splice(j, 1);
    c._parent = null;
    if (stageRef && stageRef._focus && (c === stageRef._focus || (c instanceof DisplayObjectContainer && c.contains(stageRef._focus)))) stageRef.focus = null;
    return c;
  }
  removeChildren(a = 0, b = 0x7fffffff) { for (let i = Math.min(b, this._ch.length - 1); i >= a; i--) this.removeChildAt(i); }
  getChildAt(i: number) { const c = this._ch[i]; if (!c) throw new RangeError('The supplied index is out of bounds.'); return c; }
  getChildByName(n: string) { return this._ch.find(c => c._name === n) ?? null; }
  getChildIndex(c: DisplayObject) { const i = this._ch.indexOf(c); if (i < 0) throw new Error('The supplied DisplayObject must be a child of the caller.'); return i; }
  setChildIndex(c: DisplayObject, i: number) {
    const j = this.getChildIndex(c);
    if (i < 0 || i >= this._ch.length) throw new RangeError('The supplied index is out of bounds.');
    this._ch.splice(j, 1); this._ch.splice(i, 0, c);
  }
  swapChildren(a: DisplayObject, b: DisplayObject) { this.swapChildrenAt(this.getChildIndex(a), this.getChildIndex(b)); }
  swapChildrenAt(i: number, j: number) { const t = this._ch[i]; this._ch[i] = this._ch[j]; this._ch[j] = t; }
  contains(c: DisplayObject | null): boolean { for (let o = c; o; o = o._parent) if (o === this) return true; return false; }
  getObjectsUnderPoint(p: Point): DisplayObject[] {
    const out: DisplayObject[] = [];
    const walk = (o: DisplayObject) => {
      if (o instanceof DisplayObjectContainer) o._ch.forEach(walk);
      else if (o._hitShape(p.x, p.y)) out.push(o);
    };
    walk(this);
    return out;
  }
  // inserts a timeline-placed child by depth
  _insertTimeline(c: DisplayObject) {
    const d = c._depth!;
    let i = this._ch.findIndex(o => o._depth !== undefined && o._depth > d);
    if (i < 0) i = this._ch.length;
    this._ch.splice(i, 0, c);
    c._parent = this;
  }
  _childAtDepth(d: number) { return this._ch.find(c => c._depth === d) ?? null; }
  _localBounds(): Rectangle | null {
    let r: Rectangle | null = this._ownBounds();
    for (const c of this._ch) {
      const b = c._parentBounds();
      if (b) r = r ? r.union(b) : b;
    }
    return r;
  }
  _ownBounds(): Rectangle | null { return null; }
  _hitLocal(x: number, y: number): boolean {
    for (let i = this._ch.length - 1; i >= 0; i--) {
      const c = this._ch[i];
      if (!c._visible && !(this as any)._isHitArea) continue;
      const m = c._matrix().clone(); m.invert();
      const p = m.transformPoint(new Point(x, y));
      if (c._hitLocal(p.x, p.y)) return true;
    }
    return this._ownHit(x, y);
  }
  _ownHit(_x: number, _y: number) { return false; }
  _draw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    this._drawOwn(ctx, m, ct);
    const ch = this._ch;
    let clipEnd = -1, clipping = false;
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i];
      if (clipping && (c._depth === undefined || c._depth > clipEnd)) { ctx.restore(); clipping = false; }
      if (c._clipDepth) {
        if (clipping) { ctx.restore(); clipping = false; }
        const p = new Path2D();
        c._clip(p, mul(c._matrix(), m));
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clip(p);
        clipping = true; clipEnd = c._clipDepth;
        continue;
      }
      renderObject(c, ctx, m, ct);
    }
    if (clipping) ctx.restore();
  }
  _drawOwn(_ctx: CanvasRenderingContext2D, _m: Matrix, _ct: ColorTransform) {}
  _clip(p: Path2D, m: Matrix) { for (const c of this._ch) if (c._visible || true) c._clip(p, mul(c._matrix(), m)); }
  _onStage(on: boolean) { for (const c of this._ch) c._onStage(on); }
}

function dispatchStage(o: DisplayObject, type: string) {
  o.dispatchEvent(new Event(type));
  o._onStage(type === Event.ADDED_TO_STAGE);
  if (o instanceof DisplayObjectContainer) for (const c of o._ch.slice()) dispatchStage(c, type);
}

export class Sprite extends DisplayObjectContainer {
  _g: Graphics | null = null;
  buttonMode = false; useHandCursor = true; hitArea: Sprite | null = null; soundTransform: any = null;
  dropTarget: DisplayObject | null = null;
  get graphics() { return (this._g ??= new Graphics()); }
  _ownBounds() { return this._g?.bounds?.clone() ?? null; }
  _ownHit(x: number, y: number) { return !!this._g && hitDraws(this._g.renderDraws, x, y); }
  _drawOwn(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    if (this._g?.draws.length || this._g?.renderDraws.length) {
      ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
      drawDraws(ctx, this._g.renderDraws, ct, 1, worldScale(m));
    }
  }
  _clip(p: Path2D, m: Matrix) { if (this._g) for (const d of this._g.renderDraws) if (d.f) p.addPath(d.p ?? (d.p = path(d.d)), dom(m)); super._clip(p, m); }
  startDrag(lockCenter = false, bounds: Rectangle | null = null) { stageRef?._startDrag(this, lockCenter, bounds); }
  stopDrag() { stageRef?._stopDrag(this); }
}

export class Shape extends DisplayObject {
  _g: Graphics | null = null;
  _def: any = null;
  get graphics() { return (this._g ??= new Graphics()); }
  _localBounds() {
    if (this._def) { const b = this._def.b; return new Rectangle(b[0], b[1], b[2] - b[0], b[3] - b[1]); }
    return this._g?.bounds?.clone() ?? null;
  }
  _draws() { return this._def ? this._def.dr : this._g ? this._g.renderDraws : []; }
  _hitLocal(x: number, y: number) { const b = this._localBounds(); return !!b && b.contains(x, y) && hitDraws(this._draws(), x, y); }
  _draw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    const g = this._parent?._grid9;
    if (g && this._def) { draw9(ctx, this, m, ct, g); return; }
    if (this._def && drawCached(ctx, this._def, this._localBounds()!, m, ct, (c, cm) => this._drawRaw(c, cm, ct))) return;
    this._drawRaw(ctx, m, ct);
  }
  _drawRaw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    drawDraws(ctx, this._draws(), ct, 1, worldScale(m));
  }
  _clip(p: Path2D, m: Matrix) { const dm = dom(m); for (const d of this._draws()) if (d.f) p.addPath(d.p ?? (d.p = path(d.d)), dm); }
}

// Draws a shape inside a 9-slice scaled sprite: geometry is remapped so corners keep their size.
function draw9(ctx: CanvasRenderingContext2D, s: Shape, m: Matrix, ct: ColorTransform, info: any) {
  const { grid, sx, sy, b } = info;
  const map = (v: number, lo: number, hi: number, b0: number, b1: number, sc: number) => {
    if (sc === 1) return v;
    const L = lo - b0, R = b1 - hi, total = (b1 - b0) * sc, mid = Math.max(0, total - L - R);
    const k = hi - lo ? mid / (hi - lo) : 0;
    const base = b0 * sc;
    if (v <= lo) return base + (v - b0);
    if (v >= hi) return base + total - (b1 - v);
    return base + L + (v - lo) * k;
  };
  const key = `${sx},${sy}`;
  const cache = (s._def.__g9 ??= {});
  let draws = cache[key];
  if (!draws) {
    draws = s._def.dr.map((d: any) => ({
      ...d, p: undefined,
      d: d.d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_: string, x: string, y: string) =>
        `${Math.round(map(+x, grid.x, grid.right, b.x, b.right, sx) * 100) / 100} ${Math.round(map(+y, grid.y, grid.bottom, b.y, b.bottom, sy) * 100) / 100}`),
    }));
    if (Object.keys(cache).length > 16) s._def.__g9 = {};
    s._def.__g9[key] = draws;
  }
  // m includes the parent's scale; remove it since geometry is pre-scaled
  const n = new Matrix(m.a / sx, m.b / sx, m.c / sy, m.d / sy, m.tx, m.ty);
  ctx.setTransform(n.a, n.b, n.c, n.d, n.tx, n.ty);
  drawDraws(ctx, draws, ct, 1, worldScale(n));
}

export class StaticText extends DisplayObject {
  _def: any;
  constructor(def: any) { super(); this._def = def; }
  get text() { return ''; }
  _localBounds() { const b = this._def.b; return new Rectangle(b[0], b[1], b[2] - b[0], b[3] - b[1]); }
  _draw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    if (drawCached(ctx, this._def, this._localBounds(), m, ct, (c, cm) => this._drawRaw(c, cm, ct))) return;
    this._drawRaw(ctx, m, ct);
  }
  _drawRaw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    const t = this._def;
    const tm = mul(Matrix.from(t.m), m);
    for (const r of t.recs) {
      const font = pack.chars[r.f];
      if (!font) continue;
      const s = r.h / 1024;
      let x = r.x;
      ctx.fillStyle = ct.apply(r.c);
      for (let i = 0; i < r.g.length; i += 2) {
        const gd = font.g[r.g[i]];
        if (gd) {
          ctx.setTransform(tm.a * s, tm.b * s, tm.c * s, tm.d * s, tm.a * x + tm.c * r.y + tm.tx, tm.b * x + tm.d * r.y + tm.ty);
          ctx.fill(path(gd), 'evenodd');
        }
        x += r.g[i + 1];
      }
    }
  }
}

// ---------------------------------------------------------------- MovieClip
export class MovieClip extends Sprite {
  _frames: any[][] = [[]];
  _labels: Record<string, number> = {};
  _cur = 0;
  _playing = true;
  _scripts: Record<number, Function> | null = null;
  _sym = 0;
  _grid9: any = null;
  enabled = true; trackAsMenu = false;
  constructor() {
    super();
    const sym = (new.target as any).__sym;
    const id = typeof sym === 'number' ? sym : sym !== undefined ? pack.symbols[sym] : undefined;
    if (id !== undefined) this._initTimeline(id);
    else this._cur = 1; // a clip without a library timeline is on its (empty) frame 1
  }
  _initTimeline(id: number) {
    const def = pack.chars[id];
    if (!def || def.t !== 'sprite') { this._cur = 1; return; }
    this._cur = 0;
    this._sym = id;
    this._frames = def.fr;
    this._labels = def.lb ?? {};
    if (def.grid) this._grid = new Rectangle(def.grid[0], def.grid[1], def.grid[2] - def.grid[0], def.grid[3] - def.grid[1]);
    this._goto(1, false);
  }
  get currentFrame() { return this._cur || 1; }
  get totalFrames() { return this._frames.length; }
  get framesLoaded() { return this._frames.length; }
  get isPlaying() { return this._playing; }
  get currentLabel(): string | null {
    let best: string | null = null, bf = 0;
    for (const [n, f] of Object.entries(this._labels)) if (f <= this._cur && f >= bf) { best = n; bf = f; }
    return best;
  }
  get currentFrameLabel(): string | null { for (const [n, f] of Object.entries(this._labels)) if (f === this._cur) return n; return null; }
  get currentLabels() { return Object.entries(this._labels).map(([name, frame]) => ({ name, frame })); }
  get currentScene() { return { name: 'Scene 1', labels: this.currentLabels, numFrames: this.totalFrames }; }
  addFrameScript(...args: any[]) {
    this._scripts ??= {};
    for (let i = 0; i < args.length; i += 2) {
      if (args[i + 1]) this._scripts[args[i] + 1] = args[i + 1]; else delete this._scripts[args[i] + 1];
    }
    // frame 1 script of a freshly constructed clip runs in the next script phase
    if (this._cur && this._scripts[this._cur] && !frameScriptQueue.includes(this)) frameScriptQueue.push(this);
  }
  play() { this._playing = true; }
  stop() { this._playing = false; }
  gotoAndStop(f: any, _scene: any = null) { this._playing = false; this._gotoScript(f); }
  gotoAndPlay(f: any, _scene: any = null) { this._playing = true; this._gotoScript(f); }
  nextFrame() { this._playing = false; if (this._cur < this._frames.length) this._gotoScript(this._cur + 1); }
  prevFrame() { this._playing = false; if (this._cur > 1) this._gotoScript(this._cur - 1); }
  nextScene() {} prevScene() {}
  _frameNum(f: any): number {
    if (typeof f === 'string') { const n = this._labels[f]; if (n) return n; const k = parseInt(f); return k === k ? k : 0; }
    return Math.trunc(+f);
  }
  _gotoScript(f: any) {
    let n = this._frameNum(f);
    if (!n) return;
    n = Math.max(1, Math.min(n, this._frames.length));
    if (n === this._cur) return;
    this._goto(n, true);
    this._runScript();
  }
  _runScript() {
    const fn = this._scripts?.[this._cur];
    if (fn) fn.call(this);
  }
  // natural playback: called once per frame for clips on stage
  _advance() {
    if (!this._playing || this._frames.length <= 1) return;
    const n = this._cur >= this._frames.length ? 1 : this._cur + 1;
    this._goto(n, false);
    if (this._scripts?.[this._cur]) frameScriptQueue.push(this);
  }
  _goto(n: number, _byScript: boolean) {
    const from = this._cur;
    const back = n <= from;
    // accumulate timeline ops between current state and target
    const ops = new Map<number, any>();
    const start = back ? 1 : from + 1;
    for (let f = start; f <= n; f++) {
      for (const o of this._frames[f - 1]) {
        if (o.rm !== undefined) { ops.set(o.rm, { rm: true, frame: f }); continue; }
        const prev = ops.get(o.d);
        if (o.c !== undefined && !(o.mv && prev && !prev.rm && prev.c === o.c)) ops.set(o.d, { ...o, frame: f, fresh: true });
        else if (prev && !prev.rm) ops.set(o.d, { ...prev, ...o, c: prev.c, fresh: prev.fresh, frame: prev.frame });
        else ops.set(o.d, { ...o, frame: f, fresh: false });
      }
    }
    this._cur = n;
    if (back) {
      // remove timeline children not present (or re-placed later than) the target frame
      for (const c of this._ch.slice()) {
        if (c._depth === undefined) continue;
        const o = ops.get(c._depth);
        if (!o || o.rm || !o.fresh || c._placeFrame > n || o.c !== c._charId || o.frame !== c._placeFrame) this._removeTimeline(c);
      }
    }
    for (const [d, o] of ops) {
      const ex = this._childAtDepth(d);
      if (o.rm) { if (ex && !back) this._removeTimeline(ex); continue; }
      if (ex && (!o.fresh || (back && ex._charId === o.c && ex._placeFrame === o.frame))) { ex._applyPlace(o, false); continue; }
      if (ex && o.fresh) this._removeTimeline(ex);
      if (o.c === undefined) continue;
      this._place(o);
    }
  }
  _removeTimeline(c: DisplayObject) {
    if (c._parent !== this) return;
    this.removeChild(c);
    if (c._name && (this as any)[c._name] === c) (this as any)[c._name] = null;
  }
  _place(o: any) {
    const def = pack.chars[o.c];
    if (!def) return;
    let child: DisplayObject;
    PENDING = { o, frame: o.frame, parent: this };
    try {
      const cls = def.t === 'sprite' || def.t === 'button' || def.t === 'edit' ? classForChar(o.c) : null;
      if (cls) child = new cls();
      else if (def.t === 'sprite') { child = new MovieClip(); (child as MovieClip)._initTimeline(o.c); }
      else if (def.t === 'shape') { child = new Shape(); (child as Shape)._def = def; }
      else if (def.t === 'text') child = new StaticText(def);
      else if (def.t === 'edit') child = factories.edit(def);
      else if (def.t === 'button') child = new SimpleButton(def);
      else if (def.t === 'bitmap') child = new Bitmap(BitmapData._fromChar(o.c), 'auto', false);
      else { PENDING = null; return; }
    } finally { if (PENDING) { PENDING = null; } }
    child._charId = o.c;
    if (child._parent !== this) { child._applyPlace(o, true); child._depth = o.d; child._placeFrame = o.frame; this._insertTimeline(child); }
    if (o.n) (this as any)[o.n] = child;
    this._added(child);
  }
  _draw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    if (this._grid && (Math.abs(this._sx - 1) > 1e-3 || Math.abs(this._sy - 1) > 1e-3)) {
      const b = this._localBoundsNoGrid();
      this._grid9 = b ? { grid: this._grid, sx: this._sx, sy: this._sy, b } : null;
    } else this._grid9 = null;
    super._draw(ctx, m, ct);
  }
  _localBoundsNoGrid() { return super._localBounds(); }
}

// ---------------------------------------------------------------- SimpleButton
export class SimpleButton extends InteractiveObject {
  upState: DisplayObject | null = null; overState: DisplayObject | null = null; downState: DisplayObject | null = null; hitTestState: DisplayObject | null = null;
  enabled = true; useHandCursor = true; trackAsMenu = false; soundTransform: any = null;
  _state = 'up';
  constructor(def: any = null) {
    super();
    if (def) {
      const mk = (bit: number) => {
        const recs = def.recs.filter((r: any) => r.s & bit);
        if (!recs.length) return null;
        const c = new Sprite();
        for (const r of recs.sort((a: any, b: any) => a.d - b.d)) {
          const fake = new MovieClip();
          fake._frames = [[{ d: r.d, c: r.c, m: r.m, x: r.x ?? 0, f: r.f, bm: r.bm }]];
          fake._goto(1, false);
          for (const ch of fake._ch.slice()) { fake.removeChild(ch); c.addChild(ch); }
        }
        c._parent = this as any;
        return c;
      };
      this.upState = mk(1); this.overState = mk(2); this.downState = mk(4); this.hitTestState = mk(8);
      for (const s of [this.upState, this.overState, this.downState, this.hitTestState]) if (s) s._parent = this as any;
    }
  }
  get _cur(): DisplayObject | null { return this._state === 'over' ? this.overState : this._state === 'down' ? this.downState : this.upState; }
  _localBounds() { return this._cur?._parentBounds() ?? null; }
  _hitLocal(x: number, y: number) { const h = this.hitTestState; if (!h) return false; const m = h._matrix().clone(); m.invert(); const p = m.transformPoint(new Point(x, y)); return h._hitLocal(p.x, p.y); }
  _draw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) { const s = this._cur; if (s) renderObject(s, ctx, m, ct); }
}

// ---------------------------------------------------------------- Bitmap / BitmapData
export class BitmapData {
  _w: number; _h: number; transparent: boolean;
  _img: any = null; // untouched source image
  _c: HTMLCanvasElement | null = null;
  _x: CanvasRenderingContext2D | null = null;
  _disposed = false;
  constructor(width: number, height: number, transparent = true, fillColor = 0xffffffff) {
    const sym = (new.target as any).__sym;
    const id = typeof sym === 'number' ? sym : sym !== undefined ? pack.symbols[sym] : undefined;
    if (id !== undefined && images[id]) {
      const im: any = images[id];
      this._img = im; this._w = im.width; this._h = im.height; this.transparent = true;
      return;
    }
    this._w = Math.max(0, Math.trunc(width)); this._h = Math.max(0, Math.trunc(height));
    // Flash Player 11+ limits: 8191 px per side, 16,777,215 px total (ArgumentError #2015)
    if ((this._w === 0 || this._h === 0 || this._w > 8191 || this._h > 8191 || this._w * this._h > 16777215) && id === undefined) throw new Error('Error #2015: Invalid BitmapData.');
    this.transparent = transparent;
    const fc = transparent ? fillColor >>> 0 : (fillColor | 0xff000000) >>> 0;
    if (fc >>> 24) { this._ctx().fillStyle = argbCss(fc); this._x!.fillRect(0, 0, this._w, this._h); }
  }
  // a BitmapData sharing a library image (PlaceObject3 with HasImage places bitmaps directly)
  static _fromChar(id: number): BitmapData {
    const b: BitmapData = Object.create(BitmapData.prototype);
    const im: any = images[id];
    Object.assign(b, { _img: im, _c: null, _x: null, _disposed: false, _pix: null, _pixDirty: false, _w: im?.width ?? 0, _h: im?.height ?? 0, transparent: true });
    return b;
  }
  get width() { return this._w; }
  get height() { return this._h; }
  get rect() { return new Rectangle(0, 0, this._w, this._h); }
  // Pixel-level ops (getPixel/setPixel) work on a CPU-side copy that is read back once and written
  // back lazily; per-pixel getImageData/putImageData on a GPU canvas stalls the whole GPU pipeline.
  _pix: ImageData | null = null; _pixDirty = false;
  _src(): any {
    if (this._pixDirty) { this._raw().putImageData(this._pix!, 0, 0); this._pixDirty = false; }
    return this._c ?? this._img ?? this._raw().canvas;
  }
  _raw(): CanvasRenderingContext2D {
    if (!this._x) {
      this._c = newCanvas(this._w, this._h);
      this._x = this._c.getContext('2d')!;
      if (this._img) { this._x.drawImage(this._img, 0, 0); this._img = null; }
    }
    return this._x;
  }
  // context for canvas-level ops: syncs pending pixel writes and drops the pixel copy
  _ctx(): CanvasRenderingContext2D {
    const x = this._raw();
    if (this._pix) { if (this._pixDirty) x.putImageData(this._pix, 0, 0); this._pix = null; this._pixDirty = false; }
    return x;
  }
  _pixels(): Uint8ClampedArray {
    if (!this._pix) this._pix = this._raw().getImageData(0, 0, Math.max(1, this._w), Math.max(1, this._h));
    return this._pix.data;
  }
  _changed() { this._ver = (this._ver ?? 0) + 1; }
  [k: string]: any;
  clone() { const b = new BitmapData(this._w || 1, this._h || 1, this.transparent, 0); b._ctx().drawImage(this._src(), 0, 0); return b; }
  dispose() { this._disposed = true; freeCanvas(this._c); this._c = null; this._x = null; this._img = null; this._pix = null; this._pixDirty = false; }
  lock() {} unlock() {}
  fillRect(r: Rectangle, color: number) {
    const x = this._ctx();
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(r.x, r.y, r.width, r.height);
    const c = this.transparent ? color >>> 0 : (color | 0xff000000) >>> 0;
    if (c >>> 24) { x.fillStyle = argbCss(c); x.fillRect(r.x, r.y, r.width, r.height); }
    x.restore(); this._changed();
  }
  copyPixels(src: BitmapData, r: Rectangle, p: Point, _alphaBmd: any = null, _alphaPt: any = null, mergeAlpha = false) {
    const x = this._ctx();
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
    if (!mergeAlpha) x.clearRect(p.x, p.y, r.width, r.height);
    if (r.width > 0 && r.height > 0) x.drawImage(src._src(), r.x, r.y, r.width, r.height, p.x, p.y, r.width, r.height);
    x.restore(); this._changed();
  }
  draw(source: any, matrix: Matrix | null = null, ct: ColorTransform | null = null, blend: any = null, clip: Rectangle | null = null, smoothing = false) {
    const x = this._ctx();
    x.save();
    x.setTransform(1, 0, 0, 1, 0, 0);
    if (clip) { x.beginPath(); x.rect(clip.x, clip.y, clip.width, clip.height); x.clip(); }
    const op = blendOp(blend); if (op) x.globalCompositeOperation = op;
    const m = matrix ?? IDM;
    if (source instanceof BitmapData) {
      x.imageSmoothingEnabled = smoothing;
      x.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
      const img = ct && !ct.isIdentity() ? recolor(source._src(), ct, source._ver ?? 0) : source._src();
      if (ct) x.globalAlpha = Math.max(0, Math.min(1, ct.alphaMultiplier));
      x.drawImage(img, 0, 0);
    } else if (source instanceof DisplayObject) {
      x.imageSmoothingEnabled = true;
      renderContent(source, x, m, ct ?? ID_CT);
    }
    x.restore(); this._changed();
  }
  drawWithQuality(source: any, matrix: Matrix | null = null, ct: ColorTransform | null = null, blend: any = null, clip: Rectangle | null = null, smoothing = false, _q: any = null) { this.draw(source, matrix, ct, blend, clip, smoothing); }
  _data(r = this.rect) { this._src(); return this._raw().getImageData(r.x, r.y, Math.max(1, r.width), Math.max(1, r.height)); }
  getPixel32(px: number, py: number) {
    px = Math.trunc(px); py = Math.trunc(py);
    if (px < 0 || py < 0 || px >= this._w || py >= this._h || this._disposed) return 0;
    const d = this._pixels(), i = (py * this._w + px) * 4;
    return ((d[i + 3] << 24) | (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]) >>> 0;
  }
  getPixel(px: number, py: number) { return this.getPixel32(px, py) & 0xffffff; }
  setPixel32(px: number, py: number, c: number) {
    px = Math.trunc(px); py = Math.trunc(py);
    if (px < 0 || py < 0 || px >= this._w || py >= this._h || this._disposed) return;
    const d = this._pixels(), i = (py * this._w + px) * 4;
    d[i] = (c >> 16) & 255; d[i + 1] = (c >> 8) & 255; d[i + 2] = c & 255; d[i + 3] = this.transparent ? (c >>> 24) & 255 : 255;
    this._pixDirty = true; this._changed();
  }
  setPixel(px: number, py: number, c: number) { this.setPixel32(px, py, (0xff000000 | c) >>> 0); }
  getPixels(r: Rectangle) { const d = this._data(r).data; const out: number[] = []; for (let i = 0; i < d.length; i += 4) out.push(d[i + 3], d[i], d[i + 1], d[i + 2]); return out; }
  setPixels(r: Rectangle, bytes: any) {
    const x = this._ctx(); const img = x.createImageData(r.width, r.height); const src: Uint8Array = bytes._u8 ?? bytes;
    const p = bytes.position ?? 0, n = Math.min(img.data.length, src.length - p) & ~3;
    // ARGB (big-endian bytes) -> RGBA, one 32-bit word per pixel (little-endian platforms)
    const words = (p & 3) === 0 && src.byteOffset % 4 === 0 ? new Uint32Array(src.buffer, src.byteOffset + p, n >> 2) : new Uint32Array(src.slice(p, p + n).buffer);
    const out = new Uint32Array(img.data.buffer, 0, n >> 2);
    for (let i = 0; i < out.length; i++) { const w = words[i]; out[i] = (w >>> 8) | (w << 24); }
    if (bytes.position !== undefined) bytes.position = p + n;
    x.putImageData(img, r.x, r.y); this._changed();
  }
  colorTransform(r: Rectangle, ct: ColorTransform) {
    const x = this._ctx(); const d = this._data(r); const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      p[i] = p[i] * ct.redMultiplier + ct.redOffset; p[i + 1] = p[i + 1] * ct.greenMultiplier + ct.greenOffset;
      p[i + 2] = p[i + 2] * ct.blueMultiplier + ct.blueOffset; p[i + 3] = p[i + 3] * ct.alphaMultiplier + ct.alphaOffset;
    }
    x.putImageData(d, r.x, r.y); this._changed();
  }
  applyFilter(src: BitmapData, r: Rectangle, p: Point, filter: any) {
    if (filter?.matrix && filter.constructor?.name?.includes('ColorMatrix')) {
      const s = src === this ? this._data(r) : src._data(r);
      const m = filter.matrix, d = s.data;
      for (let i = 0; i < d.length; i += 4) {
        const R = d[i], G = d[i + 1], B = d[i + 2], A = d[i + 3];
        d[i] = m[0] * R + m[1] * G + m[2] * B + m[3] * A + m[4];
        d[i + 1] = m[5] * R + m[6] * G + m[7] * B + m[8] * A + m[9];
        d[i + 2] = m[10] * R + m[11] * G + m[12] * B + m[13] * A + m[14];
        d[i + 3] = m[15] * R + m[16] * G + m[17] * B + m[18] * A + m[19];
      }
      this._ctx().putImageData(s, p.x, p.y);
    } else if (src !== this) this.copyPixels(src, r, p);
    this._changed();
  }
  getColorBoundsRect(mask: number, color: number, findColor = true) {
    const d = this._data().data; let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (let y = 0; y < this._h; y++) for (let x = 0; x < this._w; x++) {
      const i = (y * this._w + x) * 4;
      const v = ((d[i + 3] << 24) | (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]) >>> 0;
      if ((((v & mask) >>> 0) === (color >>> 0)) === findColor) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return x1 < 0 ? new Rectangle() : new Rectangle(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  }
  floodFill(px: number, py: number, color: number) {
    const x = this._ctx(); const img = this._data(); const d = img.data; const w = this._w, h = this._h;
    const at = (i: number) => ((d[i * 4 + 3] << 24) | (d[i * 4] << 16) | (d[i * 4 + 1] << 8) | d[i * 4 + 2]) >>> 0;
    const target = at(py * w + px); if (target === (color >>> 0)) return;
    const st = [py * w + px];
    while (st.length) {
      const i = st.pop()!; if (at(i) !== target) continue;
      d[i * 4] = (color >> 16) & 255; d[i * 4 + 1] = (color >> 8) & 255; d[i * 4 + 2] = color & 255; d[i * 4 + 3] = (color >>> 24) & 255;
      const cx = i % w, cy = (i / w) | 0;
      if (cx > 0) st.push(i - 1); if (cx < w - 1) st.push(i + 1); if (cy > 0) st.push(i - w); if (cy < h - 1) st.push(i + w);
    }
    x.putImageData(img, 0, 0); this._changed();
  }
  hitTest(firstPoint: Point, alphaThreshold: number, second: any) {
    if (second instanceof Point) { const v = this.getPixel32(second.x - firstPoint.x, second.y - firstPoint.y); return (v >>> 24) >= alphaThreshold; }
    if (second instanceof Rectangle) return new Rectangle(firstPoint.x, firstPoint.y, this._w, this._h).intersects(second);
    return false;
  }
  scroll(dx: number, dy: number) { const c = this.clone(); this.fillRect(this.rect, 0); this._ctx().drawImage(c._src(), dx, dy); this._changed(); }
  encode(_r: Rectangle, _opts: any, _ba: any = null) { return this._ctx().canvas.toDataURL('image/png'); }
}
const argbCss = (c: number) => `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${((c >>> 24) & 255) / 255})`;

export class Bitmap extends DisplayObject {
  _bd: BitmapData | null; pixelSnapping: string; smoothing: boolean;
  constructor(bitmapData: BitmapData | null = null, pixelSnapping = 'auto', smoothing = false) {
    super(); this._bd = bitmapData; this.pixelSnapping = pixelSnapping; this.smoothing = smoothing;
  }
  get bitmapData() { return this._bd; }
  set bitmapData(v) { this._bd = v; }
  _localBounds() { return this._bd ? new Rectangle(0, 0, this._bd.width, this._bd.height) : null; }
  _draw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    const bd = this._bd; if (!bd || bd._disposed) return;
    const img = bd._src();
    // pixel snapping 'auto': snap translation when untransformed (keeps blocks crisp)
    if (m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1) ctx.setTransform(1, 0, 0, 1, Math.round(m.tx), Math.round(m.ty));
    else ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    ctx.imageSmoothingEnabled = this.smoothing;
    const a = ct.alphaMultiplier;
    if (a <= 0) return;
    const ga = ctx.globalAlpha; ctx.globalAlpha = ga * Math.min(1, a);
    ctx.drawImage(ct.onlyAlpha() ? img : recolor(img, ct, bd._ver ?? 0), 0, 0);
    ctx.globalAlpha = ga;
  }
  _clip(p: Path2D, m: Matrix) { if (this._bd) { const r = new Path2D(); r.rect(0, 0, this._bd.width, this._bd.height); p.addPath(r, dom(m)); } }
}

// ---------------------------------------------------------------- rendering
export function renderObject(o: DisplayObject, ctx: CanvasRenderingContext2D, pm: Matrix, pct: ColorTransform) {
  if (!o._visible || o._maskOf) return;
  const m = mul(o._matrix(), pm);
  let ct = pct;
  if (o._ct || o._alpha !== 1) {
    ct = pct.clone();
    if (o._ct) ct.concat(o._ct);
    ct.alphaMultiplier *= o._alpha;
  }
  if (ct.alphaMultiplier <= 0 && ct.alphaOffset <= 0) return;
  // skip leaf objects entirely outside the target canvas (Flash doesn't rasterize off-screen content either)
  if (!(o instanceof DisplayObjectContainer) && offCanvas(o, m, ctx)) return;
  renderWith(o, ctx, m, ct);
}
function offCanvas(o: DisplayObject, m: Matrix, ctx: CanvasRenderingContext2D): boolean {
  const b = o._localBounds();
  if (!b) return false;
  const pad = o._filters.length ? 64 * Math.max(Math.abs(m.a) + Math.abs(m.b), Math.abs(m.c) + Math.abs(m.d)) + 8 : 2;
  const x0 = b.x, y0 = b.y, x1 = b.x + b.width, y1 = b.y + b.height;
  const ax = m.a * x0, ax1 = m.a * x1, cy = m.c * y0, cy1 = m.c * y1, bx = m.b * x0, bx1 = m.b * x1, dy = m.d * y0, dy1 = m.d * y1;
  const minX = Math.min(ax, ax1) + Math.min(cy, cy1) + m.tx, maxX = Math.max(ax, ax1) + Math.max(cy, cy1) + m.tx;
  const minY = Math.min(bx, bx1) + Math.min(dy, dy1) + m.ty, maxY = Math.max(bx, bx1) + Math.max(dy, dy1) + m.ty;
  const c = ctx.canvas;
  return maxX < -pad || maxY < -pad || minX > c.width + pad || minY > c.height + pad;
}
function renderWith(o: DisplayObject, ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
  const masked = o._mask, sr = o._scrollRect, filt = o._filters.length ? o._filters : null, op = o._blend !== 'normal' ? blendOp(o._blend) : null;
  if (!masked && !sr && !filt && !op) { o._draw(ctx, m, ct); return; }
  ctx.save();
  if (masked) {
    const p = new Path2D();
    masked._clip(p, mul(masked._worldMatrix(), BASE));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clip(p);
  }
  if (sr) {
    ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    ctx.beginPath(); ctx.rect(0, 0, sr.width, sr.height); ctx.clip();
    m = mul(new Matrix(1, 0, 0, 1, -sr.x, -sr.y), m);
  }
  if (op) ctx.globalCompositeOperation = op;
  if (filt && !applyFilters(ctx, filt, m, o)) { ctx.restore(); return; }
  o._draw(ctx, m, ct);
  ctx.restore();
}
// Canvas filters run over a layer as large as the current clip, i.e. the whole canvas, which is very
// expensive; clip to the object's device bounds grown by the filters' reach first. Returns false when
// the object is entirely off-canvas.
function applyFilters(ctx: CanvasRenderingContext2D, fs: any[], m: Matrix, o: DisplayObject): boolean {
  const s = worldScale(m);
  const lb = o._localBounds();
  if (lb && lb.width > 0 && lb.height > 0) {
    let reach = 0;
    for (const f of fs) reach = Math.max(reach, ((f.bx ?? f.blurX ?? 4) + (f.by ?? f.blurY ?? 4)) * 1.5 + Math.abs(f.dist ?? f.distance ?? 0) + 2);
    const b = xformRect(lb, m), r = reach * s;
    const x0 = Math.max(0, Math.floor(b.x - r)), y0 = Math.max(0, Math.floor(b.y - r));
    const x1 = Math.min(ctx.canvas.width, Math.ceil(b.x + b.width + r)), y1 = Math.min(ctx.canvas.height, Math.ceil(b.y + b.height + r));
    if (x1 <= x0 || y1 <= y0) return false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
  }
  const css: string[] = [];
  for (const f of fs) {
    const t = f._swf ? f.t : f._t;
    if (t === 'blur') css.push(`blur(${(((f.bx ?? f.blurX) + (f.by ?? f.blurY)) / 4) * s}px)`);
    else if ((t === 'glow' || t === 'shadow') && !f.inner) {
      const col = f._swf ? f.c : (((Math.round((f.alpha ?? 1) * 255) & 255) << 24) | (f.color & 0xffffff)) >>> 0;
      const a = ((col >>> 24) & 255) / 255 * Math.min(1, (f.str ?? f.strength ?? 1));
      if (a <= 0) continue;
      const blur = (((f.bx ?? f.blurX ?? 4) + (f.by ?? f.blurY ?? 4)) / 4) * s;
      const dist = t === 'shadow' ? (f.dist ?? f.distance ?? 4) * s : 0, ang = t === 'shadow' ? (f._swf ? f.a : (f.angle ?? 45) * DEG) : 0;
      css.push(`drop-shadow(${Math.cos(ang) * dist}px ${Math.sin(ang) * dist}px ${blur}px rgba(${(col >> 16) & 255},${(col >> 8) & 255},${col & 255},${a}))`);
    }
  }
  if (css.length && 'filter' in ctx) ctx.filter = css.join(' ');
  return true;
}
// renders a display object's content ignoring its own transform (BitmapData.draw semantics)
export function renderContent(o: DisplayObject, ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
  renderWith(o, ctx, m, ct);
}

// ---------------------------------------------------------------- Stage
export class LoaderInfo extends EventDispatcher {
  parameters: Record<string, string> = {};
  url = location.href; bytes: any = null; width = 675; height = 480; frameRate = 30;
  uncaughtErrorEvents = new EventDispatcher();
  applicationDomain = { hasDefinition: () => true };
}
export const loaderInfo = new LoaderInfo();

export class Stage extends DisplayObjectContainer {
  stageWidth = 675; stageHeight = 480; frameRate = 30; quality = 'high'; scaleMode = 'showAll'; align = '';
  displayState = 'normal'; showDefaultContextMenu = true; stageFocusRect = false; color = 0x666666;
  fullScreenSourceRect: any = null; mouseLock = false; allowsFullScreen = true;
  _focus: InteractiveObject | null = null;
  _mx = 0; _my = 0;
  _drag: any = null;
  constructor() { super(); stageRef = this; }
  get focus() { return this._focus; }
  set focus(v: InteractiveObject | null) { const o = this._focus; if (o === v) return; this._focus = v; (o as any)?._blur?.(); (v as any)?._focusIn?.(); }
  invalidate() {}
  _startDrag(s: Sprite, lock: boolean, bounds: Rectangle | null) {
    const p = s._parent ? s._parent.globalToLocal(new Point(this._mx, this._my)) : new Point(this._mx, this._my);
    this._drag = { s, ox: lock ? 0 : s.x - p.x, oy: lock ? 0 : s.y - p.y, bounds };
  }
  _stopDrag(s: Sprite) { if (this._drag?.s === s) this._drag = null; }
  _updateDrag() {
    const d = this._drag; if (!d) return;
    const s = d.s; const p = s._parent ? s._parent.globalToLocal(new Point(this._mx, this._my)) : new Point(this._mx, this._my);
    let x = p.x + d.ox, y = p.y + d.oy;
    if (d.bounds) { x = Math.max(d.bounds.left, Math.min(d.bounds.right, x)); y = Math.max(d.bounds.top, Math.min(d.bounds.bottom, y)); }
    s.x = x; s.y = y;
  }
}
