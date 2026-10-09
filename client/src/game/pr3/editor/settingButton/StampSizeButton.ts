// Ported from com/jiggmin/pr3/editor/settingButton/StampSizeButton.as
import { NumberButton } from './NumberButton.ts';
import { Cursor, Stamp } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StampSizeButton extends NumberButton {
  set value(param1: any) {
         super.value = param1;
         var _loc_2= (Cursor.instance);
         _loc_2.stampSize = this.value;
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         this.toolTip = "Stamp Size \nAdjust the size of the stamp.";
         this.title = "Size";
         this.minimum = 1;
         this.maximum = 256;
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.StampSizeButton', StampSizeButton);
