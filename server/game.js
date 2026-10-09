// Real-time game server over WebSocket (port of PlatformRacing3.Server: login, chat rooms,
// match listings, multiplayer matches with prizes/EXP/hats, PMs and friends).
// Messages are JSON objects with a "t" type field, the same messages the original socket carried.
import { GuestUser, roundEven, expForFinishing, expForDefeating, playtimeMul, keyPressMul, nextRankExp, HAT_MAX } from './users.js';
const DEBUG = !!process.env.PR3_DEBUG;
// Maths.DEG_RAD / Maths.RotatePoint of the original server (note the truncated constant)
const DEG_RAD = 0.0174533;
function rotatePoint(x, y, rot) {
  rot = Math.fround(-rot);
  const pythag = Math.sqrt(x * x + y * y), angle = DEG_RAD * rot + Math.atan2(y, x);
  return [Math.fround(Math.cos(angle) * pythag), Math.fround(Math.sin(angle) * pythag)];
}

const WINNABLE_PARTS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 24]; // Brain..Tortoise, Penguin (Part enum)
const LOTD_HATS = [6, 10, 12, 13, 15, 16, 17, 18, 14]; // Santa, Pedro the Snail, Top, Party, Pirate, Nurse, Bouncy, Shark, Parasol (Hat enum)
const COWBOY = 4, CARDBOARD_BOX = 11, BASEBALL_CAP = 2;
const rnd = n => Math.floor(Math.random() * n);

export class GameServer {
  constructor({ users, content, redeemToken, serverName = 'Local Server' }) {
    Object.assign(this, { users, content, redeemToken, serverName });
    this.sessions = new Map();
    this.chatRooms = new Map();
    this.listings = new Map();
    this.matches = new Map();
    this.quickJoin = new Set();
    this.nextSocket = 1; this.nextListing = 0; this.nextMatch = 0; this.nextGuest = 1;
    this.createChat('chat-Home', 0, '', 'Welcome to Platform Racing 3!', true);
    setInterval(() => this.tick(), 1000).unref();
  }
  onlineCount() { let n = 0; for (const s of this.sessions.values()) if (s.loggedIn) n++; return n; }
  isOnline(uid) { for (const s of this.sessions.values()) if (s.user?.id === uid && !s.user.isGuest) return true; return false; }
  connect(ws, ip) {
    const s = new Session(this, ws, ip, this.nextSocket++);
    this.sessions.set(s.socketId, s);
    ws.on('message', m => { try { this.handle(s, typeof m === 'string' ? JSON.parse(m) : null); } catch (e) { console.error('game message error', e); } });
    ws.on('close', () => this.disconnect(s));
  }
  disconnect(s) {
    if (!this.sessions.delete(s.socketId)) return;
    // each step on its own, so one failure can't leave the player behind in rooms/listings
    const step = f => { try { f(); } catch (e) { console.error('disconnect cleanup', e); } };
    for (const room of [...this.chatRooms.values()]) step(() => room.leave(s));
    step(() => s.lobby.listing?.leave(s));
    for (const l of [...s.lobby.matches]) step(() => l.leaveLobby(s));
    this.quickJoin.delete(s);
    step(() => s.match?.match.leave(s));
    if (s.user && !s.user.isGuest) step(() => { s.user.setServer(null); s.user.lastOnline = Math.floor(Date.now() / 1000); s.user.save(); });
  }
  tick() {
    for (const m of this.matches.values()) m.checkState();
  }
  createChat(name, creator, pass, note, system = false) {
    const r = new ChatRoom(this, name, creator, pass, note, system);
    this.chatRooms.set(name, r);
    return r;
  }

  handle(s, m) {
    if (!m) return;
    const t = m.t ?? m.type;
    const h = HANDLERS[t];
    if (DEBUG && t !== 'update' && t !== 'ping') console.log(`< ${s.socketId} ${JSON.stringify(m).slice(0, 200)}`);
    if (!h) return;
    if (!s.loggedIn && !['confirm_connection', 'guest_login', 'token_login', 'login', 'ping', 'test_ping', 'mv'].includes(t)) return;
    h.call(this, s, m);
  }

  login(s, user) {
    s.user = user;
    s.loginTime = Date.now();
    s.loggedIn = true;
    user.setServer(this.serverName);
    s.send({ t: 'loginSuccess', socketID: s.socketId, userID: user.id, userName: user.username, permissions: user.permissions, vars: user.vars('*') });
    if (!user.isGuest) s.send({ t: 'receiveFriendsAndIgnored', friendArray: [...user.friends], ignoredArray: [...user.ignoredSet] });
  }
  levelList(s, m) {
    const start = +m.start || 0, count = Math.min(+m.count || 5, 100);
    let r;
    // the original server's queries (LevelManager.GetBestLevels/GetBestTodayLevels/GetNewestLevels/...)
    const pub = s.user.isGuest ? 'l.publish = 1' : `(l.publish = 1 OR l.author_id = ${+s.user.id})`;
    const score = `CASE WHEN dislikes = 0 THEN likes WHEN likes = 0 THEN -dislikes ELSE likes END`;
    switch (m.mode) {
      case 'campaign': r = this.content.campaignLevels('classic', start, count); break;
      case 'best': r = this.content.levelPage(pub, [], `${score} DESC, l.id DESC`, count, start); break;
      case 'best_today': r = this.content.levelPage(`(likes > 0 OR dislikes > 0) AND ${pub}`, [], `CASE WHEN dislikes = 0 THEN likes WHEN likes = 0 THEN -dislikes ELSE likes / dislikes END DESC, l.id DESC`, count, start, true); break;
      case 'newest': r = this.content.levelPage(pub, [], 'l.updated DESC, l.id DESC', count, start); break;
      case 'liked': r = s.user.isGuest ? { levels: [], total: 0 } : this.content.levelPage('l.id IN (SELECT level_id FROM level_ratings WHERE user_id = ? AND rating > 0)', [s.user.id], 'l.updated DESC', count, start); break;
      default: r = { levels: [], total: 0 };
    }
    s.send({ t: 'receiveLevelList', requestID: +m.request_id || 0, results: r.total ?? r.levels.length, levels: r.levels.map(l => this.content.levelJson(l)) });
  }
  createListing(s, level, m, type = 'normal') {
    if (s.lobby.listing || !level) return null;
    if (!level.publish && (s.user.isGuest || level.authorId !== s.user.id)) return null;
    const id = ++this.nextListing;
    const name = type === 'lotd' ? `lotd-${id}` : type === 'tournament' ? `tournament-${id}` : `match-listing-${id}`;
    const l = new MatchListing(this, type, s, level, name, +m.min_rank || 0, m.max_rank === undefined ? 2 ** 31 : +m.max_rank, Math.max(1, Math.min(+m.max_members || 4, 32)), !!m.only_friends);
    if (s) s.send({ t: 'matchCreated', ...l.json() });
    this.listings.set(name, l);
    return l;
  }
  lotd() {
    let l = [...this.listings.values()].filter(x => x.type === 'lotd').sort((a, b) => b.clients.size - a.clients.size)[0];
    if (!l) {
      const levels = this.content.campaignLevels().levels;
      if (!levels.length) return null;
      const lv = levels[rnd(levels.length)];
      const id = ++this.nextListing;
      l = new MatchListing(this, 'lotd', null, lv, `lotd-${id}`, 0, 2 ** 31, 4, false);
      this.listings.set(l.name, l);
    }
    return l;
  }
  sendPm(fromUser, toName, title, message, kind = 'text', data = '') {
    const to = typeof toName === 'number' ? this.users.get(toName) : this.users.byName(toName);
    if (!to) return 'User not found';
    if (to.ignoredSet.has(fromUser.id)) return '';
    this.users.db.prepare('INSERT INTO pms (to_id, from_id, title, message, kind, data) VALUES (?, ?, ?, ?, ?, ?)').run(to.id, fromUser.id, String(title).slice(0, 100), String(message).slice(0, 5000), kind, data);
    return '';
  }
}

