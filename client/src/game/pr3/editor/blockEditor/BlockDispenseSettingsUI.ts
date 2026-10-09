// Ported from com/jiggmin/pr3/editor/blockEditor/BlockDispenseSettingsUI.as
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockDispenseSettingsUIGraphic, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockDispenseSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.dispenseCoins = int(Number(this.m.numCoinsBox.text));
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockDispenseSettingsUIGraphic();
         this.m.numCoinsBox.restrict = "0-9";
         this.m.numCoinsBox.maxChars = 2;
         this.m.numCoinsBox.text = param1.dispenseCoins.toString();
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockDispenseSettingsUI', BlockDispenseSettingsUI);
