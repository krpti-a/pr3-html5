// 1-player practice match (as PracticePopup does): checks match mode movement without a second client.
import { guestToLobby, race } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, findType } = ctx;
  await guestToLobby(ctx);
  const def = n => G.getDefinitionByName(n);
  findType('LobbyPage').addPopup(new (def('com.jiggmin.pr3.lobby.multiPlayer.CreatingMatchPopup'))());
  def('com.jiggmin.pr3.SocketManager').socket.createMatch(+(process.env.LEVEL ?? 1180), 0, 0, 99, 1, false);
  await race(ctx, 'solo');
}
