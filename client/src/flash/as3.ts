// AS3 language semantics used by the ported game code.
import { Dictionary } from './utils.ts';
import { objectKeys } from './events.ts';

// int()/uint() coercions (ToInt32 / ToUint32)
export const int: any = (v: any) => +v | 0;
int.MAX_VALUE = 2147483647; int.MIN_VALUE = -2147483648;
export const uint: any = (v: any) => +v >>> 0;
uint.MAX_VALUE = 4294967295; uint.MIN_VALUE = 0;

// `x is int` etc. via instanceof with custom hasInstance
const prim = (f: (v: any) => boolean) => ({ [Symbol.hasInstance]: f }) as any;
export const $int = prim(v => typeof v === 'number' && (v | 0) === v);
export const $uint = prim(v => typeof v === 'number' && v >>> 0 === v);
export const $Number = prim(v => typeof v === 'number');
export const $String = prim(v => typeof v === 'string');
export const $Boolean = prim(v => typeof v === 'boolean');
export const $Array = prim(v => Array.isArray(v));
export const $Function = prim(v => typeof v === 'function');
export const $Object = prim(v => v !== null && v !== undefined);
export const $Class = prim(v => typeof v === 'function');

// `x as T`
export function $as(v: any, T: any) { return v instanceof T ? v : null; }

// for each (x in o)
export function $each(o: any): any[] {
  if (o === null || o === undefined) return [];
  if (Array.isArray(o)) {
    // AS3 iterates set elements and dynamic properties: holes of sparse arrays (arrays indexed by socket
    // id) are skipped and string keys (arrays used as maps, e.g. statArray["speed"]) are included
    const keys = Object.keys(o);
    return keys.length === o.length ? o.slice() : keys.map(k => o[k]);
  }
  if (o instanceof Map) return [...o.values()];
  if (typeof o.length === 'function' && typeof o.item === 'function') return o.toArray();
  return Object.keys(o).map(k => o[k]);
}
export function $keys(o: any): any[] {
  if (o === null || o === undefined) return [];
  if (o instanceof Map) return [...o.keys()];
  if (o instanceof Dictionary) return Object.keys(o).map(k => (k[0] === '\u0001' ? objectKeys.get(k)?.deref() : /^-?\d+(\.\d+)?$/.test(k) ? +k : k)).filter(k => k !== undefined);
  if (Array.isArray(o)) { const r: any[] = []; for (const k in o) r.push(k); return r; }
  return Object.keys(o);
}

// Bound method closures (AS3 method references keep `this` and are identical across reads).
const bound = new WeakMap<object, Map<Function, Function>>();
export function $b(o: any, name: string) {
  const f = o?.[name];
  if (typeof f !== 'function' || !Object.getPrototypeOf(o)?.[name] || Object.prototype.hasOwnProperty.call(o, name)) return f;
  let m = bound.get(o);
  if (!m) { m = new Map(); bound.set(o, m); }
  let b = m.get(f);
  if (!b) { b = f.bind(o); m.set(f, b!); }
  return b;
}

// AS3 Array extras
const A: any = Array;
A.CASEINSENSITIVE = 1; A.DESCENDING = 2; A.UNIQUESORT = 4; A.RETURNINDEXEDARRAY = 8; A.NUMERIC = 16;
const nativeSort = Array.prototype.sort;
function cmpFor(flags: number) {
  const num = flags & 16, ci = flags & 1, desc = flags & 2 ? -1 : 1;
  return (a: any, b: any) => {
    let r: number;
    if (num) r = +a - +b;
    else { let x = String(a), y = String(b); if (ci) { x = x.toLowerCase(); y = y.toLowerCase(); } r = x < y ? -1 : x > y ? 1 : 0; }
    return r * desc;
  };
}
Object.defineProperty(Array.prototype, 'sort', {
  configurable: true, writable: true,
  value: function (this: any[], a?: any, b?: any) {
    if (typeof a === 'number') return nativeSort.call(this, cmpFor(a));
    if (typeof a === 'function' && typeof b === 'number') { const r = nativeSort.call(this, a); if (b & 2) r.reverse(); return r; }
    return nativeSort.call(this, a ?? ((x: any, y: any) => { const s = String(x), t = String(y); return s < t ? -1 : s > t ? 1 : 0; }));
  },
});
Object.defineProperty(Array.prototype, 'sortOn', {
  configurable: true, writable: true,
  value: function (this: any[], names: any, opts: any = 0) {
    const ns: string[] = Array.isArray(names) ? names : [names];
    const os: number[] = Array.isArray(opts) ? opts : ns.map(() => opts);
    const idx = this.map((v, i) => i);
    idx.sort((i, j) => {
      for (let k = 0; k < ns.length; k++) { const r = cmpFor(os[k] ?? 0)(this[i]?.[ns[k]], this[j]?.[ns[k]]); if (r) return r; }
      return i - j;
    });
    if ((os[0] ?? 0) & 8) return idx;
    const copy = idx.map(i => this[i]);
    for (let i = 0; i < copy.length; i++) this[i] = copy[i];
    return this;
  },
});

// AS3 Date properties
for (const [p, g, s] of [['time', 'getTime', 'setTime'], ['fullYear', 'getFullYear', 'setFullYear'], ['month', 'getMonth', 'setMonth'], ['date', 'getDate', 'setDate'],
  ['day', 'getDay', ''], ['hours', 'getHours', 'setHours'], ['minutes', 'getMinutes', 'setMinutes'], ['seconds', 'getSeconds', 'setSeconds'],
  ['milliseconds', 'getMilliseconds', 'setMilliseconds'], ['timezoneOffset', 'getTimezoneOffset', ''], ['fullYearUTC', 'getUTCFullYear', ''], ['monthUTC', 'getUTCMonth', ''],
  ['dateUTC', 'getUTCDate', ''], ['hoursUTC', 'getUTCHours', ''], ['minutesUTC', 'getUTCMinutes', '']]) {
  Object.defineProperty(Date.prototype, p, {
    configurable: true,
    get(this: any) { return this[g](); },
    set(this: any, v: any) { if (s) this[s](v); },
  });
}
// AS3 XML-ish helpers used by the API layer
export function $xml(o: any) { return o; }
// Error.getStackTrace()
(Error.prototype as any).getStackTrace = function (this: Error) { return this.stack ?? String(this); };
declare global {
  interface ArrayConstructor { CASEINSENSITIVE: number; DESCENDING: number; UNIQUESORT: number; RETURNINDEXEDARRAY: number; NUMERIC: number }
  interface Array<T> { sortOn(names: any, options?: any): any; removeAt(i: number): T; insertAt(i: number, v: T): void }
  interface Error { getStackTrace(): string; errorID?: number }
  interface Date { time: number; fullYear: number; month: number; date: number; day: number; hours: number; minutes: number; seconds: number; milliseconds: number }
}
Object.defineProperty(Array.prototype, 'removeAt', { configurable: true, writable: true, value(this: any[], i: number) { return this.splice(i, 1)[0]; } });
Object.defineProperty(Array.prototype, 'insertAt', { configurable: true, writable: true, value(this: any[], i: number, v: any) { this.splice(i, 0, v); } });
