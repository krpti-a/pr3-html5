// Ported from com/jiggmin/pr3/editor/blockEditor/BlockTeleportSettingsUI.as
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockSettings, BlockTeleportSettingsUIGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockTeleportSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.teleportCooldown = int(int(this.m.teleportCooldownBox.text));
         this.blockSettings.randomDestination = Boolean(this.m.setRandomDestination.checked);
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockTeleportSettingsUIGraphic();
         this.m.teleportCooldownBox.restrict = "0-9.";
         this.m.teleportCooldownBox.maxChars = 6;
         this.m.teleportCooldownBox.text = param1.teleportCooldown.toString();
         this.m.setRandomDestination.textBox.text = "Random destination";
         this.m.setRandomDestination.checked = Boolean(param1.randomDestination);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockTeleportSettingsUI', BlockTeleportSettingsUI);
