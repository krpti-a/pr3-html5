// Place a 12x6 grid of blocks in the editor, scroll away and back; screenshots to verify block rendering.
export default async function ({ open, until, evaluate, shot, sleep }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickEditor(), true`);
  await until(`!!__h.findType('LevelEditorPage')`, 20000, 'editor');
  await sleep(2000);
  console.log(await evaluate(`(() => { const MM = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager'); const map = MM.map, bm = map.blockMap;
    for (let r = 0; r < 6; r++) for (let c = 0; c < 12; c++) bm.addCommand({ type: 'addBlock', blockID: 1 + (c + r) % 6, x: 40 * c + 160 - map.posX, y: 40 * r + 120 - map.posY });
    return 'showAll=' + bm.showAll + ' pos=' + map.posX + ',' + map.posY; })()`));
  await sleep(500); await shot('grid');
  await evaluate(`(async () => { const map = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map; for (let i = 0; i < 60; i++) { map.posX -= 15; map.posY -= 5; await new Promise(r => setTimeout(r, 16)); } })()`);
  await sleep(300); await shot('scrolled');
  await evaluate(`(async () => { const map = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map; for (let i = 0; i < 60; i++) { map.posX += 15; map.posY += 5; await new Promise(r => setTimeout(r, 16)); } })()`);
  await sleep(300); await shot('back');
}
