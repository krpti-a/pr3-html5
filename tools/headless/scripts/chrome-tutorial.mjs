// Real-browser run: guest -> lobby -> tutorial level, sampling memory every second.
export default async function ({ open, until, evaluate, stats, shot, sleep, key }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await stats('menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`);
  await sleep(500);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'welcome');
  await stats('lobby'); await shot('lobby');
  await evaluate(`__h.findType('WelcomePopup').clickPlayHandler(null), true`);
  for (let i = 0; i < 12; i++) { await sleep(1000); await stats('level+' + (i + 1)); }
  await shot('level');
  await key('down', 'ArrowRight', 'ArrowRight', 39);
  for (let i = 0; i < 4; i++) { await sleep(1000); await stats('right+' + (i + 1)); }
  await key('up', 'ArrowRight', 'ArrowRight', 39);
  await shot('moved');
}
