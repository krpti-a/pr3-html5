// Imports data from the original PR3 Postgres database (the Docker "pr3-local" stack) into SQLite.
// Usage: node tools/import-postgres.mjs <out.db> [--all] [--no-accounts] [--container=pr3-local-database-1]
//   default set: campaign levels, the curated PR3Hub snapshot, all levels made by local accounts
//   --all: every level in the database (Lua-scripted Reborn levels are always skipped)
//   --no-accounts: do not copy local accounts/progress (for a shareable seed database)
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { rmSync, existsSync } from 'node:fs';
import { inflateRawSync, inflateSync } from 'node:zlib';
import { openDb, z } from '../server/db.js';

const args = process.argv.slice(2);
const out = args.find(a => !a.startsWith('--')) ?? 'data/pr3.db';
const ALL = args.includes('--all');
const ACCOUNTS = !args.includes('--no-accounts');
const CONTAINER = (args.find(a => a.startsWith('--container=')) ?? '--container=pr3-local-database-1').split('=')[1];

async function* rows(sql) {
  const p = spawn('docker', ['exec', CONTAINER, 'psql', '-U', 'pr3', '-d', 'pr3', '-At', '-c', `SELECT row_to_json(t) FROM (${sql}) t`]);
  let err = '';
  p.stderr.on('data', d => (err += d));
  for await (const line of createInterface({ input: p.stdout, crlfDelay: Infinity })) if (line) yield JSON.parse(line);
  await new Promise(r => p.on('close', r));
  if (err.trim()) throw new Error(err);
}
const all = async sql => { const a = []; for await (const r of rows(sql)) a.push(r); return a; };

if (existsSync(out)) rmSync(out);
for (const ext of ['-wal', '-shm']) if (existsSync(out + ext)) rmSync(out + ext);
const db = openDb(out);
db.exec('BEGIN');

// ---------- levels to import
const LATEST = `SELECT DISTINCT ON (id) * FROM base.levels ORDER BY id, version DESC`;
let levelFilter;
if (ALL) levelFilter = `TRUE`;
else levelFilter = `l.id IN (SELECT level_id FROM base.campaigns) OR l.id IN (SELECT local_level_id FROM base.archived_pr3hub_levels a WHERE a.remote_level_id IN (${await snapshotIds()})) OR t.author_user_id < 1000000`;
async function snapshotIds() {
  // levels listed in the committed curated snapshot (seed/pr3hub-levels.sql)
  const { readFileSync } = await import('node:fs');
  const sqlFile = new URL(`../${process.env.PR3_REPO ?? '../pr3'}/seed/pr3hub-levels.sql`, import.meta.url);
  const ids = [...readFileSync(sqlFile, 'utf8').matchAll(/archived_pr3hub_levels \([^)]*\) VALUES \(\d+, (\d+),/g)].map(m => m[1]);
  return ids.length ? ids.join(',') : '0';
}
const levelSql = `SELECT l.*, t.title, t.author_user_id, coalesce(p.plays, 0) AS plays FROM (${LATEST}) l JOIN base.levels_titles t ON t.id = l.id
  LEFT JOIN base.levels_plays p ON p.level_id = l.id WHERE length(l.lua) = 0 AND (${levelFilter})`;