class Session {
  constructor(server, ws, ip, id) {
    Object.assign(this, { server, ws, ip, socketId: id });
    this.loggedIn = false; this.confirmed = false; this.user = null; this.ping = 0;
    this.lobby = { listing: null, matches: new Set() };
    this.match = null; // MatchPlayer
    this.tracking = new Map(); // room -> Set(socketId)
    this.queued = new Map(); // room -> Map(socketId -> msgs[])
    this.spectate = false; this.hostTournament = false;
  }
  get isGuest() { return this.user?.isGuest ?? true; }
  send(o) { if (DEBUG && o.t !== 'ping' && o.data?.type !== 'u') console.log(`> ${this.socketId} ${JSON.stringify(o).slice(0, 200)}`); if (this.ws.open) this.ws.send(JSON.stringify(o)); }
  vars(names) { const v = this.user.vars(names); if (names.includes('socketID')) v.socketID = this.socketId; if (names.includes('ping')) v.ping = this.ping; return v; }
  track(room, other, vars) {
    let set = this.tracking.get(room); if (!set) this.tracking.set(room, (set = new Set()));
    if (!set.has(other.socketId)) { set.add(other.socketId); this.send({ t: 'userJoinRoom', roomName: room, socketID: other.socketId, userID: other.user.id, userName: other.user.username, vars }); }
    const q = this.queued.get(room)?.get(other.socketId);
    if (q) { for (const m of q) this.send(m); this.queued.get(room).delete(other.socketId); }
  }
  untrack(room, socketId) {
    if (this.tracking.get(room)?.delete(socketId)) this.send({ t: 'userLeaveRoom', roomName: room, socketID: socketId });
    this.queued.get(room)?.delete(socketId);
  }
  untrackAll(room) { this.tracking.delete(room); this.queued.delete(room); }
  sendUserRoomData(room, socketId, msg) {
    if (this.tracking.get(room)?.has(socketId)) return this.send(msg);
    let m = this.queued.get(room); if (!m) this.queued.set(room, (m = new Map()));
    let q = m.get(socketId); if (!q) m.set(socketId, (q = []));
    q.push(msg);
  }
}

const LISTING_VARS = ['userName', 'rank', 'hat', 'head', 'body', 'feet', 'hatColor', 'headColor', 'bodyColor', 'feetColor', 'socketID', 'ping'];
const MATCH_VARS = ['speed', 'accel', 'jump', 'hat', 'head', 'body', 'feet', 'hatColor', 'headColor', 'bodyColor', 'feetColor'];

class ChatRoom {
  constructor(server, name, creator, pass, note, system) {
    Object.assign(this, { server, name, creator, pass, note, system });
    this.clients = new Set(); this.recent = []; this.banned = new Set();
  }
  join(s, chatId = 0) {
    const creatorName = this.creator ? this.server.users.get(this.creator)?.username ?? 'Unknown' : null;
    s.send({ t: 'receiveRoomVars', chatId, roomName: this.name, vars: { creator: creatorName, note: this.note } });
    if (this.banned.has(s.user.isGuest ? 'ip:' + s.ip : 'u:' + s.user.id)) return false;
    if (this.clients.has(s)) return false;
    this.clients.add(s);
    for (const o of this.clients) o.track(this.name, s, s.user.vars(['id']));
    for (const o of this.clients) if (o !== s) s.track(this.name, o, o.user.vars(['id']));
    for (const m of this.recent) s.send(m);
    return true;
  }
  leave(s) {
    if (!this.clients.delete(s)) return;
    for (const o of this.clients) o.untrack(this.name, s.socketId);
    s.untrackAll(this.name);
    if (!this.clients.size && !this.system) this.server.chatRooms.delete(this.name);
  }
  handleData(s, data, sendToSelf) {
    if (!this.clients.has(s) || data?.type !== 'chat' || s.isGuest) return;
    const text = String(data.data?.message ?? '').trim().slice(0, 300);
    if (!text) return;
    if (text.startsWith('/')) return s.send({ t: 'alert', message: 'Unknown command' });
    const msg = chatMsg(this.name, text, s);
    this.recent.push(msg); if (this.recent.length > 25) this.recent.shift();
    for (const o of this.clients) if (sendToSelf || o !== s) o.send(msg);
  }
}
// a PM row as the original server serializes it (IPrivateMessage); thing transfers carry their details as a
// JSON message (ThingTransferPrivateMessage), with the PM's own id as thing_id (what accept_thing_transfer gets)
function pmJson(r) {
  const sender = r.username ?? 'Unknown';
  let title = r.title, message = r.message;
  if (r.kind === 'thing') {
    let d = {}; try { d = JSON.parse(r.data); } catch {}
    title = `${sender} has sent you a ${d.thing}`;
    message = JSON.stringify({ message_type: 'thing_receive', thing_sender: sender, thing_type: d.thing, thing_title: d.title, thing_id: r.id });
  }
  return { messageID: r.id, senderId: r.from_id, senderName: sender, senderNameColor: r.name_color ?? -16777216, title, message, sent_time: r.sent };
}
const chatMsg = (room, text, s) => ({ t: 'receiveMessage', roomName: room, data: { type: 'chat', data: { message: text, socketID: s?.socketId ?? 0, userID: s?.user.id ?? 0, name: s?.user.username ?? 'Broadcaster', nameColor: s?.user.nameColor ?? -65536, highlight: false } } });

