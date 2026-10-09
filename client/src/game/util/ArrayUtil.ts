// Ported from com/adobe/utils/ArrayUtil.as
import { uint } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class ArrayUtil {
  static arraysAreEqual(param1: any[], param2: any[]): boolean {
         if(param1.length != param2.length)
         {
            return false;
         }
         var _loc_3: number = uint(param1.length);
         var _loc_4: number = uint(0);
         while(_loc_4 < _loc_3)
         {
            if(param1[_loc_4] !== param2[_loc_4])
            {
               return false;
            }
            _loc_4 = uint(_loc_4 + (1));
         }
         return true;
      }
  static arrayContainsValue(param1: any[], param2: any): boolean {
         return param1.indexOf(param2) != -1;
      }
  static copyArray(param1: any[]): any[] {
         return param1.slice();
      }
  static removeValueFromArray(param1: any[], param2: any): void {
         var _loc_3: number = uint(param1.length);
         var _loc_4: number = uint(_loc_3);
         while(_loc_4 > -1)
         {
            if(param1[_loc_4] === param2)
            {
               param1.splice(_loc_4,1);
            }
            _loc_4--;
         }
      }
  static createUniqueCopy(param1: any[]): any[] {
         var _loc_4: any= null;
         var _loc_2: any[]= new Array();
         var _loc_3: number = uint(param1.length);
         var _loc_5: number = uint(0);
         while(_loc_5 < _loc_3)
         {
            _loc_4 = param1[_loc_5];
            if(!ArrayUtil.arrayContainsValue(_loc_2,_loc_4))
            {
               _loc_2.push(_loc_4);
            }
            _loc_5 = uint(_loc_5 + (1));
         }
         return _loc_2;
      }
  constructor() {
         
      }
}
$reg('com.adobe.utils.ArrayUtil', ArrayUtil);
