// Real mouse hovers across lobby buttons (SimpleButton) and campaign level buttons (ButtonClass); report stuck highlights.
import { toLobby } from './chrome-lib.mjs';
export default async function (ctx) {
  const { evaluate, sleep, shot, clickObj, hoverObj } = ctx;
  await toLobby(ctx);
  const names = ['singlePlayerButton', 'multiPlayerButton', 'customizeButton', 'chatButton', 'playersButton', 'editorButton'];
  const lobbyStates = `(() => { const m = __h.findType('LobbyPage').m; return ${JSON.stringify(names)}.map(n => n.replace('Button', '') + ':' + m[n]._state).join(' '); })()`;
  for (const n of names) { await hoverObj(`__h.findType('LobbyPage').m.${n}`, n, 2); await sleep(150); console.log('hover', n.padEnd(20), await evaluate(lobbyStates)); }
  await clickObj(`__h.findType('LobbyPage').m.singlePlayerButton`, 'singlePlayer'); await sleep(2500);
  console.log('buttons:', await evaluate(`__h.findAll(o => o instanceof pr3.getDefinitionByName('com.jiggmin.ui.ButtonClass') && o.stage).map(o => o.constructor.name + ':' + o.currentLabel).join(' ')`));
  const bc = `__h.findAll(o => o instanceof pr3.getDefinitionByName('com.jiggmin.ui.ButtonClass') && o.stage && o.visible)`;
  const n = await evaluate(`${bc}.length`);
  for (let i = 0; i < n; i++) {
    await hoverObj(`${bc}[${i}]`, 'bc' + i, 1); await sleep(120);
    console.log('  pick', await evaluate(`(() => { const o = ${bc}[${i}]; const b = o.getBounds(pr3.stage); let t = pr3.runtime.pick(b.x + b.width / 2, b.y + b.height / 2); const a = []; for (; t; t = t.parent) a.push(t.constructor.name + (t.name ? '#' + t.name : '')); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)].join(',') + ' ' + a.slice(0, 5).join(' < '); })()`));
    console.log('hover bc', i, await evaluate(`${bc}.map((o, j) => j + (['up', 'selected'].includes(o.currentLabel) ? '' : ':' + o.constructor.name + '.' + o.currentLabel)).filter(s => s.includes(':')).join(' ')`));
  }
  await shot('hover');
}
