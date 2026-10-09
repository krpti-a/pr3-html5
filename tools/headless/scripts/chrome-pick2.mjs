export default async function ({ open, until, evaluate, sleep }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(400);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  console.log(await evaluate(`(() => { const l = __h.findType('LobbyPage'), b = l.m.singlePlayerButton;
    const ls = b._ls?.click?.length; const entry = l.buttonDic[b];
    let r = 'click listeners=' + ls + ' dicEntry=' + JSON.stringify(entry && { ...entry, func: typeof entry.func }) + ' cur=' + l.curPopup?.constructor?.name;
    try { l.clickButtonHandler({ target: b }); r += ' -> after direct call: ' + l.curPopup?.constructor?.name + ' last=' + l.constructor.lastPopupName; } catch (e) { r += ' threw ' + e.stack; }
    return r; })()`));
}
