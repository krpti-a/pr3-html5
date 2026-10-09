// Ported from com/jiggmin/ui/ProgressBarClass.as
import { MovieClip } from '../../flash/index.ts';
import { Removable } from '../basic/Removable.ts';
import { Maths } from '../refs.ts';
import { $reg } from '../refs.ts';

export class ProgressBarClass extends Removable {
  declare bar: MovieClip;
  maxPercent: any = 100;
  _percent: number = NaN;
  get percent(): number {
         return this._percent;
      }
  set percent(param1: number) {
         this._percent = param1;
         this._percent = Maths.limit(this._percent,1,this.maxPercent);
         this.bar.scaleX = this._percent / this.maxPercent;
      }
  constructor() {
         super();
         this.percent = 1;
      }
}
$reg('com.jiggmin.ui.ProgressBarClass', ProgressBarClass);
