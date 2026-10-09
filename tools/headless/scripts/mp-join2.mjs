// Join the hosted listing by clicking it in the multiplayer lobby list.
import { guestToLobby, race } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType, until, texts } = ctx;
  await guestToLobby(ctx);
  findType('LobbyPage').changePopup('multiPlayer');
  const listing = () => { const out = []; const w = o => { if (o.constructor === G.getDefinitionByName('com.jiggmin.pr3.lobby.multiPlayer.MatchListing') && o.stage && !o.lotd) out.push(o); for (const c of o._ch ?? []) w(c); }; w(G.stage); return out.find(l => /Brick World/.test(texts(l).join(' '))) ?? null; };
  await until(() => listing(), 30 * 30, 'listing in lobby');
  const l = listing();
  console.log('join: lobby shows listing:', texts(l).join(' | '));
  l.clickHandler();
  await until(() => findType('InMatchPopup'), 300, 'in listing');
  await frames(60);
  const pop = findType('InMatchPopup');
  console.log('join: players seen', JSON.stringify(pop?.match?.playerListingArray?.map(p => p.userName ?? p.name ?? p.socketID)), 'texts:', pop ? texts(pop).filter(t => /Guest/.test(t)).join(',') : '(game already started)');
  await race(ctx, 'join');
}
