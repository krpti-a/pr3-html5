// Practice match (1 player) on an art-heavy level: load time, long frames, running frame times + CPU profile.
import { writeFileSync } from 'node:fs';
export default async function ({ open, until, evaluate, sleep, send, key, shot, stats }) {
  const lv = +(process.env.LEVEL ?? 1055144);
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(500);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  await evaluate(`(() => { window.__ft = []; let last = performance.now(); const f = t => { window.__ft.push([t, t - last]); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()`);
  await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 250 }); await send('Profiler.start');
  await evaluate(`(() => { window.__t0 = performance.now(); const d = n => pr3.getDefinitionByName(n); __h.findType('LobbyPage').addPopup(new (d('com.jiggmin.pr3.lobby.multiPlayer.CreatingMatchPopup'))()); d('com.jiggmin.pr3.SocketManager').socket.createMatch(${lv}, 0, 0, 99, 1, false); return true; })()`);
  await until(`(() => { const p = __h.findType('MatchPage'); return p && p.localPlayer && p.countdown === -1; })()`, 90000, 'race start');
  const tStart = await evaluate(`performance.now() - window.__t0`);
  if (process.env.PROFILE_LOAD) { const { profile } = await send('Profiler.stop'); writeFileSync('/tmp/pr3-load.cpuprofile', JSON.stringify(profile)); await send('Profiler.start'); }
  console.log(`level ${lv}: load+countdown ${Math.round(tStart)}ms`);
  await stats('started');
  const layers = () => evaluate(`(() => { const m = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map; return m.artMapArray.length + ' art layers, tiles=' + m.artMapArray.map(a => a.bitmapHolder?.numChildren ?? 0).join('/') + ' drawing=' + m.drawing; })()`);
  console.log('at start:', await layers());
  await key('down', 'ArrowRight', 'ArrowRight', 39);
  for (let i = 0; i < 8; i++) { await key('down', 'ArrowUp', 'ArrowUp', 38); await sleep(350); await key('up', 'ArrowUp', 'ArrowUp', 38); await sleep(650); if (i === 4) { await key('up', 'ArrowRight', 'ArrowRight', 39); await key('down', 'ArrowLeft', 'ArrowLeft', 37); } }
  await key('up', 'ArrowLeft', 'ArrowLeft', 37);
  console.log('after 8s:', await layers());
  const { profile } = await send('Profiler.stop');
  writeFileSync('/tmp/pr3-match.cpuprofile', JSON.stringify(profile));
  const ft = await evaluate(`window.__ft.map(([t, d]) => [Math.round(t - window.__t0), Math.round(d)])`);
  const load = ft.filter(([t]) => t < tStart), run = ft.filter(([t]) => t > tStart).map(([, d]) => d).sort((a, b) => a - b);
  console.log(`load: frames=${load.length} long>100ms=${JSON.stringify(load.filter(([, d]) => d > 100))}`);
  console.log(`running: frames=${run.length} avg=${(run.reduce((a, b) => a + b, 0) / run.length).toFixed(1)}ms p50=${run[run.length >> 1]} p95=${run[Math.floor(run.length * 0.95)]} max=${run.at(-1)}`);
  await stats('end'); await shot('match-perf');
}
