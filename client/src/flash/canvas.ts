// All offscreen canvases go through here so their memory can be tracked and capped.
// Canvas backing stores live outside the JS heap (often on the GPU), so a leak there is invisible
// to the GC's pressure heuristics; the player pauses the game if this budget is exceeded.
let liveBytes = 0;
const sizes = new WeakMap<HTMLCanvasElement, number>();
const registry = typeof FinalizationRegistry !== 'undefined' ? new FinalizationRegistry<number>(b => { liveBytes -= b; }) : null;

export const canvasStats = { created: 0, get liveMB() { return liveBytes / 1048576; } };

export function newCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
  const b = c.width * c.height * 4;
  liveBytes += b; canvasStats.created++;
  sizes.set(c, b);
  registry?.register(c, b, c);
  return c;
}
// Frees a canvas' backing store immediately (instead of waiting for GC).
export function freeCanvas(c: HTMLCanvasElement | null | undefined) {
  if (!c) return;
  const b = sizes.get(c);
  if (b !== undefined) { liveBytes -= b; sizes.delete(c); registry?.unregister(c); }
  c.width = 0; c.height = 0;
}
