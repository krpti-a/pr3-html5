export default async function ({ G, frames, findType, until, texts }) {
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  const pack = (await import('../../../client/src/flash/assets.ts').catch(() => null));
  const out = [];
  const walk = (o, ind, depth) => {
    const d = o._def; const b = o.getBounds(G.stage);
    const fills = d?.draws ? [...new Set(d.draws.map(x => x.f ? x.f.t + (x.f.t === 'b' ? '#' + x.f.id : '') : 'line'))].join(',') : '';
    out.push(`${ind}${o.constructor.__sym ?? o.constructor.name}${o.name ? ' "' + o.name + '"' : ''} char=${o._charId ?? '-'} vis=${o._visible} a=${o._alpha} blend=${o._blend} mask=${!!o._mask} maskOf=${!!o._maskOf} filters=${o._filters?.length ?? 0} [${[b.x, b.y, b.width, b.height].map(v => Math.round(v))}] ${fills}`);
    if (depth > 0) for (const c of o._ch ?? []) walk(c, ind + '  ', depth - 1);
  };
  walk(findType('MenuPage'), '', 4);
  console.log(out.join('\n'));
}
