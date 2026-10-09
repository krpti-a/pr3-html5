import { guestToLobby, race } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType, until, texts } = ctx;
  await guestToLobby(ctx);
  const def = n => G.getDefinitionByName(n);
  const lobby = findType('LobbyPage');
  const SM = def('com.jiggmin.pr3.SocketManager') ?? def('SocketManager');
  lobby.addPopup(new (def('com.jiggmin.pr3.lobby.multiPlayer.CreatingMatchPopup'))());
  SM.socket.createMatch(+(process.env.LEVEL ?? 1180), 0, 0, 99, 2, false);
  await until(() => findType('InMatchPopup'), 300, 'in match popup');
  console.log('host: match listing created');
  // a 2-player listing starts by itself when full
  await until(() => findType('MatchPage'), 30 * 120, 'match start');
  await race(ctx, 'host');
}
