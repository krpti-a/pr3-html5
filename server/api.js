// HTTP API: account login/registration and the DataAccess procedures used by the client.
import { randomBytes } from 'node:crypto';
import { str } from './content.js';
import { RateLimiter } from './limits.js';

export function createApi({ db, users, content, game, mod, clientIp = req => req.socket.remoteAddress ?? '', isHttps = () => false }) {
  const loginTokens = new Map(); // token -> { userId, expires }
  setInterval(() => { const now = Date.now(); for (const [k, t] of loginTokens) if (t.expires < now) loginTokens.delete(k); }, 60000).unref();
  // abuse limits (per ip, or per account for saves): password guessing, account spam, filling the disk with saves
  const limits = {
    login: new RateLimiter(10, 10),     // attempts / minute
    register: new RateLimiter(3 / 60, 3), // accounts / hour
    save: new RateLimiter(20, 10),      // level/block/stamp saves / minute
    api: new RateLimiter(600, 200),     // any other API call / minute
  };
  const SAVES = new Set(['SaveLevel4', 'SaveBlock4', 'SaveStamp', 'SaveCampaignRun3', 'SaveUserLevelData']);
  const sessionUser = req => {
    const m = /(?:^|;\s*)pr3s=([A-Za-z0-9_-]+)/.exec(req.headers.cookie ?? '');
    if (!m) return 0;
    return db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(m[1])?.user_id ?? 0;
  };
  const startSession = (res, userId) => {
    const token = randomBytes(24).toString('base64url');
    db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId);
    res.setHeader('Set-Cookie', `pr3s=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${isHttps(res.req) ? '; Secure' : ''}`);
  };
  const ok = (rows, extra = {}) => ({ Error: '', NumRows: String(rows.length), Row: rows, ...extra });
  const err = e => ({ Error: e, NumRows: '0', Row: [] });

  const procs = {
    GetServers2: () => ok([str({ server_id: 1, server_name: process.env.PR3_SERVER_NAME ?? 'Local Server', address: '', port: 0, status: `${game.onlineCount()} online` })]),
    GetLoginToken2: (p, uid) => {
      if (!uid) return err('You are not logged in! If you think this is error, please try again.');
      if (loginTokens.size > 10000) return err('The server is busy, please try again.');
      const token = randomBytes(24).toString('base64url');
      loginTokens.set(token, { userId: uid, expires: Date.now() + 60000 });
      return ok([{ login_token: token }]);
    },
    GetLevel2: p => { const l = content.level(+p.p_level_id); return l ? ok([content.levelRow(l)]) : err('Level was not found'); },
    GetLockedLevel: p => { const l = content.level(+p.p_level_id); return l && l.campaign ? ok([content.levelRow(l)]) : err('Level was not found'); },
    SaveLevel4: (p, uid) => {
      if (!uid) return err('You are not logged in!');
      const r = content.saveLevel(uid, p);
      return r.error ? err(r.error) : ok([{ saved: '1', level_id: String(r.id) }]);
    },
    CountMyLevels2: (p, uid) => (uid ? ok([{ count: String(content.count('t.author_id = ?', [uid])) }]) : err('You are not logged in!')),
    GetMyLevels2: (p, uid) => (uid ? ok(content.levels('t.author_id = ?', [uid], 'l.updated DESC', +p.p_count || 100, +p.p_start || 0).map(l => content.levelRow(l, false))) : err('You are not logged in!')),
    DeleteLevel2: (p, uid) => { if (!uid) return err('You are not logged in!'); content.deleteLevel(+p.p_level_id, uid); return ok([]); },
    SearchLevels3: (p, uid) => {
      const s = `%${String(p.p_search_str ?? '').replace(/[%_]/g, '')}%`;
      const where = (p.p_mode === 'user' ? 'u.username LIKE ?' : 't.title LIKE ?') + (uid ? ' AND (l.publish = 1 OR t.author_id = ?)' : ' AND l.publish = 1');
      const order = { date: 'l.updated', rating: 'likes', alphabetical: 't.title', popularity: 't.plays' }[p.p_sort] ?? 'l.updated';
      const dir = p.p_dir === 'asc' ? 'ASC' : 'DESC';
      return ok(content.levels(where, uid ? [s, uid] : [s], `${order} ${dir}`, 100, 0).map(l => content.levelRow(l, false)));
    },
    SaveBlock4: (p, uid) => { if (!uid) return err('You are not logged in!'); const e = content.saveBlock(uid, p); return e ? err(e) : ok([{ saved: '1' }]); },
    GetMyBlockCategorys: (p, uid) => (uid ? ok(content.myBlockCategories(uid).map(c => ({ category: c }))) : err('You are not logged in!')),
    CountMyBlocks2: (p, uid) => (uid ? ok([{ category: String(p.p_category ?? ''), count: String(content.countMyBlocks(uid, String(p.p_category ?? ''))) }]) : err('You are not logged in!')),
    GetMyBlocks2: (p, uid) => (uid ? ok(content.myBlocks(uid, String(p.p_category ?? ''), +p.p_start || 0, +p.p_count || 100).map(id => ({ block_id: String(id) })), { category: String(p.p_category ?? '') }) : err('You are not logged in!')),
    GetBlock2: p => ok([content.blockRow(+p.p_block_id)]),
    GetManyBlocks: p => ok(String(p.p_block_array ?? '').split(',').filter(Boolean).map(id => content.blockRow(+id))),
    DeleteBlock2: (p, uid) => { if (uid) content.deleteBlock(+p.p_block_id, uid); return ok([]); },
    GetMyStampCategorys: (p, uid) => ok(uid ? content.myStampCategories(uid).map(c => ({ category: c })) : []),
    CountMyStamps: (p, uid) => ok([{ category: String(p.p_category ?? ''), count: String(uid ? content.countMyStamps(uid, String(p.p_category ?? '')) : 0) }]),
    GetMyStamps: (p, uid) => ok(uid ? content.myStamps(uid, String(p.p_category ?? ''), +p.p_start || 0, +p.p_count || 100).map(id => ({ stamp_id: String(id) })) : []),
    SaveStamp: (p, uid) => { if (!uid) return err('You are not logged in!'); const e = content.saveStamp(uid, p); return e ? err(e) : ok([{ saved: '1' }]); },
    GetManyStamps: p => ok(String(p.p_stamp_array ?? '').split(',').filter(Boolean).map(id => content.stampRow(+id))),
    DeleteStamp: (p, uid) => { if (uid) content.deleteStamp(+p.p_stamp_id, uid); return ok([]); },
    CountMyFriends: (p, uid) => ok([{ friend_count: String(uid ? users.get(uid).friends.size : 0) }]),
    GetMyFriends: (p, uid) => ok(uid ? [...users.get(uid).friends].map(id => userRow(id)).filter(Boolean) : []),
    CountMyIgnored: (p, uid) => ok([{ ignored_count: String(uid ? users.get(uid).ignoredSet.size : 0) }]),
    GetMyIgnored: (p, uid) => ok(uid ? [...users.get(uid).ignoredSet].map(id => userRow(id)).filter(Boolean) : []),
    SearchUsers2: p => ok(db.prepare('SELECT id FROM users WHERE username LIKE ? AND archived = 0 LIMIT 100').all(`%${p.p_name ?? p.p_search_str ?? ''}%`).map(r => userRow(r.id))),
    SaveCampaignRun3: (p, uid) => {
      if (!uid) return err('You are not logged in!');
      const run = String(p.p_recorded_run ?? '');
      if (run.length > 128000) return err('Recorded run is too large.');
      const time = Math.trunc(+p.p_finish_time);
      if (!Number.isSafeInteger(time) || time <= 0 || !content.level(+p.p_level_id)?.campaign) return err('Invalid campaign run.');
      content.saveRun(uid, String(p.p_category ?? 'normal').slice(0, 64), +p.p_level_id, +p.p_level_version, run, time);
      const u = users.get(uid);
      u.checkCampaignTime(+p.p_level_id, time);
      u.checkCampaignPrizes();
      return ok([]);
    },
    GetCampaignRun3: p => { const r = content.bestRun(+p.p_level_id, +p.p_user_id); return ok(r ? [{ recorded_run: r }] : []); },
    GetMyFriendsFastestRuns: (p, uid) => ok(uid ? content.friendRuns(uid, +p.p_level_id).map(r => str({ user_id: r.user_id, best_time_ms: r.t, name: r.username, hat: r.hat, head: r.head,
      body: r.body, feet: r.feet, hat_color: r.hat_color, head_color: r.head_color, body_color: r.body_color, feet_color: r.feet_color })) : []),
    GetUserLevelData: (p, uid) => ok(uid ? [{ level_data: db.prepare('SELECT data FROM user_level_data WHERE user_id = ? AND level_id = ?').get(uid, +p.p_level_id)?.data ?? '' }] : []),
    SaveUserLevelData: (p, uid) => {
      if (!uid) return err('You are not logged in!');
      const levelId = +p.p_level_id, data = String(p.p_data ?? '');
      if (!Number.isSafeInteger(levelId) || !db.prepare('SELECT 1 FROM level_titles WHERE id = ?').get(levelId)) return err('Level was not found.');
      if (data.length > 64000) return err('Level data is too large.');
      db.prepare('INSERT OR REPLACE INTO user_level_data VALUES (?, ?, ?)').run(uid, levelId, data);
      return ok([]);
    },
    SetLOTD: (p, uid) => {
      if (!uid || !users.get(uid)?.hasPermission('access_feature_level')) return err('You do not have permission to do that.');
      return game.featureLevel(+p.p_level_id) ? ok([]) : err('Level was not found');
    },
    ...mod.procs({ ok, err }),
    GetPurchasedItems: () => ok([]),
    PurchaseItem: () => err('The shop is not available.'),
  };
  function userRow(id) {
    const u = users.get(id);
    // fields of the original's UserData.WriteXml (friends / ignored / search rows)
    return u ? str({ userID: u.id, userName: u.username, nameColor: u.nameColor, rank: u.rank, hat_array: [...u.hats].join(','), status: game.isOnline(u.id) ? u.status : 'Offline' }) : null;
  }

  const MAX_BODY = 8e6; // the biggest levels are ~2 MB
  const maxDbBytes = 400e6; // leave room for the seed, WAL, logs and static assets on small hosts
  const pageCount = db.prepare('PRAGMA page_count');
  const pageSize = db.prepare('PRAGMA page_size').get().page_size;
  async function body(req) {
    if (+(req.headers['content-length'] ?? 0) > MAX_BODY) throw Object.assign(new Error('Request too large'), { status: 413 });
    const chunks = []; let n = 0;
    for await (const c of req) { n += c.length; if (n > MAX_BODY) throw Object.assign(new Error('Request too large'), { status: 413 }); chunks.push(c); }
    return Buffer.concat(chunks).toString('utf8');
  }
  const form = s => Object.fromEntries(new URLSearchParams(s));
  const send = (res, code, data, type = 'application/json') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(typeof data === 'string' ? data : JSON.stringify(data)); };

  return {
    redeemToken(token) {
      const t = loginTokens.get(token);
      loginTokens.delete(token);
      return t && t.expires > Date.now() ? t.userId : 0;
    },
    async handle(req, res) {
      const ip = clientIp(req);
      try {
        const url = new URL(req.url, 'http://x');
        const path = url.pathname.replace(/^\/api\//, '');
        if (path === 'login' && req.method === 'POST') {
          if (!limits.login.take(ip)) return send(res, 200, 'Too many login attempts, please wait a minute and try again', 'text/plain');
          const f = form(await body(req));
          if (!f.username) return send(res, 200, 'Please enter your username/email', 'text/plain');
          if (!f.password) return send(res, 200, 'Please enter your password', 'text/plain');
          const id = users.authenticate(f.username, f.password);
          if (!id) return send(res, 200, 'Login details does not match, please check you entered the right username/email and password', 'text/plain');
          startSession(res, id);
          return send(res, 200, '', 'text/plain');
        }
        if (path === 'register' && req.method === 'POST') {
          if (!limits.register.take(ip)) return send(res, 200, 'Too many new accounts from your network, please try again later', 'text/plain');
          const f = form(await body(req));
          const name = (f.username ?? '').trim();
          if (!/^[A-Za-z0-9_\-. ]{2,20}$/.test(name)) return send(res, 200, 'Username must be 2-20 characters (letters, numbers, spaces, - _ .)', 'text/plain');
          if ((f.password ?? '').length < 4) return send(res, 200, 'Password must be at least 4 characters long', 'text/plain');
          if (f.password !== f.retype_password) return send(res, 200, "Passwords don't match", 'text/plain');
          if (users.byName(name)) return send(res, 200, 'That username is already taken', 'text/plain');
          startSession(res, users.register(name, f.password, f.email));
          return send(res, 200, '', 'text/plain');
        }
        if (path === 'logout') {
          const m = /(?:^|;\s*)pr3s=([A-Za-z0-9_-]+)/.exec(req.headers.cookie ?? '');
          if (m) db.prepare('DELETE FROM sessions WHERE token = ?').run(m[1]);
          res.setHeader('Set-Cookie', 'pr3s=; Path=/; Max-Age=0');
          return send(res, 200, '', 'text/plain');
        }
        if (path === 'isloggedin') {
          const uid = sessionUser(req);
          const u = uid ? users.get(uid) : null;
          return send(res, 200, { IsLoggedIn: u ? '1' : '0', UserName: u?.username ?? '', UserId: String(u?.id ?? 0) });
        }
        if (path === 'GetLevel') {
          const l = content.level(+url.searchParams.get('id'), +url.searchParams.get('version'));
          return send(res, 200, l ? ok([content.levelRow(l)]) : err('Level was not found'));
        }
        if (path.startsWith('data/') && req.method === 'POST') {
          const name = path.slice(5);
          const proc = Object.hasOwn(procs, name) ? procs[name] : null;
          if (!limits.api.take(ip)) return send(res, 429, err('Too many requests, please slow down.'));
          let p = JSON.parse((await body(req)) || '{}');
          if (!p || typeof p !== 'object' || Array.isArray(p)) p = {};
          const uid = sessionUser(req);
          if (SAVES.has(name) && !limits.save.take(uid ? 'u' + uid : ip)) return send(res, 200, err('You are saving too fast, please wait a moment.'));
          if (SAVES.has(name) && pageCount.get().page_count * pageSize >= maxDbBytes) return send(res, 200, err('The server is out of storage space for saves.'));
          const r = proc ? proc(p, uid) : ok([]);
          if (process.env.PR3_DEBUG) console.log(`api ${path.slice(5)}${proc ? '' : ' (UNKNOWN PROC)'} ${JSON.stringify(p).slice(0, 160)} -> ${r?.Error ? 'Error: ' + r.Error : (r?.Row?.length ?? 0) + ' rows'}`);
          return send(res, 200, r);
        }
        send(res, 404, { Error: 'Not found' });
      } catch (e) {
        if (e?.status === 413) return send(res, 413, err('Request too large'));
        if (e instanceof SyntaxError) return send(res, 400, err('Bad request'));
        console.error('api error', e);
        send(res, 500, err('Server error'));
      }
    },
  };
}
