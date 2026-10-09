// flash.utils: deterministic virtual clock, timers, ByteArray (with zlib), Dictionary and helpers.
import { EventDispatcher, TimerEvent } from './events.ts';
import { inflate, deflate } from './zlib.ts';

// The game runs on a virtual clock that advances 33/33/34 ms per 30 fps frame,
// matching Flash's integer getTimer() at an exact 30 fps.
export const clock = { now: 0, frame: 0 };
export function getTimer() { return clock.now; }
// Wall-clock milliseconds, for code that budgets work per frame ("stop after 66 ms and continue next
// frame"): the virtual clock above doesn't advance within a frame, so such loops would never yield.
const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
export function realTimer() { return Math.floor(performance.now() - t0); }

interface T { id: number; fn: Function; args: any[]; due: number; every: number; seq: number }
const timers = new Map<number, T>();
let nextId = 1, seq = 0;
export function setTimeout(fn: Function, delay: number = 0, ...args: any[]) {
  const id = nextId++;
  timers.set(id, { id, fn, args, due: clock.now + Math.max(0, +delay || 0), every: 0, seq: seq++ });
  return id;
}
export function setInterval(fn: Function, delay: number, ...args: any[]) {
  const id = nextId++;
  const d = Math.max(1, +delay || 0);
  timers.set(id, { id, fn, args, due: clock.now + d, every: d, seq: seq++ });
  return id;
}
export function clearTimeout(id: any) { timers.delete(id); }
export const clearInterval = clearTimeout;
// Runs every timer due at the current virtual time, in due order (intervals may fire repeatedly to catch up, capped).
export function runTimers() {
  // timers created while this runs (e.g. setTimeout(f, 0) chains that split up loading work) wait for the
  // next frame, so long pipelines spread over frames instead of freezing one
  const limit = seq;
  for (let guard = 0; guard < 1000; guard++) {
    let best: T | null = null;
    for (const t of timers.values()) if (t.due <= clock.now && t.seq < limit && (!best || t.due < best.due || (t.due === best.due && t.seq < best.seq))) best = t;
    if (!best) return;
    if (best.every) { best.due += best.every; if (best.due <= clock.now - 200) best.due = clock.now + best.every; best.seq = seq++; }
    else timers.delete(best.id);
    try { best.fn(...best.args); } catch (e) { reportError(e); }
  }
}
export let reportError = (e: any) => console.error(e);
export function setErrorReporter(f: (e: any) => void) { reportError = f; }

export class Timer extends EventDispatcher {
  delay: number; repeatCount: number; currentCount = 0; private _id = 0;
  constructor(delay: number, repeatCount = 0) { super(); this.delay = delay; this.repeatCount = repeatCount; }
  get running() { return this._id !== 0; }
  start() {
    if (this._id) return;
    this._id = setInterval(() => {
      this.currentCount++;
      this.dispatchEvent(new TimerEvent(TimerEvent.TIMER));
      if (this.repeatCount > 0 && this.currentCount >= this.repeatCount) { this.stop(); this.dispatchEvent(new TimerEvent(TimerEvent.TIMER_COMPLETE)); }
    }, this.delay);
  }
  stop() { clearInterval(this._id); this._id = 0; }
  reset() { this.stop(); this.currentCount = 0; }
}

// AS3 Dictionary: a plain object whose object keys are dispatchers (see EventDispatcher[Symbol.toPrimitive]).
export class Dictionary {
  [k: string]: any;
  constructor(_weakKeys = false) {}
}

export function getQualifiedClassName(o: any): string {
  if (o === null || o === undefined) return 'null';
  if (typeof o === 'number') return Number.isInteger(o) ? 'int' : 'Number';
  if (typeof o === 'string') return 'String';
  if (typeof o === 'boolean') return 'Boolean';
  if (Array.isArray(o)) return 'Array';
  const c = typeof o === 'function' ? o : o.constructor;
  return c?.__qname ?? c?.name ?? 'Object';
}
export function trace(...a: any[]) { if ((globalThis as any).PR3_DEBUG) console.log(...a); }
// links from game text (level descriptions, PMs, chat) may only open web pages: a javascript:/data: url would run script on this origin
export function safeUrl(url: string) { try { return ['http:', 'https:'].includes(new URL(url, location.href).protocol); } catch { return false; } }
export function navigateToURL(req: any, target = '_blank') { const url = typeof req === 'string' ? req : req?.url; if (safeUrl(url)) window.open(url, target, 'noopener'); }
export function describeType(_o: any) { return null; }
export const escapeMultiByte = encodeURIComponent, unescapeMultiByte = decodeURIComponent;

