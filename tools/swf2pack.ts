// Converts the original PR3 SWF into a compact asset pack for the HTML5 runtime.
// Usage: node tools/swf2pack.ts <game.swf> <ffdec-export-dir> <out-dir>
// Shapes become SVG path data, sprites keep their original timelines, bitmaps and
// sounds are taken from FFDec's export (which decodes JPEG3 alpha etc.).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';
import { join } from 'node:path';
import { Reader, readTags } from '../client/src/swf/reader.ts';

const [swfPath, expDir, outDir] = process.argv.slice(2);
const file = readFileSync(swfPath);
const body = new Uint8Array(file[0] === 0x43 ? inflateSync(file.subarray(8)) : file.subarray(8));
const R = new Reader(body);
R.rect(); R.u16(); R.u16();
const tags = readTags(R, body.length);

const chars: Record<number, any> = {};
const symbols: Record<string, number> = {};
const px = (t: number) => Math.round(t * 5) / 100; // twips -> px (2 decimals)
const mtx = (m: number[]) => [+m[0].toFixed(5), +m[1].toFixed(5), +m[2].toFixed(5), +m[3].toFixed(5), px(m[4]), px(m[5])];
const isIdentity = (m: number[]) => m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0;

// ---------- shapes ----------
function gradient(r: Reader, ver: number, focal: boolean) {
  r.align();
  const spread = r.ub(2), interp = r.ub(2), n = r.ub(4);
  const stops: number[][] = [];
  for (let i = 0; i < n; i++) stops.push([r.u8(), ver >= 3 ? r.rgba() : r.rgb()]);
  const g: any = { spread, interp, stops };
  if (focal) g.focal = r.fixed8();
  return g;
}
function fillStyle(r: Reader, ver: number) {
  const type = r.u8();
  if (type === 0) return { t: 's', c: ver >= 3 ? r.rgba() : r.rgb() };
  if (type === 0x10 || type === 0x12 || type === 0x13) {
    const m = mtx(r.matrix());
    return { t: type === 0x10 ? 'l' : 'r', m, g: gradient(r, ver, type === 0x13) };
  }
  if (type >= 0x40 && type <= 0x43) {
    const id = r.u16();
    const m = r.matrix();
    return { t: 'b', id, m: [m[0] / 20, m[1] / 20, m[2] / 20, m[3] / 20, px(m[4]), px(m[5])], rep: !(type & 1), sm: !(type & 2) };
  }
  throw new Error('fill type ' + type);
}
function fillStyles(r: Reader, ver: number) {
  let n = r.u8();
  if (n === 0xff && ver >= 2) n = r.u16();
  const a = [];
  for (let i = 0; i < n; i++) a.push(fillStyle(r, ver));
  return a;
}
function lineStyles(r: Reader, ver: number) {
  let n = r.u8();
  if (n === 0xff && ver >= 2) n = r.u16();
  const a = [];
  for (let i = 0; i < n; i++) {
    const w = r.u16();
    if (ver === 4) {
      r.align();
      const startCap = r.ub(2), join = r.ub(2), hasFill = r.ub(1), noH = r.ub(1), noV = r.ub(1);
      r.ub(1); r.ub(5);
      const noClose = r.ub(1), endCap = r.ub(2);
      const ls: any = { w: px(w), cap: startCap, join };
      if (noH || noV) ls.ns = (noH ? 1 : 0) | (noV ? 2 : 0);
      if (noClose) ls.nc = 1;
      if (endCap !== startCap) ls.ecap = endCap;
      if (join === 2) ls.ml = r.fixed8();
      if (hasFill) ls.f = fillStyle(r, ver); else ls.c = r.rgba();
      a.push(ls);
    } else a.push({ w: px(w), c: ver >= 3 ? r.rgba() : r.rgb(), cap: 0, join: 0 });
  }
  return a;
}

