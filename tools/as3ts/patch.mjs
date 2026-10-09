// Applies hand-made fixes to freshly converted files (keeps the AS3 conversion re-runnable).
// Each patch: [file, find, replace]; a missing "find" is reported so stale patches are noticed.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PATCHES, PRIVATE_RENAMES } from './patches.mjs';
const root = process.argv[2] ?? 'client/src/game';
let ok = 0, bad = 0;
for (const [file, find, repl] of PATCHES) {
  const p = join(root, file);
  const s = readFileSync(p, 'utf8');
  if (s.includes(find)) { writeFileSync(p, s.split(find).join(repl)); ok++; }
  else if (!repl || !s.includes(repl)) { console.warn(`patch not applied: ${file}: ${find.slice(0, 60)}`); bad++; }
}
for (const [file, name] of PRIVATE_RENAMES) {
  const p = join(root, file);
  const s = readFileSync(p, 'utf8');
  const to = `${name}$${file.split('/').pop().replace('.ts', '')}`;
  const re = new RegExp(`(?<![\\w$])${name}(?![\\w$])`, 'g');
  if (re.test(s)) { writeFileSync(p, s.replace(re, to)); ok++; }
  else if (!s.includes(to)) { console.warn(`rename not applied: ${file}: ${name}`); bad++; }
}
console.log(`patches: ${ok} applied, ${bad} failed`);
