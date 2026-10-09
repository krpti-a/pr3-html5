// flash.text: TextField with Flash-like layout, rendered with the SWF's embedded glyph outlines.
import { InteractiveObject, factories, stageRef, dom } from './display.ts';
import { Event, TextEvent, FocusEvent } from './events.ts';
import { Matrix, Rectangle, ColorTransform, Point } from './geom.ts';
import { pack } from './assets.ts';
import { path } from './draw.ts';

export class TextFormat {
  font: string | null; size: number | null; color: number | null; bold: boolean | null; italic: boolean | null; underline: boolean | null;
  url: string | null; target: string | null; align: string | null; leftMargin: number | null; rightMargin: number | null;
  indent: number | null; leading: number | null; letterSpacing: number | null = null; kerning: boolean | null = null;
  blockIndent: number | null = null; bullet: boolean | null = null; tabStops: number[] | null = null; display = 'block';
  constructor(font: string | null = null, size: number | null = null, color: number | null = null, bold: boolean | null = null, italic: boolean | null = null,
    underline: boolean | null = null, url: string | null = null, target: string | null = null, align: string | null = null,
    leftMargin: number | null = null, rightMargin: number | null = null, indent: number | null = null, leading: number | null = null) {
    this.font = font; this.size = size; this.color = color; this.bold = bold; this.italic = italic; this.underline = underline;
    this.url = url; this.target = target; this.align = align; this.leftMargin = leftMargin; this.rightMargin = rightMargin;
    this.indent = indent; this.leading = leading;
  }
}
export const TextFieldAutoSize = { NONE: 'none', LEFT: 'left', RIGHT: 'right', CENTER: 'center' };
export const TextFieldType = { DYNAMIC: 'dynamic', INPUT: 'input' };
export const TextFormatAlign = { LEFT: 'left', RIGHT: 'right', CENTER: 'center', JUSTIFY: 'justify', START: 'start', END: 'end' };
export const AntiAliasType = { NORMAL: 'normal', ADVANCED: 'advanced' };
export const GridFitType = { NONE: 'none', PIXEL: 'pixel', SUBPIXEL: 'subpixel' };
export const TextLineMetrics = class { constructor(public x = 0, public width = 0, public height = 0, public ascent = 0, public descent = 0, public leading = 0) {} };

const FMT_KEYS = ['font', 'size', 'color', 'bold', 'italic', 'underline', 'url', 'target', 'align', 'leftMargin', 'rightMargin', 'indent', 'leading', 'letterSpacing', 'kerning', 'blockIndent'] as const;
type F = Record<(typeof FMT_KEYS)[number], any>;
const copyFmt = (f: any): F => { const o: any = {}; for (const k of FMT_KEYS) o[k] = f[k]; return o; };
const mergeFmt = (base: F, f: any): F => { const o: any = { ...base }; for (const k of FMT_KEYS) if (f[k] !== null && f[k] !== undefined) o[k] = f[k]; return o; };
const sameFmt = (a: F, b: F) => FMT_KEYS.every(k => a[k] === b[k]);

// ---------- fonts
interface FontInfo { glyph: Record<number, string>; adv: Record<number, number>; asc: number; desc: number; lead: number }
const fontCache: Record<string, FontInfo | null> = {};
function embedded(name: string): FontInfo | null {
  if (name in fontCache) return fontCache[name];
  let info: FontInfo | null = null;
  for (const c of Object.values(pack.chars)) {
    if (c.t === 'font' && c.name === name && c.g.length) {
      info = { glyph: {}, adv: {}, asc: c.asc ?? 900, desc: c.desc ?? 250, lead: c.lead ?? 0 };
      c.codes.forEach((code: number, i: number) => { info!.glyph[code] = c.g[i]; info!.adv[code] = c.adv?.[i] ?? 600; });
      break;
    }
  }
  return (fontCache[name] = info);
}
let measureCtx: CanvasRenderingContext2D | null = null;
const deviceFont = (f: F) => `${f.italic ? 'italic ' : ''}${f.bold ? 'bold ' : ''}${f.size}px ${cssFamily(f.font)}`;
function cssFamily(n: string) {
  if (!n || n === '_sans') return 'Arial, Helvetica, sans-serif';
  if (n === '_serif' || n === 'Times New Roman') return '"Times New Roman", serif';
  if (n === '_typewriter') return '"Courier New", monospace';
  return `"${n}", Arial, sans-serif`;
}

