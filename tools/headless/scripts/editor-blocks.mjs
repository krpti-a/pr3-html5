// Place a grid of blocks in the editor and compare the block map with what's on the display list.
export default async function (ctx) {
  const { G, frames, findType, until, texts } = ctx;
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  findType('MenuPage').clickEditor();
  await until(() => findType('LevelEditorPage'), 300, 'editor');
  await frames(60);
  const MM = G.getDefinitionByName('com.jiggmin.pr3.map.MapManager');
  const map = MM.map, bm = map.blockMap;
  console.log('map pos', map.posX, map.posY, 'blockMap xy', bm.x, bm.y, 'tileSize', bm.tileSize);
  for (let r = 0; r < 6; r++) { for (let c = 0; c < 10; c++) bm.addCommand({ type: 'addBlock', blockID: 1 + c % 5, x: 30 * c + 100 - map.posX, y: 30 * r + 100 - map.posY }); await frames(2); }
  await frames(30);
  let inMap = 0; for (const x in bm.map) for (const y in bm.map[x]) if (bm.map[x][y]) inMap++;
  let onStage = 0, visibleOnStage = 0; const walk = o => { for (const c of o._ch ?? []) { if (c.constructor.name.includes('Block') && c.realVars) { onStage++; if (c.stage && c._visible) visibleOnStage++; } walk(c); } }; walk(G.stage);
  console.log('blocks in map', inMap, 'on display list', onStage, 'visible', visibleOnStage);
  const rows = {}; for (const x in bm.map) for (const y in bm.map[x]) if (bm.map[x][y]) { rows[y] = (rows[y] ?? 0) + 1; }
  console.log('per row', JSON.stringify(rows));
  console.log('groups', bm.blockGroupArray?.length, Object.keys(bm.blockGroupArray ?? {}).slice(0, 10));
}
