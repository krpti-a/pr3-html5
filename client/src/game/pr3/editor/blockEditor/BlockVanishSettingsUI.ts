// Ported from com/jiggmin/pr3/editor/blockEditor/BlockVanishSettingsUI.as
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockSettings, BlockVanishSettingsUIGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockVanishSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.timeTillVanish = int(Number(this.m.timeVanishBox.text) * 1000);
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockVanishSettingsUIGraphic();
         this.m.timeVanishBox.restrict = "0-9.";
         this.m.timeVanishBox.maxChars = 10;
         this.m.timeVanishBox.text = (param1.timeTillVanish / 1000).toString();
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockVanishSettingsUI', BlockVanishSettingsUI);