interface Glyph { ch: string; code: number; x: number; w: number; f: F; i: number }
interface Line { g: Glyph[]; w: number; asc: number; desc: number; lead: number; y: number; start: number; end: number; align: string; x0: number }

export class TextField extends InteractiveObject {
  _runs: { t: string; f: F }[] = [];
  _def: F;
  _bx = 0; _by = 0; _w = 100; _h = 100;
  _auto = 'none';
  wordWrap = false; multiline = false; _type = 'dynamic'; selectable = true;
  border = false; borderColor = 0; background = false; backgroundColor = 0xffffff;
  embedFonts = false; maxChars = 0; _restrict: string | null = null; _restrictRe: RegExp | null = null; displayAsPassword = false;
  condenseWhite = false; antiAliasType = 'normal'; sharpness = 0; thickness = 0; gridFitType = 'pixel'; mouseWheelEnabled = true;
  alwaysShowSelection = false; useRichTextClipboard = false; styleSheet: any = null; textInteractionMode = 'normal';
  _scrollV = 1; scrollH = 0;
  _lines: Line[] | null = null;
  _selB = 0; _selE = 0; _caretOn = 0;
  _html = false;

  constructor(def: any = null) {
    super();
    this._def = copyFmt(new TextFormat('Times New Roman', 12, 0, false, false, false, '', '', 'left', 0, 0, 0, 0));
    this._def.letterSpacing = 0; this._def.kerning = false; this._def.blockIndent = 0;
    if (def) this._initDef(def);
  }
  _initDef(d: any) {
    const font = d.font ? pack.chars[d.font] : null;
    this._def.font = font?.name ?? d.fontCls ?? 'Times New Roman';
    if (font) this._def.bold = !!font.bold, this._def.italic = !!font.italic;
    if (d.h) this._def.size = d.h;
    if (d.c !== undefined) this._def.color = d.c & 0xffffff;
    this._def.align = ['left', 'right', 'center', 'justify'][d.align ?? 0];
    this._def.leftMargin = d.lm ?? 0; this._def.rightMargin = d.rm ?? 0; this._def.indent = d.ind ?? 0; this._def.leading = d.lead ?? 0;
    this._bx = d.b[0]; this._by = d.b[1]; this._w = d.b[2] - d.b[0]; this._h = d.b[3] - d.b[1];
    this.wordWrap = !!d.wrap; this.multiline = !!d.multi; this.displayAsPassword = !!d.pw;
    this._type = d.ro ? 'dynamic' : 'input'; this.selectable = !d.nosel; this.border = !!d.border; this.background = !!d.border;
    this.embedFonts = !!d.outl; this.maxChars = d.max ?? 0; this._html = !!d.html;
    if (d.auto) this._auto = 'left';
    if (d.text) { if (d.html) this.htmlText = d.text; else this.text = d.text; }
  }
  // ---------- properties
  get type() { return this._type; }
  set type(v: string) { this._type = v; }
  get autoSize() { return this._auto; }
  set autoSize(v: string) { this._auto = v === true as any ? 'left' : v === false as any ? 'none' : v; this._relayout(); }
  get restrict() { return this._restrict; }
  set restrict(v: string | null) { this._restrict = v; this._restrictRe = v ? restrictRe(v) : null; }
  get defaultTextFormat() { return Object.assign(new TextFormat(), this._def); }
  set defaultTextFormat(f: TextFormat) { this._def = mergeFmt(this._def, f); }
  get textColor() { return this._runs[0]?.f.color ?? this._def.color; }
  set textColor(c: number) { this._def.color = c; for (const r of this._runs) r.f = { ...r.f, color: c }; this._dirty(); }
  get text() { return this._runs.map(r => r.t).join(''); }
  set text(v: string) {
    v = String(v ?? '').replace(/\r\n|\n/g, '\r');
    this._runs = v ? [{ t: v, f: { ...this._def } }] : [];
    this._selB = this._selE = Math.min(this._selE, v.length);
    this._dirty();
  }
  get length() { return this.text.length; }
  get htmlText() { return toHtml(this._runs); }
  set htmlText(v: string) {
    this._runs = parseHtml(String(v ?? ''), this._def, this.condenseWhite, this.multiline);
    this._dirty();
  }
  appendText(s: string) {
    s = s.replace(/\r\n|\n/g, '\r');
    const f = this._runs.length ? this._runs[this._runs.length - 1].f : { ...this._def };
    this._runs.push({ t: s, f });
    this._norm(); this._dirty();
  }
  replaceText(b: number, e: number, s: string) {
    const t = this.text;
    const f = this._fmtAt(b) ?? { ...this._def };
    const before = this._slice(0, b), after = this._slice(e, t.length);
    this._runs = [...before, ...(s ? [{ t: s.replace(/\r\n|\n/g, '\r'), f }] : []), ...after];
    this._norm(); this._dirty();
  }
  replaceSelectedText(s: string) { const b = Math.min(this._selB, this._selE), e = Math.max(this._selB, this._selE); this.replaceText(b, e, s); this._selB = this._selE = b + s.length; }
  setTextFormat(fmt: TextFormat, b = -1, e = -1) {
    const len = this.length;
    if (b < 0) { b = 0; e = len; } else if (e < 0) e = b + 1;
    const mid = this._slice(b, e).map(r => ({ t: r.t, f: mergeFmt(r.f, fmt) }));
    this._runs = [...this._slice(0, b), ...mid, ...this._slice(e, len)];
    this._norm(); this._dirty();
  }
  getTextFormat(b = -1, e = -1) {
    const len = this.length;
    if (b < 0) { b = 0; e = len; } else if (e < 0) e = b + 1;
    const rs = this._slice(b, e);
    const out = new TextFormat();
    const src = rs.length ? rs : [{ t: '', f: this._def }];
    for (const k of FMT_KEYS) { const v = src[0].f[k]; (out as any)[k] = src.every(r => r.f[k] === v) ? v : null; }
    return out;
  }
  _fmtAt(i: number): F | null { let p = 0; for (const r of this._runs) { if (i < p + r.t.length || (i === p + r.t.length && r === this._runs[this._runs.length - 1])) return r.f; p += r.t.length; } return null; }
  _slice(b: number, e: number) {
    const out: { t: string; f: F }[] = []; let p = 0;
    for (const r of this._runs) {
      const s = Math.max(b, p), en = Math.min(e, p + r.t.length);
      if (en > s) out.push({ t: r.t.slice(s - p, en - p), f: r.f });
      p += r.t.length;
    }
    return out;
  }
  _norm() {
    const out: { t: string; f: F }[] = [];
    for (const r of this._runs) { if (!r.t) continue; const l = out[out.length - 1]; if (l && sameFmt(l.f, r.f)) l.t += r.t; else out.push({ t: r.t, f: r.f }); }
    this._runs = out;
  }
  // ---------- geometry
  get width() { return this._w * Math.abs(this._sx); }
  set width(v: number) { if (!(+v >= 0)) return; this._w = +v; this._lines = null; this._relayout(); }
  get height() { return this._h * Math.abs(this._sy); }
  set height(v: number) { if (!(+v >= 0)) return; this._h = +v; this._lines = null; }
  _localBounds() { return new Rectangle(this._bx, this._by, this._w, this._h); }
  _hitLocal(x: number, y: number) { return this._localBounds().contains(x, y); }
  get textWidth() { this._layout(); return Math.max(0, ...this._lines!.map(l => l.w)); }
  // Flash reports no line box for an empty field (autoSize then collapses it to the 4px gutters)
  get textHeight() { this._layout(); const L = this._lines!; if (!L.length || !this.length) return 0; const l = L[L.length - 1]; return l.y + l.asc + l.desc; }
  get numLines() { this._layout(); return Math.max(1, this._lines!.length); }
  get maxScrollV() {
    this._layout(); const L = this._lines!; const vis = this._h - 4;
    let i = L.length - 1, hsum = 0;
    while (i >= 0) { const lh = L[i].asc + L[i].desc + (i < L.length - 1 ? L[i].lead : 0); if (hsum + lh > vis && hsum > 0) break; hsum += lh + (i < L.length - 1 ? 0 : 0); i--; }
    return Math.max(1, i + 2);
  }
  get scrollV() { return this._scrollV; }
  set scrollV(v: number) { this._scrollV = Math.max(1, Math.min(Math.trunc(v), this.maxScrollV)); }
  get bottomScrollV() {
    this._layout(); const L = this._lines!; let y = 0, i = this._scrollV - 1;
    for (; i < L.length; i++) { y += L[i].asc + L[i].desc; if (y > this._h - 4) break; y += L[i].lead; }
    return Math.max(this._scrollV, i);
  }
  get maxScrollH() { return Math.max(0, this.textWidth - (this._w - 4)); }
  getLineText(n: number) { this._layout(); const l = this._lines![n]; return l ? this.text.slice(l.start, l.end) : ''; }
  getLineMetrics(n: number) { this._layout(); const l = this._lines![n] ?? { w: 0, asc: 0, desc: 0, lead: 0, x0: 2 }; return new TextLineMetrics(l.x0, l.w, l.asc + l.desc + l.lead, l.asc, l.desc, l.lead); }
  getLineIndexOfChar(i: number) { this._layout(); return this._lines!.findIndex(l => i >= l.start && i < Math.max(l.end, l.start + 1)); }
  getLineOffset(n: number) { this._layout(); return this._lines![n]?.start ?? 0; }
  getLineLength(n: number) { this._layout(); const l = this._lines![n]; return l ? l.end - l.start : 0; }
  getCharBoundaries(i: number) {
    this._layout();
    for (const l of this._lines!) for (const g of l.g) if (g.i === i) return new Rectangle(this._bx + l.x0 + g.x, this._by + 2 + l.y, g.w, l.asc + l.desc);
    return null;
  }
  getCharIndexAtPoint(x: number, y: number) { const i = this._indexAt(x, y); return i; }
  get caretIndex() { return this._selE; }
  get selectionBeginIndex() { return Math.min(this._selB, this._selE); }
  get selectionEndIndex() { return Math.max(this._selB, this._selE); }
  setSelection(b: number, e: number) { const L = this.length; this._selB = Math.max(0, Math.min(b, L)); this._selE = Math.max(0, Math.min(e, L)); }
  get selectedText() { return this.text.slice(this.selectionBeginIndex, this.selectionEndIndex); }
  _dirty() { this._lines = null; this._relayout(); }
  _relayout() {
    if (this._auto === 'none') return;
    this._layout();
    const tw = this.textWidth, th = this.textHeight;
    if (!this.wordWrap) {
      const nw = tw + 4, ow = this._w;
      if (this._auto === 'center') this._shiftX((ow - nw) / 2);
      else if (this._auto === 'right') this._shiftX(ow - nw);
      this._w = nw;
    }
    this._h = th + 4;
    this._lines = null;
  }
  _shiftX(d: number) { this._x = Math.trunc((this._x + d * this._sx) * 20) / 20; this._mDirty = true; }

