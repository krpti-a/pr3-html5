// Compares the port's physics trace with the original's (Ruffle) trace, step by step.
// Usage: node tools/physics/compare.mjs <scenario> [--tol=1e-9]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] ?? 'brick-run';
const tol = +(process.argv.find(a => a.startsWith('--tol='))?.slice(6) ?? 1e-9);
// steps after the reference's last frame are cut (the runners stop at slightly different points in that frame)
const ref = JSON.parse(readFileSync(join(here, `.out/ref-${name}.json`), 'utf8')).steps;
const lastFrame = ref.at(-1)?.[0] ?? 0;
const port = JSON.parse(readFileSync(join(here, `.out/port-${name}.json`), 'utf8')).steps.filter(s => s[0] <= lastFrame);
const COLS = ['frame', 'dt', 'x', 'y', 'velX', 'velY', 'realX', 'realY', 'rotation', 'state', 'remainingJumpVel', 'superJumpVel'];
let firstBad = -1, maxDiff = 0;
const n = Math.min(ref.length, port.length);
for (let i = 0; i < n && firstBad < 0; i++) {
  for (let c = 0; c < COLS.length; c++) {
    const a = ref[i][c], b = port[i][c];
    if (typeof a === 'number') {
      const d = Math.abs(a - b); if (d > maxDiff) maxDiff = d;
      if (!(d <= tol)) { firstBad = i; break; }
    } else if (a !== b) { firstBad = i; break; }
  }
}
console.log(`${name}: ref ${ref.length} steps, port ${port.length} steps, max |diff| before divergence ${maxDiff.toExponential(2)}`);
if (firstBad < 0 && ref.length === port.length) { console.log('IDENTICAL within tolerance', tol); process.exit(0); }
const i0 = firstBad < 0 ? Math.max(0, n - 3) : Math.max(0, firstBad - 2);
console.log(firstBad < 0 ? 'step count differs' : `first divergence at step ${firstBad}:`);
for (let i = i0; i < Math.min(n, (firstBad < 0 ? i0 + 3 : firstBad + 3)); i++) {
  console.log(' ref ', JSON.stringify(ref[i]));
  console.log(' port', JSON.stringify(port[i]));
  if (ref[i] && port[i]) console.log('  diff', COLS.map((c, k) => typeof ref[i][k] === 'number' && ref[i][k] !== port[i][k] ? `${c}:${(port[i][k] - ref[i][k]).toExponential(2)}` : (ref[i][k] !== port[i][k] ? `${c}:${ref[i][k]}->${port[i][k]}` : '')).filter(Boolean).join(' '));
}
process.exit(1);
