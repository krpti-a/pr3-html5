// Editor with a big map: real mouse drags (block dropping via the cursor) and hover, timing frames + JS profile.
import { writeFileSync } from 'node:fs';
export default async function ({ open, until, evaluate, sleep, send, shot }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickEditor(), true`);
  await until(`!!__h.findType('LevelEditorPage')`, 20000, 'editor');
  await sleep(2000);
  console.log('placed', await evaluate(`(() => { const map = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map, bm = map.blockMap; let n = 0;
    for (let r = -20; r < 40; r++) for (let c = -20; c < 60; c++) if ((r + c) % 3) { bm.addCommand({ type: 'addBlock', blockID: 1 + (c * 7 + r) % 6, x: 40 * c, y: 40 * r }); n++; } return n; })()`));
  console.log('cursor', await evaluate(`(() => { const C = pr3.getDefinitionByName('com.jiggmin.cursor.Cursor') ?? pr3.getDefinitionByName('Cursor'); const cur = C?.cursor ?? C?.currentCursor; return cur ? cur.constructor.name + ' block=' + (cur.block?.id ?? cur._block?.id) : 'none'; })()`).catch(e => e.message));
  await sleep(1500);
  await evaluate(`(() => { window.__ft = []; let last = performance.now(); const f = t => { window.__ft.push(t - last); last = t; if (!window.__stop) requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()`);
  await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 200 }); await send('Profiler.start');
  const m = (type, x, y, buttons = 0) => send('Input.dispatchMouseEvent', { type, x, y, button: buttons ? 'left' : 'none', buttons, clickCount: type === 'mousePressed' || type === 'mouseReleased' ? 1 : 0 });
  for (let k = 0; k < 3; k++) {
    await m('mouseMoved', 300, 350); await m('mousePressed', 300, 350, 1);
    for (let i = 0; i < 90; i++) { await m('mouseMoved', 300 + i * 9, 350 + Math.sin(i / 8) * 120, 1); await sleep(16); }
    await m('mouseReleased', 1100, 350, 0);
    for (let i = 0; i < 60; i++) { await m('mouseMoved', 1100 - i * 12, 500 + Math.cos(i / 6) * 150); await sleep(16); }
  }
  const { profile } = await send('Profiler.stop');
  await evaluate(`window.__stop = true`);
  writeFileSync('/tmp/pr3-editor-mouse.cpuprofile', JSON.stringify(profile));
  const ft = (await evaluate(`window.__ft.slice()`)).sort((a, b) => a - b);
  console.log(`mouse: frames=${ft.length} avg=${(ft.reduce((a, b) => a + b, 0) / ft.length).toFixed(1)}ms p95=${ft[Math.floor(ft.length * 0.95)].toFixed(1)} max=${ft.at(-1).toFixed(1)}`);
  await shot('editor-mouse');
}
