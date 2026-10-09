// Copy public game content into a database without local player accounts or messages.
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from '../server/db.js';
import { ensureDefaults } from '../server/defaults.js';
import { verifyPassword } from '../server/users.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(process.argv[2] ?? join(root, 'data', 'pr3.db'));
const output = resolve(process.argv[3] ?? join(root, 'data', 'seed.db'));
if (!existsSync(source)) throw new Error(`Source database does not exist: ${source}`);
if (existsSync(output)) throw new Error(`Refusing to overwrite seed database: ${output}`);
if (process.env.PR3_ADMIN_USER || process.env.PR3_ADMIN_PASS) {
  throw new Error('Unset PR3_ADMIN_USER and PR3_ADMIN_PASS before creating the default seed');
}

mkdirSync(dirname(output), { recursive: true });
const db = openDb(output);
try {
  ensureDefaults(db); // id 1: 123456q / Faszos
  db.prepare('ATTACH DATABASE ? AS source').run(source);
  db.exec('BEGIN IMMEDIATE');
  try {
    // Keep playable levels and editor content, but assign their authorship to
    // the one default account. No local users, ratings, runs, sessions, or PMs
    // are imported.
    db.exec(`
      INSERT INTO main.level_titles (id, title, author_id, plays, deleted)
        SELECT id, title, 1, 0, deleted FROM source.level_titles;
      INSERT INTO main.levels SELECT * FROM source.levels;
      INSERT INTO main.block_titles (id, title, category, author_id, deleted)
        SELECT id, title, category, 1, deleted FROM source.block_titles;
      INSERT INTO main.blocks SELECT * FROM source.blocks;
      INSERT INTO main.stamp_titles (id, title, category, author_id, deleted)
        SELECT id, title, category, 1, deleted FROM source.stamp_titles;
      INSERT INTO main.stamps SELECT * FROM source.stamps;
      INSERT INTO main.campaigns SELECT * FROM source.campaigns;
      INSERT INTO main.campaign_prizes SELECT * FROM source.campaign_prizes;
      INSERT INTO main.level_prizes SELECT * FROM source.level_prizes;
    `);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  db.exec('DETACH DATABASE source');
  ensureDefaults(db); // give the default account its campaign gold runs

  const accounts = db.prepare('SELECT id, username, password, email FROM users').all();
  if (accounts.length !== 1 || accounts[0].id !== 1 || accounts[0].username !== '123456q' ||
      accounts[0].email !== '' || !verifyPassword('Faszos', accounts[0].password)) {
    throw new Error('Seed account verification failed');
  }
  for (const table of ['friends', 'ignored', 'sessions', 'level_ratings', 'pms', 'user_level_data']) {
    if (db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n !== 0) {
      throw new Error(`Private data remained in ${table}`);
    }
  }
  if (db.prepare('SELECT count(*) AS n FROM level_titles WHERE author_id != 1').get().n !== 0 ||
      db.prepare('SELECT count(*) AS n FROM block_titles WHERE author_id != 1').get().n !== 0 ||
      db.prepare('SELECT count(*) AS n FROM stamp_titles WHERE author_id != 1').get().n !== 0) {
    throw new Error('Unexpected content author in seed');
  }
  db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  console.log(`Created ${output}: one account, ${db.prepare('SELECT count(*) AS n FROM level_titles').get().n} levels, ${db.prepare('SELECT count(*) AS n FROM block_titles').get().n} blocks`);
} finally {
  db.close();
}