type Edge = [number, number, number, number, number, number, number]; // x0 y0 cx cy x1 y1 curved
// Parses SHAPE records; returns layers of {fills, lines, fillEdges[], lineEdges[]} in draw order.
function shapeRecords(r: Reader, ver: number, fills: any[], lines: any[], fontMode = false) {
  r.align();
  let fb = r.ub(4), lb = r.ub(4);
  const layers: any[] = [];
  let layer: any = { fills, lines, fe: fills.map(() => [] as Edge[]), le: lines.map(() => [] as Edge[][]) };
  if (fontMode) layer.fe = [[]];
  layers.push(layer);
  let x = 0, y = 0, f0 = 0, f1 = 0, ln = 0;
  let curLine: Edge[] | null = null;
  const raw: Edge[] = [];
  const add = (e: Edge) => {
    if (fontMode) raw.push(e);
    if (f1) layer.fe[f1 - 1]?.push(e);
    if (f0) layer.fe[f0 - 1]?.push([e[4], e[5], e[2], e[3], e[0], e[1], e[6]]);
    if (ln) {
      if (!curLine) { curLine = []; layer.le[ln - 1]?.push(curLine); }
      curLine.push(e);
    }
  };
  for (;;) {
    if (r.ub(1) === 0) {
      const ns = r.ub(1), sl = r.ub(1), sf1 = r.ub(1), sf0 = r.ub(1), mv = r.ub(1);
      if (!ns && !sl && !sf1 && !sf0 && !mv) break;
      if (mv) { const n = r.ub(5); x = r.sb(n); y = r.sb(n); curLine = null; }
      if (sf0) { f0 = r.ub(fb); }
      if (sf1) { f1 = r.ub(fb); }
      if (sl) { ln = r.ub(lb); curLine = null; }
      if (ns) {
        const nf = fillStyles(r, ver), nl = lineStyles(r, ver);
        r.align();
        fb = r.ub(4); lb = r.ub(4);
        layer = { fills: nf, lines: nl, fe: nf.map(() => [] as Edge[]), le: nl.map(() => [] as Edge[][]) };
        layers.push(layer);
        curLine = null;
      }
    } else {
      if (r.ub(1)) { // straight
        const n = r.ub(4) + 2;
        let dx = 0, dy = 0;
        if (r.ub(1)) { dx = r.sb(n); dy = r.sb(n); } else if (r.ub(1)) dy = r.sb(n); else dx = r.sb(n);
        add([x, y, 0, 0, x + dx, y + dy, 0]);
        x += dx; y += dy;
      } else {
        const n = r.ub(4) + 2;
        const cx = x + r.sb(n), cy = y + r.sb(n);
        const ax = cx + r.sb(n), ay = cy + r.sb(n);
        add([x, y, cx, cy, ax, ay, 1]);
        x = ax; y = ay;
      }
    }
  }
  if (fontMode && !layers[0].fe[0].length) layers[0].fe[0] = raw; // glyphs without fill style info
  return layers;
}
const seg = (e: Edge) => (e[6] ? `Q${px(e[2])} ${px(e[3])} ${px(e[4])} ${px(e[5])}` : `L${px(e[4])} ${px(e[5])}`);
// Joins unordered fill edges into closed sub-paths (SVG path data).
function fillPathFast(edges: Edge[]) {
  const byStart = new Map<string, number[]>();
  edges.forEach((e, i) => { const k = e[0] + ',' + e[1]; let a = byStart.get(k); if (!a) byStart.set(k, a = []); a.push(i); });
  const used = new Uint8Array(edges.length);
  let d = '';
  for (let i = 0; i < edges.length; i++) {
    if (used[i]) continue;
    let j = i;
    const sx = edges[i][0], sy = edges[i][1];
    d += `M${px(sx)} ${px(sy)}`;
    for (;;) {
      used[j] = 1;
      const e = edges[j];
      d += seg(e);
      if (e[4] === sx && e[5] === sy) break;
      const list = byStart.get(e[4] + ',' + e[5]);
      const n = list?.find(k => !used[k]);
      if (n === undefined) break;
      j = n;
    }
  }
  return d;
}
function linePath(paths: Edge[][]) {
  let d = '';
  let lx = NaN, ly = NaN;
  for (const p of paths) for (const e of p) {
    if (e[0] !== lx || e[1] !== ly) d += `M${px(e[0])} ${px(e[1])}`;
    d += seg(e);
    lx = e[4]; ly = e[5];
  }
  return d;
}
function layersToDraws(layers: any[]) {
  const draws: any[] = [];
  for (const L of layers) {
    L.fe.forEach((edges: Edge[], i: number) => { if (edges.length) draws.push({ f: L.fills[i], d: fillPathFast(edges) }); });
    L.le.forEach((paths: Edge[][], i: number) => { if (paths.length) draws.push({ l: L.lines[i], d: linePath(paths) }); });
  }
  return draws;
}
function defineShape(r: Reader, ver: number) {
  const id = r.u16();
  const b = r.rect();
  if (ver === 4) { r.rect(); r.u8(); }
  const fills = fillStyles(r, ver), lines = lineStyles(r, ver);
  chars[id] = { t: 'shape', b: [px(b[0]), px(b[2]), px(b[1]), px(b[3])], dr: layersToDraws(shapeRecords(r, ver, fills, lines)) };
}

