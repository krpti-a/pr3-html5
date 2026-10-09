// Runs a physics scenario on the ORIGINAL game (instrumented SWF, see make-as3.sh) in Ruffle web inside
// an isolated headless Chromium, and saves every physics step to .out/ref-<scenario>.json.
// Usage: node tools/physics/run-ref.mjs <scenario> (game server must be running for level data: PR3_ORIGIN)
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome } from '../headless/cdp.mjs';
import { scenarios, fetchLevel } from './scenarios.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] ?? 'brick-run';
const sc = scenarios[name]; if (!sc) throw new Error('unknown scenario ' + name);
const ORIGIN = process.env.PR3_ORIGIN ?? 'http://localhost:8080';
const RUFFLE = process.env.RUFFLE ?? join(here, '../..', process.env.PR3_REPO ?? '../pr3', 'reverse/tools/ruffle/package');
const SWF = join(here, '.out/physics-ref.swf');
if (!existsSync(SWF)) throw new Error('build the reference SWF first: tools/physics/make-as3.sh');
const config = { character: sc.character, sched: sc.sched, frames: sc.frames, level: await fetchLevel(ORIGIN, sc.levelId) };

const PAGE = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#000">
<div id=c style="width:675px;height:480px"></div>
<script>
window.RufflePlayer = { config: { autoplay: 'on', unmuteOverlay: 'hidden', splashScreen: false, allowScriptAccess: true, logLevel: 'warn', letterbox: 'off', contextMenu: 'off' } };
</script>
<script src="/ruffle/ruffle.js"></script>
<script>
(async () => {
  const cfg = await (await fetch('/config.json')).json();
  window.ptConfig = () => cfg;
  window.ptDone = steps => { window.__ptResult = steps; };
  const player = window.RufflePlayer.newest().createPlayer();
  player.style.width = '675px'; player.style.height = '480px';
  document.getElementById('c').appendChild(player);
  player.ruffle().load({ url: '/ref.swf', allowScriptAccess: true });
})();
</script>`;
const MIME = { '.js': 'text/javascript', '.wasm': 'application/wasm', '.swf': 'application/x-shockwave-flash', '.json': 'application/json', '.html': 'text/html' };
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x').pathname;
  let body = null, type = 'text/html';
  if (u === '/') body = PAGE;
  else if (u === '/config.json') { body = JSON.stringify(config); type = MIME['.json']; }
  else if (u === '/ref.swf') { body = readFileSync(SWF); type = MIME['.swf']; }
  else if (u.startsWith('/ruffle/')) { const f = join(RUFFLE, u.slice(8)); if (existsSync(f)) { body = readFileSync(f); type = MIME[extname(f)] ?? 'application/octet-stream'; } }
  if (body === null) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': type }); res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const c = await launchChrome({ limitMb: 3000, dpr: 1, width: 700, height: 500 });
try {
  await c.send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
  const t0 = Date.now();
  let steps = null;
  while (Date.now() - t0 < 240000) {
    steps = await c.evaluate('window.__ptResult ?? null').catch(() => null);
    if (steps) break;
    await new Promise(r => setTimeout(r, 1000));
    if ((Date.now() - t0) % 15000 < 1000) console.log(`waiting... ${Math.round((Date.now() - t0) / 1000)}s rss=${c.rssMb().toFixed(0)}MB`);
  }
  if (!steps) { await c.shot('ref-timeout'); for (const l of c.consoleLines.slice(-20)) console.log(l); throw new Error('no result from Ruffle'); }
  const out = join(here, `.out/ref-${name}.json`);
  writeFileSync(out, JSON.stringify({ scenario: name, steps }));
  console.log(`${steps.length} steps -> ${out} (peak rss ${c.peak.toFixed(0)}MB)`);
} finally {
  c.close(); server.close();
}
process.exit(0);
