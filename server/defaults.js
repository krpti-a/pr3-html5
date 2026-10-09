// Default content, enforced on every startup: an admin account with every hat and part and the whole
// campaign completed on gold. An existing account with that name (case-insensitive) is upgraded in place.
// PR3_ADMIN_PASS overrides an existing password only when explicitly configured.
import { hashPassword, verifyPassword, HAT_MAX, PART_MAX } from './users.js';

const ADMIN_USER = process.env.PR3_ADMIN_USER ?? '123456q';
const ADMIN_PASS = process.env.PR3_ADMIN_PASS ?? 'Faszos';

export function ensureDefaults(db) {
  const range = n => JSON.stringify(Array.from({ length: n }, (_, i) => i + 1));
  let u = db.prepare('SELECT id, password FROM users WHERE username = ? COLLATE NOCASE').get(ADMIN_USER);
  if (!u) {
    u = db.prepare("INSERT INTO users (username, password, email) VALUES (?, ?, '') RETURNING id, password").get(ADMIN_USER, hashPassword(ADMIN_PASS));
    console.log(`created default admin account "${ADMIN_USER}"`);
  } else if (process.env.PR3_ADMIN_PASS && !verifyPassword(ADMIN_PASS, u.password)) {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashPassword(ADMIN_PASS), u.id);
  }
  // the built-in password ships with the code: fine on your own machine, an open admin account on a public server
  if (!process.env.PR3_ADMIN_PASS && verifyPassword(ADMIN_PASS, db.prepare('SELECT password FROM users WHERE id = ?').get(u.id).password))
    console.warn(`WARNING: admin account "${ADMIN_USER}" uses the built-in default password. Before putting this server online, start it with PR3_ADMIN_PASS=<your own password>.`);
  db.prepare("UPDATE users SET group_name = 'Admin', permission_rank = 1000, archived = 0, hats = ?, heads = ?, bodys = ?, feets = ? WHERE id = ?")
    .run(range(HAT_MAX), range(PART_MAX), range(PART_MAX), range(PART_MAX), u.id);
  // a gold run (half a second under the gold time) on every campaign level not already golded
  const best = db.prepare('SELECT min(finish_time) AS t FROM campaign_runs WHERE user_id = ? AND level_id = ? AND finish_time > 0');
  const ins = db.prepare('INSERT INTO campaign_runs (level_id, level_version, user_id, finish_time) VALUES (?, ?, ?, ?)');
  for (const c of db.prepare('SELECT c.level_id, c.gold, (SELECT max(version) FROM levels WHERE id = c.level_id) AS v FROM campaigns c').all()) {
    const t = best.get(u.id, c.level_id).t;
    if (!(t > 0 && t < c.gold * 1000)) ins.run(c.level_id, c.v ?? 1, u.id, Math.max(1, c.gold * 1000 - 500));
  }
}
