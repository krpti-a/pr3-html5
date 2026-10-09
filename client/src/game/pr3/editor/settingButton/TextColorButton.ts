// Ported from com/jiggmin/pr3/editor/settingButton/TextColorButton.as
import { Event } from '../../../../flash/index.ts';
import { uint, $b } from '../../../../flash/as3.ts';
import { EZColorPicker } from '../../../ui/colorPicker/EZColorPicker.ts';
import { Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class TextColorButton extends EZColorPicker {
  get value(): number {
         return this.color;
      }
  set value(param1: number) {
    param1 = uint(param1);
         this.setColor(param1);
         (Cursor.instance).textColor = param1;
      }
  changeHandler(event: Event): void {
      }
  remove(): void {
         this.removeEventListener(Event.CHANGE,$b(this, 'changeHandler'));
         this.removeEventListener(Event.CLOSE,$b(this, 'closeHandler'));
         super.remove();
      }
  closeHandler(event: Event): void {
         (Cursor.instance).textColor = this.color;
      }
  constructor() {
         super();
         this.addEventListener(Event.CHANGE,$b(this, 'changeHandler'),false,0,true);
         this.addEventListener(Event.CLOSE,$b(this, 'closeHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.TextColorButton', TextColorButton);
