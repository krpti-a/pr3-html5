// A (this browser) hosts a 2-player match; once racing, the tab is treated as hidden for 8 s while B (mp-join) races.
export default async function ({ open, until, evaluate, sleep }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(400);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  await evaluate(`(() => { const d = n => pr3.getDefinitionByName(n); __h.findType('LobbyPage').addPopup(new (d('com.jiggmin.pr3.lobby.multiPlayer.CreatingMatchPopup'))()); d('com.jiggmin.pr3.SocketManager').socket.createMatch(1180, 0, 0, 99, 2, false); return true; })()`);
  await until(`(() => { const p = __h.findType('MatchPage'); return p && p.countdown === -1 && p.playerArray?.length === 2; })()`, 60000, 'race with 2 players');
  const snap = () => evaluate(`(() => { const p = __h.findType('MatchPage'); const r = p.playerArray.find(x => x !== p.localPlayer); return { frame: pr3.runtime.frame ?? null, clock: window.__clock?.() , renders: pr3.runtime.renders, remote: r ? [Math.round(r.x), Math.round(r.y)] : null, backlog: r?.updateArray?.length, t: p.timer.getElapsedMS() }; })()`);
  console.log('A before hide:', JSON.stringify(await snap()));
  await evaluate(`pr3.runtime.forceHidden = true`);
  for (let i = 1; i <= 4; i++) { await sleep(2000); console.log(`A hidden +${i * 2}s:`, JSON.stringify(await snap())); }
  await evaluate(`pr3.runtime.forceHidden = false`); await sleep(500);
  console.log('A visible again:', JSON.stringify(await snap()));
}
