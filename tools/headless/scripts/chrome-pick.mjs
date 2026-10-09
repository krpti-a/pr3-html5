export default async function ({ open, until, evaluate, sleep, clickObj }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(400);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  console.log(await evaluate(`(() => { const l = __h.findType('LobbyPage'); const out = [];
    for (const n of ['singlePlayer', 'multiPlayer', 'customize', 'chat', 'players', 'messages', 'editor', 'back']) { const b = l.m[n + 'Button']; if (!b) { out.push(n + ': none'); continue; }
      const r = b.getBounds(pr3.stage); const t = pr3.runtime.pick(r.x + r.width / 2, r.y + r.height / 2);
      const chain = []; for (let o = t; o && chain.length < 4; o = o.parent) chain.push((o.constructor.__sym ?? o.constructor.name) + (o.name ? '#' + o.name : ''));
      out.push(n + ': hit ' + chain.join(' < ') + (t === b ? '  OK' : '  MISMATCH') + ' mouseChildren=' + b.mouseChildren); }
    return out.join('\\n'); })()`));
  await clickTrace(arguments[0]);
}
export async function clickTrace({ evaluate, clickObj, sleep }) {
  await evaluate(`(() => { const b = __h.findType('LobbyPage').m.singlePlayerButton; window.__ev = []; for (const t of ['mouseDown', 'mouseUp', 'click', 'rollOver', 'mouseOver']) b.addEventListener(t, e => window.__ev.push(t + '@' + (e.target === b ? 'btn' : e.target?.constructor?.name))); return true; })()`);
  await clickObj(`__h.findType('LobbyPage').m.singlePlayerButton`, 'singlePlayer');
  await sleep(500);
  console.log('errs:', JSON.stringify(await evaluate('window.__errs'))); console.log('events:', JSON.stringify(await evaluate('window.__ev')), 'state', await evaluate(`__h.findType('LobbyPage').m.singlePlayerButton._state`), 'popup', await evaluate(`__h.findType('LobbyPage').curPopup?.constructor?.name`));
}
