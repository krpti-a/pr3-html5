// Ported from com/jiggmin/pr3/editor/settingButton/BrushAlphaButton.as
import { NumberButton } from './NumberButton.ts';
import { Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BrushAlphaButton extends NumberButton {
  set value(param1: any) {
         super.value = param1;
         var _loc_2= (Cursor.instance);
         _loc_2.brushAlpha = this.value / 100;
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         this.toolTip = "Brush Alpha \nAdjust the transparency of the brush\'s paint.";
         this.title = "Alpha";
         this.minimum = 1;
         this.maximum = 100;
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.BrushAlphaButton', BrushAlphaButton);
