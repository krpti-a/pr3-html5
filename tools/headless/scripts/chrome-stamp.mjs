// Stamp editor (via the editor jump menu path): draw a stroke and screenshot.
export default async function ({ open, until, evaluate, sleep, shot, clickObj, send }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await clickObj(`__h.findType('MenuPage').m.loginPanel.gotoEditorButton`, 'Goto Level Editor');
  await until(`!!__h.findType('LevelEditorPage')`, 20000, 'editor'); await sleep(1500);
  const page = process.env.PAGE ?? 'StampEditorPage';
  await evaluate(`(() => { const P = pr3.getDefinitionByName('com.jiggmin.pr3.editor.${page === 'StampEditorPage' ? 'stampEditor' : 'blockEditor'}.${page}'); __h.findType('LevelEditorPage').setPage(new P()); return true; })()`);
  await until(`!!__h.findType('${page}')`, 15000, page); await sleep(2500);
  await shot(page);
  console.log('page children:', await evaluate(`(() => { const p = __h.findType('StampEditorPage'); const out = []; const walk = (o, d) => { const b = o.getBounds(pr3.stage); const inside = 250 >= b.x && 250 <= b.right && 240 >= b.y && 240 <= b.bottom; if (d <= 3 && (inside || d < 2)) out.push('  '.repeat(d) + o.toString() + (o.name ? '#' + o.name : '') + ' [' + [b.x, b.y, b.width, b.height].map(Math.round) + ']' + (inside ? ' *' : '') + (o.mouseEnabled === false ? ' me=0' : '') + (o.mouseChildren === false ? ' mc=0' : '') + (o._visible === false ? ' hidden' : '')); if (d < 3) for (const c of o._ch ?? []) walk(c, d + 1); }; walk(p, 0); return '\\n' + out.join('\\n'); })()`));
  console.log('hit chain:', await evaluate(`(() => { const t = pr3.runtime.pick(250, 240); const c = []; for (let o = t; o; o = o.parent) c.push(o.toString() + (o.name ? '#' + o.name : '') + (o.mouseEnabled === false ? '(me=false)' : '') + (o.mouseChildren === false ? '(mc=false)' : '')); return c.join(' < '); })()`));
  const m = (type, x, y, b = 0) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: b, clickCount: 1 });
  await m('mouseMoved', 330, 330); await m('mousePressed', 330, 330, 1);
  for (let i = 0; i <= 30; i++) { await m('mouseMoved', 330 + i * 3, 330 + Math.sin(i / 4) * 30, 1); await sleep(16); }
  await m('mouseReleased', 420, 330, 0); await sleep(1200);
  console.log('art state:', JSON.stringify(await evaluate(`(() => { const map = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map; const sel = map.selectedMap; return { selected: sel?.constructor?.name, cmds: map.artMapArray.map(a => a.commandArray?.length), tiles: map.artMapArray.map(a => a.bitmapHolder?.numChildren), scale: map.scale, pos: [map.posX, map.posY], holderChildren: map.artMapArray.map(a => a.holder?.graphics?.draws?.length) }; })()`)));
  console.log('errs:', JSON.stringify(await evaluate('window.__errs')));
  console.log('texts:', (await evaluate(`__h.texts().filter(t => t.trim())`)).slice(0, 25).join(' | '));
  await shot(page + '-drawn');
}