class MatchListing {
  constructor(server, type, creator, level, name, minRank, maxRank, maxMembers, onlyFriends) {
    Object.assign(this, { server, type, level, name, minRank, maxRank, maxMembers, onlyFriends });
    this.clients = new Map(); this.lobbyClients = new Set(); this.banned = new Set();
    this.host = creator?.socketId ?? 0;
    this.full = false;
  }
  json() {
    const l = this.level;
    return { roomName: this.name, levelID: l.id, levelTitle: l.title, version: l.version, creatorID: l.authorId, creatorName: l.author, creatorNameColor: l.authorNameColor,
      levelType: l.mode, likes: l.likes, dislikes: l.dislikes, minRank: this.minRank, maxRank: this.maxRank, maxMembers: this.maxMembers };
  }
  canJoin(s) {
    if (this.full || this.clients.size >= this.maxMembers) return 'full';
    if (this.host === s.socketId) return 'ok';
    if (this.type === 'normal' && this.clients.size === 0) return 'waiting';
    if (this.type !== 'lotd' && (this.minRank > s.user.rank || this.maxRank < s.user.rank) && !s.user.hasPermission?.('access_bypass_match_listing_rank_requirement')) return 'rank';
    if (this.type !== 'lotd' && this.onlyFriends && !s.user.hasPermission?.('access_bypass_match_listing_only_friends')) {
      if (s.isGuest) return 'friends';
      const host = this.clients.get(this.host);
      if (host && !host.isGuest && !host.user.friends.has(s.user.id)) return 'friends';
    }
    if (this.banned.has(s.isGuest ? 'ip:' + s.ip : 'u:' + s.user.id)) return 'banned';
    return 'ok';
  }
  joinLobby(s) {
    if (this.lobbyClients.has(s)) return false;
    this.lobbyClients.add(s);
    for (const o of this.clients.values()) s.track(this.name, o, o.vars(LISTING_VARS));
    return true;
  }
  leaveLobby(s) { this.lobbyClients.delete(s); s.lobby.matches.delete(this); s.untrackAll(this.name); }
  assignHost(s) {
    this.host = s.socketId;
    s.send({ t: 'matchOwner', matchName: this.name, play: true, kick: this.type === 'normal', ban: this.type === 'normal' });
  }
  join(s) {
    if (this.canJoin(s) !== 'ok' || this.clients.has(s.socketId)) return false;
    this.clients.set(s.socketId, s);
    s.lobby.listing = this;
    // drop what the lobby preview showed: the joiner gets every member (incl. itself) afresh
    s.lobby.matches.delete(this); this.lobbyClients.delete(s); s.untrackAll(this.name);
    for (const o of [...this.clients.values()].sort((a, b) => (a === s) - (b === s))) {
      s.track(this.name, o, o.vars(LISTING_VARS));
      o.track(this.name, s, s.vars(LISTING_VARS));
    }
    for (const o of this.lobbyClients) o.track(this.name, s, s.vars(LISTING_VARS));
    if ((this.type === 'normal' || this.type === 'lotd') && (this.host === s.socketId || this.host === 0)) this.assignHost(s);
    if (this.clients.size >= this.maxMembers) { this.full = true; this.start(); }
    return true;
  }
  leave(s) {
    if (!this.clients.delete(s.socketId)) return;
    s.lobby.listing = null;
    for (const o of this.clients.values()) o.untrack(this.name, s.socketId);
    for (const o of this.lobbyClients) o.untrack(this.name, s.socketId);
    s.untrackAll(this.name);
    if (this.clients.size === 0) {
      this.host = 0;
      if (this.type !== 'lotd') { for (const o of this.lobbyClients) { o.lobby.matches.delete(this); o.untrackAll(this.name); } this.server.listings.delete(this.name); }
      return;
    }
    if ((this.type === 'normal' || this.type === 'lotd') && this.host === s.socketId) {
      const next = this.clients.values().next().value;
      this.assignHost(next);
    }
  }
  forceStart(s) { if (this.host === s.socketId && this.clients.size > 0) { this.full = true; this.start(); } }
  kick(s, socketId, ban = false) {
    if (s.socketId !== this.host) return;
    const target = this.clients.get(+socketId);
    if (!target || target === s) return;
    if (ban) this.banned.add(target.isGuest ? 'ip:' + target.ip : 'u:' + target.user.id);
    this.leave(target);
    target.send({ t: 'userLeaveRoom', roomName: this.name, socketID: target.socketId });
  }
  start() {
    this.server.listings.delete(this.name);
    const match = new MultiplayerMatch(this.server, this.type, this.type === 'normal' ? `match-${++this.server.nextMatch}` : this.name.replace('listing-', ''), this.level);
    this.server.matches.set(match.name, match);
    const start = { t: 'receiveMessage', roomName: this.name, data: { type: 'startGame', data: null, gameName: match.name, random: rnd(2 ** 31) } };
    const order = [...this.clients.values()].sort(() => Math.random() - 0.5);
    for (const s of order) {
      s.lobby.listing = null;
      match.reserve(s, s.socketId === this.host);
      s.untrackAll(this.name);
      s.send(start);
    }
    match.lock();
    for (const s of this.lobbyClients) { s.untrackAll(this.name); s.lobby.matches.delete(this); s.send(start); }
  }
}

