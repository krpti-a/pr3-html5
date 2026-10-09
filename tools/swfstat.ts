import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { Reader, readTags } from '../client/src/swf/reader.ts';
const f = readFileSync(process.argv[2]);
const body = f[0] === 0x43 ? inflateSync(f.subarray(8)) : f.subarray(8);
const r = new Reader(new Uint8Array(body));
r.rect(); r.u16(); r.u16();
const tags = readTags(r, body.length);
const cnt: Record<number, [number, number]> = {};
for (const t of tags) { (cnt[t.code] ??= [0, 0]); cnt[t.code][0]++; cnt[t.code][1] += t.len; }
console.log(Object.entries(cnt).map(([c, [n, l]]) => `${c}: ${n} tags, ${l} bytes`).join('\n'));
// sprite inner tags
const inner: Record<number, number> = {};
for (const t of tags) if (t.code === 39) { const rr = new Reader(r.d, t.start); rr.u16(); rr.u16(); for (const it of readTags(rr, t.start + t.len)) inner[it.code] = (inner[it.code] ?? 0) + 1; }
console.log('sprite inner', inner);
