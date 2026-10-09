// Real clicks: multiplayer -> Practice -> Campaign tab -> first level -> expect a running practice match.
export default async function ({ open, until, evaluate, sleep, shot, clickObj }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(400);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  await clickObj(`__h.findType('LobbyPage').m.multiPlayerButton`, 'multiPlayer'); await sleep(1500);
  await clickObj(`__h.find(o => o._label === ${JSON.stringify(process.env.BUTTON ?? 'Practice')} && o.stage)`, process.env.BUTTON ?? 'Practice'); await sleep(1500);
  await clickObj(`__h.find(o => o.constructor.name.includes('Tab') && o._label === 'Campaign' && o.stage) ?? __h.find(o => (o.text === 'Campaign') && o.stage)`, 'Campaign tab'); await sleep(1500);
  await shot('practice-list');
  await clickObj(`__h.findType('LevelListingButton')`, 'first level'); await sleep(1500);
  await shot('practice-selected');
  if (process.env.BUTTON === 'Start Game') { await clickObj(`__h.find(o => o._label === 'Start Game' && o.stage && o.parent?.constructor?.name !== 'MatchList')`, 'Start Game (popup)'); await sleep(1500); }
  const ok = await until(`!!__h.findType('MatchPage')`, 15000, 'match page');
  console.log('match started:', ok, 'errs:', JSON.stringify(await evaluate('window.__errs')));
  await sleep(3000); await shot('practice-match');
}
