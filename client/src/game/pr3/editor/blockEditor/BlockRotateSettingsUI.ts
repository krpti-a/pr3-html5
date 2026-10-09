// Ported from com/jiggmin/pr3/editor/blockEditor/BlockRotateSettingsUI.as
import { Removable } from '../../../basic/Removable.ts';
import { BlockRotateSettingsUIGraphic, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockRotateSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.rotationSpeed = Number(this.m.numSpeedBox.text);
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockRotateSettingsUIGraphic();
         this.m.numSpeedBox.restrict = "0-9.";
         this.m.numSpeedBox.maxChars = 2;
         this.m.numSpeedBox.text = param1.rotationSpeed.toString();
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockRotateSettingsUI', BlockRotateSettingsUI);
