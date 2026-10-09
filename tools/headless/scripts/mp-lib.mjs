// Shared steps for the two-client multiplayer test (mp-host / mp-join).
export async function guestToLobby({ texts, frames, findType, until }) {
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  findType('MenuPage').clickPlayAsGuest(null);
  await frames(30);
  findType('MenuPage').clickGo();
  await until(() => findType('WelcomePopup'), 300, 'welcome popup');
  findType('WelcomePopup').clickSkipHandler(null);
  await frames(30);
}
export async function race(ctx, tag) {
  const { G, frames, findType, until, key, report } = ctx;
  await until(() => findType('MatchPage')?.localPlayer, 900, 'match page');
  const page = findType('MatchPage');
  console.log(`${tag}: in match "${page?.title}" players=${page?.playerArray?.length}`);
  await until(() => page.localPlayer && page.timer?.getElapsedMS?.() > 0, 600, 'race start');
  report(`${tag} race started`);
  key('keydown', 'ArrowRight', 'ArrowRight');
  for (let i = 0; i < 10; i++) {
    key('keydown', 'ArrowUp', 'ArrowUp'); await frames(12); key('keyup', 'ArrowUp', 'ArrowUp'); await frames(18);
    const lp = page.localPlayer;
    const remotes = (page.playerArray ?? []).filter(p => p !== lp).map(p => `${p.constructor.name}@${p.x.toFixed(0)},${p.y.toFixed(0)}`);
    console.log(`${tag} t=${page.timer.getElapsedMS()} me@${lp?.x.toFixed(0)},${lp?.y.toFixed(0)} remote=[${remotes.join(' ')}]`);
  }
  key('keyup', 'ArrowRight', 'ArrowRight');
  await frames(30);
  if (process.env.FINISH) await finishRace(ctx, page, tag, +(process.env.FINISH_DELAY ?? 0));
  const lp = page.localPlayer;
  return { me: lp ? [lp.x, lp.y] : null, remotes: (page.playerArray ?? []).filter(p => p !== lp).map(p => [p.x, p.y]) };
}

// drop the local player onto the level's finish block (bumping it from below if needed)
export async function finishRace({ G, frames, key, until, texts, findType }, page, tag, delay) {
  await frames(delay);
  const bm = G.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map.blockMap;
  let fin = null, side = '';
  for (const x in bm.map) for (const y in bm.map[x]) { const b = bm.map[x][y]; if (!b?.realVars || fin) continue; for (const s of ['top', 'bump', 'left', 'right']) if (b.realVars[s]?.type === 'finish' && !fin) { fin = b; side = s; } }
  if (!fin) { console.log(tag, 'no finish block'); return; }
  const p = page.localPlayer;
  p.x = p.realX = fin.posX + 15; p.y = p.realY = side === 'top' ? fin.posY - 2 : fin.posY + 91; p.velX = p.velY = 0;
  if (side !== 'top') key('keydown', 'ArrowUp', 'ArrowUp');
  await until(() => !page.localPlayer, 300, 'finish');
  key('keyup', 'ArrowUp', 'ArrowUp');
  await frames(150);
  console.log(tag, 'finished; screen text:', texts().filter(t => !/^\d+$/.test(t)).slice(-14).join(' | '));
}

// Log in a test account (tools/headless/.out/test-accounts.json, index ACCOUNT env or argument) -> lobby.
export async function memberToLobby({ texts, frames, findType, until }, idx = +(process.env.ACCOUNT ?? 0)) {
  const { readFileSync } = await import('node:fs');
  const acct = JSON.parse(readFileSync(new URL('../.out/test-accounts.json', import.meta.url), 'utf8'))[idx];
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  const lp = findType('MenuPage').m.loginPanel;
  lp.userNameField.textBox.text = acct.username;
  lp.passwordField.textBox.text = acct.password;
  findType('MenuPage').clickGo();
  await until(() => findType('LobbyPage'), 600, 'lobby');
  await frames(30);
  findType('WelcomePopup')?.clickSkipHandler(null);
  await frames(30);
  return acct;
}
