// Level editor benchmark: place blocks along a drag path, erase, scroll; frame times + CPU profile.
import { writeFileSync } from 'node:fs';
export default async function ({ open, until, evaluate, stats, shot, sleep, send }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickEditor(), true`);
  await until(`!!__h.findType('LevelEditorPage')`, 20000, 'editor');
  await sleep(3000);
  await stats('editor');
  // frame time recorder
  await evaluate(`(() => { window.__ft = []; let last = performance.now(); const f = t => { window.__ft.push(t - last); last = t; if (window.__ftOn) requestAnimationFrame(f); }; window.__ftOn = true; requestAnimationFrame(f); return true; })()`);
  const phase = async (name, js, ms) => {
    await evaluate(`window.__ft = []; true`);
    await evaluate(`(() => { const MM = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager'); let i = 0; window.__iv = setInterval(() => { const map = MM.map, bm = map.blockMap; ${js}; i++; }, 16); return true; })()`);
    await sleep(ms);
    await evaluate(`clearInterval(window.__iv), true`);
    const ft = await evaluate(`window.__ft.slice()`);
    ft.sort((a, b) => a - b);
    const avg = ft.reduce((a, b) => a + b, 0) / ft.length;
    console.log(`${name.padEnd(10)} frames=${ft.length} avg=${avg.toFixed(1)}ms p50=${ft[ft.length >> 1]?.toFixed(1)} p95=${ft[Math.floor(ft.length * 0.95)]?.toFixed(1)} max=${ft.at(-1)?.toFixed(1)}`);
  };
  await send('Profiler.enable');
  await send('Profiler.setSamplingInterval', { interval: 200 });
  await send('Profiler.start');
  await phase('idle', ``, 2000);
  await phase('place', `bm.addCommand({ type: 'addBlock', blockID: 1 + (i % 7), x: 30 * (i % 40) - map.posX, y: 30 * (8 + Math.floor(i / 40) % 8) - map.posY })`, 5000);
  await phase('erase', `bm.addCommand({ type: 'removeBlock', x: 30 * (i % 40) - map.posX, y: 30 * (8 + Math.floor(i / 40) % 8) - map.posY })`, 3000);
  await phase('refill', `bm.addCommand({ type: 'addBlock', blockID: 1 + (i % 7), x: 30 * (i % 40) - map.posX, y: 30 * (8 + Math.floor(i / 40) % 8) - map.posY })`, 4000);
  await phase('scroll', `map.posX -= 12; map.posY = -100 + Math.sin(i / 20) * 200`, 4000);
  const { profile } = await send('Profiler.stop');
  writeFileSync(process.env.PROFILE_OUT ?? '/tmp/pr3-editor.cpuprofile', JSON.stringify(profile));
  await shot('editor');
  await stats('end-editor');
}
