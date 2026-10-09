import load from './level-draws.mjs';
export default async function (ctx) {
  const z = await import('../.out/headless.mjs');
  await load(ctx);
  console.log('zlib', JSON.stringify(z.zlibStats));
}
