// flash.geom equivalents (Point, Rectangle, Matrix, ColorTransform).
export class Point {
  x: number; y: number;
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  get length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  add(p: Point) { return new Point(this.x + p.x, this.y + p.y); }
  subtract(p: Point) { return new Point(this.x - p.x, this.y - p.y); }
  clone() { return new Point(this.x, this.y); }
  equals(p: Point) { return p.x === this.x && p.y === this.y; }
  offset(dx: number, dy: number) { this.x += dx; this.y += dy; }
  setTo(x: number, y: number) { this.x = x; this.y = y; }
  copyFrom(p: Point) { this.x = p.x; this.y = p.y; }
  normalize(len: number) {
    const l = this.length;
    if (l > 0) { const s = len / l; this.x *= s; this.y *= s; }
  }
  toString() { return `(x=${this.x}, y=${this.y})`; }
  static distance(a: Point, b: Point) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }
  static interpolate(a: Point, b: Point, f: number) { return new Point(b.x + (a.x - b.x) * f, b.y + (a.y - b.y) * f); }
  static polar(len: number, ang: number) { return new Point(len * Math.cos(ang), len * Math.sin(ang)); }
}

export class Rectangle {
  x: number; y: number; width: number; height: number;
  constructor(x = 0, y = 0, width = 0, height = 0) { this.x = x; this.y = y; this.width = width; this.height = height; }
  get left() { return this.x; }
  set left(v) { this.width -= v - this.x; this.x = v; }
  get right() { return this.x + this.width; }
  set right(v) { this.width = v - this.x; }
  get top() { return this.y; }
  set top(v) { this.height -= v - this.y; this.y = v; }
  get bottom() { return this.y + this.height; }
  set bottom(v) { this.height = v - this.y; }
  get topLeft() { return new Point(this.x, this.y); }
  get bottomRight() { return new Point(this.right, this.bottom); }
  get size() { return new Point(this.width, this.height); }
  clone() { return new Rectangle(this.x, this.y, this.width, this.height); }
  isEmpty() { return this.width <= 0 || this.height <= 0; }
  setEmpty() { this.x = this.y = this.width = this.height = 0; }
  setTo(x: number, y: number, w: number, h: number) { this.x = x; this.y = y; this.width = w; this.height = h; }
  copyFrom(r: Rectangle) { this.setTo(r.x, r.y, r.width, r.height); }
  contains(x: number, y: number) { return x >= this.x && x < this.right && y >= this.y && y < this.bottom; }
  containsPoint(p: Point) { return this.contains(p.x, p.y); }
  containsRect(r: Rectangle) { return r.x >= this.x && r.y >= this.y && r.right <= this.right && r.bottom <= this.bottom; }
  intersects(r: Rectangle) { return !this.intersection(r).isEmpty(); }
  intersection(r: Rectangle) {
    const x = Math.max(this.x, r.x), y = Math.max(this.y, r.y);
    const R = Math.min(this.right, r.right), B = Math.min(this.bottom, r.bottom);
    return R <= x || B <= y ? new Rectangle() : new Rectangle(x, y, R - x, B - y);
  }
  union(r: Rectangle) {
    if (this.isEmpty()) return r.clone();
    if (r.isEmpty()) return this.clone();
    const x = Math.min(this.x, r.x), y = Math.min(this.y, r.y);
    return new Rectangle(x, y, Math.max(this.right, r.right) - x, Math.max(this.bottom, r.bottom) - y);
  }
  inflate(dx: number, dy: number) { this.x -= dx; this.y -= dy; this.width += dx * 2; this.height += dy * 2; }
  offset(dx: number, dy: number) { this.x += dx; this.y += dy; }
  offsetPoint(p: Point) { this.offset(p.x, p.y); }
  equals(r: Rectangle) { return r.x === this.x && r.y === this.y && r.width === this.width && r.height === this.height; }
  toString() { return `(x=${this.x}, y=${this.y}, w=${this.width}, h=${this.height})`; }
}

