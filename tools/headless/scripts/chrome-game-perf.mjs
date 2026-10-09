// Gameplay perf: level load hitch + running frame times, with a CPU profile (LEVEL env, default tutorial 225).
import { writeFileSync } from 'node:fs';
export default async function ({ open, until, evaluate, sleep, send, key, shot }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`);
  await sleep(500);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'welcome');
  await evaluate(`(() => { window.__ft = []; let last = performance.now(); const f = t => { window.__ft.push([t, t - last]); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()`);
  await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 200 }); await send('Profiler.start');
  const lv = +(process.env.LEVEL ?? 225);
  await evaluate(`(() => { const OGP = pr3.getDefinitionByName('com.jiggmin.pr3.game.OfflineGamePage'); window.__t0 = performance.now(); __h.findType('WelcomePopup').setPage(new OGP('${lv === 225 ? 'reborn' : 'classic'}', ${lv})); return true; })()`);
  await until(`!!__h.findType('OfflineGamePage')?.localPlayer`, 30000, 'level');
  await sleep(4000);
  if (process.env.HIDE_BG) await evaluate(`(() => { const mt = pr3.stage._ch[0]; for (const c of mt._ch) if (!c.constructor.name.includes('PlatformRacing3')) c.visible = false; return mt._ch.length; })()`);
  await key('down', 'ArrowRight', 'ArrowRight', 39);
  for (let i = 0; i < 6; i++) { await key('down', 'ArrowUp', 'ArrowUp', 38); await sleep(400); await key('up', 'ArrowUp', 'ArrowUp', 38); await sleep(600); }
  await key('up', 'ArrowRight', 'ArrowRight', 39);
  const { profile } = await send('Profiler.stop');
  writeFileSync(process.env.PROFILE_OUT ?? '/tmp/pr3-game.cpuprofile', JSON.stringify(profile));
  const ft = await evaluate(`(() => { const t0 = window.__t0; return window.__ft.filter(([t]) => t > t0).map(([t, d]) => [Math.round(t - t0), Math.round(d)]); })()`);
  const long = ft.filter(([, d]) => d > 50);
  console.log('frames', ft.length, 'long (>50ms):', long.length, JSON.stringify(long.slice(0, 20)));
  const run = ft.filter(([t]) => t > 6000).map(([, d]) => d).sort((a, b) => a - b);
  console.log(`running: avg=${(run.reduce((a, b) => a + b, 0) / run.length).toFixed(1)}ms p95=${run[Math.floor(run.length * 0.95)]} max=${run.at(-1)}`);
  await shot('game-perf');
}