const blockIds = new Set();
const authors = new Set();
const insTitle = db.prepare('INSERT OR REPLACE INTO level_titles (id, title, author_id, plays) VALUES (?, ?, ?, ?)');
const insLevel = db.prepare(`INSERT OR REPLACE INTO levels (id, version, description, publish, song_id, mode, seconds, gravity, alien, sfchm, snow, wind, items, health, koth, bg_image, data, updated)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
let nLevels = 0;
for await (const l of rows(levelSql)) {
  insTitle.run(l.id, l.title, l.author_user_id, l.plays);
  const items = (l.items ?? []).join(',');
  insLevel.run(l.id, l.version, l.description, l.publish ? 1 : 0, l.song_id, l.mode, l.seconds, l.gravity, l.alien, l.sfchm, l.snow, l.wind, items, l.health,
    (l.king_of_the_hat ?? []).join(':'), l.bg_image, z(l.level_data), Math.floor(Date.parse(l.last_updated + 'Z') / 1000) || 0);
  for (const id of levelBlockIds(l.level_data)) blockIds.add(id);
  authors.add(l.author_user_id);
  nLevels++;
}
console.log(`levels: ${nLevels}`);

function levelBlockIds(data) {
  let s = data ?? '';
  try {
    if (s.startsWith('v2 | ')) s = JSON.parse(s.slice(5)).blockStr ?? '';
    else if (s.startsWith('v3 | ')) {
      const b = Buffer.from(s.slice(5), 'base64');
      if (b.readInt32BE(0) > 0) { const len = b.readUInt32BE(8); s = inflateRawSync(b.subarray(12, 12 + len)).toString(); } else s = '';
    } else s = JSON.parse(inflateSync(Buffer.from(s, 'base64')).toString()).blockStr ?? '';
  } catch { s = ''; }
  if (typeof s !== 'string') s = '';
  const ids = [];
  for (const m of s.matchAll(/(?:^|,)b(\d+)/g)) ids.push(+m[1]);
  return ids;
}

// ---------- campaign
for (const c of await all(`SELECT * FROM base.campaigns`))
  db.prepare('INSERT OR REPLACE INTO campaigns VALUES (?, ?, ?, ?, ?, ?, ?)').run(c.level_id, c.bronze_time, c.silver_time, c.gold_time, c.medals_required, c.season, c.level_order);
for (const p of await all(`SELECT * FROM base.campaigns_prizes`))
  db.prepare('INSERT INTO campaign_prizes VALUES (?, ?, ?, ?)').run(p.season, p.type, p.id, p.medals_required);
for (const p of await all(`SELECT * FROM base.levels_prize`))
  db.prepare('INSERT INTO level_prizes VALUES (?, ?, ?)').run(p.level_id, p.part_type, p.part_id);

// ---------- blocks (referenced + transitive dependencies + local accounts' own blocks)
const insBT = db.prepare('INSERT OR REPLACE INTO block_titles (id, title, category, author_id) VALUES (?, ?, ?, ?)');
const insB = db.prepare('INSERT OR REPLACE INTO blocks (id, version, description, image, settings, updated) VALUES (?, ?, ?, ?, ?, ?)');
const done = new Set();
let pending = [...blockIds].filter(id => id > 700);
const BLOCK_SQL = ids => `SELECT b.*, t.title, t.category, t.author_user_id FROM (SELECT DISTINCT ON (id) * FROM base.blocks WHERE id IN (${ids}) ORDER BY id, version DESC) b JOIN base.blocks_titles t ON t.id = b.id`;
if (ACCOUNTS || ALL) for (const r of await all(`SELECT id FROM base.blocks_titles WHERE author_user_id < 1000000`)) pending.push(r.id);
while (pending.length) {
  const batch = [...new Set(pending.filter(id => !done.has(id)))].slice(0, 2000);
  pending = pending.filter(id => !batch.includes(id) && !done.has(id));
  if (!batch.length) break;
  batch.forEach(id => done.add(id));
  for await (const b of rows(BLOCK_SQL(batch.join(',')))) {
    insBT.run(b.id, b.title, b.category, b.author_user_id);
    insB.run(b.id, b.version, b.description, z(b.image_data), z(b.settings), Math.floor(Date.parse(b.last_updated + 'Z') / 1000) || 0);
    authors.add(b.author_user_id);
    for (const dep of blockDeps(b.settings)) if (!done.has(dep) && dep > 700) pending.push(dep);
  }
}
console.log(`blocks: ${done.size}`);
function blockDeps(settings) {
  try {
    let s = settings ?? '';
    s = s.startsWith('v2 | ') ? s.slice(5) : inflateSync(Buffer.from(s, 'base64')).toString();
    const o = JSON.parse(s);
    return [...(o.changePattern ?? []), o.generatorBlockID, o.itemType?.settings?.p?.id].filter(x => Number.isFinite(+x)).map(Number);
  } catch { return []; }
}

// ---------- users (authors always; local accounts optionally with credentials and progress)
const userSql = `SELECT * FROM base.users WHERE id IN (${[...authors].join(',') || 0})${ACCOUNTS ? ' OR id < 1000000' : ''}`;
const insU = db.prepare(`INSERT OR REPLACE INTO users (id, username, password, email, register_time, last_online, permission_rank, name_color, group_name, total_exp, bonus_exp,
  hats, heads, bodys, feets, hat, hat_color, head, head_color, body, body_color, feet, feet_color, speed, accel, jump, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
let nUsers = 0;
for await (const u of rows(userSql)) {
  const local = u.id < 1000000 && ACCOUNTS;
  insU.run(u.id, u.username, local ? u.password : '', local ? u.email : '', Math.floor(Date.parse(u.register_time + 'Z') / 1000) || 0, null,
    local ? u.permission_rank : 0, u.name_color, u.group_name, local ? u.total_exp : 0, local ? u.bonus_exp : 0,
    JSON.stringify(local ? u.hats : [1]), JSON.stringify(local ? u.heads : [1, 2, 3]), JSON.stringify(local ? u.bodys : [1, 2, 3]), JSON.stringify(local ? u.feets : [1, 2, 3]),
    u.current_hat, u.current_hat_color, u.current_head, u.current_head_color, u.current_body, u.current_body_color, u.current_feet, u.current_feet_color,
    u.speed, u.accel, u.jump, local ? 0 : 1);
  nUsers++;
}
console.log(`users: ${nUsers}`);
if (ACCOUNTS) {
  for (const r of await all(`SELECT * FROM base.campaigns_runs WHERE user_id < 1000000`))
    db.prepare('INSERT INTO campaign_runs (category, level_id, level_version, user_id, recorded_run, finish_time, ts) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(r.category, r.level_id, r.level_version, r.user_id, r.recorded_run ?? '', r.finish_time, Math.floor(Date.parse(r.timestamp + 'Z') / 1000) || 0);
  for (const r of await all(`SELECT * FROM base.friends WHERE user_id < 1000000`)) db.prepare('INSERT OR IGNORE INTO friends VALUES (?, ?)').run(r.user_id, r.friend_user_id);
  for (const r of await all(`SELECT * FROM base.ignored WHERE user_id < 1000000`)) db.prepare('INSERT OR IGNORE INTO ignored VALUES (?, ?)').run(r.user_id, r.ignored_user_id);
  for (const r of await all(`SELECT * FROM base.levels_ratings`)) db.prepare('INSERT OR IGNORE INTO level_ratings VALUES (?, ?, ?)').run(r.level_id, r.user_id, r.rating === 'like' ? 1 : -1);
}
// keep new ids above imported ones
db.exec(`INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('level_titles', (SELECT max(2000000, coalesce(max(id), 0)) FROM level_titles)), ('block_titles', (SELECT max(3000000, coalesce(max(id), 0)) FROM block_titles)), ('stamp_titles', (SELECT max(1000, coalesce(max(id), 0)) FROM stamp_titles))`);
db.exec('COMMIT');
db.exec('VACUUM');
db.close();
console.log(`wrote ${out}`);
