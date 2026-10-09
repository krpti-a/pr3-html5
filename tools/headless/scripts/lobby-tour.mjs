// Visit every lobby tab (TABS env, comma list) and report errors, visible text and new server log lines.
import { readFileSync } from 'node:fs';
import { guestToLobby, memberToLobby } from './mp-lib.mjs';
export default async function (ctx) {
  const { frames, findType, texts, G } = ctx;
  await (process.env.MEMBER ? memberToLobby(ctx) : guestToLobby(ctx));
  const lobby = findType('LobbyPage');
  const log = () => { try { return readFileSync('/tmp/pr3-server.log', 'utf8').split('\n'); } catch { return []; } };
  for (const tab of (process.env.TABS ?? 'singlePlayer,multiPlayer,customize,chat,players,messages').split(',')) {
    const before = log().length;
    lobby.changePopup(tab);
    await frames(+(process.env.WAIT ?? 150));
    const popup = lobby.popup ?? lobby.currentPopup;
    console.log(`\n=== ${tab}: popup=${popup?.constructor?.name}`);
    console.log('text:', texts().filter(t => t.trim()).slice(0, 40).join(' | ').slice(0, 900));
    console.log('server:', log().slice(before).filter(l => !/ ping|"t":"ping"/.test(l)).map(l => l.slice(0, 180)).join('\n        '));
  }
}
