// Isolated headless Chromium driven over the DevTools protocol, with a memory watchdog that
// kills the whole browser process group above a limit (a runaway page must never take the machine down).
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';

export function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const base = join(homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(base)) for (const d of readdirSync(base).filter(d => d.startsWith('chromium_headless_shell')).sort().reverse()) {
    for (const sub of ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell-linux64']) {
      const p = join(base, d, sub, 'chrome-headless-shell');
      if (existsSync(p)) return p;
    }
  }
  throw new Error('No headless Chromium found; set CHROME to a chrome-headless-shell binary');
}

export async function launchChrome({ limitMb = 2500, width = 740, height = 714, dpr = 2, shots = join(tmpdir(), 'pr3-shots'), log = console.log } = {}) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), 'pr3-chrome-'));
  const chrome = spawn(findChrome(), [
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--headless', '--mute-audio', '--no-first-run',
    `--window-size=${width},${height}`, `--force-device-scale-factor=${dpr}`, '--js-flags=--max-old-space-size=1024', 'about:blank',
  ], { detached: true, stdio: 'ignore' });
  // orphan guard: if this Node process dies in any way (even SIGKILL), take the browser down with it
  spawn('sh', ['-c', `while kill -0 ${process.pid} 2>/dev/null; do sleep 1; done; kill -9 -${chrome.pid} 2>/dev/null`], { detached: true, stdio: 'ignore' }).unref();
  let killed = false, peak = 0;
  const kill = reason => { if (killed) return; killed = true; if (reason !== 'done') log('KILL chrome:', reason); try { process.kill(-chrome.pid, 'SIGKILL'); } catch {} };
  process.on('exit', () => kill('exit'));
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { kill(sig); process.exit(130); });
  const rssMb = () => {
    const rows = execFileSync('ps', ['-A', '-o', 'pid=,ppid=,rss='], { encoding: 'utf8' }).trim().split('\n').map(l => l.trim().split(/\s+/).map(Number));
    const kids = new Map(); for (const [p, pp] of rows) (kids.get(pp) ?? kids.set(pp, []).get(pp)).push(p);
    const rss = new Map(rows.map(([p, , r]) => [p, r]));
    let total = 0; const st = [chrome.pid];
    while (st.length) { const p = st.pop(); total += rss.get(p) ?? 0; st.push(...(kids.get(p) ?? [])); }
    return total / 1024;
  };
  const watchdog = setInterval(() => {
    const mb = rssMb(); peak = Math.max(peak, mb);
    if (mb > limitMb) { kill(`RSS ${mb.toFixed(0)}MB > ${limitMb}MB`); log('MEMORY LIMIT HIT'); process.exit(3); }
  }, 200);

  let url = null;
  for (let i = 0; i < 50 && !url; i++) {
    try { url = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
    if (!url) await new Promise(r => setTimeout(r, 100));
  }
  if (!url) { kill('no start'); throw new Error('chrome did not start'); }
  const ws = new WebSocket(url);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let seq = 0; const pending = new Map(); const consoleLines = []; const handlers = new Map();
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method && handlers.has(m.method)) handlers.get(m.method)(m.params);
    if (m.method === 'Runtime.consoleAPICalled') consoleLines.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    else if (m.method === 'Runtime.exceptionThrown') consoleLines.push('EXC ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text));
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  await send('Runtime.enable');
  await send('Page.enable');
  mkdirSync(shots, { recursive: true });
  let shotN = 0;
  const shot = async (name = '') => {
    const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
    const f = join(shots, `${String(++shotN).padStart(2, '0')}${name ? '-' + name : ''}.jpg`);
    writeFileSync(f, Buffer.from(r.data, 'base64'));
    log('shot', f);
    return f;
  };
  const close = () => { clearInterval(watchdog); kill('done'); };
  const on = (method, fn) => handlers.set(method, fn);
  return { send, on, evaluate, shot, close, consoleLines, rssMb, get peak() { return peak; } };
}