// ---------- filters ----------
function filters(r: Reader) {
  const n = r.u8();
  const out: any[] = [];
  for (let i = 0; i < n; i++) {
    const t = r.u8();
    if (t === 0 || t === 2) { // drop shadow / glow
      const c = r.rgba();
      const f: any = { t: t === 0 ? 'shadow' : 'glow', c };
      f.bx = r.fixed16(); f.by = r.fixed16();
      if (t === 0) { f.a = r.fixed16(); f.dist = r.fixed16(); }
      f.str = r.fixed8();
      const fl = r.u8();
      f.inner = !!(fl & 0x80); f.ko = !!(fl & 0x40); f.q = fl & 0x1f;
      out.push(f);
    } else if (t === 1) {
      const f: any = { t: 'blur', bx: r.fixed16(), by: r.fixed16() };
      f.q = r.u8() >> 3;
      out.push(f);
    } else if (t === 3) { // bevel
      const f: any = { t: 'bevel', sc: r.rgba(), hc: r.rgba(), bx: r.fixed16(), by: r.fixed16(), a: r.fixed16(), dist: r.fixed16(), str: r.fixed8() };
      const fl = r.u8(); f.inner = !!(fl & 0x80); f.ko = !!(fl & 0x40); f.top = !!(fl & 0x10); f.q = fl & 0xf;
      out.push(f);
    } else if (t === 4 || t === 7) { // gradient glow / bevel
      const nc = r.u8();
      const cols = []; for (let k = 0; k < nc; k++) cols.push(r.rgba());
      const rat = []; for (let k = 0; k < nc; k++) rat.push(r.u8());
      const f: any = { t: t === 4 ? 'gglow' : 'gbevel', cols, rat, bx: r.fixed16(), by: r.fixed16(), a: r.fixed16(), dist: r.fixed16(), str: r.fixed8() };
      const fl = r.u8(); f.inner = !!(fl & 0x80); f.ko = !!(fl & 0x40); f.top = !!(fl & 0x10); f.q = fl & 0xf;
      out.push(f);
    } else if (t === 5) {
      const mx = r.u8(), my = r.u8();
      r.f32(); r.f32();
      for (let k = 0; k < mx * my; k++) r.f32();
      r.rgba(); r.u8();
    } else if (t === 6) {
      const m = []; for (let k = 0; k < 20; k++) m.push(+r.f32().toFixed(5));
      out.push({ t: 'cm', m });
    } else throw new Error('filter ' + t);
  }
  return out;
}

