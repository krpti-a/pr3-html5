// Levels, blocks, stamps and campaign data access (port of the LevelManager/BlockManager/CampaignManager SQL).
import { z, unz } from './db.js';

const ORIGINAL_ITEMS = new Set(['l', 'p', 'b', 'po', 'sp', 'li', 'r', 'a', 's', 'sw', 't', 'j', 'su']);
const LEVEL_SELECT = `SELECT l.*, t.title, t.author_id, t.plays, u.username AS author_username, u.name_color AS author_name_color,
  (SELECT count(*) FROM level_ratings r WHERE r.level_id = l.id AND r.rating > 0) AS likes,
  (SELECT count(*) FROM level_ratings r WHERE r.level_id = l.id AND r.rating < 0) AS dislikes,
  c.bronze, c.silver, c.gold, c.medals_required, c.season AS campaign_season
  FROM levels l JOIN level_titles t ON t.id = l.id LEFT JOIN users u ON u.id = t.author_id LEFT JOIN campaigns c ON c.level_id = l.id`;
const LATEST = `l.version = (SELECT max(version) FROM levels v WHERE v.id = l.id)`;

export class Content {
  constructor(db) { this.db = db; }
  level(id, version = 0) {
    const r = this.db.prepare(`${LEVEL_SELECT} WHERE l.id = ? AND ${version ? 'l.version = ?' : LATEST} AND t.deleted = 0`).get(...(version ? [id, version] : [id]));
    if (r) return this.levelObj(r);
    // Archived PR3Hub levels are namespaced at +1000000; the client hardcodes some original ids (tutorial = 225).
    if (id > 0 && id < 1000000) { const a = this.level(id + 1000000, version); if (a) a.id = id; return a; }
    return null;
  }
  levelObj(r) {
    return {
      id: r.id, version: r.version, authorId: r.author_id, author: r.author_username ?? 'Unknown', authorNameColor: r.author_name_color ?? -16777216,
      title: r.title, description: r.description, publish: !!r.publish, songId: r.song_id, mode: r.mode, seconds: r.seconds, gravity: r.gravity,
      alien: r.alien, sfchm: r.sfchm, snow: r.snow, wind: r.wind, items: r.items.split(',').filter(i => ORIGINAL_ITEMS.has(i)), health: r.health,
      koth: r.koth ? r.koth.split(':').map(Number) : [], bgImage: r.bg_image, get data() { return unz(r.data); }, updated: r.updated, plays: r.plays,
      likes: r.likes, dislikes: 0, campaign: r.gold != null, bronze: r.bronze ?? 0, silver: r.silver ?? 0, gold: r.gold ?? 0, medalsRequired: r.medals_required ?? 0,
      campaignSeason: r.campaign_season ?? '', prizes: this.db.prepare('SELECT type, prize_id FROM level_prizes WHERE level_id = ?').all(r.id),
    };
  }
  // XML-row shape used by the DataAccess API (all values as strings, like E4X text)
  levelRow(l, withData = true) {
    return str({
      level_id: l.id, version: l.version, user_id: l.authorId, author_name_color: l.authorNameColor, author_username: l.author, title: l.title, comment: l.description,
      publish: l.publish ? 1 : 0, song_id: l.songId, mode: l.mode, seconds: l.seconds, gravity: l.gravity, alienChance: l.alien, sfchm_chance: l.sfchm,
      wind_chance: l.wind, snow_chance: l.snow, items: l.items.join(','), health: l.health, king_of_the_hat: l.koth.join(':'), bg_image: l.bgImage,
      level_data: withData ? l.data : '', lua: '', last_updated: new Date(l.updated * 1000).toISOString(), plays: l.plays, likes: l.likes, dislikes: l.dislikes,
      bronze: l.bronze, silver: l.silver, gold: l.gold, medals_required: l.medalsRequired, campaign_sesion: l.campaignSeason,
    });
  }
  // JSON shape used in socket level lists (LevelData JsonPropertyNames)
  levelJson(l) {
    return { levelID: l.id, version: l.version, author: l.author, title: l.title, comment: l.description, plays: l.plays, likes: l.likes, dislikes: l.dislikes,
      bronze: l.bronze, silver: l.silver, gold: l.gold, medalsRequired: l.medalsRequired, campaignSeason: l.campaignSeason, author_name_color: l.authorNameColor >>> 0, mode: l.mode };
  }
  levels(where, params, order = 't.id DESC', limit = 100, offset = 0) {
    return this.db.prepare(`${LEVEL_SELECT} WHERE ${LATEST} AND t.deleted = 0 AND (${where}) ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params, limit, offset).map(r => this.levelObj(r));
  }
  // a page of levels with the total row count (the original's COUNT(t.id) OVER() queries); `today` limits
  // likes/dislikes to ratings from the last 24 hours (best_today)
  levelPage(where, params, order, count, start, today = false) {
    const rated = today ? 'AND r.rated_on >= unixepoch() - 86400' : '';
    const sql = `SELECT * FROM (SELECT l.*, t.title, t.author_id, t.plays, u.username AS author_username, u.name_color AS author_name_color,
        (SELECT count(*) FROM level_ratings r WHERE r.level_id = l.id AND r.rating > 0 ${rated}) AS likes,
        (SELECT count(*) FROM level_ratings r WHERE r.level_id = l.id AND r.rating < 0 ${rated}) AS dislikes,
        c.bronze, c.silver, c.gold, c.medals_required, c.season AS campaign_season
        FROM levels l JOIN level_titles t ON t.id = l.id LEFT JOIN users u ON u.id = t.author_id LEFT JOIN campaigns c ON c.level_id = l.id
        WHERE ${LATEST} AND t.deleted = 0) l WHERE (${where})`;
    const total = this.db.prepare(`SELECT count(*) AS n FROM (${sql})`).get(...params).n;
    const levels = this.db.prepare(`${sql} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...params, count, start).map(r => this.levelObj(r));
    return { total, levels };
  }
  count(where, params) { return this.db.prepare(`SELECT count(*) AS n FROM level_titles t WHERE t.deleted = 0 AND (${where})`).get(...params).n; }
  campaignLevels(season = 'classic', start = 0, count = 1000) {
    const rows = this.levels('c.season = ?', [season], 'c.level_order ASC', count, start);
    return { total: this.db.prepare('SELECT count(*) AS n FROM campaigns WHERE season = ?').get(season).n, levels: rows };
  }
  saveLevel(userId, p) {
    const title = String(p.p_title ?? '').trim();
    if (title.length < 1 || title.length > 50) return { error: 'Level title must be between 1 and 50 chars long!' };
    if ((p.p_comment ?? '').length > 1000) return { error: "Level comment can't be longer than 1000 chars long!" };
    const levelData = String(p.p_level_data ?? '');
    if (levelData.length > 3000000) return { error: 'Level data is too large.' };
    let t = this.db.prepare('SELECT id FROM level_titles WHERE title = ? COLLATE NOCASE AND author_id = ? AND deleted = 0').get(title, userId);
    if (!t) t = this.db.prepare('INSERT INTO level_titles (title, author_id) VALUES (?, ?) RETURNING id').get(title, userId);
    const version = (this.db.prepare('SELECT max(version) AS v FROM levels WHERE id = ?').get(t.id).v ?? 0) + 1;
    const mode = String(p.p_mode ?? 'race');
    const items = String(p.p_items ?? '').split(',').filter(i => ORIGINAL_ITEMS.has(i));
    this.db.prepare(`INSERT INTO levels (id, version, description, publish, song_id, mode, seconds, gravity, alien, sfchm, snow, wind, items, health, koth, bg_image, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(t.id, version, String(p.p_comment ?? ''), +p.p_publish ? 1 : 0, String(p.p_song_id ?? 'random'), mode,
      +p.p_seconds || 0, +p.p_gravity || 1, +p.p_alien || 0, +p.p_sfchm || 0, +p.p_snow || 0, +p.p_wind || 0, [...new Set(items)].join(','),
      mode === 'deathmatch' ? Math.max(1, +p.p_health || 5) : 5, String(p.p_king_of_the_hat ?? ''), String(p.p_bg_image ?? ''), z(levelData));
    return { id: t.id, version };
  }
  deleteLevel(id, userId) { this.db.prepare('UPDATE level_titles SET deleted = 1 WHERE id = ? AND author_id = ?').run(id, userId); }
  unpublishLevel(id, userId, any = false) {
    const l = this.level(id); if (!l || (!any && l.authorId !== userId)) return;
    this.db.prepare('UPDATE levels SET publish = 0 WHERE id = ? AND version = ?').run(id, l.version);
  }
  addPlays(id, n) { this.db.prepare('UPDATE level_titles SET plays = plays + ? WHERE id = ?').run(n, id); }
  rate(id, userId, rating) { this.db.prepare('INSERT OR REPLACE INTO level_ratings (level_id, user_id, rating, rated_on) VALUES (?, ?, ?, unixepoch())').run(id, userId, rating > 0 ? 1 : -1); }

  // ---------- blocks
  blockRow(id) {
    const b = this.db.prepare(`SELECT b.*, t.title, t.category FROM blocks b JOIN block_titles t ON t.id = b.id WHERE b.id = ? AND t.deleted = 0 ORDER BY b.version DESC LIMIT 1`).get(id);
    // as the original server: an invisible, inactive placeholder (empty strings would break the client's parser)
    if (!b) return str({ block_id: id, title: '', category: '', comment: '', image_data: 'v2 | {"artArray":[]}', settings: 'v2 | {"type":"inactive"}' });
    return str({ block_id: b.id, title: b.title, category: b.category, comment: b.description, image_data: unz(b.image), settings: unz(b.settings) });
  }
  saveBlock(userId, p) {
    const title = String(p.p_title ?? '').trim();
    if (title.length < 1 || title.length > 50) return 'Block title must be between 1 and 50 chars long!';
    const cat = String(p.p_category ?? '');
    const image = String(p.p_image_data ?? ''), settings = String(p.p_settings ?? '');
    if (cat.length > 80 || String(p.p_comment ?? '').length > 1000 || image.length > 512000 || settings.length > 64000) return 'Block data is too large.';
    let t = this.db.prepare('SELECT id FROM block_titles WHERE title = ? COLLATE NOCASE AND category = ? COLLATE NOCASE AND author_id = ? AND deleted = 0').get(title, cat, userId);
    if (!t) t = this.db.prepare('INSERT INTO block_titles (title, category, author_id) VALUES (?, ?, ?) RETURNING id').get(title, cat, userId);
    const version = (this.db.prepare('SELECT max(version) AS v FROM blocks WHERE id = ?').get(t.id).v ?? 0) + 1;
    this.db.prepare('INSERT INTO blocks (id, version, description, image, settings) VALUES (?, ?, ?, ?, ?)').run(t.id, version, String(p.p_comment ?? ''), z(image), z(settings));
    return '';
  }
  // "My blocks"/"My stamps" lists use the original's category ids: default-all-<kind>s,
  // default-all-<kind>s-without-category and category-<name> (case-insensitive); newest first
  mine(table, versions, userId, cat, kind) {
    let where = 't.author_id = ? AND t.deleted = 0', args = [userId];
    if (cat === `default-all-${kind}s`) {}
    else if (cat === `default-all-${kind}s-without-category`) where += " AND t.category = ''";
    else if (cat.startsWith('category-')) { where += ' AND t.category = ? COLLATE NOCASE'; args.push(cat.slice(9)); }
    else { where += ' AND t.category = ? COLLATE NOCASE'; args.push(cat); }
    const from = `FROM ${table} t LEFT JOIN (SELECT id, max(updated) AS updated FROM ${versions} GROUP BY id) v ON v.id = t.id WHERE ${where}`;
    return {
      count: () => this.db.prepare(`SELECT count(*) AS n ${from}`).get(...args).n,
      ids: (start, count) => this.db.prepare(`SELECT t.id ${from} ORDER BY v.updated DESC, t.id DESC LIMIT ? OFFSET ?`).all(...args, count, start).map(r => r.id),
    };
  }
  myBlockCategories(userId) { return this.db.prepare("SELECT category FROM block_titles WHERE author_id = ? AND deleted = 0 AND category != '' GROUP BY lower(category) ORDER BY lower(category)").all(userId).map(r => r.category); }
  myBlocks(userId, cat, start, count) { return this.mine('block_titles', 'blocks', userId, cat, 'block').ids(start, count); }
  countMyBlocks(userId, cat) { return this.mine('block_titles', 'blocks', userId, cat, 'block').count(); }
  deleteBlock(id, userId) { this.db.prepare('UPDATE block_titles SET deleted = 1 WHERE id = ? AND author_id = ?').run(id, userId); }

  // ---------- stamps
  stampRow(id) {
    const s = this.db.prepare(`SELECT s.*, t.title, t.category FROM stamps s JOIN stamp_titles t ON t.id = s.id WHERE s.id = ? AND t.deleted = 0 ORDER BY s.version DESC LIMIT 1`).get(id);
    return s ? str({ stamp_id: s.id, title: s.title, category: s.category, comment: s.description, art: unz(s.art) }) : str({ stamp_id: id, title: 'Deleted Stamp', category: '', comment: '', art: '' });
  }
  saveStamp(userId, p) {
    const title = String(p.p_title ?? '').trim(); if (!title) return 'Invalid title';
    const cat = String(p.p_category ?? '');
    const art = String(p.p_art ?? '');
    if (title.length > 50 || cat.length > 80 || String(p.p_comment ?? '').length > 1000 || art.length > 512000) return 'Stamp data is too large.';
    let t = this.db.prepare('SELECT id FROM stamp_titles WHERE title = ? COLLATE NOCASE AND category = ? AND author_id = ? AND deleted = 0').get(title, cat, userId);
    if (!t) t = this.db.prepare('INSERT INTO stamp_titles (title, category, author_id) VALUES (?, ?, ?) RETURNING id').get(title, cat, userId);
    const version = (this.db.prepare('SELECT max(version) AS v FROM stamps WHERE id = ?').get(t.id).v ?? 0) + 1;
    this.db.prepare('INSERT INTO stamps (id, version, description, art) VALUES (?, ?, ?, ?)').run(t.id, version, String(p.p_comment ?? ''), z(art));
    return '';
  }
  myStampCategories(userId) { return this.db.prepare("SELECT category FROM stamp_titles WHERE author_id = ? AND deleted = 0 AND category != '' GROUP BY lower(category) ORDER BY lower(category)").all(userId).map(r => r.category); }
  myStamps(userId, cat, start, count) { return this.mine('stamp_titles', 'stamps', userId, cat, 'stamp').ids(start, count); }
  countMyStamps(userId, cat) { return this.mine('stamp_titles', 'stamps', userId, cat, 'stamp').count(); }
  deleteStamp(id, userId) { this.db.prepare('UPDATE stamp_titles SET deleted = 1 WHERE id = ? AND author_id = ?').run(id, userId); }

  // ---------- campaign runs
  saveRun(userId, category, levelId, version, run, time) {
    const exists = this.db.prepare(`SELECT 1 FROM campaign_runs WHERE user_id = ? AND category = ? AND level_id = ? AND level_version = ? AND finish_time <= ? AND ts >= unixepoch('now', 'start of day')`)
      .get(userId, category, levelId, version, time);
    if (!exists) this.db.prepare('INSERT INTO campaign_runs (category, level_id, level_version, user_id, recorded_run, finish_time) VALUES (?, ?, ?, ?, ?, ?)').run(category, levelId, version, userId, run, time);
  }
  bestRun(levelId, userId) {
    return this.db.prepare('SELECT recorded_run FROM campaign_runs WHERE user_id = ? AND level_id = ? ORDER BY (finish_time > 0) DESC, finish_time ASC LIMIT 1').get(userId, levelId)?.recorded_run ?? null;
  }
  friendRuns(userId, levelId) {
    return this.db.prepare(`SELECT r.user_id, min(r.finish_time) AS t, r.recorded_run, u.* FROM campaign_runs r JOIN friends f ON f.friend_id = r.user_id JOIN users u ON u.id = r.user_id
      WHERE f.user_id = ? AND r.level_id = ? AND r.finish_time > 0 GROUP BY r.user_id ORDER BY t ASC LIMIT 3`).all(userId, levelId);
  }
}
export function str(o) { const r = {}; for (const [k, v] of Object.entries(o)) r[k] = v === null || v === undefined ? '' : typeof v === 'boolean' ? (v ? '1' : '0') : String(v); return r; }
