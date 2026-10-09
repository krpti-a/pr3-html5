import { guestToLobby } from './mp-lib.mjs';
export default async function (ctx) {
  await guestToLobby(ctx);
  await ctx.frames(60);
  const cp = ctx.findType('CustomizePopup');
  const me = ctx.G.getDefinitionByName('com.jiggmin.pr3.SocketManager').socket.me.vars;
  console.log('me.vars speed/accel/jump', me.speed, me.accel, me.jump, 'rank', me.rank);
  console.log('sliders', cp?.statSliders ? JSON.stringify(cp.statSliders.getStats()) : 'none', cp?.statSliders?.statArray?.map(s => [s.variable, s.value, s.m?.slider?.value, s.m?.valueBox?.text]));
}
