// Summarizes a .cpuprofile: top functions by self time and by inclusive time.
import { readFileSync } from 'node:fs';
const p = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const byId = new Map(p.nodes.map(n => [n.id, n]));
const self = new Map(); const dt = new Map();
for (let i = 0; i < p.samples.length; i++) dt.set(p.samples[i], (dt.get(p.samples[i]) ?? 0) + (p.timeDeltas[i] ?? 0));
const key = n => `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber + 1}`;
let total = 0;
for (const [id, t] of dt) { const n = byId.get(id); const k = key(n); self.set(k, (self.get(k) ?? 0) + t); total += t; }
const parent = new Map(); for (const n of p.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const incl = new Map();
for (const [id, t] of dt) { const seen = new Set(); for (let x = id; x; x = parent.get(x)) { const k = key(byId.get(x)); if (seen.has(k)) continue; seen.add(k); incl.set(k, (incl.get(k) ?? 0) + t); } }
const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, t]) => `${(t / 1000).toFixed(0).padStart(6)}ms ${(100 * t / total).toFixed(1).padStart(5)}%  ${k}`).join('\n');
console.log(`total ${(total / 1000).toFixed(0)}ms\n-- self --\n${top(self, +(process.argv[3] ?? 25))}\n-- inclusive --\n${top(incl, +(process.argv[3] ?? 25))}`);
