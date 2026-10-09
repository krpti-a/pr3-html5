// Admin: open the Moderate tab; screenshot the ban log, a ban's details and the archived reported messages.
import { toLobby } from './chrome-lib.mjs';
export default async function (ctx) {
  const { evaluate, sleep, shot, clickObj } = ctx;
  await toLobby(ctx, process.env.ACCOUNT ?? 2);
  await clickObj(`__h.findType('LobbyPage').m.modButton`, 'Moderate'); await sleep(2500);
  const visibleTexts = `__h.texts().filter(t => t.trim()).slice(-14).join(' | ')`;
  console.log('ban log:', await evaluate(visibleTexts));
  await shot('mod-banlog');
  await clickObj(`__h.find(o => o.constructor.name === 'ModListing' && o.stage) ?? __h.find(o => o.constructor.name.includes('Listing') && o.stage && o.titleBox)`, 'first ban'); await sleep(2000);
  console.log('details:', await evaluate(`__h.find(o => o.constructor.name === 'BanDetailsPopup')?.m.textBox.text ?? 'no details popup'`));
  await shot('mod-ban-details');
  await evaluate(`__h.find(o => o.constructor.name === 'BanDetailsPopup')?.remove(), true`); await sleep(500);
  await clickObj(`__h.find(o => o._label === 'Archived Reported Messages' && o.stage) ?? __h.find(o => o.text === 'Archived Reported Messages' && o.stage)`, 'Archived Reported Messages'); await sleep(2500);
  console.log('archived msgs:', await evaluate(visibleTexts));
  console.log('errs:', JSON.stringify(await evaluate('window.__errs')));
  await shot('mod-archived');
}
