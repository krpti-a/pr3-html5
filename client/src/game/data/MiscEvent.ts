// Ported from com/jiggmin/data/MiscEvent.as
import { Event } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class MiscEvent extends Event {
  declare _data: any;
  get data(): any {
         return this._data;
      }
  clone(): Event {
         return new MiscEvent(this.type,this.data,this.bubbles,this.cancelable);
      }
  constructor(param1: string, param2: any, param3: boolean = false, param4: boolean = false) {
         super(param1,param3,param4);
         this._data = param2;

      }
}
$reg('com.jiggmin.data.MiscEvent', MiscEvent);
