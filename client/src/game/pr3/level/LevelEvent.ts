// Ported from com/jiggmin/pr3/level/LevelEvent.as
import { Event } from '../../../flash/index.ts';
import { $reg } from '../../refs.ts';

export class LevelEvent extends Event {
  static LEVEL_AVAILABLE: string = "levelAvailable";
  static LEVEL_UNAVAILABLE: string = "levelUnavailable";
  declare _level: any;
  get level(): any {
         return this._level;
      }
  constructor(param1: string, param2: any, param3: boolean = false, param4: boolean = false) {
         super(param1,param3,param4);
         this._level = param2;

      }
}
$reg('com.jiggmin.pr3.level.LevelEvent', LevelEvent);
