// Ported from com/jiggmin/pr3/editor/blockEditor/BlockReflectSettingsUI.as
import { Event } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockReflectSettingsUIGraphic, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockReflectSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.reflectAngle = int(Number(this.m.reflectAngleBox.text));
      }
  angleChanged(e: Event): void {
         var angle: number= Number(this.m.reflectAngleBox.text);
         if(angle < -360)
         {
            this.m.reflectAngleBox.text = "-360";
         }
         else if(angle > 360)
         {
            this.m.reflectAngleBox.text = "360";
         }
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockReflectSettingsUIGraphic();
         this.m.reflectAngleBox.restrict = "-0-9.";
         this.m.reflectAngleBox.maxChars = 10;
         this.m.reflectAngleBox.text = param1.reflectAngle.toString();
         this.m.reflectAngleBox.addEventListener(Event.CHANGE,$b(this, 'angleChanged'));
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockReflectSettingsUI', BlockReflectSettingsUI);
