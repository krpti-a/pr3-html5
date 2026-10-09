// Ported from com/jiggmin/data/Maths.as

import { $reg } from '../refs.ts';

export class Maths {
  static RAD_DEG: number = 57.2958;
  static DEG_RAD: number = 0.0174533;
  static hexToRGB(param1: number): any {
         var _loc_2= ({} as any);
         _loc_2.r = param1 >> 16;
         _loc_2.g = param1 >> 8 & 0xFF;
         _loc_2.b = param1 & 0xFF;
         return _loc_2;
      }
  static pythag(param1: number, param2: number): number {
         return Math.sqrt(param1 * param1 + param2 * param2);
      }
  static limit(param1: number, param2: number, param3: number): number {
         if(param1 > param3)
         {
            param1 = param3;
         }
         if(param1 < param2)
         {
            param1 = param2;
         }
         return param1;
      }
  static getShortestRotChange(param1: number, param2: number): number {
         var _loc_3= param1 - param2;
         var _loc_4= (_loc_3 - 360) % 360;
         var _loc_5= (_loc_3 + 360) % 360;
         if(Math.abs(_loc_4) < Math.abs(_loc_3))
         {
            _loc_3 = _loc_4;
         }
         if(Math.abs(_loc_5) < Math.abs(_loc_3))
         {
            _loc_3 = _loc_5;
         }
         return _loc_3;
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.data.Maths', Maths);
