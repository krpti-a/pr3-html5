// Host an 8-player listing, wait for a second player to appear, then press Play.
import { guestToLobby, race } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType, until, texts } = ctx;
  await guestToLobby(ctx);
  const def = n => G.getDefinitionByName(n);
  findType('LobbyPage').changePopup('multiPlayer'); await frames(30);
  findType('LobbyPage').addPopup(new (def('com.jiggmin.pr3.lobby.multiPlayer.CreatingMatchPopup'))());
  def('com.jiggmin.pr3.SocketManager').socket.createMatch(+(process.env.LEVEL ?? 1180), 0, 0, 99, 8, false);
  await until(() => findType('InMatchPopup'), 300, 'hosting');
  const pop = () => findType('InMatchPopup');
  const names = () => pop()?.match?.playerListingArray?.map(p => p.userName ?? p.name ?? p.socketID) ?? [];
  console.log('host: hosting; players', JSON.stringify(names()));
  const ok = await until(() => (pop()?.match?.playerListingArray?.length ?? 0) >= 2, 30 * 60, 'second player');
  console.log('host: players now', JSON.stringify(names()), 'texts:', texts(pop()).filter(t => /Guest/.test(t)).join(','));
  if (!ok) return;
  await frames(150);
  pop().clickPlay();
  await race(ctx, 'host');
}
