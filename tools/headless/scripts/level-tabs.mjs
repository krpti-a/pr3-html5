// Multiplayer -> Start Game level browser: every tab's first entries.
import { guestToLobby, memberToLobby } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType, texts } = ctx;
  await (process.env.MEMBER ? memberToLobby(ctx) : guestToLobby(ctx));
  findType('LobbyPage').changePopup('multiPlayer'); await frames(60);
  const find = (o, p) => { if (p(o)) return o; for (const c of o._ch ?? []) { const r = find(c, p); if (r) return r; } return null; };
  find(G.stage, o => o._label === 'Start Game' && o.stage).func(); await frames(60);
  const lv = findType('Levels');
  for (const tab of ['clickCampaign', 'clickBest', 'clickBestToday', 'clickNewest', 'clickMyLevels', 'clickLiked']) {
    lv[tab](); await frames(60);
    const titles = texts(lv).filter(t => / by /i.test(t) || /no results/i.test(t)).slice(0, 4);
    console.log(tab.padEnd(16), titles.join(' | ') || '(nothing)');
  }
}
