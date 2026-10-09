// SQLite persistence (node:sqlite, no dependencies). Large text columns are stored deflated.
import { DatabaseSync } from 'node:sqlite';
import { deflateSync, inflateSync } from 'node:zlib';
import { existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDb(file, seed) {
  mkdirSync(dirname(file), { recursive: true });
  if (!existsSync(file) && seed && existsSync(seed)) copyFileSync(seed, file);
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = OFF;');
  db.exec(SCHEMA);
  // migrations
  if (!db.prepare('PRAGMA table_info(level_ratings)').all().some(c => c.name === 'rated_on')) db.exec('ALTER TABLE level_ratings ADD COLUMN rated_on INTEGER NOT NULL DEFAULT 0');
  // the host account that owns the bundled campaign levels (as in the original local setup's init.sql);
  // it has no password, so nobody can log in as it
  db.prepare(`INSERT OR IGNORE INTO users (id, username, email, group_name, heads, bodys, feets) VALUES (1, 'LocalHost', 'localhost@localhost.invalid', 'Host', '[1,2,3,26]', '[1,2,3,26]', '[1,2,3,26]')`).run();
  return db;
}

export const z = s => deflateSync(Buffer.from(s ?? '', 'utf8'));
export const unz = b => (b == null ? '' : typeof b === 'string' ? b : inflateSync(Buffer.from(b)).toString('utf8'));

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE, password TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
  register_time INTEGER NOT NULL DEFAULT (unixepoch()), last_online INTEGER, permission_rank INTEGER NOT NULL DEFAULT 0,
  name_color INTEGER NOT NULL DEFAULT -14855017, group_name TEXT NOT NULL DEFAULT 'Member', total_exp INTEGER NOT NULL DEFAULT 0, bonus_exp INTEGER NOT NULL DEFAULT 0,
  hats TEXT NOT NULL DEFAULT '[1]', heads TEXT NOT NULL DEFAULT '[1,2,3]', bodys TEXT NOT NULL DEFAULT '[1,2,3]', feets TEXT NOT NULL DEFAULT '[1,2,3]',
  hat INTEGER NOT NULL DEFAULT 1, hat_color INTEGER NOT NULL DEFAULT -16777216, head INTEGER NOT NULL DEFAULT 1, head_color INTEGER NOT NULL DEFAULT -16777216,
  body INTEGER NOT NULL DEFAULT 1, body_color INTEGER NOT NULL DEFAULT -16777216, feet INTEGER NOT NULL DEFAULT 1, feet_color INTEGER NOT NULL DEFAULT -16777216,
  speed INTEGER NOT NULL DEFAULT 50, accel INTEGER NOT NULL DEFAULT 50, jump INTEGER NOT NULL DEFAULT 50, archived INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created INTEGER NOT NULL DEFAULT (unixepoch()));
CREATE TABLE IF NOT EXISTS friends (user_id INTEGER NOT NULL, friend_id INTEGER NOT NULL, PRIMARY KEY (user_id, friend_id));
CREATE TABLE IF NOT EXISTS ignored (user_id INTEGER NOT NULL, ignored_id INTEGER NOT NULL, PRIMARY KEY (user_id, ignored_id));
CREATE TABLE IF NOT EXISTS level_titles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author_id INTEGER NOT NULL, plays INTEGER NOT NULL DEFAULT 0, deleted INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS level_titles_author ON level_titles(author_id);
CREATE TABLE IF NOT EXISTS levels (
  id INTEGER NOT NULL, version INTEGER NOT NULL, description TEXT NOT NULL DEFAULT '', publish INTEGER NOT NULL DEFAULT 1, song_id TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'race', seconds INTEGER NOT NULL DEFAULT 120, gravity REAL NOT NULL DEFAULT 1, alien REAL NOT NULL DEFAULT 0, sfchm REAL NOT NULL DEFAULT 0,
  snow REAL NOT NULL DEFAULT 0, wind REAL NOT NULL DEFAULT 0, items TEXT NOT NULL DEFAULT '', health INTEGER NOT NULL DEFAULT 5, koth TEXT NOT NULL DEFAULT '',
  bg_image TEXT NOT NULL DEFAULT '', data BLOB, updated INTEGER NOT NULL DEFAULT (unixepoch()), PRIMARY KEY (id, version)
);
CREATE TABLE IF NOT EXISTS level_ratings (level_id INTEGER NOT NULL, user_id INTEGER NOT NULL, rating INTEGER NOT NULL, PRIMARY KEY (level_id, user_id));
CREATE TABLE IF NOT EXISTS level_prizes (level_id INTEGER NOT NULL, type TEXT NOT NULL, prize_id INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS campaigns (level_id INTEGER PRIMARY KEY, bronze INTEGER NOT NULL, silver INTEGER NOT NULL, gold INTEGER NOT NULL, medals_required INTEGER NOT NULL DEFAULT 0, season TEXT NOT NULL DEFAULT 'classic', level_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS campaign_prizes (season TEXT NOT NULL, type TEXT NOT NULL, prize_id INTEGER NOT NULL, medals INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS campaign_runs (id INTEGER PRIMARY KEY, category TEXT NOT NULL DEFAULT '', level_id INTEGER NOT NULL, level_version INTEGER NOT NULL, user_id INTEGER NOT NULL, recorded_run TEXT NOT NULL DEFAULT '', finish_time INTEGER NOT NULL, ts INTEGER NOT NULL DEFAULT (unixepoch()));
CREATE INDEX IF NOT EXISTS campaign_runs_user ON campaign_runs(user_id, level_id);
CREATE TABLE IF NOT EXISTS block_titles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT '', author_id INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS blocks (id INTEGER NOT NULL, version INTEGER NOT NULL, description TEXT NOT NULL DEFAULT '', image BLOB, settings BLOB, updated INTEGER NOT NULL DEFAULT (unixepoch()), PRIMARY KEY (id, version));
CREATE TABLE IF NOT EXISTS stamp_titles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT '', author_id INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS stamps (id INTEGER NOT NULL, version INTEGER NOT NULL, description TEXT NOT NULL DEFAULT '', art BLOB, updated INTEGER NOT NULL DEFAULT (unixepoch()), PRIMARY KEY (id, version));
CREATE TABLE IF NOT EXISTS pms (id INTEGER PRIMARY KEY, to_id INTEGER NOT NULL, from_id INTEGER NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, sent INTEGER NOT NULL DEFAULT (unixepoch()), kind TEXT NOT NULL DEFAULT 'text', data TEXT NOT NULL DEFAULT '', deleted INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS pms_to ON pms(to_id);
CREATE TABLE IF NOT EXISTS user_level_data (user_id INTEGER NOT NULL, level_id INTEGER NOT NULL, data TEXT NOT NULL, PRIMARY KEY (user_id, level_id));
CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);
`;
