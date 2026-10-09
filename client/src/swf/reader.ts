// Minimal little-endian byte/bit reader for SWF structures.
export class Reader {
  d: Uint8Array;
  v: DataView;
  p: number;
  bit = 0; // bits remaining in cur
  cur = 0;

  constructor(d: Uint8Array, p = 0) {
    this.d = d;
    this.v = new DataView(d.buffer, d.byteOffset, d.byteLength);
    this.p = p;
  }
  align() { this.bit = 0; }
  u8() { this.bit = 0; return this.d[this.p++]; }
  u16() { this.bit = 0; const r = this.v.getUint16(this.p, true); this.p += 2; return r; }
  s16() { this.bit = 0; const r = this.v.getInt16(this.p, true); this.p += 2; return r; }
  u32() { this.bit = 0; const r = this.v.getUint32(this.p, true); this.p += 4; return r; }
  f32() { this.bit = 0; const r = this.v.getFloat32(this.p, true); this.p += 4; return r; }
  fixed8() { return this.s16() / 256; }
  fixed16() { this.bit = 0; const r = this.v.getInt32(this.p, true) / 65536; this.p += 4; return r; }
  ub(n: number) {
    let r = 0;
    while (n > 0) {
      if (this.bit === 0) { this.cur = this.d[this.p++]; this.bit = 8; }
      const take = Math.min(n, this.bit);
      r = (r << take) | ((this.cur >> (this.bit - take)) & ((1 << take) - 1));
      this.bit -= take; n -= take;
    }
    return r >>> 0;
  }
  sb(n: number) {
    if (n === 0) return 0;
    const r = this.ub(n);
    return n < 32 && r & (1 << (n - 1)) ? r - (1 << n) : r | 0;
  }
  fb(n: number) { return this.sb(n) / 65536; }
  str() {
    this.bit = 0;
    let e = this.p;
    while (this.d[e]) e++;
    const s = new TextDecoder().decode(this.d.subarray(this.p, e));
    this.p = e + 1;
    return s;
  }
  bytes(n: number) { this.bit = 0; const r = this.d.subarray(this.p, this.p + n); this.p += n; return r; }

  rect() {
    this.align();
    const n = this.ub(5);
    const r = [this.sb(n), this.sb(n), this.sb(n), this.sb(n)]; // xmin xmax ymin ymax (twips)
    this.align();
    return r;
  }
  // [a, b, c, d, tx, ty] with tx/ty in twips
  matrix(): number[] {
    this.align();
    let a = 1, b = 0, c = 0, d = 1;
    if (this.ub(1)) { const n = this.ub(5); a = this.fb(n); d = this.fb(n); }
    if (this.ub(1)) { const n = this.ub(5); b = this.fb(n); c = this.fb(n); }
    const n = this.ub(5);
    const tx = this.sb(n), ty = this.sb(n);
    this.align();
    return [a, b, c, d, tx, ty];
  }
  // [rm, gm, bm, am, ra, ga, ba, aa] multipliers as 0..1, adds as -255..255
  cxform(alpha: boolean): number[] {
    this.align();
    const hasAdd = this.ub(1), hasMul = this.ub(1), n = this.ub(4);
    const r = [1, 1, 1, 1, 0, 0, 0, 0];
    if (hasMul) { r[0] = this.sb(n) / 256; r[1] = this.sb(n) / 256; r[2] = this.sb(n) / 256; if (alpha) r[3] = this.sb(n) / 256; }
    if (hasAdd) { r[4] = this.sb(n); r[5] = this.sb(n); r[6] = this.sb(n); if (alpha) r[7] = this.sb(n); }
    this.align();
    return r;
  }
  rgb() { const r = this.u8(), g = this.u8(), b = this.u8(); return (255 << 24 | r << 16 | g << 8 | b) >>> 0; }
  rgba() { const r = this.u8(), g = this.u8(), b = this.u8(), a = this.u8(); return (a << 24 | r << 16 | g << 8 | b) >>> 0; }
  argb() { const a = this.u8(), r = this.u8(), g = this.u8(), b = this.u8(); return (a << 24 | r << 16 | g << 8 | b) >>> 0; }
}

export interface Tag { code: number; start: number; len: number }

export function readTags(r: Reader, end: number): Tag[] {
  const out: Tag[] = [];
  while (r.p < end) {
    const h = r.u16();
    const code = h >> 6;
    let len = h & 0x3f;
    if (len === 0x3f) len = r.u32();
    out.push({ code, start: r.p, len });
    r.p += len;
    if (code === 0) break;
  }
  return out;
}
