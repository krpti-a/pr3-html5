// Ported from com/jiggmin/pr3/editor/blockEditor/BlockWaterSettingsUI.as
import { Removable } from '../../../basic/Removable.ts';
import { BlockSettings, BlockWaterSettingsUIGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockWaterSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.swimSpeed = Number(this.m.numSpeedBox.text);
      }
  constructor(blockSettings: BlockSettings) {
         super();
         this.blockSettings = blockSettings;
         this.m = new BlockWaterSettingsUIGraphic();
         this.m.numSpeedBox.maxChars = 5;
         this.m.numSpeedBox.restrict = "-0-9.";
         this.m.numSpeedBox.text = blockSettings.swimSpeed.toString();
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockWaterSettingsUI', BlockWaterSettingsUI);
