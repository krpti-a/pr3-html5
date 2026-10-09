// zztest1 sends a PM to zztest2, then zztest2's messages tab is listed and the PM opened.
import { memberToLobby } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType, texts } = ctx;
  const me = await memberToLobby(ctx);
  const SM = G.getDefinitionByName('com.jiggmin.pr3.SocketManager');
  if (process.env.SEND_TO) { SM.socket.sendPM(process.env.SEND_TO, 'Hello title', 'Hello body ' + Date.now()); await frames(60); console.log('sent'); }
  const lobby = findType('LobbyPage');
  lobby.changePopup('messages');
  await frames(150);
  console.log(`${me.username} messages tab:`, texts().filter(t => t.trim()).slice(2, 30).join(' | '));
}
