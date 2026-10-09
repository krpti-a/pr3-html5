export default async function ({ frames, tree }) { await frames(90, 90); console.log(tree(+(process.env.DEPTH ?? 4))); }
