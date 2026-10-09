// Ported from com/jiggmin/pr3/editor/settingPopup/NumberPopup.as
import { Event } from '../../../../flash/index.ts';
import { $b } from '../../../../flash/as3.ts';
import { SettingPopup } from './SettingPopup.ts';
import { NumberPopupGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class NumberPopup extends SettingPopup {
  declare m: any;
  set maximum(param1: number) {
         this.m.slider.maximum = param1;
      }
  changeHandler(event: Event): void {
         this.value = this.m.slider.value;
      }
  checkBoxHandler(event: Event): void {
         this.aliasing = this.m.setAliasing.checked;
      }
  set value(param1: any) {
         param1 = Number(param1);
         if(isNaN(param1))
         {
            param1 = this.m.slider.minimum;
         }
         else if(param1 > this.m.slider.maximum)
         {
            param1 = this.m.slider.maximum;
         }
         else if(param1 < this.m.slider.minimum)
         {
            param1 = this.m.slider.minimum;
         }
         this.m.textBox.text = param1.toString();
         this.m.slider.value = param1;
         super.value = param1;
      }
  textInputHandler(event: Event): void {
         this.value = Number(this.m.textBox.text);
      }
  remove(): void {
         this.m.slider.removeEventListener(Event.CHANGE,$b(this, 'changeHandler'));
         this.m.textBox.removeEventListener(Event.CHANGE,$b(this, 'textInputHandler'));
         this.m = null;
         super.remove();
      }
  set minimum(param1: number) {
         this.m.slider.minimum = param1;
      }
  set snapInterval(param1: number) {
         this.m.slider.snapInterval = param1;
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         this.m = new NumberPopupGraphic();
         this.addGraphic(this.m);
         this.m.textBox.restrict = "0-9.";
         this.m.slider.addEventListener(Event.CHANGE,$b(this, 'changeHandler'),false,0,true);
         this.m.textBox.addEventListener(Event.CHANGE,$b(this, 'textInputHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.editor.settingPopup.NumberPopup', NumberPopup);
