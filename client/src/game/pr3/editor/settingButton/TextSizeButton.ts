// Ported from com/jiggmin/pr3/editor/settingButton/TextSizeButton.as
import { Font } from '../../../../flash/index.ts';
import { NumberButton } from './NumberButton.ts';
import { Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class TextSizeButton extends NumberButton {
  set value(param1: any) {
         super.value = param1;
         var _loc_2= (Cursor.instance);
         _loc_2.textSize = this.value;
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         this.toolTip = "Font Size \nAdjust the size of the text.";
         this.title = "Size";
         this.minimum = 1;
         this.maximum = 200;
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.TextSizeButton', TextSizeButton);
