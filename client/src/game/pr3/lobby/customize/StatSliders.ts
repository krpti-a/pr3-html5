// Ported from com/jiggmin/pr3/lobby/customize/StatSliders.as
import { int, $each } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { StatSlider, StatSlidersGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StatSliders extends Removable {
  spacing: number = 40;
  _total: number = 0;
  declare statArray: any[];
  declare m: any;
  startY: number = 33;
  statCount: number = 0;
  declare lastValueArray: any[];
  getPointsLeft(): number {
         var _loc_2= null;
         var _loc_3= NaN;
         var _loc_4= NaN;
         var _loc_1= 0;
         for (_loc_2 of $each(this.statArray))
         {
            _loc_1 += _loc_2.value;
         }
         _loc_3 = this.total - _loc_1;
         _loc_4 = _loc_3;
         if(_loc_4 < 0)
         {
            _loc_4 = 0;
         }
         this.m.remainingBox.text = _loc_4.toString();
         return _loc_3;
      }
  get total(): number {
         return this._total;
      }
  set total(value: number) {
    value = int(value);
         this._total = int(value);
      }
  getStats(): any {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_1= ({} as any);
         _loc_1.changed = false;
         for (_loc_2 of $each(this.statArray))
         {
            _loc_3 = _loc_2.getVariable();
            _loc_4 = _loc_2.getValue();
            _loc_1[_loc_3] = _loc_4;
            if(this.lastValueArray[_loc_3] != _loc_4)
            {
               _loc_1.changed = true;
               this.lastValueArray[_loc_3] = _loc_4;
            }
         }
         return _loc_1;
      }
  remove(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.statArray))
         {
            _loc_1.remove();
         }
         this.statArray = null;
         this.lastValueArray = null;
         super.remove();
      }
  addStat(param1: string, param2: string, param3: number): void {
    param3 = int(param3);
         var _loc_4= null;
         _loc_4 = new StatSlider(param1,param2,param3,this);
         this.statArray[param2] = _loc_4;
         _loc_4.y = this.statCount * this.spacing + this.startY;
         this.setStat(param2,param3);
         this.addChild(_loc_4);
         var _loc_5= this;
         var _loc_6= this.statCount + 1;
         _loc_5.statCount = _loc_6;
      }
  hidePointsRemaining(): void {
         var _loc_1= null;
         this.m.visible = false;
         for (_loc_1 of $each(this.statArray))
         {
            _loc_1.y -= this.startY;
         }
      }
  setStat(param1: string, param2: number): void {
    param2 = int(param2);
         this.lastValueArray[param1] = param2;
         var _loc_3= (this.statArray[param1]);
         if(_loc_3 != null)
         {
            _loc_3.setValue(param2);
         }
      }
  setMaxStat(param1: string, param2: number): void {
    param2 = int(param2);
         this.lastValueArray[param1] = param2;
         var _loc_3= (this.statArray[param1]);
         if(_loc_3 != null)
         {
            _loc_3.setMaxValue(param2);
         }
      }
  constructor(param1: number, param2: number, param3: number, param4: number, param5: number) {
    param1 = int(param1); param2 = int(param2); param3 = int(param3); param4 = int(param4); param5 = int(param5);
         super();
         this.m = new StatSlidersGraphic();
         this.statArray = new Array();
         this.lastValueArray = new Array();
         this._total = int(150 + param1);
         this.addChild(this.m);
         this.addStat("Speed","speed",param2);
         this.addStat("Acceleration","accel",param3);
         this.addStat("Jump Height","jump",param4);
         this.getPointsLeft();
      }
}
$reg('com.jiggmin.pr3.lobby.customize.StatSliders', StatSliders);
