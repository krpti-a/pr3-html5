import { guestToLobby } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType } = ctx;
  await ctx.until(() => ctx.texts().some(t => /online\)/.test(t)), 300, 'menu');
  findType('MenuPage').clickPlayAsGuest(null); await frames(30); findType('MenuPage').clickGo();
  // catch the lobby as soon as it exists and track its button identity per frame
  await ctx.until(() => findType('LobbyPage'), 600, 'lobby');
  const l = findType('LobbyPage'); let b0 = l.m.singlePlayerButton, n = 0;
  console.log('LobbyPageGraphic frames', l.m._frames?.length, 'cur', l.m.currentFrame, 'playing', l.m._playing, 'wired', !!l.buttonDic[b0]);
  for (let i = 0; i < 120; i++) { await frames(1); const b = l.m.singlePlayerButton; if (b !== b0) { n++; console.log(`frame +${i}: button replaced (gfx frame ${l.m.currentFrame}, playing ${l.m._playing}); old on stage=${!!b0.stage} new wired=${!!l.buttonDic[b]}`); b0 = b; } }
  console.log('replacements', n);
}
