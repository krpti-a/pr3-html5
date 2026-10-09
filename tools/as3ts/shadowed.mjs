// Lists AS3 class members sharing a name with a private member of an ancestor (they collide in TS; see PRIVATE_RENAMES in patches.mjs).
// Usage: node tools/as3ts/shadowed.mjs "${PR3_REPO:-../pr3}/reverse/as3-fixed"  (vars matched inside function bodies are false positives)
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const root = process.argv[2];
const files = execSync(`find ${root} -name '*.as'`).toString().trim().split('\n');
const classes = {};
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const cm = src.match(/class\s+(\w+)(?:\s+extends\s+([\w.]+))?/); if (!cm) continue;
  const name = cm[1], ext = cm[2]?.split('.').pop();
  const members = {};
  const re = /^\s*((?:(?:public|private|protected|internal|static|override|final)\s+)*)(function\s+(?:get\s+|set\s+)?|var\s+|const\s+)(\w+)/gm;
  let m;
  while ((m = re.exec(src))) {
    const mods = m[1]; if (/static/.test(mods)) continue;
    const id = m[3]; if (id === name) continue;
    (members[id] ??= []).push({ priv: /private/.test(mods), override: /override/.test(mods), kind: m[2].trim() });
  }
  classes[name] = { ext, members, file: f };
}
const out = [];
for (const [name, c] of Object.entries(classes)) {
  for (const [id, defs] of Object.entries(c.members)) {
    for (let a = classes[c.ext], an = c.ext; a; an = a.ext, a = classes[a.ext]) {
      const ad = a.members[id];
      if (!ad) continue;
      if (ad.some(d => d.priv) || defs.some(d => d.priv)) out.push(`${name}.${id} (${defs.map(d => (d.priv ? 'private ' : '') + (d.override ? 'override ' : '') + d.kind).join('/')})  shadows  ${an}.${id} (${ad.map(d => (d.priv ? 'private ' : '') + d.kind).join('/')})`);
      break;
    }
  }
}
console.log(out.sort().join('\n')); console.log(out.length, 'collisions');