// ---------- sprites ----------
function placeObject(r: Reader, ver: number, end: number) {
  const fl = r.u8();
  const fl2 = ver === 3 ? r.u8() : 0;
  const o: any = { d: r.u16() };
  // class name only with HasClassName (as Flash/Ruffle read it; HasImage just marks a bitmap character)
  if (ver === 3 && fl2 & 0x08) o.cls = r.str();
  if (fl & 0x02) o.c = r.u16();
  if (fl & 0x01) o.mv = 1;
  if (fl & 0x04) { const m = r.matrix(); o.m = mtx(m); }
  if (fl & 0x08) { const x = r.cxform(true); if (x.join() !== '1,1,1,1,0,0,0,0') o.x = x; else o.x = 0; }
  if (fl & 0x10) o.r = r.u16();
  if (fl & 0x20) o.n = r.str();
  if (fl & 0x40) o.cd = r.u16();
  if (ver === 3) {
    if (fl2 & 0x01) o.f = filters(r);
    if (fl2 & 0x02) o.bm = r.u8();
    if (fl2 & 0x04) o.cab = r.u8();
    if (fl2 & 0x20) o.v = r.u8();
    if (fl2 & 0x40) r.rgba();
  }
  return o;
}
function defineSprite(r: Reader, start: number, len: number) {
  const id = r.u16();
  const n = r.u16();
  const frames: any[][] = [];
  const labels: Record<string, number> = {};
  let cur: any[] = [];
  for (const t of readTags(r, start + len)) {
    const rr = new Reader(body, t.start);
    if (t.code === 26) cur.push(placeObject(rr, 2, t.start + t.len));
    else if (t.code === 70) cur.push(placeObject(rr, 3, t.start + t.len));
    else if (t.code === 28) cur.push({ rm: rr.u16() });
    else if (t.code === 43) labels[rr.str()] = frames.length + 1;
    else if (t.code === 1) { frames.push(cur); cur = []; }
  }
  while (frames.length < n) frames.push([]);
  chars[id] = { t: 'sprite', fr: frames };
  if (Object.keys(labels).length) chars[id].lb = labels;
}

// ---------- text ----------
function defineFont3(r: Reader) {
  const id = r.u16();
  const fl = r.u8();
  const wide = !!(fl & 0x04), wideOff = !!(fl & 0x08), layout = !!(fl & 0x80);
  r.u8(); // lang
  const name = new TextDecoder().decode(r.bytes(r.u8())).replace(/\0+$/, '');
  const ng = r.u16();
  const tableStart = r.p;
  const offs: number[] = [];
  for (let i = 0; i < ng; i++) offs.push(wideOff ? r.u32() : r.u16());
  const codeOff = wideOff ? r.u32() : r.u16();
  const glyphs: string[] = [];
  for (let i = 0; i < ng; i++) {
    const gr = new Reader(body, tableStart + offs[i]);
    const layers = shapeRecords(gr, 1, [], [], true);
    glyphs.push(fillPathFast(layers[0].fe[0])); // EM square = 1024 units
  }
  r.p = tableStart + codeOff;
  const codes: number[] = [];
  for (let i = 0; i < ng; i++) codes.push(wide ? r.u16() : r.u8());
  const f: any = { t: 'font', name, bold: !!(fl & 1), italic: !!(fl & 2), g: glyphs, codes };
  if (layout) {
    f.asc = r.u16() / 20; f.desc = r.u16() / 20; f.lead = r.s16() / 20;
    f.adv = []; for (let i = 0; i < ng; i++) f.adv.push(r.s16() / 20);
  }
  chars[id] = f;
}
function defineText(r: Reader, ver: number) {
  const id = r.u16();
  const b = r.rect();
  const m = mtx(r.matrix());
  const gb = r.u8(), ab = r.u8();
  const recs: any[] = [];
  let font = 0, color = 0xff000000, x = 0, y = 0, h = 0;
  for (;;) {
    const fl = r.u8();
    if (fl === 0) break;
    if (fl & 0x08) font = r.u16();
    if (fl & 0x04) color = ver === 2 ? r.rgba() : r.rgb();
    if (fl & 0x01) x = r.s16();
    if (fl & 0x02) y = r.s16();
    if (fl & 0x08) h = r.u16();
    const n = r.u8();
    const g: number[] = [];
    r.align();
    for (let i = 0; i < n; i++) { g.push(r.ub(gb)); g.push(r.sb(ab)); }
    r.align();
    recs.push({ f: font, c: color, x: px(x), y: px(y), h: px(h), g: g.map((v, i) => (i & 1 ? px(v) : v)) });
    let adv = 0; for (let i = 1; i < g.length; i += 2) adv += g[i];
    x += adv;
  }
  chars[id] = { t: 'text', b: [px(b[0]), px(b[2]), px(b[1]), px(b[3])], m, recs };
}
function defineEditText(r: Reader) {
  const id = r.u16();
  const b = r.rect();
  r.align();
  const f1 = r.u8(), f2 = r.u8();
  const o: any = { t: 'edit', b: [px(b[0]), px(b[2]), px(b[1]), px(b[3])] };
  const hasText = f1 & 0x80, hasColor = f1 & 0x04, hasMax = f1 & 0x02, hasFont = f1 & 0x01;
  if (f1 & 0x40) o.wrap = 1;
  if (f1 & 0x20) o.multi = 1;
  if (f1 & 0x10) o.pw = 1;
  if (f1 & 0x08) o.ro = 1;
  const hasFontClass = f2 & 0x80;
  if (f2 & 0x40) o.auto = 1;
  const hasLayout = f2 & 0x20;
  if (f2 & 0x10) o.nosel = 1;
  if (f2 & 0x08) o.border = 1;
  if (f2 & 0x02) o.html = 1;
  if (f2 & 0x01) o.outl = 1;
  if (hasFont) o.font = r.u16();
  if (hasFontClass) o.fontCls = r.str();
  if (hasFont || hasFontClass) o.h = px(r.u16());
  if (hasColor) o.c = r.rgba();
  if (hasMax) o.max = r.u16();
  if (hasLayout) { o.align = r.u8(); o.lm = px(r.u16()); o.rm = px(r.u16()); o.ind = px(r.s16()); o.lead = px(r.s16()); }
  const v = r.str(); if (v) o.var = v;
  if (hasText) o.text = r.str();
  chars[id] = o;
}
function defineFontName(r: Reader) { const id = r.u16(); if (chars[id]) chars[id].full = r.str(); }

