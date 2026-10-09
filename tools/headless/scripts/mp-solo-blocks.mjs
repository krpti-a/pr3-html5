import solo from './mp-solo.mjs';
export default async function (ctx) {
  const orig = ctx.frames; let once = false;
  await solo({ ...ctx, frames: async (n, e) => { await orig(n, e); if (once) return; const pg = ctx.findType('MatchPage'); const p = pg?.localPlayer; if (!p || pg.countdown !== -1) return; once = true;
    const bm = ctx.G.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map.blockMap;
    console.log('starts', JSON.stringify(pg.startPositions?.map(s => [s.x, s.y])), 'startIndex', pg.startIndex ?? pg.nextStart);
    for (let ty = 10; ty <= 14; ty++) { let row = ''; for (let tx = 4; tx <= 14; tx++) { const b = bm.getBlockAtTile(tx, ty); row += b ? (b.realVars?.type ?? '?').slice(0, 3).padEnd(4) : '.   '; } console.log('y' + ty, row); }
    console.log('player tile', Math.floor(p.x / 30), Math.floor(p.y / 30)); } });
}
