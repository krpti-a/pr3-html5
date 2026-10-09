import assert from 'node:assert/strict';
import test from 'node:test';

import { GameServer } from '../server/game.js';

function fakeSocket() {
  const listeners = new Map();
  return {
    open: true,
    messages: [],
    on(event, listener) { listeners.set(event, listener); },
    send(message) { this.messages.push(JSON.parse(message)); },
    close() { listeners.get('close')?.(); },
  };
}

function fakeUser(id, username) {
  const all = {
    id,
    userID: id,
    username,
    userName: username,
    rank: 0,
    exp: 0,
    speed: 1,
    accel: 1,
    jump: 1,
    hat: 0,
    hatColor: 0,
    head: 0,
    headColor: 0,
    body: 0,
    bodyColor: 0,
    feet: 0,
    feetColor: 0,
    nameColor: -16777216,
    hats: [],
    status: '',
  };
  return {
    ...all,
    isGuest: false,
    friends: new Set(),
    ignoredSet: new Set(),
    permissions: [],
    vars(names) {
      if (names === '*') return { ...all };
      const wanted = Array.isArray(names) ? names : [names];
      return Object.fromEntries(wanted.map(name => [name, all[name]]).filter(([, value]) => value !== undefined));
    },
    hasPermission() { return false; },
    setServer() {},
    save() {},
  };
}

function fakeLevel() {
  return {
    id: 7,
    title: 'Level of the Day test level',
    version: 1,
    authorId: 1,
    author: 'test-author',
    authorNameColor: -16777216,
    mode: 'race',
    likes: 0,
    dislikes: 0,
    seconds: 0,
    snow: 0,
    wind: 0,
    sfchm: 0,
    alien: 0,
    koth: [],
    prizes: [],
  };
}

function fixture() {
  const level = fakeLevel();
  const content = {
    campaignLevels() { return { levels: [level] }; },
    addPlays() {},
  };
  const users = {
    db: {
      prepare() {
        return { get() { return undefined; } };
      },
    },
    get() { return null; },
    byName() { return null; },
  };
  const server = new GameServer({ users, content, redeemToken() { return 0; } });

  const connect = (id, username) => {
    const ws = fakeSocket();
    server.connect(ws, `127.0.0.${id}`);
    const session = [...server.sessions.values()].at(-1);
    server.login(session, fakeUser(id, username));
    ws.messages.length = 0;
    return { session, ws };
  };

  return { server, connect };
}

function joinLotd(server, player, listing) {
  server.handle(player.session, { t: 'get_lotd' });
  server.handle(player.session, { t: 'jr', room_type: 'match_listing', room_name: listing.name });
}

function clearMatchTimers(server) {
  for (const match of server.matches.values()) clearTimeout(match.reserveTimer);
}

test('the first player in Level of the Day can force-start it', () => {
  const { server, connect } = fixture();
  const first = connect(1, 'first-player');
  const listing = server.lotd();

  joinLotd(server, first, listing);
  assert.equal(listing.host, first.session.socketId);
  assert.ok(first.ws.messages.some(message => message.t === 'matchOwner' && message.play === true && message.kick === false && message.ban === false));

  server.handle(first.session, { t: 'force_start' });

  assert.ok(first.ws.messages.some(message => message.data?.type === 'startGame'));
  clearMatchTimers(server);
});

test('Level of the Day host ownership moves to the next player after leaving', () => {
  const { server, connect } = fixture();
  const first = connect(1, 'first-player');
  const second = connect(2, 'second-player');
  const listing = server.lotd();

  joinLotd(server, first, listing);
  joinLotd(server, second, listing);
  assert.equal(listing.host, first.session.socketId);

  server.handle(first.session, { t: 'lr', room_type: 'match_listing', room_name: listing.name });
  assert.equal(listing.host, second.session.socketId);
  assert.ok(second.ws.messages.some(message => message.t === 'matchOwner' && message.play === true));

  server.handle(first.session, { t: 'force_start' });
  assert.equal([...server.matches.values()].length, 0);
  assert.equal(second.ws.messages.some(message => message.data?.type === 'startGame'), false);

  server.handle(second.session, { t: 'force_start' });
  assert.ok(second.ws.messages.some(message => message.data?.type === 'startGame'));
  clearMatchTimers(server);
});
