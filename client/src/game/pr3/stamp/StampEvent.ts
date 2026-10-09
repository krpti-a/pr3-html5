// Ported from com/jiggmin/pr3/stamp/StampEvent.as
import { Event } from '../../../flash/index.ts';
import { Stamp } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class StampEvent extends Event {
  static STAMP_AVAILABLE: string = "stampAvailable";
  declare stamp: Stamp;
  constructor(type: string, stamp: Stamp, bubbles: boolean = false, cancelable: boolean = false) {
         super(type,bubbles,cancelable);
         this.stamp = stamp;

      }
}
$reg('com.jiggmin.pr3.stamp.StampEvent', StampEvent);
