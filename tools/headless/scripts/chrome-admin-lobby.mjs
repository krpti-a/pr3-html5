// Log in as a member (ACCOUNT index in .out/test-accounts.json, default 2 = admin); screenshot the lobby and dump its buttons.
import { readFileSync } from 'node:fs';
export default async function ({ open, until, evaluate, sleep, shot, clickObj }) {
  const acct = JSON.parse(readFileSync(new URL('../.out/test-accounts.json', import.meta.url), 'utf8'))[+(process.env.ACCOUNT ?? 2)];
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await evaluate(`(() => { const lp = __h.findType('MenuPage').m.loginPanel; lp.userNameField.textBox.text = ${JSON.stringify(acct.username)}; lp.passwordField.textBox.text = ${JSON.stringify(acct.password)}; __h.findType('MenuPage').clickGo(); return true; })()`);
  await until(`!!__h.findType('LobbyPage')`, 20000, 'lobby');
  await sleep(1500);
  await evaluate(`__h.findType('WelcomePopup')?.clickSkipHandler(null), true`); await sleep(800);
  console.log(JSON.stringify(await evaluate(`(() => { const m = __h.findType('LobbyPage').m;
    const out = { frame: m.currentFrame, label: m.currentFrameLabel, totalFrames: m.totalFrames, labels: m.currentLabels?.map(l => l.name + '@' + l.frame) };
    for (const n of ['modButton','singlePlayerButton','multiPlayerButton','customizeButton','chatButton','playersButton','editorButton','backButton']) {
      const b = m[n]; out[n] = b ? { onStage: !!b.stage, parentIsM: b.parent === m, visible: b.visible, x: b.x, y: b.y, name: b.name } : null;
    }
    out.children = []; for (let i = 0; i < m.numChildren; i++) { const c = m.getChildAt(i); out.children.push((c.name || '?') + ':' + c.constructor.name + '@' + Math.round(c.x) + ',' + Math.round(c.y)); }
    return out; })()`), null, 1));
  console.log('errs:', JSON.stringify(await evaluate('window.__errs')));
  await shot('admin-lobby');
  await clickObj(`__h.findType('LobbyPage').m.singlePlayerButton`, 'singlePlayer'); await sleep(2500);
  console.log('after click:', (await evaluate(`__h.texts().filter(t => t.trim())`)).slice(0, 12).join(' | '));
  await shot('admin-single-player');
}
