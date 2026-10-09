// Real mouse: menu "play as guest" -> GO -> skip welcome -> lobby Single Player button -> first campaign level.
export default async function ({ open, until, evaluate, sleep, shot, clickObj }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await clickObj(`__h.findType('MenuPage').m.loginPanel.playAsGuestBtn`, 'guest'); await sleep(500);
  await clickObj(`__h.findType('MenuPage').m.loginPanel.joinServerButton`, 'GO');
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await sleep(500);
  await clickObj(`__h.findType('WelcomePopup').m.skipButton`, 'skip tutorial'); await sleep(800);
  const lobby = `__h.findType('LobbyPage')`;
  const btns = await evaluate(`(() => { const l = ${lobby}; return Object.keys(l.buttonDic).map(k => l.buttonDic[k]?.popupName); })()`);
  console.log('lobby buttons:', JSON.stringify(btns));
  for (const name of (process.env.TABS ?? 'singlePlayer').split(',')) {
    await clickObj(`${lobby}.m.${name}Button`, name);
    await sleep(1500); await shot('tab-' + name);
  }
}
