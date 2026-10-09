// Player/guest data model (port of PlatformRacing3.Common.User) backed by SQLite.
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

export const HAT_MAX = 19, PART_MAX = 26;
// everything the client checks plus the original server's match-listing permissions
const ADMIN_PERMISSIONS = ['access_ban_user', 'access_bans', 'access_feature_level', 'access_moderator_tools', 'access_silence_user', 'access_unpublish_level',
  'bypass_campaign_medal_requirement', 'access_see_unpublished_levels', 'access_force_start_any_match_listing', 'access_kick_any_match_listing',
  'access_ban_any_match_listing', 'access_kick_immunity_match_listing', 'access_match_listing_no_members_limit',
  'access_bypass_match_listing_rank_requirement', 'access_bypass_match_listing_only_friends'];
const DEFAULT_PARTS = [1, 2, 3];
const GUEST_COLOR = argb(255, 29, 84, 151);
function argb(a, r, g, b) { return ((a << 24) | (r << 16) | (g << 8) | b) | 0; }

// ---------- EXP (ExpUtils)
const EXP_REQ = [], TOTAL_REQ = [];
for (let r = 0; r <= 184; r++) EXP_REQ.push(r === 0 ? 1 : Math.floor(30 * Math.pow(1.25, r - 1)));
{ let e = 0; for (let r = 0; r <= 177; r++) { TOTAL_REQ.push(e); e += EXP_REQ[r]; } TOTAL_REQ.push(e); }
export const nextRankExp = rank => EXP_REQ[Math.min(rank, EXP_REQ.length - 1)];
export function rankFromTotal(total) {
  let lo = 0, hi = TOTAL_REQ.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (TOTAL_REQ[m] <= total) lo = m; else hi = m - 1; }
  return { rank: lo, exp: total - TOTAL_REQ[lo] };
}
// .NET Math.Round rounds half to even (the original server's EXP math)
export const roundEven = x => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r; };
export const expForFinishing = t => roundEven(5 * playtimeMul(t));
export const expForDefeating = rank => roundEven(5 + rank);
export const playtimeMul = t => Math.min(t / 120, 1);
export const keyPressMul = k => Math.min(k / 60, 1);

// ---------- passwords (same PBKDF2 format as the original server, so old accounts work)
export function hashPassword(pw) {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(pw, salt, 10000, 32, 'sha1');
  return Buffer.concat([Buffer.from([0]), salt, hash]).toString('base64');
}
export function verifyPassword(pw, stored) {
  try {
    const b = Buffer.from(stored, 'base64');
    if (b[0] !== 0 || b.length !== 49) return false;
    const hash = pbkdf2Sync(pw, b.subarray(1, 17), 10000, 32, 'sha1');
    return timingSafeEqual(hash, b.subarray(17));
  } catch { return false; }
}

export class UserStore {
  constructor(db) {
    this.db = db;
    this.cache = new Map();
    this.loadCampaign();
  }
  loadCampaign() {
    this.campaignTimes = new Map();
    for (const c of this.db.prepare('SELECT * FROM campaigns').all())
      this.campaignTimes.set(c.level_id, { season: c.season, gold: c.gold * 1000, silver: c.silver * 1000, bronze: c.bronze * 1000 });
    this.prizes = {};
    for (const p of this.db.prepare('SELECT * FROM campaign_prizes ORDER BY medals').all())
      (this.prizes[p.season] ??= []).push({ id: p.prize_id, medals: p.medals, category: p.type });
  }
  get(id) {
    let u = this.cache.get(id);
    if (u) return u;
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!row) return null;
    u = new PlayerUser(this, row);
    this.cache.set(id, u);
    return u;
  }
  byName(name) { const r = this.db.prepare('SELECT id FROM users WHERE username = ?').get(name); return r ? this.get(r.id) : null; }
  authenticate(name, pw) {
    const r = this.db.prepare('SELECT id, password FROM users WHERE (username = ? OR (email != \'\' AND email = ? COLLATE NOCASE)) AND archived = 0').get(name, name);
    return r && verifyPassword(pw, r.password) ? r.id : 0;
  }
  register(name, pw, email) {
    const r = this.db.prepare('INSERT INTO users (username, password, email, hat_color, head_color, body_color, feet_color, head, body, feet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id')
      .get(name, hashPassword(pw), email ?? '', -16777216, randColor(), randColor(), randColor(), 1 + rnd(3), 1 + rnd(3), 1 + rnd(3));
    return r.id;
  }
}
const rnd = n => Math.floor(Math.random() * n);
const randColor = () => (0xff000000 | Math.round(Math.random() * 0xffffff)) | 0;

