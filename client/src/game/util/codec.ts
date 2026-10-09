// Base64 / Hex / MD5 / Color helpers replacing com.hurlant, com.adobe.crypto and fl.motion.Color.
import { ByteArray, ColorTransform } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class Base64 {
  static encodeByteArray(b: ByteArray) { let s = ''; const u = b.bytes(); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); }
  static decodeToByteArray(s: string) { const bin = atob((s ?? '').replace(/[^A-Za-z0-9+/=]/g, '')); const u = new Uint8Array(bin.length); for (let i = 0; i < u.length; i++) u[i] = bin.charCodeAt(i); return ByteArray.from(u); }
  static encode(s: string) { const b = new ByteArray(); b.writeUTFBytes(s); return Base64.encodeByteArray(b); }
  static decode(s: string) { return Base64.decodeToByteArray(s).toString(); }
}
export class Hex {
  static fromArray(b: ByteArray) { return [...b.bytes()].map(x => x.toString(16).padStart(2, '0')).join(''); }
  static toArray(s: string) { const u = new Uint8Array(s.length >> 1); for (let i = 0; i < u.length; i++) u[i] = parseInt(s.substr(i * 2, 2), 16); return ByteArray.from(u); }
}
// compact MD5 (RFC 1321)
export class MD5 {
  static hash(s: string) {
    const b = new TextEncoder().encode(s);
    const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);
    const R = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    const n = ((b.length + 8) >> 6) + 1, w = new Uint32Array(n * 16);
    b.forEach((x, i) => (w[i >> 2] |= x << ((i % 4) * 8)));
    w[b.length >> 2] |= 0x80 << ((b.length % 4) * 8); w[n * 16 - 2] = b.length * 8;
    let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
    for (let o = 0; o < w.length; o += 16) {
      let [A, B, C, D] = [a0, b0, c0, d0];
      for (let i = 0; i < 64; i++) {
        const r = i >> 4; let F: number, g: number;
        if (r === 0) { F = (B & C) | (~B & D); g = i; } else if (r === 1) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (r === 2) { F = B ^ C ^ D; g = (3 * i + 5) % 16; } else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        const t = D; D = C; C = B;
        const x = (A + F + K[i] + w[o + g]) >>> 0, sh = R[r * 4 + (i % 4)];
        B = (B + ((x << sh) | (x >>> (32 - sh)))) >>> 0; A = t;
      }
      a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
    }
    return [a0, b0, c0, d0].map(v => [0, 8, 16, 24].map(s => ((v >>> s) & 255).toString(16).padStart(2, '0')).join('')).join('');
  }
}
// fl.motion.Color
export class Color extends ColorTransform {
  tintColor = 0; tintMultiplier = 0;
  setTint(color: number, mult: number) {
    this.tintColor = color; this.tintMultiplier = mult;
    this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 1 - mult;
    this.redOffset = ((color >> 16) & 255) * mult; this.greenOffset = ((color >> 8) & 255) * mult; this.blueOffset = (color & 255) * mult;
  }
  static interpolateTransform(a: ColorTransform, b: ColorTransform, p: number) {
    const l = (x: number, y: number) => x + (y - x) * p;
    return new ColorTransform(l(a.redMultiplier, b.redMultiplier), l(a.greenMultiplier, b.greenMultiplier), l(a.blueMultiplier, b.blueMultiplier), l(a.alphaMultiplier, b.alphaMultiplier),
      l(a.redOffset, b.redOffset), l(a.greenOffset, b.greenOffset), l(a.blueOffset, b.blueOffset), l(a.alphaOffset, b.alphaOffset));
  }
  static interpolateColor(a: number, b: number, p: number) {
    const c = (s: number) => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * p) << s;
    return (c(24) | c(16) | c(8) | c(0)) >>> 0;
  }
}
$reg('com.hurlant.util.Base64', Base64); $reg('com.hurlant.util.Hex', Hex); $reg('com.adobe.crypto.MD5', MD5); $reg('fl.motion.Color', Color);