class MatchPlayer {
  constructor(match, s) {
    Object.assign(this, { match, session: s, user: s.user, socketId: s.socketId });
    this.speed = s.user.speed; this.accel = s.user.accel; this.jump = s.user.jump;
    this.hats = []; this.x = 0; this.y = 0; this.velX = 0; this.velY = 0; this.scaleX = 1; this.rot = 0;
    this.item = 'n'; this.life = 0; this.hurt = false; this.coins = 0; this.dash = 0; this.team = 'none';
    this.keys = {}; this.keyPresses = 0;
    this.finishTime = null; this.finishPlace = null; this.forfeit = false; this.gone = false; this.koth = ''; this.host = false;
  }
  vars(names) { const v = this.user.vars(names); for (const n of ['speed', 'accel', 'jump']) if (names.includes(n)) v[n] = this[n]; return v; }
  finishJson() { return { socketID: this.socketId, name: this.user.username, finish_time: this.forfeit ? 'forfeit' : this.finishTime === null ? '' : String(this.finishTime), finish_place: this.finishPlace ?? 0, coins: this.coins, koth: this.koth ?? '', dash: this.dash, gone: this.gone }; }
}

class MultiplayerMatch {
  constructor(server, type, name, level) {
    Object.assign(this, { server, type, name, level });
    this.status = 'preparing';
    this.reserved = new Set(); this.clients = new Set(); this.players = new Map(); this.drawing = new Set();
    this.ready = 0; this.nextHatId = 0; this.droppedHats = new Map(); this.prize = null; this.startTime = 0;
  }
  send(o, except = null) { for (const c of this.clients) if (c !== except) c.send(o); }
  reserve(s, host) {
    const p = new MatchPlayer(this, s);
    p.host = host;
    this.players.set(s.socketId, p);
    this.reserved.add(s);
    for (const o of this.clients) o.track(this.name, s, p.vars(MATCH_VARS));
    s.match = p;
    this.drawing.add(s.socketId);
  }
  lock() {
    this.status = 'joining';
    this.reserveTimer = setTimeout(() => { for (const s of [...this.reserved]) this.unreserve(s); this.checkState(); }, 10000);
    this.checkState();
  }
  unreserve(s) {
    this.reserved.delete(s);
    this.players.delete(s.socketId);
    this.send({ t: 'receiveForfiet', socketID: s.socketId });
    for (const o of this.clients) o.untrack(this.name, s.socketId);
    this.drawing.delete(s.socketId);
    if (s.match?.match === this) s.match = null;
  }
  join(s) {
    if (!this.reserved.delete(s)) { this.clients.add(s); this.onJoin(s); return; } // spectate
    this.clients.add(s);
    this.onJoin(s);
    this.ready++;
    this.checkState();
  }
  onJoin(s) {
    for (const p of this.players.values()) {
      s.track(this.name, p.session, p.vars(MATCH_VARS));
      if (!this.drawing.has(p.socketId)) s.sendUserRoomData(this.name, p.socketId, { t: 'finishDrawing', socketID: p.socketId });
    }
  }
  finishDrawing(s) {
    if (this.drawing.delete(s.socketId)) for (const o of this.clients) o.sendUserRoomData(this.name, s.socketId, { t: 'finishDrawing', socketID: s.socketId });
    this.checkState();
  }
  elapsed() { return (Date.now() - this.startTime) / 1000; }
  checkState() {
    for (;;) {
      if (this.status === 'joining') {
        if (this.ready !== this.players.size) return;
        this.status = 'drawing';
      } else if (this.status === 'drawing') {
        if (this.drawing.size) return;
        this.status = 'ongoing';
        clearTimeout(this.reserveTimer);
        this.start();
      } else if (this.status === 'ongoing') {
        const lv = this.level;
        const timeUp = lv.seconds > 0 && lv.mode !== 'kingOfTheHat' && this.elapsed() > lv.seconds;
        if (timeUp && (lv.mode === 'coinFiend' || lv.mode === 'damageDash')) for (const c of [...this.clients]) this.finishMatch(c);
        if (timeUp || [...this.players.values()].every(p => p.forfeit || p.finishTime !== null)) { this.status = 'ended'; this.send({ t: 'endGame' }); }
        else return;
      } else if (this.status === 'ended') {
        if (this.clients.size) return;
        this.status = 'died';
        this.server.matches.delete(this.name);
        return;
      } else return;
    }
  }
  start() {
    const lv = this.level, events = [];
    if (lv.snow > Math.random() * 100) events.push('snow');
    if (lv.wind > Math.random() * 100) events.push('wind');
    if (lv.mode !== 'kingOfTheHat') {
      if (lv.sfchm > Math.random() * 100) { events.push('sfchm'); for (const p of this.players.values()) this.addHat(p, COWBOY, p.user.hatColor, false); }
      else for (const p of this.players.values()) {
        if (p.user.hat !== 1) this.addHat(p, p.user.hat, p.user.hatColor, false);
        else if (lv.mode === 'hatAttack') this.addHat(p, CARDBOARD_BOX, p.user.hatColor, false);
      }
    } else {
      // King of the Hat: hats spawn on finish blocks; positions come from the level's finish blocks
      const hat = lv.koth[0] ?? 2, color = lv.koth[1] ?? -16777216;
      for (const pt of finishBlocks(lv)) this.dropHat({ id: ++this.nextHatId, num: hat, color, spawned: true }, pt.x * 40 + 20, pt.y * 40 + 20);
      for (const p of this.players.values()) this.send({ t: 'setPlayerHats', socketID: p.socketId, hatArray: p.hats });
    }
    if (lv.alien > Math.random() * 100) events.push('aliens');
    this.rollPrize();
    if (this.prize) this.send({ t: 'prize', category: this.prize.category, id: this.prize.id, status: 'available' });
    this.startTime = Date.now() + 2664;
    this.send({ t: 'receiveEvents', events });
    this.send({ t: 'beginMatch' });
    this.server.content.addPlays(lv.id, this.players.size);
  }
  rollPrize() {
    const lv = this.level;
    if (lv.prizes?.length) { const p = lv.prizes[rnd(lv.prizes.length)]; this.prize = { category: p.type, id: p.prize_id, bonus: false }; return; }
    if (this.type === 'lotd') {
      const r = Math.random();
      if (r < 0.4) this.prize = { category: ['head', 'body', 'feet'][rnd(3)], id: 1 + rnd(26), bonus: true };
      else if (r < 0.5) this.prize = { category: 'hat', id: LOTD_HATS[rnd(LOTD_HATS.length)], bonus: true };
      return;
    }
    const ips = new Set([...this.players.values()].map(p => p.session.ip)).size;
    if (this.players.size < 2 || ips < 2) return;
    let chance = ips * 5;
    if (ips >= 4 && rnd(Math.floor(40 / ips)) === 0) chance *= 2;
    if (chance <= Math.random() * 100) return;
    const t = Math.random() * 100;
    const cat = t > 40 && t <= 67 ? 'body' : t > 67 && t <= 89 ? 'head' : 'feet';
    this.prize = { category: cat, id: WINNABLE_PARTS[rnd(WINNABLE_PARTS.length)], bonus: true };
  }
  addHat(p, num, color, spawned = true) {
    if (num < 1 || num > HAT_MAX) return;
    p.hats.push({ id: ++this.nextHatId, num, color, spawned });
    this.send({ t: 'setPlayerHats', socketID: p.socketId, hatArray: p.hats.map(hatJson) });
  }
  dropHat(hat, x, y, velX = 0, velY = 0) {
    this.droppedHats.set(hat.id, hat);
    this.send({ t: 'addHat', id: hat.id, num: hat.num, color: hat.color, x, y, velX, velY });
  }
  loseHat(s, x, y, vx, vy) {
    const p = this.players.get(s.socketId); if (!p) return;
    const hat = p.hats.shift(); if (!hat) return;
    this.dropHat(hat, x, y, Math.fround(vx), Math.fround(vy));
    this.send({ t: 'setPlayerHats', socketID: p.socketId, hatArray: p.hats.map(hatJson) });
  }
  getHat(s, id) {
    const p = this.players.get(s.socketId);
    if (!p || p.forfeit || p.finishTime !== null) return;
    const hat = this.droppedHats.get(+id); if (!hat) return;
    this.droppedHats.delete(+id);
    p.hats.push(hat);
    this.send({ t: 'removeHat', id: hat.id }, s);
    this.send({ t: 'setPlayerHats', socketID: p.socketId, hatArray: p.hats.map(hatJson) });
  }
  update(s, m) {
    const p = this.players.get(s.socketId); if (!p) return;
    const out = { t: 'update', socketID: s.socketId };
    if (Array.isArray(m.p)) {
      const [x, y, vx, vy, sx] = m.p;
      out.p = [x, y, Math.fround(vx), Math.fround(vy), sx];
      p.x = x; p.y = y; p.velX = vx; p.velY = vy; p.scaleX = sx;
    }
    for (const k of ['space', 'left', 'right', 'down', 'up']) if (k in m) { if (p.keys[k] !== !!m[k]) p.keyPresses++; p.keys[k] = !!m[k]; out[k] = !!m[k]; }
    for (const [src, dst] of [['velLevel', 'speed'], ['accelLevel', 'accel'], ['jumpLevel', 'jump']]) if (src in m) { p[dst] = m[src] | 0; out[src] = m[src] | 0; }
    if ('rot' in m) { p.rot = m.rot | 0; out.rot = p.rot; }
    if ('item' in m) { p.item = String(m.item); out.item = p.item; }
    if ('life' in m) { p.life = m.life | 0; out.life = p.life; }
    if ('hurt' in m) { p.hurt = !!m.hurt; out.hurt = p.hurt; }
    if ('coins' in m) { p.coins = m.coins | 0; out.coins = p.coins; }
    if ('team' in m) { p.team = String(m.team); out.team = p.team; }
    if (m.teleport) out.teleport = true;
    this.send(out, s);
  }
  handleData(s, data, sendToSelf) {
    const room = this.name, d = data?.data ?? {};
    let msg = null;
    switch (data?.type) {
      case 'chat': if (s.isGuest) return; msg = chatMsg(room, String(d.message ?? '').slice(0, 300), s); break;
      case 'useItem': msg = { t: 'receiveMessage', roomName: room, socketID: s.socketId, data: { type: 'useItem', data: { p: d.p } } }; break;
      case 'shatterBlock': msg = { t: 'receiveMessage', roomName: room, data: { type: 'shatterBlock', data: { tileY: d.tileY, tileX: d.tileX } } }; break;
      case 'explodeBlock': msg = { t: 'receiveMessage', roomName: room, data: { type: 'explodeBlock', data: { tileY: d.tileY, tileX: d.tileX } } }; break;
      case 'gameEvent': msg = { t: 'receiveMessage', roomName: room, socketID: s.socketId, data: { type: 'gameEvent', data: d } }; break;
      case 'chatBubble': msg = { t: 'receiveMessage', roomName: room, socketID: s.socketId, data: { type: 'chatBubble', data: { id: d.id } } }; break;
      default: return;
    }
    this.send(msg, sendToSelf ? null : s);
  }
  forfeit(s, leave = false) {
    const p = this.players.get(s.socketId);
    if (leave && s.match?.match === this) s.match = null;
    if (this.status === 'preparing' || this.status === 'joining' || this.status === 'drawing') {
      this.drawing.delete(s.socketId);
      this.players.delete(s.socketId);
      this.reserved.delete(s);
      this.send({ t: 'receiveForfiet', socketID: s.socketId });
    } else if (p) {
      if (this.level.mode === 'hatAttack' || this.level.mode === 'kingOfTheHat') while (p.hats.length) this.forceDropHat(p, 15);
      if (p.finishTime === null && !p.forfeit) { p.forfeit = true; this.send({ t: 'receiveForfiet', socketID: s.socketId }); }
      if (leave) p.gone = true;
      this.send({ t: 'playerFinished', socketID: s.socketId, finishArray: [...this.players.values()].map(x => x.finishJson()) });
    }
    this.checkState();
  }
  forceDropHat(p, power = 7) {
    // as the original server: float (PointF) rotation, float velocities rounded half-to-even twice
    const f = Math.fround;
    const [rx, ry] = rotatePoint(0, -60, -p.rot);
    const x = p.x + rx, y = p.y + ry;
    const a = DEG_RAD * Math.random() * -180;
    let vx = f(f(Math.cos(a)) * power); const vy = f(f(Math.sin(a)) * power);
    vx = f(f(roundEven(f(vx * 100))) / 100); vx = f(f(roundEven(f(vx * 100))) / 100);
    const hat = p.hats.shift(); if (!hat) return;
    this.dropHat(hat, x, y, vx, vy);
    this.send({ t: 'setPlayerHats', socketID: p.socketId, hatArray: p.hats.map(hatJson) });
  }
  leave(s) {
    if (!this.clients.delete(s)) { if (this.reserved.has(s)) this.unreserve(s); return; }
    this.forfeit(s, true);
    for (const o of this.clients) o.untrack(this.name, s.socketId);
    this.checkState();
  }
  finishMatch(s) {
    const now = this.elapsed();
    const lv = this.level;
    if (now < 0 || (lv.seconds > 0 && lv.mode !== 'kingOfTheHat' && now > lv.seconds + 5)) return;
    const p = this.players.get(s.socketId);
    if (!p || p.forfeit || p.finishTime !== null) return;
    p.finishTime = now;
    let exp = expForFinishing(now);
    const label = { race: 'Level completed', deathmatch: 'Fighting spirit', hatAttack: 'Hat owner', coinFiend: 'Coin meizer', damageDash: 'Damage dealer', kingOfTheHat: 'Hat holder' }[lv.mode] ?? 'Level completed';
    const expArray = [[label, exp]];
    let place = this.players.size;
    for (const o of this.players.values()) {
      if (o === p) continue;
      let defeated = false;
      switch (lv.mode) {
        case 'race': case 'hatAttack': case 'kingOfTheHat': defeated = o.forfeit || o.finishTime === null; break;
        case 'deathmatch': defeated = o.forfeit || o.finishTime !== null; break;
        case 'coinFiend': defeated = o.forfeit || p.coins > o.coins; break;
        case 'damageDash': defeated = o.forfeit || p.dash > o.dash; break;
      }
      if (!defeated) continue;
      place--;
      let e = roundEven(expForDefeating(o.user.rank) * playtimeMul(o.finishTime ?? now) * keyPressMul(o.keyPresses));
      if (o.session.ip === p.session.ip) e = Math.floor(e / 2);
      exp += e;
      expArray.push(['Defeated ' + o.user.username, e]);
    }
    p.finishPlace = place;
    const base = exp;
    if (this.prize && (!this.prize.bonus || place === 1)) {
      const prize = this.prize;
      if (prize.bonus) this.prize = null;
      const owned = p.user.has(prize.category, prize.id);
      if (!owned) p.user.give(prize.category, prize.id);
      if (prize.bonus && owned) { exp += roundEven(base * 0.5); expArray.push(['Prize bonus', 'EXP X 1.5']); }
      s.send({ t: 'prize', category: prize.category, id: prize.id, status: owned ? 'exp' : 'won' });
    }
    let hatBonus = 0;
    for (const h of p.hats) if (!h.spawned && h.num === BASEBALL_CAP) hatBonus += hatBonus === 0 ? 1 : 0.1;
    if (hatBonus > 0) { exp += roundEven(base * hatBonus); expArray.push(['Exp hat', `EXP X ${hatBonus + 1}`]); }
    if (this.type === 'lotd') { exp += roundEven(base * 0.25); expArray.push(['LOTD bonus', 'EXP X 1.25']); }
    this.send({ t: 'playerFinished', socketID: s.socketId, finishArray: [...this.players.values()].map(x => x.finishJson()) });
    s.send({ t: 'youFinished', rank: s.user.rank, curExp: s.user.exp, maxExp: nextRankExp(s.user.rank), totExpGain: exp, expArray, place });
    s.user.addExp(exp);
    this.checkState();
  }
  coins(s, n) { const p = this.players.get(s.socketId); if (p && !p.forfeit && p.finishTime === null) { p.coins = n | 0; this.send({ t: 'coins', array: [...this.players.values()].map(x => x.finishJson()) }); } }
  dash(s, n) { const p = this.players.get(s.socketId); if (p && !p.forfeit && p.finishTime === null) { p.dash = n | 0; this.send({ t: 'coins', array: [...this.players.values()].map(x => x.finishJson()) }); } }
  kothTime(s, time) {
    if (this.level.mode !== 'kingOfTheHat') return;
    const p = this.players.get(s.socketId); if (!p) return;
    const m = /^(-?\d+):(-?\d+)$/.exec(String(time)); if (!m) return;
    p.koth = `${Math.max(0, +m[1])}:${String(Math.max(0, +m[2])).padStart(2, '0')}`;
    this.send({ t: 'coins', array: [p.finishJson()] });
  }
}
const hatJson = h => ({ id: h.id, num: h.num, color: h.color });
function finishBlocks(lv) {
  // finds tiles holding a finish block in a v2 level string (built-in finish ids are 7, 107, ... 507)
  const out = [];
  try {
    const d = lv.data;
    const s = d.startsWith('v2 | ') ? JSON.parse(d.slice(5)).blockStr ?? '' : '';
    let id = 0, x = 0, y = 0;
    for (const tok of s.split(',')) {
      if (tok[0] === 'b') { id = +tok.slice(1); continue; }
      const [dx, dy] = tok.split(':').map(Number); x += dx; y += dy;
      if (id % 100 === 7 && id < 600) out.push({ x, y });
    }
  } catch {}
  return out;
}

