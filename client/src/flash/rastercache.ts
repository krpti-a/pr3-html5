// Raster cache for immutable vector content (library shapes, static text).
// Rasterizing large vector art with gradients every frame is the most expensive thing the renderer
// does; content drawn again with the same linear transform and color is instead rendered once into an
// offscreen canvas and blitted. Rules that keep the output identical (to within 1/32 px):
// - only immutable library definitions (no Graphics drawn at runtime),
// - only at full alpha: Flash applies alpha per fill, which a composited bitmap can't reproduce,
// - the subpixel part of the translation is part of the key (quantized to 1/16 px),
// - an entry is created on the second use of a key, so continuously transforming parts are not cached.
import { Matrix, Rectangle, ColorTransform } from './geom.ts';
import { newCanvas, freeCanvas } from './canvas.ts';

interface Entry { c: HTMLCanvasElement; ox: number; oy: number; bytes: number }
const entries = new Map<string, Entry>(); // insertion order = LRU order
const seen = new Map<string, number>();
const ids = new WeakMap<object, number>();
let nextId = 1, bytes = 0;
const MAX_BYTES = 96 * 1048576, MAX_ENTRY_PX = 2_500_000;
export const rasterCacheStats = { hits: 0, misses: 0, get mb() { return bytes / 1048576; }, get entries() { return entries.size; } };
export let rasterCacheEnabled = true;
export function setRasterCache(on: boolean) { rasterCacheEnabled = on; if (!on) clearRasterCache(); }
export function clearRasterCache() { for (const e of entries.values()) freeCanvas(e.c); entries.clear(); seen.clear(); bytes = 0; }

const q = (v: number) => Math.round(v * 4096) / 4096;
// Returns true if drawn from (or into) the cache; false means the caller should draw directly.
export function drawCached(ctx: CanvasRenderingContext2D, def: object, b: Rectangle, m: Matrix, ct: ColorTransform,
  render: (c: CanvasRenderingContext2D, m: Matrix) => void): boolean {
  if (!rasterCacheEnabled || ct.alphaMultiplier !== 1 || ct.alphaOffset !== 0 || b.width <= 0 || b.height <= 0) return false;
  let id = ids.get(def); if (!id) { id = nextId++; ids.set(def, id); }
  const ix = Math.floor(m.tx), iy = Math.floor(m.ty);
  const fx = Math.round((m.tx - ix) * 16) / 16, fy = Math.round((m.ty - iy) * 16) / 16;
  const key = `${id}|${q(m.a)},${q(m.b)},${q(m.c)},${q(m.d)}|${fx},${fy}|${ct.key()}`;
  let e = entries.get(key);
  if (e) {
    entries.delete(key); entries.set(key, e); // most recently used
    rasterCacheStats.hits++;
  } else {
    // only cache what is drawn again with the same transform
    if (!seen.has(key)) { if (seen.size > 20000) seen.clear(); seen.set(key, 1); rasterCacheStats.misses++; return false; }
    seen.delete(key);
    const lm = new Matrix(m.a, m.b, m.c, m.d, fx, fy);
    const x0 = Math.min(lm.a * b.x + lm.c * b.y, lm.a * b.right + lm.c * b.y, lm.a * b.x + lm.c * b.bottom, lm.a * b.right + lm.c * b.bottom) + fx;
    const y0 = Math.min(lm.b * b.x + lm.d * b.y, lm.b * b.right + lm.d * b.y, lm.b * b.x + lm.d * b.bottom, lm.b * b.right + lm.d * b.bottom) + fy;
    const x1 = Math.max(lm.a * b.x + lm.c * b.y, lm.a * b.right + lm.c * b.y, lm.a * b.x + lm.c * b.bottom, lm.a * b.right + lm.c * b.bottom) + fx;
    const y1 = Math.max(lm.b * b.x + lm.d * b.y, lm.b * b.right + lm.d * b.y, lm.b * b.x + lm.d * b.bottom, lm.b * b.right + lm.d * b.bottom) + fy;
    const ox = Math.floor(x0) - 2, oy = Math.floor(y0) - 2;
    const w = Math.ceil(x1) + 2 - ox, h = Math.ceil(y1) + 2 - oy;
    if (w * h > MAX_ENTRY_PX || w <= 0 || h <= 0) return false;
    const c = newCanvas(w, h);
    const cx = c.getContext('2d')!;
    lm.tx = fx - ox; lm.ty = fy - oy;
    render(cx, lm);
    e = { c, ox, oy, bytes: w * h * 4 };
    entries.set(key, e); bytes += e.bytes;
    while (bytes > MAX_BYTES && entries.size > 1) {
      const [k, old] = entries.entries().next().value!;
      entries.delete(k); bytes -= old.bytes; freeCanvas(old.c);
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(e.c, ix + e.ox, iy + e.oy);
  return true;
}
