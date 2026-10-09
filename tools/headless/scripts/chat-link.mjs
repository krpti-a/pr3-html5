// Member chats in Home, then clicks their own name link in the chat log; expects the user popup to open.
import { memberToLobby } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType, texts, until } = ctx;
  await memberToLobby(ctx);
  findType('LobbyPage').changePopup('chat');
  await frames(90);
  const chat = findType('ChatPopup') ?? findType('LobbyPage');
  // send via the chat's own input + send button handler
  const find = (o, pred) => { if (pred(o)) return o; for (const c of o._ch ?? []) { const r = find(c, pred); if (r) return r; } return null; };
  const input = find(G.stage, o => o.type === 'input' && o.constructor.name.includes('TextField') && o.stage && o._visible);
  input.text = 'hello from headless';
  const sendBtn = find(G.stage, o => o.label === 'Send' || o._label === 'Send');
  sendBtn?.func ? sendBtn.func() : console.log('no send button func');
  await frames(60);
  const log = find(G.stage, o => o._runs && /event:/.test(o.htmlText) && /hello from headless/.test(o.text));
  if (!log) { console.log('no chat line with a link; texts:', texts().slice(-10)); return; }
  console.log('chat html:', log.htmlText.match(/<A [^>]*HREF="event:[^"]*"|<a [^>]*href="event:[^"]*"/i)?.[0]);
  // find a point on the link: scan the field's chars for one with a url
  let pt = null, urls = 0, bounds = 0;
  for (let i = 0; i < log.length && !pt; i++) if (log._fmtAt(i)?.url) { urls++; const b = log.getCharBoundaries(i); if (b) { bounds++; pt = log.localToGlobal({ x: b.x + b.width / 2, y: b.y + b.height / 2 }); } }
  console.log('chars with url', urls, 'with bounds', bounds, 'runs', JSON.stringify(log._runs.map(r => [r.t.slice(0, 20), r.f.url ?? ''])).slice(0, 300));
  if (!pt) { console.log('no link char found'); return; }
  const before = texts().length;
  const e = { clientX: pt.x, clientY: pt.y, button: 0, pointerId: 1, shiftKey: false, preventDefault() {} };
  const canvas = globalThis.__canvas;
  canvas._emit('pointermove', e); canvas._emit('pointerdown', e); canvas._emit('pointerup', e);
  await frames(60);
  console.log('after click, popup?', !!(findType('UserPopup') ?? findType('UserPagePopup')), texts().slice(-12).join(' | '));
}