const te = new TextEncoder(), td = new TextDecoder();
export class ByteArray {
  _u8 = new Uint8Array(64); _len = 0; position = 0; endian = 'bigEndian'; objectEncoding = 3;
  get length() { return this._len; }
  set length(n: number) { this._grow(n); this._len = n; if (this.position > n) this.position = n; }
  get bytesAvailable() { return this._len - this.position; }
  private _grow(n: number) { if (n > this._u8.length) { const b = new Uint8Array(Math.max(n, this._u8.length * 2)); b.set(this._u8.subarray(0, this._len)); this._u8 = b; } }
  private _dv() { return new DataView(this._u8.buffer, this._u8.byteOffset, this._u8.byteLength); }
  private _w(n: number) { this._grow(this.position + n); const p = this.position; this.position += n; if (this.position > this._len) this._len = this.position; return p; }
  private _r(n: number) { if (this.position + n > this._len) throw new RangeError('Error #2030: End of file was encountered.'); const p = this.position; this.position += n; return p; }
  get [Symbol.toStringTag]() { return 'ByteArray'; }
  static from(u8: Uint8Array) { const b = new ByteArray(); b._u8 = new Uint8Array(u8); b._len = u8.length; return b; }
  bytes() { return this._u8.subarray(0, this._len); }
  writeByte(v: number) { const p = this._w(1); this._u8[p] = v; }
  writeBoolean(v: boolean) { this.writeByte(v ? 1 : 0); }
  writeShort(v: number) { const p = this._w(2); this._dv().setInt16(p, v, this.endian === 'littleEndian'); }
  writeInt(v: number) { const p = this._w(4); this._dv().setInt32(p, v, this.endian === 'littleEndian'); }
  writeUnsignedInt(v: number) { const p = this._w(4); this._dv().setUint32(p, v >>> 0, this.endian === 'littleEndian'); }
  writeFloat(v: number) { const p = this._w(4); this._dv().setFloat32(p, v, this.endian === 'littleEndian'); }
  writeDouble(v: number) { const p = this._w(8); this._dv().setFloat64(p, v, this.endian === 'littleEndian'); }
  writeUTFBytes(s: string) { const b = te.encode(s); const p = this._w(b.length); this._u8.set(b, p); }
  writeUTF(s: string) { const b = te.encode(s); this.writeShort(b.length); const p = this._w(b.length); this._u8.set(b, p); }
  writeBytes(src: ByteArray, off = 0, len = 0) { const n = len || src._len - off; const d = src._u8.slice(off, off + n); const p = this._w(n); this._u8.set(d, p); }
  readByte() { const v = this._u8[this._r(1)]; return v > 127 ? v - 256 : v; }
  readUnsignedByte() { return this._u8[this._r(1)]; }
  readBoolean() { return this.readUnsignedByte() !== 0; }
  readShort() { return this._dv().getInt16(this._r(2), this.endian === 'littleEndian'); }
  readUnsignedShort() { return this._dv().getUint16(this._r(2), this.endian === 'littleEndian'); }
  readInt() { return this._dv().getInt32(this._r(4), this.endian === 'littleEndian'); }
  readUnsignedInt() { return this._dv().getUint32(this._r(4), this.endian === 'littleEndian'); }
  readFloat() { return this._dv().getFloat32(this._r(4), this.endian === 'littleEndian'); }
  readDouble() { return this._dv().getFloat64(this._r(8), this.endian === 'littleEndian'); }
  readUTFBytes(n: number) { const p = this._r(n); return td.decode(this._u8.subarray(p, p + n)); }
  readUTF() { return this.readUTFBytes(this.readUnsignedShort()); }
  readBytes(dst: ByteArray, off = 0, len = 0) {
    const n = len || this._len - this.position; const p = this._r(n);
    dst._grow(off + n); dst._u8.set(this._u8.subarray(p, p + n), off); if (off + n > dst._len) dst._len = off + n;
  }
  clear() { this._len = 0; this.position = 0; }
  compress(alg = 'zlib') { const out = deflate(this.bytes(), alg !== 'deflate'); this._u8 = out as Uint8Array<ArrayBuffer>; this._len = out.length; this.position = this._len; }
  uncompress(alg = 'zlib') { const out = inflate(this.bytes(), alg !== 'deflate'); this._u8 = out.length ? out as Uint8Array<ArrayBuffer> : new Uint8Array(1); this._len = out.length; this.position = 0; }
  deflate() { this.compress('deflate'); }
  inflate() { this.uncompress('deflate'); }
  toString() { return td.decode(this.bytes()); }
  // AMF is only used for deep cloning in the original; keep objects as-is
  writeObject(o: any) { (this as any)._obj = o; }
  readObject() { return structuredClone((this as any)._obj); }
}
