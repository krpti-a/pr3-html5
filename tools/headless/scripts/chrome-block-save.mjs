// Member: block editor -> draw -> Save popup (real clicks) -> the level editor's custom block picker lists it.
import { toLobby } from './chrome-lib.mjs';
export default async function (ctx) {
  const { evaluate, sleep, shot, clickObj, send, until } = ctx;
  await toLobby(ctx, process.env.ACCOUNT ?? 1);
  const title = 'zz block ' + Date.now() % 100000;
  await evaluate(`(() => { const P = pr3.getDefinitionByName('com.jiggmin.pr3.editor.blockEditor.BlockEditorPage'); __h.findType('LobbyPage').setPage(new P()); return true; })()`);
  await until(`!!__h.findType('com.jiggmin.pr3.editor.blockEditor.BlockEditorPage') || !!__h.find(o => o.constructor.name === 'BlockEditorPage')`, 20000, 'block editor'); await sleep(2500);
  await shot('block-editor');
  const cover = await evaluate(`(() => { const p = __h.find(o => o.constructor.name === 'BlockEditorPage'); return p?.cover ? 'cover on stage=' + !!p.cover.stage : 'no cover'; })()`);
  console.log('cover:', cover);
  if (/stage=true/.test(cover)) { await clickObj(`__h.find(o => o.constructor.name === 'BlockEditorPage').cover`, 'cover'); await sleep(800); }
  await clickObj(`__h.find(o => (o.constructor.__sym ?? '') === 'ArtButtonGraphic' && o.stage)`, 'Art menu'); await sleep(1000);
  const m = (type, x, y, b = 0) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: b, clickCount: 1 });
  // page coordinates of a point on the art layer (the block is the 40x40 square around map 350,240)
  const at = (x, y) => evaluate(`(() => { const MM = pr3.getDefinitionByName('com.jiggmin.pr3.map.MapManager');
    const g = MM.map.artMapArray[0].localToGlobal({ x: ${x}, y: ${y} }); const c = document.getElementById('c'), r = c.getBoundingClientRect(); const B = pr3.runtime.base ?? pr3.BASE;
    return { x: r.left + (B.a * g.x + B.tx) * r.width / c.width, y: r.top + (B.d * g.y + B.ty) * r.height / c.height }; })()`);
  const p0 = await at(332, 222);
  await m('mouseMoved', p0.x, p0.y); await m('mousePressed', p0.x, p0.y, 1);
  for (let i = 0; i <= 12; i++) { const p = await at(332 + i * 3, 222 + (i % 2) * 34); await m('mouseMoved', p.x, p.y, 1); await sleep(16); }
  const p1 = await at(368, 258); await m('mouseReleased', p1.x, p1.y, 0); await sleep(800);
  await shot('block-drawn');
  // open the save popup the way the editor menu does
  const saveBtn = await evaluate(`(() => { const b = __h.find(o => o.stage && /save/i.test(o.constructor.__sym ?? '') ); return b ? b.constructor.__sym : null; })()`);
  console.log('save button sym:', saveBtn);
  if (saveBtn) await clickObj(`__h.find(o => o.stage && /save/i.test(o.constructor.__sym ?? ''))`, 'Save menu button');
  else await evaluate(`(() => { const S = pr3.getDefinitionByName('com.jiggmin.pr3.editor.SavePopup'); __h.find(o => o.constructor.name === 'BlockEditorPage').addPopup(new S('block')); return true; })()`);
  await sleep(1200);
  const popup = await evaluate(`!!__h.find(o => o.constructor.name === 'SavePopup')`);
  console.log('save popup open:', popup);
  if (!popup) { await shot('no-save-popup'); return; }
  await evaluate(`(() => { const p = __h.find(o => o.constructor.name === 'SavePopup'); p.m.titleBox.text = ${JSON.stringify(title)}; p.m.categoryBox.text = 'zz'; return true; })()`);
  await shot('save-popup');
  await clickObj(`__h.find(o => o.constructor.name === 'SavePopup').buttonArray?.[0] ?? __h.find(o => o._label === 'Save' && o.stage)`, 'Save'); await sleep(2500);
  console.log('after save texts:', (await evaluate(`__h.texts().filter(t => /save|block|error|could/i.test(t))`)).slice(-6).join(' | '));
  console.log('errs:', JSON.stringify(await evaluate('window.__errs')));
  await shot('after-save');
  // level editor -> block picker -> custom
  await evaluate(`(() => { const P = pr3.getDefinitionByName('com.jiggmin.pr3.editor.levelEditor.LevelEditorPage'); __h.find(o => o.constructor.name === 'BlockEditorPage').setPage(new P()); return true; })()`);
  await until(`!!__h.find(o => o.constructor.name === 'LevelEditorPage')`, 20000, 'level editor'); await sleep(2500);
  await evaluate(`(() => { const B = pr3.getDefinitionByName('com.jiggmin.pr3.editor.settingPopup.BlockPickerPopup'); const p = new B(); __h.find(o => o.constructor.name === 'LevelEditorPage').addPopup(p); p.clickCustom(); return true; })()`);
  await sleep(3000);
  console.log('custom picker texts:', (await evaluate(`__h.texts().filter(t => t.trim())`)).slice(-15).join(' | '));
  console.log('has saved title:', await evaluate(`__h.texts().some(t => t.includes(${JSON.stringify(title)}))`), 'block buttons:', await evaluate(`__h.findAll(o => /BlockButton|BlockListing/.test(o.constructor.name) && o.stage).length`));
  console.log('errs:', JSON.stringify(await evaluate('window.__errs')));
  await shot('custom-picker');
  console.log(JSON.stringify(await evaluate(`(() => { const sel = __h.find(o => o.constructor.name === 'MyBlockSelector' && o.stage); if (!sel) return 'no MyBlockSelector on stage: ' + __h.findAll(o => /Selector/.test(o.constructor.name) && o.stage).map(o => o.constructor.name).join(','); const out = [];
    const dump = (o, d) => { const b = o.getBounds(pr3.stage); out.push('  '.repeat(d) + o.constructor.name + (o.name ? '#' + o.name : '') + ' [' + [b.x, b.y, b.width, b.height].map(Math.round).join(',') + '] vis=' + o.visible + ' a=' + o.alpha + (o.blockID !== undefined ? ' blockID=' + o.blockID : '')); if (d < 4) for (const c of o._ch ?? []) dump(c, d + 1); };
    dump(sel, 0); return out; })()`), null, 1));
  await sleep(1000); await shot('custom-picker-loaded');
  console.log(JSON.stringify(await evaluate(`(() => { const sel = __h.find(o => o.constructor.name === 'MyBlockSelector' && o.stage); const b = sel && __h.find(o => o.constructor.name === 'ImageButton', sel); if (!b) return 'none'; const out = [];
    for (let o = b; o; o = o.parent) out.push('^ ' + o.constructor.name + ' vis=' + o.visible + ' a=' + o.alpha + (o.mask ? ' MASK' : '') + (o.scrollRect ? ' SCROLLRECT' : '') + (o.filters?.length ? ' filters' : '') + ' cf=' + o.currentFrame + (o.currentLabel ? '/' + o.currentLabel : ''));
    const dump = (o, d) => { const bb = o.getBounds(pr3.stage); out.push('  '.repeat(d) + o.constructor.name + (o.name ? '#' + o.name : '') + ' [' + [bb.x, bb.y, bb.width, bb.height].map(Math.round).join(',') + '] vis=' + o.visible + ' a=' + o.alpha + (o.mask ? ' MASK' : '') + (o._clipDepth ? ' CLIP' : '') + (o.bitmapData ? ' bmp' + o.bitmapData.width + 'x' + o.bitmapData.height : '')); if (d < 6) for (const c of o._ch ?? []) dump(c, d + 1); };
    dump(b, 0);
    const opaque = bd => { if (!bd) return 'no bd'; let n = 0; for (let y = 0; y < bd.height; y++) for (let x = 0; x < bd.width; x++) if (bd.getPixel32(x, y) >>> 24) n++; return n + '/' + bd.width * bd.height; };
    const blk = __h.find(o => o.constructor.name === 'Block', b);
    out.push('clone opaque ' + opaque(blk?.bitmapData) + ' id=' + blk?.id);
    const BM = pr3.getDefinitionByName('com.jiggmin.pr3.block.BlockManager');
    const orig = BM.getBlock?.(blk.id) ?? BM.blocks?.[blk.id] ?? BM.blockDict?.[blk.id];
    out.push('orig ' + (orig ? orig.constructor.name + ' opaque ' + opaque(orig.bitmapData) + ' sameBD=' + (orig.bitmapData === blk.bitmapData) : 'n/a: ' + Object.keys(BM).join(',')));
    out.push('BM: beingDrawn=' + BM.blockBeingDrawn + ' queue=' + JSON.stringify(BM.drawQueue) + ' workers free/busy=' + BM.freeDataWorkers?.length + '/' + BM.busyDataWorkers?.length + ' drawStarted=' + BM.drawStarted);
    const dm = BM.drawingMap; out.push('drawingMap: ' + dm?.constructor.name + ' listeners=' + Object.keys(dm?._ls ?? {}).join(',') + ' art=' + dm?.artMapArray?.map(a => a.constructor.name + ':' + (a.commandArray?.length ?? '?') + (a.drawing !== undefined ? ' drawing=' + a.drawing : '')).join(' '));
    out.push('saveString head: ' + String(orig?.vars?.saveString ?? '').slice(0, 120));
    return out; })()`), null, 1));
}
