// flash.display.Graphics: records drawing commands into fill/stroke draws (same format as SWF shapes).
import { Matrix, Rectangle } from './geom.ts';

const r2 = (v: number) => Math.round(v * 100) / 100;

export class Graphics {
  draws: any[] = [];
  bounds: Rectangle | null = null;
  version = 0;
  private fill: any = null;
  private line: any = null;
  private fd = ''; // current fill path data
  private ld = ''; // current line path data
  private x = 0; private y = 0; private sx = 0; private sy = 0;
  private lineDraw: any = null;

  private ext(x: number, y: number, pad = 0) {
    const b = this.bounds;
    if (!b) { this.bounds = new Rectangle(x - pad, y - pad, pad * 2, pad * 2); return; }
    if (x - pad < b.x) { b.width += b.x - (x - pad); b.x = x - pad; }
    if (y - pad < b.y) { b.height += b.y - (y - pad); b.y = y - pad; }
    if (x + pad > b.right) b.width = x + pad - b.x;
    if (y + pad > b.bottom) b.height = y + pad - b.y;
  }
  private flushFill() {
    if (this.fill && this.fd) {
      if (this.x !== this.sx || this.y !== this.sy) this.fd += `L${r2(this.sx)} ${r2(this.sy)}`;
      // insert before current line draw so fill renders below its outline
      const d = { f: this.fill, d: this.fd };
      if (this.lineDraw) this.draws.splice(this.draws.indexOf(this.lineDraw), 0, d); else this.draws.push(d);
    }
    this.fd = '';
  }
  private flushLine() {
    if (this.line && this.ld && this.ld.indexOf('L') + this.ld.indexOf('Q') > -2) {
      // the renderer caches a compiled Path2D on the draw (`p`); drop it when the path grows
      if (this.lineDraw) { this.lineDraw.d = this.ld; this.lineDraw.p = undefined; } else this.draws.push(this.lineDraw = { l: this.line, d: this.ld });
    }
  }
  private touch() { this.version++; }
  clear() { this.draws = []; this.bounds = null; this.fill = this.line = null; this.fd = this.ld = ''; this.lineDraw = null; this.x = this.y = this.sx = this.sy = 0; this.touch(); }
  beginFill(color = 0, alpha = 1) {
    this.endFill();
    this.fill = { t: 's', c: ((Math.round(Math.max(0, Math.min(1, alpha)) * 255) << 24) | (color & 0xffffff)) >>> 0 };
    this.fd = `M${r2(this.x)} ${r2(this.y)}`; this.sx = this.x; this.sy = this.y;
  }
  beginGradientFill(type: string, colors: number[], alphas: number[], ratios: number[], matrix?: Matrix, _spread = 'pad', _interp = 'rgb', focal = 0) {
    this.endFill();
    const m = matrix ?? new Matrix();
    const stops = colors.map((c, i) => [ratios[i], ((Math.round(Math.max(0, Math.min(1, alphas[i] ?? 1)) * 255) << 24) | (c & 0xffffff)) >>> 0]);
    this.fill = { t: type === 'radial' ? 'r' : 'l', m: [m.a, m.b, m.c, m.d, m.tx, m.ty], g: { stops, focal } };
    this.fd = `M${r2(this.x)} ${r2(this.y)}`; this.sx = this.x; this.sy = this.y;
  }
  beginBitmapFill(bmd: any, matrix: Matrix | null = null, repeat = true, smooth = false) {
    this.endFill();
    const m = matrix ?? new Matrix();
    this.fill = { t: 'b', bmd, m: [m.a, m.b, m.c, m.d, m.tx, m.ty], rep: repeat, sm: smooth };
    this.fd = `M${r2(this.x)} ${r2(this.y)}`; this.sx = this.x; this.sy = this.y;
  }
  endFill() {
    this.flushFill();
    this.fill = null;
    this.touch();
  }
  lineStyle(thickness = NaN, color = 0, alpha = 1, _pixelHinting = false, scaleMode = 'normal', caps: string | null = null, joints: string | null = null, miterLimit = 3) {
    this.flushLine();
    this.lineDraw = null;
    if (thickness !== thickness || thickness === undefined || thickness === null) { this.line = null; this.ld = ''; return; }
    this.line = {
      w: Math.max(0, Math.min(255, thickness)), c: ((Math.round(Math.max(0, Math.min(1, alpha)) * 255) << 24) | (color & 0xffffff)) >>> 0,
      cap: caps === 'none' ? 1 : caps === 'square' ? 2 : 0, join: joints === 'bevel' ? 1 : joints === 'miter' ? 2 : 0, ml: miterLimit,
      ns: scaleMode === 'none' ? 3 : scaleMode === 'horizontal' ? 2 : scaleMode === 'vertical' ? 1 : 0,
    };
    this.ld = `M${r2(this.x)} ${r2(this.y)}`;
    this.touch();
  }
  moveTo(x: number, y: number) {
    if (this.fill) {
      if (this.x !== this.sx || this.y !== this.sy) this.fd += `L${r2(this.sx)} ${r2(this.sy)}`;
      this.fd += `M${r2(x)} ${r2(y)}`;
      this.sx = x; this.sy = y;
    }
    if (this.line) this.ld += `M${r2(x)} ${r2(y)}`;
    this.x = x; this.y = y;
  }
  lineTo(x: number, y: number) {
    const s = `L${r2(x)} ${r2(y)}`;
    if (this.fill) this.fd += s;
    if (this.line) { this.ld += s; this.ext(this.x, this.y, this.line.w / 2); this.ext(x, y, this.line.w / 2); this.flushLine(); }
    else this.ext(x, y);
    if (this.fill) this.ext(this.x, this.y);
    this.x = x; this.y = y;
    this.touch();
  }
  curveTo(cx: number, cy: number, x: number, y: number) {
    const s = `Q${r2(cx)} ${r2(cy)} ${r2(x)} ${r2(y)}`;
    if (this.fill) this.fd += s;
    const pad = this.line ? this.line.w / 2 : 0;
    this.ext(this.x, this.y, pad); this.ext(cx, cy, pad); this.ext(x, y, pad);
    if (this.line) { this.ld += s; this.flushLine(); }
    this.x = x; this.y = y;
    this.touch();
  }
  cubicCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
    const s = `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(x)} ${r2(y)}`;
    if (this.fill) this.fd += s;
    const pad = this.line ? this.line.w / 2 : 0;
    this.ext(this.x, this.y, pad); this.ext(c1x, c1y, pad); this.ext(c2x, c2y, pad); this.ext(x, y, pad);
    if (this.line) { this.ld += s; this.flushLine(); }
    this.x = x; this.y = y;
    this.touch();
  }
  private shape(d: string, x0: number, y0: number, x1: number, y1: number) {
    const pad = this.line ? this.line.w / 2 : 0;
    this.ext(x0, y0, pad); this.ext(x1, y1, pad);
    if (this.fill) this.fd += d;
    if (this.line) { this.ld += d; this.flushLine(); }
    this.touch();
  }
  drawRect(x: number, y: number, w: number, h: number) {
    this.moveTo(x, y);
    this.shape(`L${r2(x + w)} ${r2(y)}L${r2(x + w)} ${r2(y + h)}L${r2(x)} ${r2(y + h)}L${r2(x)} ${r2(y)}`, x, y, x + w, y + h);
    this.x = x; this.y = y;
  }
  drawRoundRect(x: number, y: number, w: number, h: number, ew: number, eh = NaN) {
    if (eh !== eh) eh = ew;
    const rx = Math.min(ew / 2, w / 2), ry = Math.min(eh / 2, h / 2);
    if (!rx || !ry) return this.drawRect(x, y, w, h);
    this.moveTo(x + w, y + h - ry);
    const k = 0.4142, c = 0.7071;
    void k; void c;
    let d = '';
    const arc = (cx: number, cy: number, a0: number) => {
      // quarter arc approximated with two quadratic curves (like Flash)
      for (let i = 0; i < 2; i++) {
        const a1 = a0 + Math.PI / 4 * i, a2 = a1 + Math.PI / 4, am = (a1 + a2) / 2, f = 1 / Math.cos(Math.PI / 8);
        d += `Q${r2(cx + Math.cos(am) * rx * f)} ${r2(cy + Math.sin(am) * ry * f)} ${r2(cx + Math.cos(a2) * rx)} ${r2(cy + Math.sin(a2) * ry)}`;
      }
    };
    arc(x + w - rx, y + h - ry, 0); d += `L${r2(x + rx)} ${r2(y + h)}`;
    arc(x + rx, y + h - ry, Math.PI / 2); d += `L${r2(x)} ${r2(y + ry)}`;
    arc(x + rx, y + ry, Math.PI); d += `L${r2(x + w - rx)} ${r2(y)}`;
    arc(x + w - rx, y + ry, Math.PI * 1.5); d += `L${r2(x + w)} ${r2(y + h - ry)}`;
    this.shape(d, x, y, x + w, y + h);
    this.x = x + w; this.y = y + h - ry;
  }
  drawEllipse(x: number, y: number, w: number, h: number) {
    const rx = w / 2, ry = h / 2, cx = x + rx, cy = y + ry;
    this.moveTo(cx + rx, cy);
    let d = '';
    const f = 1 / Math.cos(Math.PI / 8);
    for (let i = 0; i < 8; i++) {
      const a1 = i * Math.PI / 4, a2 = a1 + Math.PI / 4, am = (a1 + a2) / 2;
      d += `Q${r2(cx + Math.cos(am) * rx * f)} ${r2(cy + Math.sin(am) * ry * f)} ${r2(cx + Math.cos(a2) * rx)} ${r2(cy + Math.sin(a2) * ry)}`;
    }
    this.shape(d, x, y, x + w, y + h);
    this.x = cx + rx; this.y = cy;
  }
  drawCircle(x: number, y: number, r: number) { this.drawEllipse(x - r, y - r, r * 2, r * 2); }
  copyFrom(g: Graphics) { this.clear(); this.draws = g.draws.map(d => ({ ...d, p: undefined })); this.bounds = g.bounds?.clone() ?? null; this.touch(); }
  // finalizes pending paths so they can be rendered
  get renderDraws() {
    if (this.fill && this.fd) {
      const tmp = this.fd + (this.x !== this.sx || this.y !== this.sy ? `L${r2(this.sx)} ${r2(this.sy)}` : '');
      const d = { f: this.fill, d: tmp };
      return this.lineDraw ? [...this.draws.slice(0, this.draws.indexOf(this.lineDraw)), d, ...this.draws.slice(this.draws.indexOf(this.lineDraw))] : [...this.draws, d];
    }
    return this.draws;
  }
}
