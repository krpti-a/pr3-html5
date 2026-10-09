// Real clicks on the multiplayer lobby buttons; screenshot what each opens (BUTTON env = label).
export default async function ({ open, until, evaluate, sleep, shot, clickObj }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(400);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  await clickObj(`__h.findType('LobbyPage').m.multiPlayerButton`, 'multiPlayer'); await sleep(1500);
  const label = process.env.BUTTON ?? 'Practice';
  await clickObj(`__h.find(o => (o._label === ${JSON.stringify(label)}) && o.stage)`, label);
  await sleep(2500);
  console.log('texts:', (await evaluate(`__h.texts().filter(t => t.trim())`)).slice(-30).join(' | '));
  console.log('errs:', JSON.stringify(await evaluate('window.__errs')));
  await shot('mp-' + label.replace(/\W/g, ''));
}
