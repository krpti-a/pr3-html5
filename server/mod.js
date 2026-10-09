// Moderation: bans/silences, the ban log, reported PMs/chats and the featured Level of the Day.
// The original C# server never implemented these, so the formats follow what the client's mod pages read.
const now = () => Math.floor(Date.now() / 1000);
const isLoopback = ip => /^(::1|127\.|::ffff:127\.)/.test(ip);

export function describeTime(seconds) {
  if (seconds < 0) return 'permanently';
  for (const [n, unit] of [[31536000, 'year'], [2592000, 'month'], [604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute']])
    if (seconds >= n) { const v = Math.round(seconds / n * 10) / 10; return `for ${v} ${unit}${v === 1 ? '' : 's'}`; }
  return `for ${seconds} second${seconds === 1 ? '' : 's'}`;
}

export class Moderation {
  constructor(db, users) {
    this.db = db; this.users = users;
  }
  // The active ban/silence for a session, or null. Accounts are matched by account only (other players on the
  // same ip - a household, a school - aren't affected); guests are matched by ip, so a banned player can't come
  // back as a guest. Loopback addresses never match (that would hit everyone behind a local reverse proxy).
  active(type, userId, ip) {
    const byIp = !userId && ip && !isLoopback(ip) ? ip : '\0';
    return this.db.prepare(`SELECT * FROM bans WHERE ban_type = ? AND lifted = 0 AND (expire_time = -1 OR expire_time > ?)
      AND ((user_id != 0 AND user_id = ?) OR (ip != '' AND ip = ?)) ORDER BY expire_time = -1 DESC, expire_time DESC LIMIT 1`).get(type, now(), userId || 0, byIp) ?? null;
  }
  message(b) {
    const left = b.expire_time === -1 ? 'permanently' : describeTime(b.expire_time - now()).replace(/^for /, 'for another ');
    return `You have been ${b.ban_type === 'silence' ? 'silenced' : 'banned'} ${left}. Reason: ${b.reason || 'none given'}`;
  }
  add(type, modId, userId, ip, seconds, reason, log) {
    const t = now();
    return this.db.prepare('INSERT INTO bans (ban_type, mod_id, user_id, ip, ban_time, expire_time, reason, log) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *')
      .get(type, modId, userId || 0, ip || '', t, seconds === -1 ? -1 : t + seconds, String(reason ?? '').slice(0, 500), String(log ?? '').slice(0, 20000));
  }
  counts(userId, ip) {
    const c = (col, v) => Object.fromEntries(this.db.prepare(`SELECT ban_type, count(*) AS n FROM bans WHERE ${col} = ? GROUP BY ban_type`).all(v).map(r => [r.ban_type, r.n]));
    const a = userId ? c('user_id', userId) : {}, i = ip ? c('ip', ip) : {};
    return { accountSilenceCount: a.silence ?? 0, accountBanCount: a.ban ?? 0, ipSilenceCount: i.silence ?? 0, ipBanCount: i.ban ?? 0 };
  }

  // DataAccess procedures (permission-checked; rows use the field names of the client's mod pages)
  procs({ ok, err }) {
    const db = this.db, users = this.users;
    const can = (uid, perm) => !!uid && !!users.get(uid)?.hasPermission(perm);
    const who = (prefix, id, nameKey = 'name', colorKey = 'name_color', groupKey = 'group') => {
      const u = id ? users.get(id) : null;
      return { [`${prefix}${nameKey}`]: u?.username ?? '', [`${prefix}${colorKey}`]: String(u?.nameColor ?? 0), [`${prefix}${groupKey}`]: u?.group ?? '' };
    };
    const str = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v == null ? '' : String(v)]));
    // the client words a record as `${ban_type}ed`, so it gets the stem ("bann" -> banned, "silenc" -> silenced)
    const banRow = b => str({
      ban_id: b.id, ban_type: b.ban_type === 'silence' ? 'silenc' : 'bann', ban_time: b.ban_time, expire_time: b.expire_time, banned_user_id: b.user_id, banned_ip: b.ip,
      ...who('banned_', b.user_id), mod_user_id: b.mod_id, ...who('mod_', b.mod_id),
      ban_lifted: b.lifted, ban_lifted_by: b.lifted_by, ...who('ban_', b.lifted_by, 'listed_username', 'listed_color', 'lifted_group'),
    });
    const picker = id => ({ picker_id: id, ...who('picker_', id, 'username', 'color', 'group') });
    const NOPE = 'You do not have permission to do that.';
    return {
      CountBans: (p, uid) => (can(uid, 'access_bans') ? ok([{ count: String(db.prepare('SELECT count(*) AS n FROM bans').get().n) }]) : err(NOPE)),
      GetBanRecords: (p, uid) => (can(uid, 'access_bans')
        ? ok(db.prepare('SELECT * FROM bans ORDER BY id DESC LIMIT ? OFFSET ?').all(Math.min(+p.p_count || 20, 100), +p.p_start || 0).map(banRow)) : err(NOPE)),
      GetBanDetails: (p, uid) => {
        if (!can(uid, 'access_bans')) return err(NOPE);
        const b = db.prepare('SELECT * FROM bans WHERE id = ?').get(+p.p_ban_id);
        if (!b) return ok([]);
        const r = banRow(b);
        return ok([{ ...r, lifted: r.ban_lifted, lifted_by: r.ban_lifted_by, listed_username: r.ban_listed_username, listed_color: r.ban_listed_color, lifted_group: r.ban_lifted_group, reason: b.reason, log: b.log }]);
      },
      LiftBan: (p, uid) => {
        if (!can(uid, 'access_bans')) return err(NOPE);
        db.prepare('UPDATE bans SET lifted = 1, lifted_by = ? WHERE id = ?').run(uid, +p.p_ban_id);
        return ok([]);
      },

      CountFlaggedMessages: (p, uid) => (can(uid, 'access_moderator_tools')
        ? ok([{ count: String(db.prepare('SELECT count(*) AS n FROM flagged_messages WHERE archived = ?').get(+p.p_archive ? 1 : 0).n) }]) : err(NOPE)),
      GetFlaggedMessages: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        return ok(db.prepare(`SELECT f.*, m.title, m.from_id FROM flagged_messages f JOIN pms m ON m.id = f.pm_id WHERE f.archived = ? ORDER BY f.reported_time DESC LIMIT ? OFFSET ?`)
          .all(+p.p_archive ? 1 : 0, Math.min(+p.p_count || 20, 100), +p.p_start || 0)
          .map(f => str({ message_id: f.pm_id, title: f.title, reported_time: f.reported_time, ...who('from_', f.from_id, 'name', 'color', 'group'), ...picker(f.picker_id) })));
      },
      GetFlaggedMessage: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        const f = db.prepare('SELECT f.*, m.title, m.message, m.from_id, m.to_id FROM flagged_messages f JOIN pms m ON m.id = f.pm_id WHERE f.pm_id = ?').get(+p.p_message_id);
        return ok(f ? [str({ title: f.title, message: f.message, from_user_id: f.from_id, ...who('from_', f.from_id, 'name', 'color', 'group'),
          to_user_id: f.to_id, ...who('to_', f.to_id, 'name', 'color', 'group'), ...picker(f.picker_id) })] : []);
      },
      PickFlaggedMessage: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        db.prepare('UPDATE flagged_messages SET picker_id = ? WHERE pm_id = ?').run(p.p_pick === '1' ? uid : 0, +p.p_message_id);
        return ok([]);
      },
      ArchiveFlaggedMessage: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        db.prepare('UPDATE flagged_messages SET archived = 1 WHERE pm_id = ?').run(+p.p_message_id);
        return ok([]);
      },
      ArchiveAllFlaggedMessages: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        db.prepare('UPDATE flagged_messages SET archived = 1').run();
        return ok([]);
      },

      CountFlaggedChats: (p, uid) => (can(uid, 'access_moderator_tools')
        ? ok([{ count: String(db.prepare('SELECT count(*) AS n FROM flagged_chats WHERE archived = ?').get(+p.p_archive ? 1 : 0).n) }]) : err(NOPE)),
      GetFlaggedChats: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        return ok(db.prepare('SELECT * FROM flagged_chats WHERE archived = ? ORDER BY id DESC LIMIT ? OFFSET ?').all(+p.p_archive ? 1 : 0, Math.min(+p.p_count || 20, 100), +p.p_start || 0)
          .map(c => str({ chat_id: c.id, time: c.time, user_id: c.reporter_id, ...who('', c.reporter_id, 'user_name', 'color', 'group'),
            reported_user_id: c.reported_user_id, ...who('reported_', c.reported_user_id, 'user_name', 'color', 'group'), ...picker(c.picker_id) })));
      },
      GetFlaggedChat: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        const c = db.prepare('SELECT * FROM flagged_chats WHERE id = ?').get(+p.p_chat_id);
        return ok(c ? [str({ log: c.log, user_id: c.reporter_id, ...who('', c.reporter_id, 'user_name', 'color', 'group'), reported_user_id: c.reported_user_id, ...picker(c.picker_id) })] : []);
      },
      PickFlaggedChat: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        db.prepare('UPDATE flagged_chats SET picker_id = ? WHERE id = ?').run(p.p_pick === '1' ? uid : 0, +p.p_chat_id);
        return ok([]);
      },
      ArchiveFlaggedChat: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        db.prepare('UPDATE flagged_chats SET archived = 1 WHERE id = ?').run(+p.p_chat_id);
        return ok([]);
      },
      ArchiveAllFlaggedChats: (p, uid) => {
        if (!can(uid, 'access_moderator_tools')) return err(NOPE);
        db.prepare('UPDATE flagged_chats SET archived = 1').run();
        return ok([]);
      },
    };
  }
}