class BaseUser {
  constructor() {
    this.status = 'Offline';
    this.totalExp = 0; this.rank = 0; this.exp = 0; this.bonusExp = 0;
    this.hats = new Set([1]); this.heads = new Set(DEFAULT_PARTS); this.bodys = new Set(DEFAULT_PARTS); this.feets = new Set(DEFAULT_PARTS);
    this.hat = 1; this.hatColor = -16777216;
    this.head = 1 + rnd(3); this.headColor = randColor(); this.body = 1 + rnd(3); this.bodyColor = randColor(); this.feet = 1 + rnd(3); this.feetColor = randColor();
    this.speed = 50; this.accel = 50; this.jump = 50;
    this.campaign = {}; // levelId -> {timeMS, season, medal}
    this.friends = new Set(); this.ignoredSet = new Set();
    this.permissions = [];
    this.muted = false;
  }
  hasPermission(p) { return this.permissions.includes(p); }
  setServer(name) { this.status = name ? `On ${name}` : 'Offline'; }
  setStats(s, a, j) {
    if (150 + this.rank >= s + a + j && [s, a, j].every(v => v >= 0 && v <= 100)) { this.speed = s; this.accel = a; this.jump = j; }
  }
  setParts(hat, hc, head, headc, body, bc, feet, fc) {
    if (this.hats.has(hat)) this.hat = hat; this.hatColor = hc | 0;
    if (this.heads.has(head)) this.head = head; this.headColor = headc | 0;
    if (this.bodys.has(body)) this.body = body; this.bodyColor = bc | 0;
    if (this.feets.has(feet)) this.feet = feet; this.feetColor = fc | 0;
  }
  addExp(e) {
    if (!e) return;
    this.totalExp += e;
    ({ rank: this.rank, exp: this.exp } = rankFromTotal(this.totalExp));
  }
  give(cat, id) { this[setName(cat)].add(id); }
  has(cat, id) { return this[setName(cat)].has(id); }
  goldMedals(season) { return Object.values(this.campaign).filter(r => r.medal === 3 && r.season === season).length; }
  vars(names) {
    const all = {
      guest: this.isGuest, userID: this.id, userName: this.username, nameColor: this.nameColor, group: this.group, status: this.status, rank: this.rank, exp: this.exp,
      hatArray: [...this.hats], headArray: [...this.heads], bodyArray: [...this.bodys], feetArray: [...this.feets], hats: [...this.hats].filter(h => h !== 1).length,
      hat: this.hat, hatColor: this.hatColor, head: this.head, headColor: this.headColor, body: this.body, bodyColor: this.bodyColor, feet: this.feet, feetColor: this.feetColor,
      speed: this.speed, accel: this.accel, jump: this.jump, expBonus: 0, campaign: this.campaign, prizes: this.store?.prizes ?? {},
    };
    if (names === '*' || (Array.isArray(names) && names.includes('*'))) return all;
    const out = {};
    for (const n of [].concat(names ?? [])) if (n in all) out[n] = all[n];
    return out;
  }
}
const setName = c => (c === 'hat' ? 'hats' : c === 'head' ? 'heads' : c === 'body' ? 'bodys' : 'feets');

export class GuestUser extends BaseUser {
  constructor(id, store) {
    super();
    this.store = store;
    this.isGuest = true; this.id = 0; this.username = 'Guest_' + id; this.nameColor = GUEST_COLOR; this.group = 'Guest'; this.status = 'Online';
  }
  save() {}
  checkCampaignPrizes(season, medals) { awardPrizes(this, this.store?.prizes?.[season ?? 'classic'] ?? [], medals); }
  saveFriends() {}
}

