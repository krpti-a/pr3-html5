// Load a level (LEVEL env) as a campaign-style OfflineGamePage and report draw calls per frame while running.
export default async function ({ G, frames, findType, until, texts, report, stats }) {
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  findType('MenuPage').clickPlayAsGuest(null); await frames(30); findType('MenuPage').clickGo();
  await until(() => findType('WelcomePopup'), 300, 'welcome');
  const OGP = G.getDefinitionByName('com.jiggmin.pr3.game.OfflineGamePage');
  findType('WelcomePopup').setPage(new OGP('classic', +(process.env.LEVEL ?? 1055144)));
  await until(() => findType('OfflineGamePage')?.localPlayer, 900, 'level');
  await frames(200, 1000);
  report('warm');
  await frames(30, 30);
  let leaves = 0, onScreen = 0; const W = 675, H = 480;
  const walk = o => { if (!o._visible) return; if (!o._ch) { leaves++; const b = o.getBounds(G.stage); if (b.right > 0 && b.x < W && b.bottom > 0 && b.y < H) onScreen++; } else for (const c of o._ch) walk(c); };
  walk(G.stage);
  console.log(`visible leaf objects: ${leaves}, on screen: ${onScreen}`);
}
