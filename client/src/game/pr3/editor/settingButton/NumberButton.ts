// Ported from com/jiggmin/pr3/editor/settingButton/NumberButton.as
import { SettingButton } from './SettingButton.ts';
import { NumberButtonGraphic, NumberPopup, SettingPopup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class NumberButton extends SettingButton {
  maximum: number = 200;
  declare m: any;
  minimum: number = 1;
  snapInterval: number = 1;
  set value(param1: any) {
         super.value = param1;
         this.m.textBox.text = param1.toString();
      }
  remove(): void {
         this.m = null;
         super.remove();
      }
  set title(param1: string) {
         this.m.titleBox.text = param1;
      }
  createPopup(): SettingPopup {
         var _loc_1= new NumberPopup();
         _loc_1.minimum = this.minimum;
         _loc_1.maximum = this.maximum;
         _loc_1.snapInterval = this.snapInterval;
         _loc_1.value = this.value;
         return _loc_1;
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         this.m = new NumberButtonGraphic();
         this.addGraphic(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.NumberButton', NumberButton);
