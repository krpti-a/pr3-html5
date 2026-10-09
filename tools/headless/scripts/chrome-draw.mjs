// Level editor: open the Art menu with a real click, then drag-draw a stroke on the map.
export default async function ({ open, until, evaluate, sleep, shot, clickObj, send }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await clickObj(`__h.findType('MenuPage').m.loginPanel.gotoEditorButton`, 'Goto Level Editor');
  await until(`!!__h.findType('LevelEditorPage')`, 20000, 'editor'); await sleep(2000);
  await clickObj(`__h.find(o => (o.constructor.__sym ?? '') === 'ArtButtonGraphic' && o.stage)`, 'Art menu'); await sleep(1500);
  await shot('art-menu');
  console.log('cursor:', await evaluate(`(() => { const C = pr3.getDefinitionByName('com.jiggmin.pr3.editor.cursor.Cursor') ?? null; return C ? (C.cursor ?? C.currentCursor)?.constructor?.name : 'n/a'; })()`).catch(e => e.message));
  const m = (type, x, y, b = 0) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: b, clickCount: 1 });
  await m('mouseMoved', 300, 400); await m('mousePressed', 300, 400, 1);
  for (let i = 0; i <= 40; i++) { await m('mouseMoved', 300 + i * 8, 400 + Math.sin(i / 5) * 60, 1); await sleep(16); }
  await m('mouseReleased', 620, 400, 0); await sleep(1500);
  const art = await evaluate(`(() => { const map = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map; const sel = map.selectedMap; return { selected: sel?.constructor?.name, commands: sel?.commandArray?.length, artLayers: map.artMapArray.length, cmds: map.artMapArray.map(a => a.commandArray?.length) }; })()`);
  console.log('art state:', JSON.stringify(art), 'errs:', JSON.stringify(await evaluate('window.__errs')));
  await shot('drawn');
}
