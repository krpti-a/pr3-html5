// Ported from com/jiggmin/pr3/lobby/customize/StatSlider.as
import { Event } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { StatSliderGraphic, StatSliders } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StatSlider extends Removable {
  declare vars: any;
  declare m: any;
  value: number = NaN;
  declare target: StatSliders;
  declare variable: string;
  sliderChange(event: Event): void {
         this.setValue(event.target.value);
      }
  remove(): void {
         this.m.slider.removeEventListener(Event.CHANGE,$b(this, 'sliderChange'));
         this.removeChild(this.m);
         this.m = null;
         this.target = null;
         this.vars = null;
         super.remove();
      }
  setValue(param1: number): void {
         this.value = param1;
         var _loc_2= this.target.getPointsLeft();
         if(_loc_2 < 0)
         {
            param1 += _loc_2;
         }
         this.m.valueBox.text = param1.toString();
         this.m.slider.value = param1;
         this.value = param1;
      }
  getVariable(): string {
         return this.variable;
      }
  getValue(): number {
         return this.value;
      }
  textChange(event: Event): void {
         var _loc_2= event.target.text;
         var _loc_3= Number(_loc_2);
         this.setValue(_loc_3);
      }
  setMaxValue(value: number): void {
    value = int(value);
         this.m.slider.maximum = value;
      }
  constructor(param1: string, param2: string, param3: number, param4: StatSliders) {
    param3 = int(param3);
         super();
         this.m = new StatSliderGraphic();
         this.target = param4;
         this.variable = param2;
         this.setValue(param3);
         this.m.titleBox.text = param1;
         this.m.valueBox.restrict = "0123456789";
         this.addChild(this.m);
         this.m.slider.addEventListener(Event.CHANGE,$b(this, 'sliderChange'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.lobby.customize.StatSlider', StatSlider);