  _layout() {
    if (this._lines) return;
    const lines: Line[] = [];
    const text = this.text;
    const fmts: F[] = [];
    for (const r of this._runs) for (let i = 0; i < r.t.length; i++) fmts.push(r.f);
    const wrapW = this._w - 4;
    let i = 0, y = 0;
    const mkLine = (start: number, para: F, first: boolean): Line => ({ g: [], w: 0, asc: 0, desc: 0, lead: 0, y: 0, start, end: start, align: para.align ?? 'left', x0: 2 + (para.leftMargin ?? 0) + (para.blockIndent ?? 0) + (first ? para.indent ?? 0 : 0) });
    const paraEnd = (p: number) => { const k = text.indexOf('\r', p); return k < 0 ? text.length : k; };
    while (i <= text.length) {
      const pe = paraEnd(i);
      const para = fmts[i] ?? fmts[i - 1] ?? this._def;
      let line = mkLine(i, para, true);
      let x = 0, lastSpace = -1;
      const maxW = wrapW - (para.leftMargin ?? 0) - (para.rightMargin ?? 0) - (para.blockIndent ?? 0);
      const push = (l: Line) => {
        if (!l.g.length) { const m = metrics(fmts[l.start] ?? para, this.embedFonts); l.asc = m.asc; l.desc = m.desc; l.lead = m.lead; }
        lines.push(l);
      };
      for (let k = i; k < pe; k++) {
        const f = fmts[k];
        const ch = this.displayAsPassword ? '*' : text[k];
        const m = metrics(f, this.embedFonts);
        const w = advance(ch, f, this.embedFonts) + (f.letterSpacing ?? 0);
        if (this.wordWrap && x + w > maxW - (line.x0 - 2 - (para.leftMargin ?? 0) - (para.blockIndent ?? 0)) && line.g.length && ch !== ' ') {
          // break at last space if possible
          let carry: Glyph[] = [];
          if (lastSpace >= 0) { carry = line.g.splice(lastSpace + 1); }
          line.end = carry.length ? carry[0].i : k;
          line.w = line.g.reduce((a, g) => Math.max(a, g.x + g.w), 0);
          if (line.g.length && line.g[line.g.length - 1].ch === ' ') line.w = line.g.slice(0, -1).reduce((a, g) => Math.max(a, g.x + g.w), 0);
          push(line);
          line = mkLine(line.end, para, false);
          x = 0; lastSpace = -1;
          for (const g of carry) { g.x = x; x += g.w; line.g.push(g); line.asc = Math.max(line.asc, metrics(g.f, this.embedFonts).asc); line.desc = Math.max(line.desc, metrics(g.f, this.embedFonts).desc); line.lead = Math.max(line.lead, metrics(g.f, this.embedFonts).lead); }
        }
        if (ch === ' ') lastSpace = line.g.length;
        line.g.push({ ch, code: ch.charCodeAt(0), x, w, f, i: k });
        x += w;
        line.asc = Math.max(line.asc, m.asc); line.desc = Math.max(line.desc, m.desc); line.lead = Math.max(line.lead, m.lead);
      }
      line.end = pe;
      line.w = line.g.reduce((a, g) => Math.max(a, g.x + g.w), 0);
      push(line);
      if (pe >= text.length) break;
      i = pe + 1;
    }
    for (const l of lines) { l.y = y; y += l.asc + l.desc + l.lead; }
    this._lines = lines;
  }
  _lineX(l: Line) {
    const avail = this._w - 4;
    if (l.align === 'center') return l.x0 + (avail - (l.x0 - 2) - l.w) / 2;
    if (l.align === 'right') return 2 + avail - l.w;
    return l.x0;
  }
  _draw(ctx: CanvasRenderingContext2D, m: Matrix, ct: ColorTransform) {
    this._layout();
    ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    if (this.background) { ctx.fillStyle = ct.apply(0xff000000 | this.backgroundColor); ctx.fillRect(this._bx, this._by, this._w, this._h); }
    if (this.border) { ctx.strokeStyle = ct.apply(0xff000000 | this.borderColor); ctx.lineWidth = 1 / Math.max(0.01, Math.abs(m.a) || 1); ctx.strokeRect(this._bx + 0.5, this._by + 0.5, this._w - 1, this._h - 1); }
    ctx.save();
    ctx.beginPath(); ctx.rect(this._bx, this._by, this._w, this._h); ctx.clip();
    const L = this._lines!;
    const focused = stageRef?._focus === this && this._type === 'input';
    const top = L[this._scrollV - 1]?.y ?? 0;
    const sb = this.selectionBeginIndex, se = this.selectionEndIndex;
    for (let li = this._scrollV - 1; li < L.length; li++) {
      const l = L[li];
      const ly = this._by + 2 + l.y - top;
      if (ly > this._by + this._h) break;
      const lx = this._bx + this._lineX(l) - this.scrollH;
      const base = ly + l.asc;
      if (focused && se > sb) for (const g of l.g) if (g.i >= sb && g.i < se) { ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fillRect(lx + g.x, ly, g.w, l.asc + l.desc); }
      for (const g of l.g) {
        if (g.ch === ' ') continue;
        const sel = focused && g.i >= sb && g.i < se;
        drawGlyph(ctx, g, lx + g.x, base, sel ? 'rgba(255,255,255,1)' : ct.apply(0xff000000 | g.f.color), this.embedFonts, m);
        if (g.f.underline) { ctx.fillStyle = ct.apply(0xff000000 | g.f.color); ctx.fillRect(lx + g.x, base + 1, g.w, Math.max(0.5, g.f.size / 16)); }
      }
    }
    if (focused && se === sb && ((performance.now() / 500) | 0) % 2 === 0) {
      const p = this._caretPos(se);
      ctx.fillStyle = ct.apply(0xff000000 | (this._fmtAt(se) ?? this._def).color);
      ctx.fillRect(p.x, p.y, 1 / Math.max(0.2, Math.abs(m.a)), p.h);
    }
    ctx.restore();
  }
  _clip(p: Path2D, m: Matrix) { const r = new Path2D(); r.rect(this._bx, this._by, this._w, this._h); p.addPath(r, dom(m)); }
  _caretPos(i: number) {
    this._layout();
    const L = this._lines!; const top = L[this._scrollV - 1]?.y ?? 0;
    for (let li = 0; li < L.length; li++) {
      const l = L[li];
      const last = li === L.length - 1 || L[li + 1].start > i;
      if (i >= l.start && (i <= l.end) && last) {
        const g = l.g.find(g => g.i === i);
        const x = g ? g.x : l.w;
        return { x: this._bx + this._lineX(l) + x - this.scrollH, y: this._by + 2 + l.y - top, h: l.asc + l.desc, line: li };
      }
    }
    return { x: this._bx + 2, y: this._by + 2, h: metrics(this._def, this.embedFonts).asc + metrics(this._def, this.embedFonts).desc, line: 0 };
  }
  _indexAt(x: number, y: number) {
    this._layout();
    const L = this._lines!; const top = L[this._scrollV - 1]?.y ?? 0;
    let li = L.length - 1;
    for (let k = this._scrollV - 1; k < L.length; k++) if (y < this._by + 2 + L[k].y - top + L[k].asc + L[k].desc + L[k].lead) { li = k; break; }
    const l = L[li]; if (!l) return 0;
    const lx = this._bx + this._lineX(l) - this.scrollH;
    for (const g of l.g) if (x < lx + g.x + g.w / 2) return g.i;
    return l.end;
  }
  // ---------- input handling (called by the player input layer)
  _focusIn() { this.dispatchEvent(new FocusEvent(FocusEvent.FOCUS_IN, true, false, null)); }
  _blur() { this.dispatchEvent(new FocusEvent(FocusEvent.FOCUS_OUT, true, false, null)); }
  _mouseDown(stageX: number, stageY: number, shift: boolean) {
    const p = this.globalToLocal(new Point(stageX, stageY));
    const i = this._indexAt(p.x, p.y);
    if (!shift) this._selB = i;
    this._selE = i;
  }
  // url of the <a href> under a stage point ('' if none): Flash dispatches TextEvent.LINK for "event:" links
  _linkAt(stageX: number, stageY: number): string {
    if (!this._runs.some(r => r.f.url)) return '';
    const p = this.globalToLocal(new Point(stageX, stageY));
    const i = this._indexAt(p.x, p.y);
    for (const k of [i, i - 1]) {
      const b = k >= 0 ? this.getCharBoundaries(k) : null;
      if (b && p.x >= b.x - 1 && p.x <= b.right + 1 && p.y >= b.y - 1 && p.y <= b.bottom + 1) return this._fmtAt(k)?.url ?? '';
    }
    return '';
  }
  _mouseDrag(stageX: number, stageY: number) { const p = this.globalToLocal(new Point(stageX, stageY)); this._selE = this._indexAt(p.x, p.y); }
  _insert(s: string) {
    if (this._type !== 'input') return;
    if (!this.multiline) s = s.replace(/[\r\n]/g, '');
    if (this._restrictRe) s = [...s].filter(c => this._restrictRe!.test(c)).join('');
    const sb = this.selectionBeginIndex, se = this.selectionEndIndex;
    if (this.maxChars > 0) s = s.slice(0, Math.max(0, this.maxChars - (this.length - (se - sb))));
    if (!s && sb === se) return;
    const te = new TextEvent(TextEvent.TEXT_INPUT, true, true, s);
    this.dispatchEvent(te);
    if (te.isDefaultPrevented()) return;
    const f = this._fmtAt(sb > 0 ? sb - 1 : 0) ?? this._def;
    const before = this._slice(0, sb), after = this._slice(se, this.length);
    this._runs = [...before, ...(s ? [{ t: s, f: { ...f } }] : []), ...after];
    this._norm();
    this._selB = this._selE = sb + s.length;
    this._dirty();
    this._scrollToCaret();
    this.dispatchEvent(new Event(Event.CHANGE, true));
  }
  _keyDown(e: KeyboardEvent): boolean {
    const t = this.text, sb = this.selectionBeginIndex, se = this.selectionEndIndex;
    const sel = (i: number) => { i = Math.max(0, Math.min(i, t.length)); if (e.shiftKey) this._selE = i; else this._selB = this._selE = i; this._scrollToCaret(); };
    const mod = e.ctrlKey || e.metaKey;
    switch (e.key) {
      case 'ArrowLeft': sel(se === sb || e.shiftKey ? this._selE - 1 : sb); return true;
      case 'ArrowRight': sel(se === sb || e.shiftKey ? this._selE + 1 : se); return true;
      case 'Home': sel(0); return true;
      case 'End': sel(t.length); return true;
      case 'ArrowUp': case 'ArrowDown': {
        if (!this.multiline) return false;
        const p = this._caretPos(this._selE); sel(this._indexAt(p.x, p.y + (e.key === 'ArrowUp' ? -2 : p.h + 2) )); return true;
      }
    }
    if (mod && e.key.toLowerCase() === 'a') { this._selB = 0; this._selE = t.length; return true; }
    if (mod && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'x')) {
      if (se > sb && !this.displayAsPassword) navigator.clipboard?.writeText(t.slice(sb, se)).catch(() => {});
      if (e.key.toLowerCase() === 'x' && this._type === 'input') this._insert('');
      return true;
    }
    if (this._type !== 'input') return false;
    if (e.key === 'Backspace') { if (se === sb && sb > 0) this._selB = sb - 1; this._insertDel(); return true; }
    if (e.key === 'Delete') { if (se === sb) this._selE = se + 1; this._insertDel(); return true; }
    if (e.key === 'Enter') { if (this.multiline) this._insert('\r'); return true; }
    if (e.key.length === 1 && !mod) { this._insert(e.key); return true; }
    return false;
  }
  _insertDel() {
    const sb = this.selectionBeginIndex, se = Math.min(this.selectionEndIndex, this.length);
    if (se <= sb) return;
    this._runs = [...this._slice(0, sb), ...this._slice(se, this.length)];
    this._norm(); this._selB = this._selE = sb; this._dirty();
    this.dispatchEvent(new Event(Event.CHANGE, true));
  }
  _scrollToCaret() {
    this._layout();
    const p = this._caretPos(this._selE);
    if (p.line + 1 < this._scrollV) this._scrollV = p.line + 1;
    while (p.line + 1 > this.bottomScrollV && this._scrollV < this.maxScrollV) this._scrollV++;
    if (!this.wordWrap) {
      const l = this._lines![p.line]; const cx = (l?.g.find(g => g.i === this._selE)?.x ?? l?.w ?? 0);
      const vis = this._w - 4;
      if (cx - this.scrollH > vis) this.scrollH = cx - vis; else if (cx < this.scrollH) this.scrollH = Math.max(0, cx - 10);
    }
  }
}
factories.edit = (d: any) => new TextField(d);

