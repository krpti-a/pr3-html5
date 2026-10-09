// Ported from com/jiggmin/pr3/lister/SelectorEvent.as
import { Event } from '../../../flash/index.ts';
import { $reg } from '../../refs.ts';

export class SelectorEvent extends Event {
  static SELECT: string = "select";
  static CONFIRM: string = "confirm";
  declare _data: any;
  get data(): any {
         return this._data;
      }
  constructor(param1: string, param2: any, param3: boolean = false, param4: boolean = false) {
         super(param1,param3,param4);
         this._data = param2;

      }
}
$reg('com.jiggmin.pr3.lister.SelectorEvent', SelectorEvent);
