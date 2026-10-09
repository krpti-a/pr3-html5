// Dump CampaignLevelSelector's children (z-order, bounds, mouse flags) to find what covers the level buttons.
export default async function ({ open, until, evaluate, sleep, clickObj }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(400);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  await clickObj(`__h.findType('LobbyPage').m.singlePlayerButton`, 'singlePlayer'); await sleep(2500);
  console.log((await evaluate(`(() => { const sel = __h.findType('com.jiggmin.pr3.lobby.singlePlayer.CampaignLevelSelector') ?? __h.find(o => o.constructor.name === 'CampaignLevelSelector'); const out = [];
    const dump = (o, d) => { const b = o.getBounds(pr3.stage); out.push('  '.repeat(d) + o.constructor.name + (o.name ? '#' + o.name : '') + ' [' + [b.x, b.y, b.width, b.height].map(Math.round).join(',') + '] vis=' + o.visible + (o.mouseEnabled === false ? ' mouseOff' : '') + (o.mouseChildren === false ? ' kidsOff' : '') + (o._g ? ' g' : '') + (o.mask ? ' masked' : '') + (o.scrollRect ? ' scrollRect' : '') + (o._clipDepth ? ' clip' : ''));
      if (d < 2) for (const c of o._ch ?? []) dump(c, d + 1); };
    dump(sel, 0); return out; })()`)).join('\n'));
}