function metrics(f: F, emb: boolean) {
  const fi = emb ? embedded(f.font) : null;
  const s = f.size ?? 12;
  if (fi) return { asc: (fi.asc / 1024) * s, desc: (fi.desc / 1024) * s, lead: f.leading ?? 0 };
  return { asc: s * 0.905, desc: s * 0.212, lead: f.leading ?? 0 };
}
function advance(ch: string, f: F, emb: boolean) {
  const fi = emb ? embedded(f.font) : null;
  const code = ch.charCodeAt(0);
  if (fi && fi.adv[code] !== undefined) return (fi.adv[code] / 1024) * f.size;
  measureCtx ??= document.createElement('canvas').getContext('2d')!;
  measureCtx.font = deviceFont(f);
  return measureCtx.measureText(ch).width;
}
function drawGlyph(ctx: CanvasRenderingContext2D, g: Glyph, x: number, base: number, color: string, emb: boolean, m: Matrix) {
  const fi = emb ? embedded(g.f.font) : null;
  ctx.fillStyle = color;
  const gd = fi?.glyph[g.code];
  if (gd) {
    const s = g.f.size / 1024;
    ctx.save();
    ctx.transform(s, 0, 0, s, x, base);
    ctx.fill(path(gd), 'evenodd');
    ctx.restore();
  } else {
    ctx.font = deviceFont(g.f);
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(g.ch, x, base);
  }
  void m;
}
function restrictRe(r: string) {
  let neg = false, out = '';
  for (let i = 0; i < r.length; i++) {
    const c = r[i];
    if (c === '^') { neg = !neg; continue; }
    if (c === '\\' && i + 1 < r.length) { out += '\\' + r[++i]; continue; }
    out += c === ']' || c === '[' ? '\\' + c : c;
  }
  try { return new RegExp(`^[${neg ? '^' : ''}${out}]$`); } catch { return null; }
}

