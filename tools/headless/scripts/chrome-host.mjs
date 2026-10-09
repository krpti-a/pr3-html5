// Real clicks: Start Game -> pick a level -> Start Game (popup) => hosting popup; Cancel; then Quick Host => hosting again.
export default async function ({ open, until, evaluate, sleep, shot, clickObj }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(400);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  await clickObj(`__h.findType('LobbyPage').m.multiPlayerButton`, 'multiPlayer'); await sleep(1500);
  await clickObj(`__h.find(o => o._label === 'Start Game' && o.stage)`, 'Start Game'); await sleep(1500);
  await clickObj(`__h.find(o => o.text === 'Campaign' && o.stage)`, 'Campaign tab'); await sleep(1500);
  await clickObj(`__h.findType('LevelListingButton')`, 'first level'); await sleep(800);
  await clickObj(`__h.find(o => o._label === 'Start Game' && o.stage, __h.findType('StartMatchPopup'))`, 'Start Game (popup)');
  const hosting = await until(`!!__h.findType('InMatchPopup')`, 8000, 'hosting popup');
  console.log('hosting after Start Game:', hosting); await shot('hosting');
  await clickObj(`__h.find(o => o._label === 'Cancel' && o.stage, __h.findType('InMatchPopup'))`, 'Cancel'); await sleep(1500);
  await clickObj(`__h.find(o => o._label === 'Quick Host' && o.stage)`, 'Quick Host');
  const quick = await until(`!!__h.findType('InMatchPopup')`, 8000, 'quick host popup');
  console.log('hosting after Quick Host:', quick, 'errs:', JSON.stringify(await evaluate('window.__errs')));
  await shot('quickhost');
}