// ---------- buttons ----------
function defineButton2(r: Reader, end: number) {
  const id = r.u16();
  r.u8();
  const aoff = r.u16();
  const recs: any[] = [];
  for (;;) {
    const fl = r.u8();
    if (fl === 0) break;
    const o: any = { s: fl & 0x0f, c: r.u16(), d: r.u16(), m: mtx(r.matrix()) };
    const x = r.cxform(true); if (x.join() !== '1,1,1,1,0,0,0,0') o.x = x;
    if (fl & 0x10) o.f = filters(r);
    if (fl & 0x20) o.bm = r.u8();
    recs.push(o);
  }
  chars[id] = { t: 'button', recs, menu: 0 };
  void aoff; void end;
}

// ---------- walk ----------
// the main timeline's own display list (character 0, the document class's timeline)
const rootFrames: any[][] = [], rootLabels: Record<string, number> = {};
let rootCur: any[] = [];
for (const t of tags) {
  const r = new Reader(body, t.start);
  switch (t.code) {
    case 26: rootCur.push(placeObject(r, 2, t.start + t.len)); break;
    case 70: rootCur.push(placeObject(r, 3, t.start + t.len)); break;
    case 28: rootCur.push({ rm: r.u16() }); break;
    case 43: rootLabels[r.str()] = rootFrames.length + 1; break;
    case 1: rootFrames.push(rootCur); rootCur = []; break;
    case 2: defineShape(r, 1); break;
    case 22: defineShape(r, 2); break;
    case 32: defineShape(r, 3); break;
    case 83: defineShape(r, 4); break;
    case 39: defineSprite(r, t.start, t.len); break;
    case 75: defineFont3(r); break;
    case 88: defineFontName(r); break;
    case 11: defineText(r, 1); break;
    case 33: defineText(r, 2); break;
    case 37: defineEditText(r); break;
    case 34: defineButton2(r, t.start + t.len); break;
    case 78: { const id = r.u16(); const g = r.rect(); if (chars[id]) chars[id].grid = [px(g[0]), px(g[2]), px(g[1]), px(g[3])]; break; }
    case 76: { const n = r.u16(); for (let i = 0; i < n; i++) { const id = r.u16(); symbols[r.str()] = id; } break; }
    case 6: case 21: case 35: case 20: case 36: case 90: {
      const id = r.u16();
      chars[id] = { t: 'bitmap' };
      if (t.code === 20 || t.code === 36) { r.u8(); chars[id].w = r.u16(); chars[id].h = r.u16(); }
      break;
    }
    case 14: { const id = r.u16(); chars[id] = { t: 'sound' }; break; }
    case 87: { const id = r.u16(); chars[id] = { t: 'binary' }; break; }
  }
}

chars[0] = { t: 'sprite', fr: rootFrames.length ? rootFrames : [[]] };

