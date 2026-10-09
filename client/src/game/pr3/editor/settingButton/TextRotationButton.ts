// Ported from com/jiggmin/pr3/editor/settingButton/TextRotationButton.as
import { NumberButton } from './NumberButton.ts';
import { Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class TextRotationButton extends NumberButton {
  set value(param1: any) {
         super.value = param1;
         var _loc_2= (Cursor.instance);
         _loc_2.textRotation = this.value;
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         this.toolTip = "Text Rotation \nChange the angle of the text.";
         this.title = "Rotation";
         this.minimum = 0;
         this.maximum = 359;
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.TextRotationButton', TextRotationButton);
