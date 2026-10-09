// Ported from com/jiggmin/pr3/stamp/Stamp.as
import { Bitmap, BitmapData } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { StampManager, StampSettings } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Stamp extends Bitmap {
  _id: number = 0;
  get id(): number {
         return this._id;
      }
  clone(): Stamp {
         return new Stamp(this.id,this.bitmapData);
      }
  get vars(): StampSettings {
         return StampManager.getVars(this.id);
      }
  get drawing(): boolean {
         return this.vars.drawing;
      }
  get classic(): boolean {
         return this.vars.classic;
      }
  constructor(id: number, bitmapData: BitmapData) {
    id = int(id);
         super();
         this._id = int(id);
         this.bitmapData = bitmapData;
      }
}
$reg('com.jiggmin.pr3.stamp.Stamp', Stamp);
