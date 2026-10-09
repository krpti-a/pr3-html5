// Log in as the default admin; report rank/hats/parts/medals/permissions as the client sees them.
import { memberToLobby } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType, texts } = ctx;
  await memberToLobby(ctx, +(process.env.ACCOUNT ?? 2));
  const me = G.getDefinitionByName('com.jiggmin.pr3.SocketManager').socket.me;
  const v = me.vars;
  const golds = Object.values(v.campaign ?? {}).filter(r => r.medal === 3).length;
  console.log(`user ${v.userName} group ${v.group} hats ${v.hatArray?.length} heads ${v.headArray?.length} bodys ${v.bodyArray?.length} feet ${v.feetArray?.length} gold medals ${golds}/${Object.keys(v.campaign ?? {}).length}`);
  console.log('permissions:', me.permissions?.join(', ') ?? JSON.stringify(me.vars.permissions));
  findType('LobbyPage').changePopup('singlePlayer'); await frames(120);
  console.log('campaign page:', texts().filter(t => /unlock|by LocalHost/i.test(t)).slice(0, 6).join(' | '));
}
