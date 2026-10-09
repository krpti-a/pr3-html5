import { guestToLobby, race } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType, until } = ctx;
  await guestToLobby(ctx);
  const def = n => G.getDefinitionByName(n);
  await frames(60); // let the host create its match first
  findType('LobbyPage').addPopup(new (def('com.jiggmin.pr3.lobby.multiPlayer.QuickJoinPopup'))());
  await until(() => findType('InMatchPopup') || findType('MatchPage'), 1200, 'quick join');
  console.log('join: joined match listing');
  await race(ctx, 'join');
}