// Branding: the menu logo's "Reborn" tag (a static text) reads "HTML5" in this port. Glyph indices and
// advances (rounded to twips like Flash) come from the text's own embedded font.
const REBRAND: Record<string, string> = { reborn: 'html5' };
for (const c of Object.values(chars) as any[]) {
  if (c.t !== 'text') continue;
  for (const r of c.recs) {
    const font = chars[r.f];
    if (!font?.codes) continue;
    const str = r.g.filter((_: number, i: number) => i % 2 === 0).map((g: number) => String.fromCharCode(font.codes[g] ?? 0)).join('');
    const to = REBRAND[str.toLowerCase()];
    if (!to) continue;
    const out = str === str.toUpperCase() ? to.toUpperCase() : to;
    const g: number[] = [];
    for (const ch of out) { const gi = font.codes.indexOf(ch.charCodeAt(0)); if (gi < 0) throw new Error(`rebrand: glyph ${ch} missing`); g.push(gi, Math.round((font.adv?.[gi] ?? 1024) * r.h / 1024 * 20) / 20); }
    r.g = g;
    console.log(`rebranded text ${str} -> ${out}`);
  }
}
if (Object.keys(rootLabels).length) chars[0].lb = rootLabels;

// The lobby's "modFrame" (shown to anyone with access_moderator_tools) re-places singlePlayerButton as an
// empty DefineButton2 in the original SWF, so mods/admins had no Single Player button. Give that empty
// button the regular one's states.
{
  const lobby = chars[symbols.LobbyPageGraphic];
  const placed = (lobby?.fr ?? []).flat().filter((p: any) => p.n === 'singlePlayerButton' && chars[p.c]?.t === 'button').map((p: any) => chars[p.c]);
  const full = placed.find((b: any) => b.recs.length);
  for (const b of placed) if (!b.recs.length && full) { b.recs = full.recs; console.log('filled empty mod-frame singlePlayerButton'); }
}

// ---------- external files ----------
mkdirSync(join(outDir, 'img'), { recursive: true });
mkdirSync(join(outDir, 'snd'), { recursive: true });
const imgSize = (buf: Buffer): [number, number] => {
  if (buf[0] === 0x89) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (buf[0] === 0x47) return [buf.readUInt16LE(6), buf.readUInt16LE(8)];
  let p = 2;
  while (p < buf.length) {
    const mk = buf[p + 1], l = buf.readUInt16BE(p + 2);
    if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) return [buf.readUInt16BE(p + 7), buf.readUInt16BE(p + 5)];
    p += 2 + l;
  }
  return [0, 0];
};
for (const f of readdirSync(join(expDir, 'images'))) {
  const id = parseInt(f);
  if (!chars[id]) continue;
  const ext = f.slice(f.lastIndexOf('.') + 1);
  const buf = readFileSync(join(expDir, 'images', f));
  const [w, h] = imgSize(buf);
  copyFileSync(join(expDir, 'images', f), join(outDir, 'img', `${id}.${ext}`));
  Object.assign(chars[id], { src: `img/${id}.${ext}`, w, h });
}
for (const f of readdirSync(join(expDir, 'sounds'))) {
  const id = parseInt(f);
  if (!chars[id]) continue;
  const ext = f.slice(f.lastIndexOf('.') + 1);
  copyFileSync(join(expDir, 'sounds', f), join(outDir, 'snd', `${id}.${ext}`));
  chars[id].src = `snd/${id}.${ext}`;
}
const missing = Object.entries(chars).filter(([, c]) => (c.t === 'bitmap' || c.t === 'sound') && !c.src).map(([k]) => k);
if (missing.length) console.warn('missing exported assets for', missing.join(','));
for (const [k, c] of Object.entries(chars)) if (c.t === 'binary') delete chars[+k];

const json = JSON.stringify({ symbols, chars });
writeFileSync(join(outDir, 'pack.json'), json);
writeFileSync(join(outDir, 'pack.json.z'), deflateSync(json, { level: 9 }));
const kinds: Record<string, number> = {};
for (const c of Object.values(chars)) kinds[c.t] = (kinds[c.t] ?? 0) + 1;
console.log(kinds, 'pack.json', json.length, 'bytes', existsSync(join(outDir, 'pack.json.z')) ? readFileSync(join(outDir, 'pack.json.z')).length + ' deflated' : '');