// ---------- minimal Flash HTML
const ENT: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ' };
function parseHtml(html: string, def: F, condense: boolean, multi: boolean) {
  const runs: { t: string; f: F }[] = [];
  const stack: F[] = [{ ...def }];
  let paras = 0, pendingPara = false, inP = false;
  const cur = () => stack[stack.length - 1];
  const add = (t: string) => {
    if (!t) return;
    if (condense) t = t.replace(/\s+/g, ' ');
    if (pendingPara) { if (multi) runs.push({ t: '\r', f: cur() }); pendingPara = false; }
    runs.push({ t, f: cur() });
  };
  const re = /<(\/?)([a-zA-Z]+)([^>]*)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[4] !== undefined) { add(m[4].replace(/&(#?\w+);/g, (_, e) => (e[0] === '#' ? String.fromCharCode(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e.toLowerCase()] ?? `&${e};`))); continue; }
    const close = !!m[1], tag = m[2].toLowerCase(), attrs: Record<string, string> = {};
    m[3].replace(/(\w+)\s*=\s*("([^"]*)"|'([^']*)'|(\S+))/g, (_s, k, _v, a, b, c) => { attrs[k.toLowerCase()] = a ?? b ?? c; return ''; });
    if (tag === 'br') { if (multi) { if (pendingPara) runs.push({ t: '\r', f: cur() }); runs.push({ t: '\r', f: cur() }); } pendingPara = false; continue; }
    if (close) {
      if (tag === 'p' || tag === 'li') { if (inP || tag === 'li') { pendingPara = true; inP = false; } }
      if (stack.length > 1 && tag !== 'br') stack.pop();
      continue;
    }
    const f: F = { ...cur() };
    if (tag === 'p') { if (paras++ > 0 && !pendingPara && runs.length) pendingPara = true; inP = true; if (attrs.align) f.align = attrs.align.toLowerCase(); }
    else if (tag === 'font') {
      if (attrs.face) f.font = attrs.face;
      if (attrs.size) f.size = attrs.size[0] === '+' || attrs.size[0] === '-' ? (f.size ?? 12) + +attrs.size : +attrs.size;
      if (attrs.color) f.color = parseInt(attrs.color.replace('#', ''), 16);
      if (attrs.letterspacing) f.letterSpacing = +attrs.letterspacing;
      if (attrs.kerning) f.kerning = attrs.kerning === '1';
    } else if (tag === 'b') f.bold = true;
    else if (tag === 'i') f.italic = true;
    else if (tag === 'u') f.underline = true;
    else if (tag === 'a') { f.url = attrs.href ?? ''; f.target = attrs.target ?? ''; }
    else if (tag === 'textformat') {
      if (attrs.leading) f.leading = +attrs.leading; if (attrs.indent) f.indent = +attrs.indent;
      if (attrs.leftmargin) f.leftMargin = +attrs.leftmargin; if (attrs.rightmargin) f.rightMargin = +attrs.rightmargin;
      if (attrs.blockindent) f.blockIndent = +attrs.blockindent;
    }
    stack.push(f);
  }
  return runs.filter(r => r.t);
}
function toHtml(runs: { t: string; f: F }[]) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paras: string[] = [];
  let cur = '';
  let align = runs[0]?.f.align ?? 'left';
  for (const r of runs) {
    const parts = r.t.split('\r');
    parts.forEach((p, i) => {
      if (i > 0) { paras.push(`<P ALIGN="${align.toUpperCase()}">${cur}</P>`); cur = ''; align = r.f.align ?? 'left'; }
      if (p) {
        let s = `<FONT FACE="${r.f.font}" SIZE="${r.f.size}" COLOR="#${(r.f.color ?? 0).toString(16).padStart(6, '0').toUpperCase()}" LETTERSPACING="${r.f.letterSpacing ?? 0}" KERNING="${r.f.kerning ? 1 : 0}">${esc(p)}</FONT>`;
        if (r.f.bold) s = `<B>${s}</B>`; if (r.f.italic) s = `<I>${s}</I>`; if (r.f.underline) s = `<U>${s}</U>`;
        if (r.f.url) s = `<A HREF="${r.f.url}" TARGET="${r.f.target ?? ''}">${s}</A>`;
        cur += s;
      }
    });
  }
  paras.push(`<P ALIGN="${align.toUpperCase()}">${cur}</P>`);
  return paras.join('');
}
