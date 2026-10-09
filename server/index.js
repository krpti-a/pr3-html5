// PR3 HTML5 server: static client, JSON API and WebSocket game server in one small process.
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serveStatic, SECURITY_HEADERS } from './static.js';
import { openDb } from './db.js';
import { UserStore } from './users.js';
import { Content } from './content.js';
import { createApi } from './api.js';
import { GameServer } from './game.js';
import { acceptUpgrade } from './ws.js';
import { ensureDefaults } from './defaults.js';
import { Moderation } from './mod.js';
import { ConnectionCounter } from './limits.js';

process.removeAllListeners('warning'); // node:sqlite prints an "experimental" warning
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const PORT = +(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? process.env.IP ?? '0.0.0.0';
const DB_FILE = process.env.PR3_DB ?? join(ROOT, 'data', 'pr3.db');
// the client's address; proxy headers only count behind your own reverse proxy (PR3_TRUST_PROXY=1), else anyone could fake them
const TRUST_PROXY = process.env.PR3_TRUST_PROXY === '1';
let warnedProxy = false;
const clientIp = req => {
  const real = req.headers['x-real-ip']; // alwaysdata's front-end proxy
  const fwd = req.headers['x-forwarded-for'];
  if ((real || fwd) && !TRUST_PROXY && !warnedProxy) { warnedProxy = true; console.warn('WARNING: requests come through a proxy but PR3_TRUST_PROXY is not set: every player looks like the proxy\'s ip, so per-ip limits and guest bans hit everyone. Set PR3_TRUST_PROXY=1.'); }
  return (TRUST_PROXY && (real?.trim() || fwd?.split(',').pop().trim())) || req.socket.remoteAddress || '';
};
// HTTPS (directly or via the trusted proxy): session cookies get the Secure flag
const isHttps = req => !!req.socket.encrypted || (TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https') || process.env.PR3_SECURE_COOKIE === '1';

const db = openDb(DB_FILE, join(ROOT, 'data', 'seed.db'));
ensureDefaults(db);
const users = new UserStore(db);
const content = new Content(db);
const mod = new Moderation(db, users);
const ref = {};
const api = createApi({ db, users, content, mod, clientIp, isHttps, game: { onlineCount: () => ref.game.onlineCount(), isOnline: id => ref.game.isOnline(id), featureLevel: id => ref.game.featureLevel(id) } });
const game = (ref.game = new GameServer({ users, content, mod, redeemToken: t => api.redeemToken(t), serverName: process.env.PR3_SERVER_NAME ?? 'Local Server' }));
// game connections: a few tabs per ip, and a hard cap overall
const conns = new ConnectionCounter(+(process.env.PR3_MAX_CONN_PER_IP ?? 8), +(process.env.PR3_MAX_CONN ?? 2000));

const server = createServer((req, res) => {
  try {
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
    if (req.url.startsWith('/api/')) return api.handle(req, res);
    if (serveStatic(PUBLIC, req, res)) return;
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  } catch (e) {
    console.error('request error', e);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end();
  }
});
// slow clients can't hold connections open forever (slowloris)
server.headersTimeout = 15000;
server.requestTimeout = 60000;
server.on('clientError', (e, socket) => socket.destroy());
server.on('upgrade', (req, socket) => {
  socket.on('error', () => socket.destroy());
  if (!req.url.startsWith('/ws')) return socket.destroy();
  const release = conns.acquire(clientIp(req));
  if (!release) { socket.end('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n'); return; }
  const ws = acceptUpgrade(req, socket);
  if (!ws) return release();
  ws.on('close', release);
  game.connect(ws, clientIp(req));
});
server.listen(PORT, HOST, () => console.log(`PR3 running at http://localhost:${PORT}  (database: ${DB_FILE})`));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { db.close(); process.exit(0); });
