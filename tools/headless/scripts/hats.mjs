import load from './tutorial-load.mjs';
export default async function (ctx) {
  const { G } = ctx;
  const P = G.getDefinitionByName('com.jiggmin.pr3.player.Player');
  const orig = P.prototype.showAppearance;
  let heads = new Map(), n = 0;
  P.prototype.showAppearance = function () {
    const h = this.m?.head; if (h && !heads.has(h)) heads.set(h, ++n);
    const g = this.hatGraphicArray?.[1];
    const before = h?._ch.filter(c => c.constructor.name.includes('Hat')).length;
    orig.call(this);
    const h2 = this.m?.head; if (h2 && !heads.has(h2)) heads.set(h2, ++n);
    console.log(`showAppearance state=${this.state} m=${this.m?.constructor.name} head#${heads.get(h)}->#${heads.get(h2)} prevHatIn=${g ? (g.parent ? heads.get(g.parent) ?? 'other' : 'none') : '-'} hats ${before}->${h2?._ch.filter(c => c.constructor.name.includes('Hat')).length} f=${this.m?.currentFrame}`);
  };
  await load(ctx);
}
