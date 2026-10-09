// Guest -> classic campaign level (LEVEL env, default 1154) -> drop the player onto a finish block -> finish popup.
export default async function ({ G, key, texts, frames, findType, until, report, tree }) {
  const level = +(process.env.LEVEL ?? 1154);
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  findType('MenuPage').clickPlayAsGuest(null);
  await frames(30);
  findType('MenuPage').clickGo();
  await until(() => findType('WelcomePopup'), 300, 'welcome popup');
  const OGP = G.getDefinitionByName('com.jiggmin.pr3.game.OfflineGamePage');
  const of = OGP.prototype.iFinished;
  OGP.prototype.iFinished = function () { console.log('iFinished: localPlayer', !!this.localPlayer, 'timer', this.timer?.getElapsedMS?.()); try { of.call(this); } catch (e) { console.log('iFinished threw', e.stack.split('\n').slice(0, 6).join('\n')); throw e; } };
  findType('WelcomePopup').setPage(new OGP('classic', level));
  await until(() => findType('OfflineGamePage')?.localPlayer, 600, 'level');
  const page = findType('OfflineGamePage');
  console.log('level', page.title, 'mode', page.levelType, 'items', page.itemArray?.join(','));
  await frames(150); // countdown
  report('started');
  const bm = G.getDefinitionByName('com.jiggmin.pr3.map.MapManager').map.blockMap;
  let fin = null, side = '';
  for (const x in bm.map) for (const y in bm.map[x]) {
    const b = bm.map[x][y]; if (!b?.realVars) continue;
    for (const s of ['top', 'bump', 'left', 'right', 'bottom']) if (b.realVars[s]?.type === 'finish' && !fin) { fin = b; side = s; }
  }
  if (!fin) { console.log('no finish block'); return; }
  const p = page.localPlayer;
  console.log(`finish block at ${fin.posX},${fin.posY} side=${side}; player at ${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  const tx = fin.posX + 15, ty = side === 'top' ? fin.posY - 2 : fin.posY + 30 + 61;
  p.x = p.realX = tx; p.y = p.realY = ty; p.velX = p.velY = 0;
  await frames(5);
  console.log(`moved player to ${p.x.toFixed(1)},${p.y.toFixed(1)} real=${p.realX?.toFixed(1)},${p.realY?.toFixed(1)}`);
  if (side !== 'top') key('keydown', 'ArrowUp', 'ArrowUp');
  for (let i = 0; i < 12; i++) { await frames(5); console.log(`  t+${i * 5}: pos ${p.x.toFixed(1)},${p.y.toFixed(1)} vel ${p.velX?.toFixed(3)},${p.velY?.toFixed(3)} state=${p.state} removed=${p.removed}`); }
  key('keyup', 'ArrowUp', 'ArrowUp');
  await until(() => findType('SinglePlayerFinishPopup'), 300, 'finish popup');
  await frames(90);
  report('finished');
  const popup = findType('SinglePlayerFinishPopup');
  console.log('popup texts:', popup ? texts(popup) : 'none');
  if (!popup) try { const C = G.getDefinitionByName('com.jiggmin.pr3.game.SinglePlayerFinishPopup'); new C('classic', level, 1, 5000, '', () => {}); console.log('constructed ok'); } catch (e) { console.log('construct error', e.stack.split('\n').slice(0, 8).join('\n')); }
}
