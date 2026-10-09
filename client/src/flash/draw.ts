// Canvas2D drawing primitives for Flash vector shapes, gradients, bitmaps and color transforms.
import { ColorTransform, Matrix } from './geom.ts';
import { images } from './assets.ts';
import { newCanvas, freeCanvas } from './canvas.ts';

const pathCache = new Map<string, Path2D>();
export function path(d: string): Path2D {
  let p = pathCache.get(d);
  if (!p) { p = new Path2D(d); pathCache.set(d, p); }
  return p;
}

export const ID_CT = new ColorTransform();
// Weakly keyed so recolored copies die with their source; versioned so redrawn BitmapData isn't stale.
const recolorCache = new WeakMap<object, Map<string, HTMLCanvasElement>>();

// Returns a canvas with the color transform baked in (Flash applies cxforms per pixel).
export function recolor(img: CanvasImageSource & { width: number; height: number }, ct: ColorTransform, ver = 0): CanvasImageSource {
  if (ct.onlyAlpha()) return img;
  let m = recolorCache.get(img);
  if (!m) { m = new Map(); recolorCache.set(img, m); }
  const k = ver + '|' + ct.key();
  let c = m.get(k);
  if (c) { m.delete(k); m.set(k, c); return c; }
  c = newCanvas(img.width || 1, img.height || 1);
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.drawImage(img, 0, 0);
  if (img.width && img.height) {
    const d = x.getImageData(0, 0, c.width, c.height);
    const p = d.data;
    const { redMultiplier: rm, greenMultiplier: gm, blueMultiplier: bm, redOffset: ro, greenOffset: go, blueOffset: bo } = ct;
    for (let i = 0; i < p.length; i += 4) {
      if (!p[i + 3]) continue;
      p[i] = p[i] * rm + ro; p[i + 1] = p[i + 1] * gm + go; p[i + 2] = p[i + 2] * bm + bo;
    }
    x.putImageData(d, 0, 0);
  }
  // small LRU per source; release evicted backing stores right away
  while (m.size >= 8) { const [ok, oc] = m.entries().next().value!; freeCanvas(oc); m.delete(ok); }
  m.set(k, c);
  return c;
}

function gradient(ctx: CanvasRenderingContext2D, f: any, ct: ColorTransform, alpha: number) {
  const g = f.t === 'l' ? ctx.createLinearGradient(-819.2, 0, 819.2, 0)
    : ctx.createRadialGradient((f.g.focal ?? 0) * 819.2, 0, 0, 0, 0, 819.2);
  for (const [r, c] of f.g.stops) g.addColorStop(r / 255, ct.apply(c, alpha));
  return g;
}

// Fills a path with a Flash fill style. Path coordinates are in shape space (current transform).
export function fillWith(ctx: CanvasRenderingContext2D, p: Path2D, f: any, ct: ColorTransform, alpha: number) {
  if (f.t === 's') { ctx.fillStyle = ct.apply(f.c, alpha); ctx.fill(p, 'evenodd'); return; }
  if (f.t === 'b') {
    const img: any = f.bmd ? f.bmd._src() : images[f.id];
    if (!img || !img.width) return;
    const src = recolor(img as any, ct, f.bmd?._ver ?? 0);
    const pat = ctx.createPattern(src, f.rep ? 'repeat' : 'no-repeat');
    if (!pat) return;
    const m = f.m;
    pat.setTransform(new DOMMatrix([m[0], m[1], m[2], m[3], m[4], m[5]]));
    ctx.fillStyle = pat;
    const sm = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = !!f.sm;
    const ga = ctx.globalAlpha;
    ctx.globalAlpha = ga * alpha * ct.alphaMultiplier;
    ctx.fill(p, 'evenodd');
    ctx.globalAlpha = ga;
    ctx.imageSmoothingEnabled = sm;
    return;
  }
  // gradient: clip to path, fill gradient square in gradient space
  ctx.save();
  ctx.clip(p, 'evenodd');
  const m = f.m;
  ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
  ctx.fillStyle = gradient(ctx, f, ct, alpha);
  ctx.fillRect(-1e5, -1e5, 2e5, 2e5);
  ctx.restore();
}

const CAPS: CanvasLineCap[] = ['round', 'butt', 'square'];
const JOINS: CanvasLineJoin[] = ['round', 'bevel', 'miter'];
// scale: current world scale (used for hairline/no-scale line widths)
export function strokeWith(ctx: CanvasRenderingContext2D, p: Path2D, l: any, ct: ColorTransform, alpha: number, scale: number) {
  const c = l.c ?? (l.f?.t === 's' ? l.f.c : l.f?.g?.stops?.[0]?.[1] ?? 0xff000000);
  ctx.strokeStyle = ct.apply(c, alpha);
  let w = l.w;
  if (l.ns) w = w / (scale || 1);
  if (w * scale < 1) w = 1 / (scale || 1);
  ctx.lineWidth = w;
  ctx.lineCap = CAPS[l.cap ?? 0] ?? 'round';
  ctx.lineJoin = JOINS[l.join ?? 0] ?? 'round';
  if (l.ml) ctx.miterLimit = l.ml;
  ctx.stroke(p);
}

export function drawDraws(ctx: CanvasRenderingContext2D, draws: any[], ct: ColorTransform, alpha: number, scale: number) {
  for (const dr of draws) {
    const p = dr.p ?? (dr.p = path(dr.d));
    if (dr.f) fillWith(ctx, p, dr.f, ct, alpha);
    else strokeWith(ctx, p, dr.l, ct, alpha, scale);
  }
}

// Point-in-shape test in shape space.
let hitCtx: CanvasRenderingContext2D | null = null;
export function hitDraws(draws: any[], x: number, y: number): boolean {
  hitCtx ??= document.createElement('canvas').getContext('2d')!;
  for (const dr of draws) {
    const p = dr.p ?? (dr.p = path(dr.d));
    if (dr.f) { if (hitCtx.isPointInPath(p, x, y, 'evenodd')) return true; }
    else { hitCtx.lineWidth = Math.max(dr.l.w, 1); if (hitCtx.isPointInStroke(p, x, y)) return true; }
  }
  return false;
}

export function setTransform(ctx: CanvasRenderingContext2D, m: Matrix) {
  ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
}
export function worldScale(m: Matrix) {
  return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
}

const BLEND: Record<string, GlobalCompositeOperation> = {
  multiply: 'multiply', screen: 'screen', lighten: 'lighten', darken: 'darken', difference: 'difference',
  add: 'lighter', overlay: 'overlay', hardlight: 'hard-light', erase: 'destination-out', alpha: 'destination-in', subtract: 'difference', invert: 'difference',
};
export const blendOp = (b: string | null | undefined): GlobalCompositeOperation | null => (b && BLEND[b]) || null;
export const BLEND_IDS = ['normal', 'normal', 'layer', 'multiply', 'screen', 'lighten', 'darken', 'difference', 'add', 'subtract', 'invert', 'alpha', 'erase', 'overlay', 'hardlight', 'shader'];
