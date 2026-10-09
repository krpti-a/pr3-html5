// Ported from com/jiggmin/pr3/editor/blockEditor/BlockMoveSettingsUI.as
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockMoveSettingsUIGraphic, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockMoveSettingsUI extends Removable {
  declare blockSettings: BlockSettings;
  declare m: any;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         var _loc_1= this.m.patternBox.text.toLowerCase();
         _loc_1 = _loc_1.replace(/>|</g,"");
         this.blockSettings.movePattern = _loc_1;
         var _loc_2= Number(this.m.freqBox.text) * 1000;
         if(_loc_2 == NaN)
         {
            _loc_2 = 2500;
         }
         this.blockSettings.moveFreq = int(_loc_2);
         this.blockSettings.collapse = Boolean(this.m.setCollapse.checked);
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockMoveSettingsUIGraphic();
         this.m.patternBox.maxChars = 1000;
         this.m.patternBox.multiline = true;
         this.m.patternBox.text = param1.movePattern;
         this.m.freqBox.restrict = "0-9.";
         this.m.freqBox.maxChars = 10;
         this.m.freqBox.text = (param1.moveFreq / 1000).toString();
         this.m.setCollapse.textBox.text = "Fragile";
         this.m.setCollapse.checked = Boolean(param1.collapse);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockMoveSettingsUI', BlockMoveSettingsUI);
