// Ported from com/jiggmin/pr3/editor/settingButton/StampRotationButton.as
import { NumberButton } from './NumberButton.ts';
import { Cursor, Stamp } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StampRotationButton extends NumberButton {
  set value(param1: any) {
         super.value = param1;
         var _loc_2= (Cursor.instance);
         _loc_2.stampRotation = this.value;
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         this.toolTip = "Stamp Rotation \nTwist and turn your stamp.";
         this.title = "Rotation";
         this.minimum = 0;
         this.maximum = 359;
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.StampRotationButton', StampRotationButton);
