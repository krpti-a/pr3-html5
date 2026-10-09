// Runs the ORIGINAL game-fixed.swf in Ruffle web inside the isolated headless Chromium and executes a
// script of clicks/keys/screenshots, for side-by-side comparison with the port.
// Usage: node tools/ruffle/original.mjs <script.mjs> [--shots=dir]
// The script's default export receives { click(x, y), key(type, key, code, keyCode), shot(name), sleep }.
// Coordinates are in stage pixels (675x480).
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { launchChrome } from '../headless/cdp.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(3).map(a => a.replace(/^--/, '').split('=')));
const RUFFLE = process.env.RUFFLE ?? join(here, '../..', process.env.PR3_REPO ?? '../pr3', 'reverse/tools/ruffle/package');
const SWF = process.env.SWF ?? join(here, '../..', process.env.PR3_REPO ?? '../pr3', 'client/pr3-fixed/game-fixed.swf');
const PAGE = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#000">
<script>window.RufflePlayer = { config: { autoplay: 'on', unmuteOverlay: 'hidden', splashScreen: false, letterbox: 'off', contextMenu: 'off', logLevel: 'error' } };</script>
<script src="/ruffle/ruffle.js"></script>
<script>const p = window.RufflePlayer.newest().createPlayer(); p.style.cssText = 'width:675px;height:480px;display:block'; document.body.appendChild(p); p.ruffle().load({ url: '/game.swf' });</script>`;
const MIME = { '.js': 'text/javascript', '.wasm': 'application/wasm' };
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x').pathname;
  let body = null, type = 'text/html';
  if (u === '/') body = PAGE;
  else if (u === '/game.swf') { body = readFileSync(SWF); type = 'application/x-shockwave-flash'; }
  else if (u.startsWith('/ruffle/')) { const f = join(RUFFLE, u.slice(8)); if (existsSync(f)) { body = readFileSync(f); type = MIME[extname(f)] ?? 'application/octet-stream'; } }
  if (body === null) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': type }); res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const c = await launchChrome({ limitMb: 3000, dpr: 2, width: 675, height: 480, shots: args.shots ?? join(tmpdir(), 'pr3-orig') });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mouse = (type, x, y) => c.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
const ctx = {
  sleep, shot: c.shot,
  async click(x, y) { await mouse('mouseMoved', x, y); await sleep(50); await mouse('mousePressed', x, y); await sleep(50); await mouse('mouseReleased', x, y); },
  async key(type, key, code = key, keyCode = 0) { await c.send('Input.dispatchKeyEvent', { type: type === 'down' ? 'rawKeyDown' : 'keyUp', key, code, windowsVirtualKeyCode: keyCode }); },
};
// The original talks to api.pr3hub.com; answer its plain login check (logged out) and refuse the rest
// (DataAccess is encrypted), so the client reaches the menu and the offline level editor.
c.on('Fetch.requestPaused', async ({ requestId, request }) => {
  const u = new URL(request.url);
  if (u.hostname === '127.0.0.1') return c.send('Fetch.continueRequest', { requestId }).catch(() => {});
  const body = /isloggedin/i.test(u.pathname) ? '<Response><IsLoggedIn>0</IsLoggedIn><UserId>0</UserId><UserName></UserName></Response>'
    : /dataaccess/i.test(u.pathname) ? `<Response><DataRequestID>${u.searchParams.get('id') ?? 0}</DataRequestID><Error></Error><NumRows>0</NumRows></Response>`
    : '<Response><Error>offline</Error></Response>';
  await c.send('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'content-type', value: 'text/xml' }, { name: 'access-control-allow-origin', value: '*' }], body: Buffer.from(body).toString('base64') }).catch(() => {});
});
await c.send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
try {
  await c.send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` });
  await sleep(6000);
  const mod = await import(pathToFileURL(resolve(process.argv[2])).href);
  await mod.default(ctx);
} finally { c.close(); server.close(); }
process.exit(0);
