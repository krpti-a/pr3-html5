import solo from './mp-solo.mjs';
export default async function (ctx) {
  const orig = ctx.frames; let once = false;
  await solo({ ...ctx, frames: async (n, e) => { await orig(n, e); if (once) return; const p = ctx.findType('MatchPage')?.localPlayer; if (!p || ctx.findType('MatchPage').countdown !== -1) return; once = true;
    const out = {}; for (const k in p) { const v = p[k]; if (typeof v === 'boolean' && v) out[k] = v; else if (typeof v === 'number' && v !== 0 && !/^_|color|Color/.test(k)) out[k] = +v.toFixed?.(4); }
    console.log('DUMP', JSON.stringify(out)); console.log('VARS', JSON.stringify(p.vars)); } });
}
