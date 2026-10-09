// Ported from com/jiggmin/pr3/editor/settingButton/PickerButton.as
import { DisplayObject, MovieClip } from '../../../../flash/index.ts';
import { SettingButton } from './SettingButton.ts';
import { Data } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PickerButton extends SettingButton {
  declare m: DisplayObject;
  set value(param1: any) {
         super.value = param1;
         this.removeM();
         this.m = this.valToGraphic(param1);
         this.addGraphic(this.m);
      }
  remove(): void {
         this.removeM();
         super.remove();
      }
  removeM(): void {
         if(this.m != null)
         {
            if(this.m instanceof MovieClip)
            {
               (this.m).stop();
            }
            if(this.m.parent != null)
            {
               this.m.parent.removeChild(this.m);
            }
            this.m = null;
         }
      }
  valToGraphic(param1: any): DisplayObject {
         return Data.stringToObject(param1);
      }
  get value(): any { return super.value; }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.PickerButton', PickerButton);
