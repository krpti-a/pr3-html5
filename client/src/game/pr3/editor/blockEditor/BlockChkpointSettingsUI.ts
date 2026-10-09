// Ported from com/jiggmin/pr3/editor/blockEditor/BlockChkpointSettingsUI.as
import { $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockChkpointSettingsUIGraphic, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockChkpointSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.chkPointReset = $b(this.m, 'reset').checked;
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockChkpointSettingsUIGraphic();
         $b(this.m, 'reset').textBox.text = "Reset Checkpoint";
         $b(this.m, 'reset').checked = param1.chkPointReset;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockChkpointSettingsUI', BlockChkpointSettingsUI);
