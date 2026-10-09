// Guest login -> lobby -> welcome popup -> tutorial level; run right for a while.
export default async function ({ G, texts, frames, find, findType, click, key, until, report, tree }) {
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  report('menu');
  findType('MenuPage').clickPlayAsGuest(null);
  await frames(30);
  findType('MenuPage').clickGo();
  await until(() => findType('WelcomePopup'), 300, 'welcome popup');
  report('lobby');
  if (!findType('WelcomePopup')) { console.log(tree(5), texts()); return; }
  findType('WelcomePopup').clickPlayHandler(null);
  await until(() => findType('OfflineGamePage')?.localPlayer, 600, 'level');
  report('level');
  console.log(tree(4));
  await frames(150);
  key('keydown', 'ArrowRight', 'ArrowRight');
  await frames(150);
  key('keyup', 'ArrowRight', 'ArrowRight');
  await frames(60);
}
