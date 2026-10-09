// Hostile-client checks against a running server: crash attempts, path traversal, oversized/slow/flooded
// WebSocket traffic, connection and login limits. The server must stay up and answer normally afterwards.
// Usage: node tools/headless/abuse.mjs [http://localhost:8080]
import net from 'node:net';
const BASE = process.argv[2] ?? 'http://localhost:8080';
const { hostname, port } = new URL(BASE);
const sleep = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
const check = (cond, label) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`); if (!cond) failed++; };
const alive = async () => { try { return (await fetch(BASE + '/', { signal: AbortSignal.timeout(3000) })).status === 200; } catch { return false; } };
// raw HTTP request (fetch would normalize the path)
const raw = path => new Promise(res => {
  const s = net.connect(+port || 80, hostname, () => s.write(`GET ${path} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
  let d = ''; s.on('data', c => (d += c)); s.on('end', () => res(d)); s.on('error', () => res('')); s.setTimeout(3000, () => { s.destroy(); res(d); });
});
const status = r => +(/^HTTP\/1\.1 (\d+)/.exec(r)?.[1] ?? 0);
const ws = () => new Promise(res => { const w = new WebSocket(BASE.replace(/^http/, 'ws') + '/ws'); w.onopen = () => res(w); w.onerror = () => res(null); });
const closed = w => new Promise(res => { if (w.readyState === 3) return res(true); w.onclose = () => res(true); setTimeout(() => res(false), 4000); });

check(await alive(), 'server up');

// 1. malformed URLs used to crash the whole process
for (const p of ['/%', '/%E0%A4%A', '/%00', '/api/%']) await raw(p);
check(await alive(), 'malformed URLs do not crash the server');

// 2. path traversal out of public/
for (const p of ['/../package.json', '/..%2f..%2fpackage.json', '/%2e%2e/server/index.js', '/..%5cserver%5cindex.js', '/../data/pr3.db', '/assets/../../server/api.js'])
  check(![200, 304].includes(status(await raw(p))), `traversal blocked: ${p}`);

// 3. security headers
const h = (await fetch(BASE + '/')).headers;
check(/default-src 'self'/.test(h.get('content-security-policy') ?? '') && h.get('x-content-type-options') === 'nosniff', 'security headers present');

// 4. API: prototype names, bad JSON, huge body
for (const name of ['__proto__', 'constructor', 'hasOwnProperty']) await fetch(`${BASE}/api/data/${name}`, { method: 'POST', body: '{}' });
check((await fetch(`${BASE}/api/data/GetLevel2`, { method: 'POST', body: '{not json' })).status === 400, 'bad JSON -> 400');
const big = await fetch(`${BASE}/api/data/SaveLevel4`, { method: 'POST', body: 'x'.repeat(9e6) }).catch(() => null);
check(!big || big.status === 413, 'oversized body refused');
check(await alive(), 'server up after API abuse');

// 5. WebSocket: prototype handler names, oversized frame, slow-drip frame, message flood
let w = await ws();
for (const t of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) w.send(JSON.stringify({ t }));
w.send('not json'); w.send('null'); w.send('42');
await sleep(300);
check(w.readyState === 1 && await alive(), 'odd messages ignored');
w.send('x'.repeat(300 * 1024));
check(await closed(w), 'oversized frame closes the connection');

{ // a 200 KB frame dribbled in 64-byte pieces: must still parse (and cheaply)
  const sock = net.connect(+port || 80, hostname);
  await new Promise(r => sock.on('connect', r));
  sock.write('GET /ws HTTP/1.1\r\nHost: x\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n\r\n');
  await sleep(200);
  const payload = Buffer.from(JSON.stringify({ t: 'ping', time: 1, pad: 'p'.repeat(200 * 1024) }));
  const head = Buffer.alloc(14); head[0] = 0x81; head[1] = 0x80 | 127; head.writeBigUInt64BE(BigInt(payload.length), 2); // mask = 0
  const frame = Buffer.concat([head, payload]);
  let got = ''; sock.on('data', d => (got += d.toString('latin1')));
  const t0 = performance.now();
  for (let i = 0; i < frame.length; i += 64) sock.write(frame.subarray(i, i + 64));
  await sleep(1500);
  check(/"t":"ping"/.test(got), `slow-drip frame parsed (${Math.round(performance.now() - t0)} ms)`);
  sock.destroy();
}

w = await ws();
for (let i = 0; i < 3000; i++) w.send(JSON.stringify({ t: 'test_ping' }));
check(await closed(w), 'message flood disconnects the client');
check(await alive(), 'server up after flood');

// 6. connection cap per ip
const socks = [];
for (let i = 0; i < 12; i++) socks.push(await ws());
check(socks.filter(Boolean).length <= 8, `connections per ip capped (${socks.filter(Boolean).length} of 12 accepted)`);
for (const s of socks) s?.close();

// 7. login guessing
let limited = false;
for (let i = 0; i < 14; i++) {
  const t = await (await fetch(`${BASE}/api/login`, { method: 'POST', body: new URLSearchParams({ username: 'nobody-here', password: 'guess' + i }) })).text();
  if (/too many/i.test(t)) { limited = true; break; }
}
check(limited, 'login attempts rate limited');

check(await alive(), 'server still up at the end');
console.log(failed ? `${failed} FAILED` : 'all passed');
process.exit(failed ? 1 : 0);
