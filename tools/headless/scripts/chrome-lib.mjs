// Shared Chrome-harness steps. ACCOUNT=<index into .out/test-accounts.json> logs in as that member, else as a guest.
import { readFileSync } from 'node:fs';
export async function toLobby({ open, until, evaluate, sleep }, account = process.env.ACCOUNT) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  if (account != null && account !== '') {
    const acct = JSON.parse(readFileSync(new URL('../.out/test-accounts.json', import.meta.url), 'utf8'))[+account];
    await evaluate(`(() => { const lp = __h.findType('MenuPage').m.loginPanel; lp.userNameField.textBox.text = ${JSON.stringify(acct.username)}; lp.passwordField.textBox.text = ${JSON.stringify(acct.password)}; __h.findType('MenuPage').clickGo(); return true; })()`);
    await until(`!!__h.findType('LobbyPage')`, 20000, 'lobby');
    await sleep(1500);
    await evaluate(`__h.findType('WelcomePopup')?.clickSkipHandler(null), true`); await sleep(500);
    return acct;
  }
  await evaluate(`__h.findType('MenuPage').clickPlayAsGuest(null), true`); await sleep(400);
  await evaluate(`__h.findType('MenuPage').clickGo(), true`);
  await until(`!!__h.findType('WelcomePopup')`, 20000, 'lobby');
  await evaluate(`__h.findType('WelcomePopup').clickSkipHandler(null), true`); await sleep(500);
  return null;
}
