// Guest -> tutorial level, then evaluate INSPECT (JS expression with ctx vars in scope) and print it.
import tutorial from './tutorial-load.mjs';
export default async function (ctx) {
  await tutorial(ctx);
  const { G, findType, find, tree, texts } = ctx;
  const v = eval(process.env.INSPECT ?? 'tree(4)');
  console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 1));
}