export class Matrix {
  a: number; b: number; c: number; d: number; tx: number; ty: number;
  constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) { this.a = a; this.b = b; this.c = c; this.d = d; this.tx = tx; this.ty = ty; }
  static from(m: number[]) { return new Matrix(m[0], m[1], m[2], m[3], m[4], m[5]); }
  clone() { return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty); }
  copyFrom(m: Matrix) { this.a = m.a; this.b = m.b; this.c = m.c; this.d = m.d; this.tx = m.tx; this.ty = m.ty; }
  setTo(a: number, b: number, c: number, d: number, tx: number, ty: number) { this.a = a; this.b = b; this.c = c; this.d = d; this.tx = tx; this.ty = ty; }
  identity() { this.setTo(1, 0, 0, 1, 0, 0); }
  // this = this * m  (apply this, then m) — same as flash concat
  concat(m: Matrix) {
    const { a, b, c, d, tx, ty } = this;
    this.a = a * m.a + b * m.c; this.b = a * m.b + b * m.d;
    this.c = c * m.a + d * m.c; this.d = c * m.b + d * m.d;
    this.tx = tx * m.a + ty * m.c + m.tx; this.ty = tx * m.b + ty * m.d + m.ty;
  }
  invert() {
    const { a, b, c, d, tx, ty } = this;
    const det = a * d - b * c;
    if (det === 0) { this.setTo(0, 0, 0, 0, -tx, -ty); return; }
    this.a = d / det; this.b = -b / det; this.c = -c / det; this.d = a / det;
    this.tx = -(this.a * tx + this.c * ty); this.ty = -(this.b * tx + this.d * ty);
  }
  translate(dx: number, dy: number) { this.tx += dx; this.ty += dy; }
  scale(sx: number, sy: number) { this.a *= sx; this.b *= sy; this.c *= sx; this.d *= sy; this.tx *= sx; this.ty *= sy; }
  rotate(r: number) { const cs = Math.cos(r), sn = Math.sin(r); this.concat(new Matrix(cs, sn, -sn, cs, 0, 0)); }
  createBox(sx: number, sy: number, rot = 0, tx = 0, ty = 0) {
    const cs = Math.cos(rot), sn = Math.sin(rot);
    this.setTo(sx * cs, sy * sn, -sx * sn, sy * cs, tx, ty);
  }
  createGradientBox(w: number, h: number, rot = 0, tx = 0, ty = 0) {
    this.createBox(w / 1638.4, h / 1638.4, rot, tx + w / 2, ty + h / 2);
  }
  transformPoint(p: Point) { return new Point(this.a * p.x + this.c * p.y + this.tx, this.b * p.x + this.d * p.y + this.ty); }
  deltaTransformPoint(p: Point) { return new Point(this.a * p.x + this.c * p.y, this.b * p.x + this.d * p.y); }
  toString() { return `(a=${this.a}, b=${this.b}, c=${this.c}, d=${this.d}, tx=${this.tx}, ty=${this.ty})`; }
}
// result = m1 * m2 (apply m1 first, then m2) — avoids allocation in hot paths
export function mul(m1: Matrix, m2: Matrix, out = new Matrix()) {
  const a = m1.a * m2.a + m1.b * m2.c, b = m1.a * m2.b + m1.b * m2.d;
  const c = m1.c * m2.a + m1.d * m2.c, d = m1.c * m2.b + m1.d * m2.d;
  const tx = m1.tx * m2.a + m1.ty * m2.c + m2.tx, ty = m1.tx * m2.b + m1.ty * m2.d + m2.ty;
  out.a = a; out.b = b; out.c = c; out.d = d; out.tx = tx; out.ty = ty;
  return out;
}

export class ColorTransform {
  redMultiplier: number; greenMultiplier: number; blueMultiplier: number; alphaMultiplier: number;
  redOffset: number; greenOffset: number; blueOffset: number; alphaOffset: number;
  constructor(rm = 1, gm = 1, bm = 1, am = 1, ro = 0, go = 0, bo = 0, ao = 0) {
    this.redMultiplier = rm; this.greenMultiplier = gm; this.blueMultiplier = bm; this.alphaMultiplier = am;
    this.redOffset = ro; this.greenOffset = go; this.blueOffset = bo; this.alphaOffset = ao;
  }
  static from(x: number[]) { return new ColorTransform(x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7]); }
  get color() { return ((this.redOffset & 255) << 16 | (this.greenOffset & 255) << 8 | (this.blueOffset & 255)) >>> 0; }
  set color(v: number) {
    this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 0;
    this.redOffset = (v >> 16) & 255; this.greenOffset = (v >> 8) & 255; this.blueOffset = v & 255;
  }
  // this = this applied after other... flash: concat(second) applies second first? Flash: combined = this then second
  concat(s: ColorTransform) {
    this.redOffset += s.redOffset * this.redMultiplier; this.greenOffset += s.greenOffset * this.greenMultiplier;
    this.blueOffset += s.blueOffset * this.blueMultiplier; this.alphaOffset += s.alphaOffset * this.alphaMultiplier;
    this.redMultiplier *= s.redMultiplier; this.greenMultiplier *= s.greenMultiplier;
    this.blueMultiplier *= s.blueMultiplier; this.alphaMultiplier *= s.alphaMultiplier;
  }
  clone() { return new ColorTransform(this.redMultiplier, this.greenMultiplier, this.blueMultiplier, this.alphaMultiplier, this.redOffset, this.greenOffset, this.blueOffset, this.alphaOffset); }
  isIdentity() {
    return this.redMultiplier === 1 && this.greenMultiplier === 1 && this.blueMultiplier === 1 && this.alphaMultiplier === 1 &&
      this.redOffset === 0 && this.greenOffset === 0 && this.blueOffset === 0 && this.alphaOffset === 0;
  }
  onlyAlpha() {
    return this.redMultiplier === 1 && this.greenMultiplier === 1 && this.blueMultiplier === 1 &&
      this.redOffset === 0 && this.greenOffset === 0 && this.blueOffset === 0 && this.alphaOffset === 0;
  }
  key() { return `${this.redMultiplier},${this.greenMultiplier},${this.blueMultiplier},${this.redOffset},${this.greenOffset},${this.blueOffset}`; }
  // applies to an ARGB uint, returns css rgba()
  apply(argb: number, alphaMul = 1) {
    const a = ((argb >>> 24) & 255), r = (argb >> 16) & 255, g = (argb >> 8) & 255, b = argb & 255;
    const R = clamp(r * this.redMultiplier + this.redOffset), G = clamp(g * this.greenMultiplier + this.greenOffset);
    const B = clamp(b * this.blueMultiplier + this.blueOffset), A = clamp(a * this.alphaMultiplier + this.alphaOffset);
    return `rgba(${R | 0},${G | 0},${B | 0},${(A / 255) * alphaMul})`;
  }
}
const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
export function css(argb: number, alpha = 1) {
  return `rgba(${(argb >> 16) & 255},${(argb >> 8) & 255},${argb & 255},${(((argb >>> 24) & 255) / 255) * alpha})`;
}
