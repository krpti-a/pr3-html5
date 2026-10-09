// Ported from com/jiggmin/pr3/editor/settingButton/BrushThicknessButton.as
import { NumberButton } from './NumberButton.ts';
import { Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BrushThicknessButton extends NumberButton {
  set value(param1: any) {
         super.value = param1;
         var _loc_2= (Cursor.instance);
         _loc_2.thickness = this.value;
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         this.toolTip = "Brush Size \nAdjust the thickness of the brush.";
         this.title = "Size";
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.BrushThicknessButton', BrushThicknessButton);
