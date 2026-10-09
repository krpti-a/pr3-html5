// Ported from com/jiggmin/pr3/editor/blockEditor/BlockBounceSettingsUI.as
import { Removable } from '../../../basic/Removable.ts';
import { BlockBounceSettingsUIGraphic, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockBounceSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.bounciness = Number(this.m.timeVanishBox.text) / 1000;
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockBounceSettingsUIGraphic();
         this.m.timeVanishBox.restrict = "0-9.";
         this.m.timeVanishBox.maxChars = 4;
         this.m.timeVanishBox.text = (param1.bounciness * 1000).toString();
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockBounceSettingsUI', BlockBounceSettingsUI);
