// Practice match (via chrome-practice), then dump the minimap state and screenshot it.
import practice from './chrome-practice.mjs';
export default async function (ctx) {
  const { evaluate, sleep, shot } = ctx;
  await practice(ctx);
  await sleep(1000);
  console.log(JSON.stringify(await evaluate(`(() => { const M = pr3.getDefinitionByName('com.jiggmin.pr3.game.Minimap'); const m = M.instance;
    if (!m) return 'no minimap';
    const dots = (m.dotArray ?? []).map(d => ({ x: +d.x.toFixed(1), y: +d.y.toFixed(1), vis: d.visible, onStage: !!d.stage, frame: d.currentFrameLabel, parent: d.parent?.constructor.name, p: m.dotDict[d]?.constructor.name }));
    return { onStage: !!m.stage, visible: m.visible, x: m.x, y: m.y, w: m.width, h: m.height, scale: m.scale, tx: m.translateX, ty: m.translateY, bmp: m.bitmap ? [m.bitmap.width, m.bitmap.height, !!m.bitmap.stage] : null, drawing: m.drawing, blockIndex: m.blockIndex, dots, keys: Object.keys(m.dotDict ?? {}).length };
  })()`), null, 1));
  console.log(JSON.stringify(await evaluate(`(() => { const m = pr3.getDefinitionByName('com.jiggmin.pr3.game.Minimap').instance; const out = [];
    for (let o = m; o; o = o.parent) out.push(o.constructor.name + ' vis=' + o.visible + ' a=' + o.alpha + ' xy=' + o.x + ',' + o.y + ' sc=' + o.scaleX + ' mask=' + !!o.mask + ' scroll=' + !!o.scrollRect + ' idx=' + (o.parent ? o.parent.getChildIndex(o) + '/' + o.parent.numChildren : '-'));
    const b = m.getBounds(m.stage); out.push('stage bounds ' + [b.x, b.y, b.width, b.height].map(v => v.toFixed(1)).join(','));
    out.push('bg ' + (m.bg && [m.bg.visible, m.bg.width, m.bg.height]));
    const bd = m.bitmapData; if (bd) { let n = 0; for (let y = 0; y < bd.height; y += 2) for (let x = 0; x < bd.width; x += 2) if (bd.getPixel32(x, y) >>> 24) n++; out.push('opaque px (sampled) ' + n); }
    return out; })()`), null, 1));
  await shot('minimap');
}
