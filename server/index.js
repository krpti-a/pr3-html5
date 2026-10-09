// PR3 HTML5 server: static client, JSON API and WebSocket game server in one small process.
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serveStatic } from './static.js';
import { openDb } from './db.js';
import { UserStore } from './users.js';
import { Content } from './content.js';
import { createApi } from './api.js';
import { GameServer } from './game.js';
import { acceptUpgrade } from './ws.js';
import { ensureDefaults } from './defaults.js';

process.removeAllListeners('warning'); // node:sqlite prints an "experimental" warning
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? process.env.IP ?? '0.0.0.0';
const DB_FILE = process.env.PR3_DB ?? join(ROOT, 'data', 'pr3.db');

const db = openDb(DB_FILE, join(ROOT, 'data', 'seed.db'));
ensureDefaults(db);
const users = new UserStore(db);
const content = new Content(db);
const ref = {};
const api = createApi({ db, users, content, game: { onlineCount: () => ref.game.onlineCount(), isOnline: id => ref.game.isOnline(id) } });
const game = (ref.game = new GameServer({ users, content, redeemToken: t => api.redeemToken(t), serverName: process.env.PR3_SERVER_NAME ?? 'Local Server' }));

const server = createServer((req, res) => {
  if (req.url.startsWith('/api/')) return api.handle(req, res);
  if (serveStatic(join(ROOT, 'public'), req, res)) return;
  res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
});
server.on('upgrade', (req, socket) => {
  if (!req.url.startsWith('/ws')) return socket.destroy();
  const ws = acceptUpgrade(req, socket);
  if (ws) game.connect(ws, req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket.remoteAddress ?? '');
});
server.listen(PORT, HOST, () => console.log(`PR3 running at http://localhost:${PORT}  (database: ${DB_FILE})`));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { db.close(); process.exit(0); });
