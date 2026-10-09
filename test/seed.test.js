import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { openDb } from '../server/db.js';
import { ensureDefaults } from '../server/defaults.js';
import { hashPassword, UserStore } from '../server/users.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = join(root, 'data', 'seed.db');

function withFreshDatabase(fn) {
  const directory = mkdtempSync(join(tmpdir(), 'pr3-seed-test-'));
  const database = join(directory, 'pr3.db');
  const db = openDb(database, seed);
  try {
    return fn(db, database);
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
}

test('a fresh database is copied from the shareable seed', () => {
  withFreshDatabase((db, database) => {
    assert.ok(existsSync(database));
    assert.equal(db.prepare('SELECT count(*) AS n FROM users').get().n, 1);
    assert.equal(db.prepare('SELECT count(*) AS n FROM level_titles').get().n, 285);
    assert.equal(db.prepare('SELECT count(*) AS n FROM blocks').get().n, 6195);
  });
});

test('the seed contains only the default account and no private player data', () => {
  withFreshDatabase(db => {
    assert.deepEqual(db.prepare('SELECT id, username, email FROM users').all().map(({ id, username, email }) => ({ id, username, email })), [
      { id: 1, username: '123456q', email: '' },
    ]);

    for (const table of ['friends', 'ignored', 'sessions', 'level_ratings', 'pms', 'user_level_data']) {
      assert.equal(db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n, 0, `${table} should be empty`);
    }
  });
});

test('all bundled authored content belongs to the default account', () => {
  withFreshDatabase(db => {
    for (const table of ['level_titles', 'block_titles', 'stamp_titles']) {
      assert.deepEqual(
        db.prepare(`SELECT DISTINCT author_id FROM ${table} ORDER BY author_id`).all().map(row => row.author_id),
        table === 'stamp_titles' ? [] : [1],
        `${table} has an unexpected author`,
      );
    }
  });
});

test('the default account authenticates with the documented credentials only', () => {
  withFreshDatabase(db => {
    const users = new UserStore(db);
    assert.equal(users.authenticate('123456q', 'Faszos'), 1);
    assert.equal(users.authenticate('123456q', 'wrong-password'), 0);
    assert.equal(users.authenticate('missing-user', 'Faszos'), 0);
  });
});

test('a changed admin password survives startup defaults', () => {
  withFreshDatabase(db => {
    db.prepare('UPDATE users SET password = ? WHERE id = 1').run(hashPassword('new-private-password'));
    ensureDefaults(db);
    const users = new UserStore(db);
    assert.equal(users.authenticate('123456q', 'new-private-password'), 1);
    assert.equal(users.authenticate('123456q', 'Faszos'), 0);
  });
});
