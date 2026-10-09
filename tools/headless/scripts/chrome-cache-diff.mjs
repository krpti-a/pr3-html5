// Pixel-compares the menu and lobby rendered with the raster cache off vs on.
export default async function ({ open, until, evaluate, sleep }) {
  const grab = `(() => { const c = document.getElementById('c'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; return Array.from(d.filter((_, i) => i % 4 !== 3)); })()`;
  const cmp = async label => {
    await evaluate(`pr3.runtime.paused = true, pr3.setRasterCache(false), true`); await sleep(300);
    const a = await evaluate(grab);
    await evaluate(`pr3.setRasterCache(true), true`); await sleep(400);
    const b = await evaluate(grab);
    await evaluate(`pr3.runtime.paused = false, true`);
    let max = 0, n8 = 0; for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); if (d > max) max = d; if (d > 8) n8++; }
    const st = await evaluate(`({ hits: pr3.rasterCacheStats.hits, entries: pr3.rasterCacheStats.entries, mb: Math.round(pr3.rasterCacheStats.mb) })`);
    console.log(`${label}: channels=${a.length} max diff=${max} values>8: ${n8} (${(100 * n8 / a.length).toFixed(3)}%) cache=${JSON.stringify(st)}`);
  };
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await sleep(1000); await cmp('menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(500);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await sleep(1500); await cmp('lobby');
}
