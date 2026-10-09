// Ported from com/jiggmin/pr3/editor/blockEditor/BlockGlassSettingsUI.as
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockGlassSettingsUIGraphic, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockGlassSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.timeTillBreak = int(Number(this.m.timeTillBreakBox.text) * 1000);
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockGlassSettingsUIGraphic();
         this.m.timeTillBreakBox.restrict = "0-9.";
         this.m.timeTillBreakBox.maxChars = 10;
         this.m.timeTillBreakBox.text = (param1.timeTillBreak / 1000).toString();
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockGlassSettingsUI', BlockGlassSettingsUI);
