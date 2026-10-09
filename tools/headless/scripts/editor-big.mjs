// Editor: time placing 3200 blocks, then frame cost with a big map.
export default async function ({ G, frames, findType, until, texts }) {
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  findType('MenuPage').clickEditor();
  await until(() => findType('LevelEditorPage'), 300, 'editor');
  await frames(60);
  const map = G.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map, bm = map.blockMap;
  let t0 = performance.now(), n = 0;
  for (let r = -20; r < (+process.env.ROWS || 40); r++) { for (let c = -20; c < 60; c++) if ((r + c) % 3) { bm.addCommand({ type: 'addBlock', blockID: 1 + (c * 7 + r) % 6, x: 40 * c, y: 40 * r }); n++; } if (r % 2 === 0) console.log(`  row ${r}: ${n} blocks, ${(performance.now() - t0).toFixed(0)}ms`); }
  console.log(`placed ${n} in ${(performance.now() - t0).toFixed(0)}ms`);
  for (let i = 0; i < 8; i++) { t0 = performance.now(); G.runFrame(); const t1 = performance.now(); G.render(); console.log(`frame ${i}: logic ${(t1 - t0).toFixed(1)}ms render ${(performance.now() - t1).toFixed(1)}ms`); await new Promise(r => setTimeout(r, 1)); }
}
