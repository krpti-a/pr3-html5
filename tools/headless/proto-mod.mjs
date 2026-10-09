// Protocol test of the moderation features against a running server (no browser):
// admin silences / bans a test member, reads ban counts + the ban log, lifts the ban; a reported PM shows up
// in the mod queue; the user search returns linkable rows; SetLOTD needs the permission.
// Usage: node tools/headless/proto-mod.mjs [http://localhost:8080]   (accounts from .out/test-accounts.json)
import { readFileSync } from 'node:fs';
const BASE = process.argv[2] ?? 'http://localhost:8080';
const accts = JSON.parse(readFileSync(new URL('./.out/test-accounts.json', import.meta.url), 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
const check = (cond, label) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`); if (!cond) failed++; };

async function session(acct) {
  const r = await fetch(`${BASE}/api/login`, { method: 'POST', body: new URLSearchParams({ username: acct.username, password: acct.password }) });
  const cookie = r.headers.get('set-cookie')?.split(';')[0] ?? '';
  const api = async (proc, p = {}) => (await fetch(`${BASE}/api/data/${proc}`, { method: 'POST', headers: { cookie }, body: JSON.stringify(p) })).json();
  return { cookie, api };
}
async function connect(api) {
  const token = (await api('GetLoginToken2')).Row[0]?.login_token;
  const ws = new WebSocket(BASE.replace(/^http/, 'ws') + '/ws');
  const inbox = [];
  ws.onmessage = e => inbox.push(JSON.parse(e.data));
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const send = o => ws.send(JSON.stringify(o));
  const wait = async (t, ms = 3000) => { const end = Date.now() + ms; for (;;) { const i = inbox.findIndex(m => m.t === t); if (i >= 0) return inbox.splice(i, 1)[0]; if (Date.now() > end) return null; await sleep(20); } };
  let closed = false; ws.onclose = () => { closed = true; };
  send({ t: 'confirm_connection' });
  send({ t: 'token_login', login_token: token });
  const login = await Promise.race([wait('loginSuccess'), wait('loginError')]);
  return { ws, send, wait, login, inbox, isClosed: () => closed };
}

const admin = await session(accts[2]), member = await session(accts[0]);
const A = await connect(admin.api);
check(A.login?.t === 'loginSuccess', 'admin logs in');

// user search rows carry userID (the user page link)
const found = await admin.api('SearchUsers2', { p_name: accts[0].username });
check(+found.Row[0]?.userID > 0, `SearchUsers2 row has userID (${found.Row[0]?.userID})`);
const memberId = +found.Row[0]?.userID;

// permissions: a normal member can't read the ban log or feature levels
check((await member.api('CountBans')).Error !== '', 'member cannot CountBans');
check((await member.api('SetLOTD', { p_level_id: '1' })).Error !== '', 'member cannot SetLOTD');

// silence: member online, gets told, chat + PM blocked
let M = await connect(member.api);
check(M.login?.t === 'loginSuccess', 'member logs in');
A.send({ t: 'ban_user', socket_id: 0, user_id: memberId, seconds: 60, ban_type: 'silence', reason: 'test silence', log: '' });
check(!!(await A.wait('alert')), 'admin gets silence confirmation');
check(/silenced/.test((await M.wait('alert'))?.message ?? ''), 'member is told they are silenced');
M.send({ t: 'send_pm', name: accts[2].username, title: 'hi', message: 'blocked?' });
check(/silenced/.test((await M.wait('alert'))?.message ?? ''), 'silenced member cannot send PMs');
M.ws.close(); await sleep(200);
M = await connect(member.api);
check(/silenced/.test(M.login?.vars?.silencedMessage ?? ''), 'silence shown again on next login');

// counts for the user page
A.send({ t: 'get_user_bans', user_id: memberId, socket_id: 0 });
const counts = await A.wait('receiveUserBans');
check(counts?.accountSilenceCount >= 1, `receiveUserBans counts (${JSON.stringify(counts)})`);

// ban: online member is disconnected and can't log in again
A.send({ t: 'ban_user', socket_id: 0, user_id: memberId, seconds: 3600, ban_type: 'ban', reason: 'test ban', log: '\nsomeone: something rude' });
check(/banned/.test((await M.wait('alert'))?.message ?? ''), 'member is told they are banned');
await sleep(300);
check(M.isClosed(), 'banned member is disconnected');
const M2 = await connect(member.api);
check(M2.login?.t === 'loginError' && /banned/.test(M2.login.error), `banned member cannot log in (${M2.login?.error})`);
M2.ws.close();

// ban log + details + lift
const total = +(await admin.api('CountBans')).Row[0].count;
const recs = await admin.api('GetBanRecords', { p_start: 0, p_count: 5 });
const ban = recs.Row.find(r => r.ban_type === 'bann' && +r.banned_user_id === memberId);
check(total >= 2 && !!ban && ban.banned_name.toLowerCase() === accts[0].username.toLowerCase() && ban.mod_name !== '', `ban log lists the ban (${total} total)`);
const det = await admin.api('GetBanDetails', { p_ban_id: ban.ban_id });
check(det.Row[0]?.reason === 'test ban' && /rude/.test(det.Row[0]?.log), 'ban details have reason + log');
for (const r of recs.Row.filter(r => +r.banned_user_id === memberId && r.ban_lifted !== '1')) await admin.api('LiftBan', { p_ban_id: r.ban_id });
const M3 = await connect(member.api);
check(M3.login?.t === 'loginSuccess' && !M3.login.vars.silencedMessage, 'after lifting, member logs in unsilenced');

// reported PM -> mod queue -> pick -> archive
M3.send({ t: 'send_pm', name: accts[2].username, title: 'proto-mod test', message: 'please report me' });
await sleep(300);
A.send({ t: 'get_pms', start: 0, count: 5, request_id: 1 });
const pm = (await A.wait('receivePMs'))?.pmArray?.find(p => p.title === 'proto-mod test');
check(!!pm, 'admin received the PM');
A.send({ t: 'report_pm', message_id: pm.messageID });
await sleep(300);
const fl = await admin.api('GetFlaggedMessages', { p_start: 0, p_count: 10, p_archive: 0 });
check(fl.Row.some(r => +r.message_id === pm.messageID && r.from_name.toLowerCase() === accts[0].username.toLowerCase()), 'reported PM is in the mod queue');
const one = await admin.api('GetFlaggedMessage', { p_message_id: pm.messageID });
check(one.Row[0]?.message === 'please report me' && one.Row[0]?.to_name.toLowerCase() === accts[2].username.toLowerCase(), 'flagged PM details');
await admin.api('PickFlaggedMessage', { p_message_id: pm.messageID, p_pick: '1' });
check((await admin.api('GetFlaggedMessage', { p_message_id: pm.messageID })).Row[0]?.picker_username.toLowerCase() === accts[2].username.toLowerCase(), 'pick sets picker');
await admin.api('ArchiveFlaggedMessage', { p_message_id: pm.messageID });
check(!(await admin.api('GetFlaggedMessages', { p_start: 0, p_count: 10, p_archive: 0 })).Row.some(r => +r.message_id === pm.messageID), 'archived PM leaves the queue');
check((await admin.api('CountFlaggedChats', { p_archive: 0 })).Error === '', 'flagged chats list works');

// featured level of the day
A.send({ t: 'get_level_list', mode: 'campaign', start: 0, count: 1, request_id: 2 });
const lv = String((await A.wait('receiveLevelList'))?.levels?.[0]?.levelID ?? '');
check((await admin.api('SetLOTD', { p_level_id: lv })).Error === '', `admin can SetLOTD (${lv})`);
A.send({ t: 'get_lotd' });
check(String((await A.wait('receiveLOTD'))?.lotd?.levelID) === String(lv), 'get_lotd returns the featured level');

for (const c of [A, M3]) c.ws.close();
console.log(failed ? `${failed} FAILED` : 'all passed');
process.exit(failed ? 1 : 0);
