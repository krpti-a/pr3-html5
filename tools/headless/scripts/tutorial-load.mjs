// Guest login -> lobby -> tutorial level loaded (no input).
export default async function ({ G, texts, frames, findType, until, report }) {
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  findType('MenuPage').clickPlayAsGuest(null);
  await frames(30);
  findType('MenuPage').clickGo();
  await until(() => findType('WelcomePopup'), 300, 'welcome popup');
  findType('WelcomePopup').clickPlayHandler(null);
  await until(() => findType('OfflineGamePage')?.localPlayer, 600, 'level');
  await frames(60);
}
