// Click lobby tabs one after another; report which buttons still look selected/highlighted.
import { toLobby } from './chrome-lib.mjs';
export default async function (ctx) {
  const { evaluate, sleep, shot, clickObj } = ctx;
  await toLobby(ctx);
  for (const n of ['customizeButton', 'chatButton', 'multiPlayerButton', 'singlePlayerButton']) {
    await clickObj(`__h.findType('LobbyPage').m.${n}`, n); await sleep(1200);
    console.log('after tab', n, await evaluate(`(() => { const m = __h.findType('LobbyPage').m; return ['singlePlayerButton','multiPlayerButton','customizeButton','chatButton'].map(k => k.replace('Button','') + ':' + m[k]._state + (m[k].upState?.currentLabel ? '/' + m[k].upState.currentLabel : '')).join(' '); })()`));
  }
  await shot('select-tabs');
}