class PlayerUser extends BaseUser {
  constructor(store, row) {
    super();
    this.store = store;
    this.isGuest = false;
    this.id = row.id; this.username = row.username; this.nameColor = row.name_color; this.group = row.group_name; this.permissionRank = row.permission_rank;
    this.totalExp = row.total_exp; ({ rank: this.rank, exp: this.exp } = rankFromTotal(this.totalExp)); this.bonusExp = row.bonus_exp;
    this.lastOnline = row.last_online ?? 0;
    const arr = (s, max) => new Set(JSON.parse(s).filter(x => x >= 1 && x <= max));
    this.hats = arr(row.hats, HAT_MAX); this.heads = arr(row.heads, PART_MAX); this.bodys = arr(row.bodys, PART_MAX); this.feets = arr(row.feets, PART_MAX);
    this.hats.add(1);
    this.permissions = ['access_no_idle_kick'];
    if (this.permissionRank >= 100) this.permissions.push('access_bypass_chat_flood', 'access_stamp_editor');
    if (this.permissionRank >= 1000 || this.group === 'Admin') this.permissions.push(...ADMIN_PERMISSIONS);
    for (const r of store.db.prepare('SELECT friend_id FROM friends WHERE user_id = ?').all(this.id)) this.friends.add(r.friend_id);
    for (const r of store.db.prepare('SELECT ignored_id FROM ignored WHERE user_id = ?').all(this.id)) this.ignoredSet.add(r.ignored_id);
    for (const r of store.db.prepare('SELECT level_id, finish_time FROM campaign_runs WHERE user_id = ?').all(this.id)) this.checkCampaignTime(r.level_id, r.finish_time);
    this.checkCampaignPrizes();
    this.hat = row.hat; this.head = row.head; this.body = row.body; this.feet = row.feet;
    BaseUser.prototype.setParts.call(this, row.hat, row.hat_color, row.head, row.head_color, row.body, row.body_color, row.feet, row.feet_color);
    this.speed = row.speed; this.accel = row.accel; this.jump = row.jump;
  }
  checkCampaignTime(levelId, t) {
    const lv = this.store.campaignTimes.get(levelId);
    if (!lv) return;
    const rec = this.campaign[levelId];
    if (rec) {
      if (t < 0) { if (rec.timeMS > 0 || rec.timeMS > t) return; }
      else if (t > rec.timeMS && rec.timeMS > 0) return;
    }
    let medal = 0;
    if (t > 0) medal = lv.gold > t ? 3 : lv.silver > t ? 2 : lv.bronze > t ? 1 : 0;
    this.campaign[levelId] = { timeMS: t, season: lv.season, medal };
  }
  checkCampaignPrizes() {
    for (const [season, prizes] of Object.entries(this.store.prizes)) awardPrizes(this, prizes, this.goldMedals(season), true);
  }
  setStats(s, a, j) { super.setStats(s, a, j); this.save(); }
  setParts(...p) { super.setParts(...p); if (this.store) this.save(); }
  addExp(e) { super.addExp(e); this.save(); }
  give(cat, id) { super.give(cat, id); this.save(); }
  save() {
    this.store.db.prepare(`UPDATE users SET total_exp = ?, bonus_exp = ?, hats = ?, heads = ?, bodys = ?, feets = ?, hat = ?, hat_color = ?, head = ?, head_color = ?, body = ?, body_color = ?,
      feet = ?, feet_color = ?, speed = ?, accel = ?, jump = ?, last_online = unixepoch() WHERE id = ?`).run(this.totalExp, this.bonusExp,
      JSON.stringify([...this.hats].filter(h => !this.tempHats?.has(h))), JSON.stringify([...this.heads]), JSON.stringify([...this.bodys]), JSON.stringify([...this.feets]),
      this.hat, this.hatColor, this.head, this.headColor, this.body, this.bodyColor, this.feet, this.feetColor, this.speed, this.accel, this.jump, this.id);
  }
  saveFriends() {
    const db = this.store.db;
    db.prepare('DELETE FROM friends WHERE user_id = ?').run(this.id);
    db.prepare('DELETE FROM ignored WHERE user_id = ?').run(this.id);
    for (const f of this.friends) db.prepare('INSERT OR IGNORE INTO friends VALUES (?, ?)').run(this.id, f);
    for (const f of this.ignoredSet) db.prepare('INSERT OR IGNORE INTO ignored VALUES (?, ?)').run(this.id, f);
  }
}
// Campaign prizes are "temporary" grants recomputed from gold medals (not stored as owned items).
function awardPrizes(u, prizes, medals, track = false) {
  for (const p of prizes) {
    const set = u[setName(p.category)];
    if (p.category === 'hat' && (p.id < 1 || p.id > HAT_MAX)) continue;
    if (medals >= p.medals) { if (!set.has(p.id) && track) (u.tempHats ??= new Set()).add(p.id); set.add(p.id); }
    else if (u.tempHats?.has(p.id)) { set.delete(p.id); u.tempHats.delete(p.id); }
  }
}