// ---------------------------------------------------------------- message handlers
const HANDLERS = {
  confirm_connection(s) { if (s.confirmed) return; s.confirmed = true; s.send({ t: 'receiveVersion', version: 6 }); s.send({ t: 'receiveSocketID', socketID: s.socketId }); },
  guest_login(s) { if (!s.loggedIn) this.login(s, new GuestUser(this.nextGuest++, this.users)); },
  token_login(s, m) {
    if (s.loggedIn) return;
    const uid = this.redeemToken(String(m.login_token ?? ''));
    const u = uid ? this.users.get(uid) : null;
    if (!u) return s.send({ t: 'loginError', error: 'This login token is invalid' });
    this.login(s, u);
  },
  login(s, m) { HANDLERS.token_login.call(this, s, m); },
  ping(s, m) { s.send({ t: 'ping', time: m.time ?? 0, server_time: Date.now() }); },
  test_ping(s) { s.send({ t: 'testPing' }); },
  report_ping(s, m) { s.ping = m.ping | 0; },
  mv(s, m) {
    if (m.location !== 'user' || m.action !== 'get' || +m.id !== s.socketId) return;
    if (!s.loggedIn) this.login(s, new GuestUser(this.nextGuest++, this.users));
    s.send({ t: 'receiveUserVars', socketID: s.socketId, vars: s.user.vars(m.user_vars) });
  },
  set_account_settings(s, m) {
    s.user.setStats(m.speed | 0, m.accel | 0, m.jump | 0);
    s.user.setParts(m.hat | 0, m.hatColor | 0, m.head | 0, m.headColor | 0, m.body | 0, m.bodyColor | 0, m.feet | 0, m.feetColor | 0);
    s.send({ t: 'receiveUserVars', socketID: s.socketId, vars: s.user.vars(['hat', 'hatColor', 'head', 'headColor', 'body', 'bodyColor', 'feet', 'feetColor', 'speed', 'accel', 'jump']) });
  },
  get_level_list(s, m) { this.levelList(s, m); },
  jr(s, m) {
    const room = String(m.room_name ?? '');
    if (m.room_type === 'chat') {
      let r = this.chatRooms.get(room);
      if (!r) { if (s.isGuest) return; r = this.createChat(room, s.user.id, m.pass ?? '', m.note ?? ''); }
      if (!r.pass || r.pass === m.pass) r.join(s, m.chatId | 0);
    } else if (m.room_type === 'match_listing') {
      const l = this.listings.get(room);
      const ok = l && (s.lobby.listing === l || (!s.lobby.listing && l.join(s)));
      if (!ok) {
        s.send({ t: 'userJoinRoom', roomName: room, socketID: s.socketId, userID: s.user.id, userName: s.user.username, vars: s.vars(LISTING_VARS) });
        s.send({ t: 'userLeaveRoom', roomName: room, socketID: s.socketId });
        if (!l) s.send({ t: 'alert', message: 'Failed to join the match listing!' });
      } else for (const q of [...this.quickJoin]) if (l.canJoin(q) === 'ok') { this.quickJoin.delete(q); q.send({ t: 'quickJoinSuccess', ...l.json() }); } else break;
    } else if (m.room_type === 'game') this.matches.get(room)?.join(s);
  },
  lr(s, m) {
    const room = String(m.room_name ?? '');
    if (m.room_type === 'chat') this.chatRooms.get(room)?.leave(s);
    else if (m.room_type === 'match_listing') {
      const l = this.listings.get(room);
      // leaving a listing's lobby preview (the client does this right before actually joining it) must
      // forget the members it was shown, so the join re-sends them to the new room
      if (l && s.lobby.listing === l) l.leave(s); else if (l) l.leaveLobby(s);
    }
    else if (m.room_type === 'game') this.matches.get(room)?.leave(s);
  },
  sr(s, m) {
    const room = String(m.room_name ?? '');
    const match = s.match?.match;
    if (m.room_type === 'chat' && match?.name !== room) this.chatRooms.get(room)?.handleData(s, m.data, !!m.send_to_self);
    else if (match && match.name === room) match.handleData(s, m.data, !!m.send_to_self);
  },
  get_member_list(s, m) { const r = this.chatRooms.get(m.room_name); s.send({ t: 'memberList', list: r ? [...r.clients].map(c => ({ socketID: c.socketId, userID: c.user.id, userName: c.user.username, nameColor: c.user.nameColor })) : [] }); },
  get_user_list(s, m) {
    const all = [...this.sessions.values()].filter(x => x.loggedIn);
    const users = all.slice(+m.start || 0, (+m.start || 0) + (+m.count || 50)).map(x => ({ ...x.user.vars(['userID', 'userName', 'rank', 'hats', 'status', 'nameColor']), socketID: x.socketId }));
    s.send({ t: 'receiveUserList', requestID: +m.request_id || 0, users, results: all.length });
  },
  get_user_page(s, m) {
    const all = [...this.sessions.values()].filter(x => x.loggedIn);
    const online = all.find(x => x.socketId === +m.socket_id) ?? (+m.user_id ? all.find(x => !x.isGuest && x.user.id === +m.user_id) : null);
    const u = online?.user ?? (+m.user_id ? this.users.get(+m.user_id) : null);
    if (!u) return s.send({ t: 'alert', message: 'Unable to load user data' });
    // as the original: online -> ms since login, offline -> last online time in unix ms; colors as uint ARGB
    const timestamp = online ? Date.now() - (online.loginTime ?? Date.now()) : (u.lastOnline ?? 0) * 1000;
    s.send({ t: 'receiveUserPage', userID: u.id, group: u.group, rank: u.rank, online: !!online, timestamp, hat: u.hat, hatColor: u.hatColor >>> 0,
      head: u.head, headColor: u.headColor >>> 0, body: u.body, bodyColor: u.bodyColor >>> 0, feet: u.feet, feetColor: u.feetColor >>> 0 });
  },
  create_match(s, m) {
    const lv = this.content.level(+m.level_id, +m.version || 0);
    if (!this.createListing(s, lv, m, s.hostTournament ? 'tournament' : 'normal')) s.send({ t: 'matchFailed' });
    s.hostTournament = false;
  },
  request_matches(s, m) {
    const num = +m.num || 0; if (num <= 0) return;
    const list = [...this.listings.values()].filter(l => l.type === 'normal' && !s.lobby.matches.has(l) && l.canJoin(s) === 'ok').sort((a, b) => b.clients.size - a.clients.size).slice(0, num);
    s.send({ t: 'receiveMatches', lobbyId: +m.lobbyId || 0, matches: list.map(l => l.json()) });
    for (const l of list) if (l.joinLobby(s)) s.lobby.matches.add(l);
  },
  leave_lobby(s) { for (const l of [...s.lobby.matches]) l.leaveLobby(s); },
  force_start(s) { s.lobby.listing?.forceStart(s); },
  kick(s, m) { s.lobby.listing?.kick(s, m.socket_id); },
  ban(s, m) { s.lobby.listing?.kick(s, m.socket_id, true); },
  start_quick_join(s) {
    this.quickJoin.add(s);
    for (const l of this.listings.values()) if (l.type === 'normal' && l.canJoin(s) === 'ok') { this.quickJoin.delete(s); s.send({ t: 'quickJoinSuccess', ...l.json() }); break; }
  },
  stop_quick_join(s) { this.quickJoin.delete(s); },
  get_lotd(s) { const l = this.lotd(); if (l) { s.send({ t: 'receiveLOTD', lotd: l.json() }); if (l.joinLobby(s)) s.lobby.matches.add(l); } },
  get_tournament(s) { s.send({ t: 'tournament_status', status: 0 }); },
  join_tournament(s) { s.send({ t: 'tournament_status', status: 0 }); },
  gr(s) { s.send({ t: 'receiveRooms', roomList: [...this.chatRooms.values()].map(r => ({ roomName: r.name, members: r.clients.size })) }); },
  finish_drawing(s) { s.match?.match.finishDrawing(s); },
  forfiet(s) { s.match?.match.forfeit(s); },
  finish_match(s) { s.match?.match.finishMatch(s); },
  update(s, m) { s.match?.match.update(s, m); },
  lose_hat(s, m) { s.match?.match.loseHat(s, +m.x, +m.y, +m.vel_x, +m.vel_y); },
  get_hat(s, m) { s.match?.match.getHat(s, m.id); },
  coins(s, m) { s.match?.match.coins(s, m.coins); },
  dash(s, m) { s.match?.match.dash(s, m.dash); },
  koth(s, m) { s.match?.match.kothTime(s, m.time); },
  win_hat(s) { if (!s.isGuest) { s.user.checkCampaignPrizes(); s.send({ t: 'receiveUserVars', socketID: s.socketId, vars: s.user.vars(['hatArray', 'headArray', 'bodyArray', 'feetArray']) }); } },
  edit_user_list(s, m) {
    if (s.isGuest) return;
    const set = m.list_type === 'friend' ? s.user.friends : m.list_type === 'ignored' ? s.user.ignoredSet : null;
    if (!set) return;
    if (m.action === 'add') set.add(+m.user_id); else if (m.action === 'remove') set.delete(+m.user_id);
    s.user.saveFriends();
  },
  rate_level(s, m) { if (!s.isGuest) this.content.rate(+m.level_id, s.user.id, +m.rating); },
  delete_level(s, m) { if (!s.isGuest) this.content.deleteLevel(+m.level_id, s.user.id); },
  unpublish_level(s, m) { if (!s.isGuest) this.content.unpublishLevel(+m.level_id, s.user.id); },
  get_pms(s, m) {
    if (s.isGuest) return s.send({ t: 'receivePMs', requestID: +m.request_id || 0, results: 0, pmArray: [] });
    const db = this.users.db;
    const total = db.prepare('SELECT count(*) AS n FROM pms WHERE to_id = ? AND deleted = 0').get(s.user.id).n;
    const rows = db.prepare('SELECT p.*, u.username, u.name_color FROM pms p LEFT JOIN users u ON u.id = p.from_id WHERE p.to_id = ? AND p.deleted = 0 ORDER BY p.id DESC LIMIT ? OFFSET ?')
      .all(s.user.id, +m.count || 10, +m.start || 0);
    s.send({ t: 'receivePMs', requestID: +m.request_id || 0, results: total, pmArray: rows.map(pmJson) });
  },
  get_pm(s, m) {
    if (s.isGuest) return;
    const r = this.users.db.prepare('SELECT p.*, u.username, u.name_color FROM pms p LEFT JOIN users u ON u.id = p.from_id WHERE p.id = ? AND p.to_id = ?').get(+m.message_id, s.user.id);
    if (r) { const pm = pmJson(r); s.send({ t: 'receivePM', title: pm.title, senderName: pm.senderName, message: pm.message, allowHTML: false, handleAsJson: r.kind !== 'text' }); }
  },
  delete_pms(s, m) { if (!s.isGuest) for (const id of [].concat(m.pm_array ?? [])) this.users.db.prepare('UPDATE pms SET deleted = 1 WHERE id = ? AND to_id = ?').run(+id, s.user.id); },
  delete_pm(s, m) { if (!s.isGuest) this.users.db.prepare('UPDATE pms SET deleted = 1 WHERE id = ? AND to_id = ?').run(+m.message_id, s.user.id); },
  send_pm(s, m) {
    if (s.isGuest) return s.send({ t: 'alert', message: 'Guests can not send private messages' });
    const e = this.sendPm(s.user, String(m.name ?? ''), m.title ?? '', m.message ?? '');
    if (e) s.send({ t: 'alert', message: e });
  },
  report_pm() {},
  send_thing(s, m) {
    if (s.isGuest) return;
    const data = JSON.stringify({ thing: m.thing, id: +m.thing_id, title: String(m.thing_title ?? ''), from: s.user.id });
    const e = this.sendPm(s.user, +m.user_id, `${s.user.username} sent you a ${m.thing}`, String(m.thing_title ?? ''), 'thing', data);
    if (e) s.send({ t: 'alert', message: e });
  },
  accept_thing_transfer(s, m) {
    if (s.isGuest) return;
    const r = this.users.db.prepare("SELECT * FROM pms WHERE id = ? AND to_id = ? AND kind = 'thing'").get(+m.transfer_id, s.user.id);
    if (!r) return;
    const d = JSON.parse(r.data);
    if (d.thing === 'level') {
      const l = this.content.level(d.id);
      if (l) this.content.saveLevel(s.user.id, { p_title: m.title ?? l.title, p_comment: m.comment ?? l.description, p_publish: m.publish ? 1 : 0, p_song_id: l.songId, p_mode: l.mode,
        p_seconds: l.seconds, p_gravity: l.gravity, p_alien: l.alien, p_sfchm: l.sfchm, p_snow: l.snow, p_wind: l.wind, p_items: l.items.join(','), p_health: l.health,
        p_king_of_the_hat: l.koth.join(':'), p_bg_image: l.bgImage, p_level_data: l.data });
    } else if (d.thing === 'block') {
      const b = this.content.blockRow(d.id);
      this.content.saveBlock(s.user.id, { p_title: m.title ?? b.title, p_category: m.category ?? b.category, p_comment: m.comment ?? b.comment, p_image_data: b.image_data, p_settings: b.settings });
    }
    this.users.db.prepare('UPDATE pms SET deleted = 1 WHERE id = ?').run(r.id);
  },
  thingExits(s, m) {
    const n = this.users.db.prepare(m.thing_type === 'block' ? 'SELECT 1 FROM block_titles WHERE title = ? COLLATE NOCASE AND author_id = ? AND deleted = 0' : 'SELECT 1 FROM level_titles WHERE title = ? COLLATE NOCASE AND author_id = ? AND deleted = 0').get(String(m.thing_title ?? ''), s.user.id);
    s.send({ t: 'thingExits', exits: !!n });
  },
};
