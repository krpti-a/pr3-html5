// Member opens the level editor; the "my blocks" selector should list their saved blocks.
import { memberToLobby } from './mp-lib.mjs';
export default async function (ctx) {
  const { G, frames, findType } = ctx;
  await memberToLobby(ctx);
  const LEP = G.getDefinitionByName('com.jiggmin.pr3.editor.levelEditor.LevelEditorPage');
  findType('LobbyPage').setPage(new LEP()); await frames(150);
  const BPP = G.getDefinitionByName('com.jiggmin.pr3.editor.settingPopup.BlockPickerPopup');
  const picker = new BPP(); findType('LevelEditorPage').addPopup(picker); await frames(30);
  picker.clickCustom(); await frames(120);
  const sel = findType('MyBlockSelector');
  console.log('MyBlockSelector:', !!sel, 'list:', JSON.stringify(sel?.list?.map?.(x => x.blockID) ?? sel?.list), 'total', sel?.totalResults ?? sel?._totalResults);
  const btns = []; const walk = o => { if (o.constructor.name.includes('BlockButton') && o.stage) btns.push(o.blockID ?? o.data?.blockID ?? o.block?.id); for (const c of o._ch ?? []) walk(c); };
  if (sel) walk(sel); console.log('block buttons in selector:', JSON.stringify(btns.slice(0, 20)));
}
