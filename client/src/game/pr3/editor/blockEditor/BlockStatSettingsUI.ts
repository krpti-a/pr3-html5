// Ported from com/jiggmin/pr3/editor/blockEditor/BlockStatSettingsUI.as
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockSettings, BlockStatSettingsUIGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockStatSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.stats.speed = int(this.m.speedBox.text);
         this.blockSettings.stats.accel = int(this.m.accelBox.text);
         this.blockSettings.stats.jump = int(this.m.jumpBox.text);
         this.blockSettings.stats.maxStat = int(this.m.maxStatBox.text);
         this.blockSettings.stats.setStatsTo = Boolean(this.m.setStatBool.checked);
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.addChild(this.m = new BlockStatSettingsUIGraphic());
         this.m.speedBox.restrict = "0-9\\-";
         this.m.accelBox.restrict = "0-9\\-";
         this.m.jumpBox.restrict = "0-9\\-";
         this.m.maxStatBox.restrict = "0-9";
         this.m.speedBox.maxChars = 4;
         this.m.accelBox.maxChars = 4;
         this.m.jumpBox.maxChars = 4;
         this.m.maxStatBox.maxChars = 3;
         this.m.speedBox.text = param1.stats.speed;
         this.m.accelBox.text = param1.stats.accel;
         this.m.jumpBox.text = param1.stats.jump;
         this.m.maxStatBox.text = param1.stats.maxStat;
         this.m.setStatBool.textBox.text = "Set stats";
         this.m.setStatBool.checked = Boolean(param1.stats.setStatsTo);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockStatSettingsUI', BlockStatSettingsUI);
