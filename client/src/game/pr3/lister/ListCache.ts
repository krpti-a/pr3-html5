// Ported from com/jiggmin/pr3/lister/ListCache.as
import { int } from '../../../flash/as3.ts';
import { Data } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ListCache {
  static cache: any = ({} as any);
  expireTime: number = 0;
  totResults: number = 0;
  declare list: any[];
  static getFromCache(param1: string, param2: number, param3: number): any {
    param2 = int(param2); param3 = int(param3);
         var _loc_10= 0;
         var _loc_11= null;
         var _loc_12= null;
         var _loc_4= ListCache.cache[param1];
         var _loc_5: any= false;
         var _loc_6= Data.getSeconds();
         var _loc_7= param2 + param3;
         var _loc_8= new Array();
         var _loc_9= true;
         if(_loc_4 != null)
         {
            _loc_10 = param2;
            while(_loc_10 < _loc_7)
            {
               _loc_11 = _loc_4.list[_loc_10];
               if(_loc_11 == null || _loc_11.expireTime <= _loc_6)
               {
                  _loc_9 = false;
                  break;
               }
               if(_loc_11.empty != true)
               {
                  _loc_8.push(_loc_11);
               }
               _loc_10++;
            }
            if(_loc_9)
            {
               _loc_12 = ({} as any);
               _loc_12.list = _loc_8;
               _loc_12.totResults = _loc_4.totResults;
               _loc_5 = _loc_12;
            }
         }
         return _loc_5;
      }
  static deleteEntireCache(): void {
         ListCache.cache = ({} as any);
      }
  static deleteCache(param1: string): void {
         ListCache.cache[param1] = null;
      }
  static saveToCache(param1: string, param2: number, param3: number, param4: number, param5: number, param6: any[]): void {
    param2 = int(param2); param3 = int(param3); param4 = int(param4); param5 = int(param5);
         var _loc_11= null;
         var _loc_7= ListCache.cache[param1];
         if(ListCache.cache[param1] == null)
         {
            _loc_7 = new ListCache();
            ListCache.cache[param1] = _loc_7;
         }
         var _loc_8= Data.getSeconds() + param2;
         var _loc_9= param3 + param4;
         var _loc_10= param3;
         while(_loc_10 < _loc_9)
         {
            _loc_11 = param6[_loc_10 - param3];
            if(_loc_11 == null)
            {
               _loc_11 = ({} as any);
               _loc_11.empty = true;
            }
            _loc_11.expireTime = _loc_8;
            _loc_7.list[_loc_10] = _loc_11;
            _loc_7.expireTime = _loc_8;
            _loc_10++;
         }
         _loc_7.totResults = param5;
      }
  static updateTotalResults(param1: string, param2: number): void {
    param2 = int(param2);
         var _loc_3= ListCache.cache[param1];
         if(_loc_3 != null)
         {
            _loc_3.totResults = param2;
         }
      }
  static getCache(param1: string): any {
         var _loc_2: any= false;
         var _loc_3= ListCache.cache[param1];
         if(_loc_3 != null)
         {
            _loc_2 = _loc_3.list;
         }
         return _loc_2;
      }
  remove(): void {
         this.list = null;
      }
  isExpired(): boolean {
         var _loc_1= Data.getMS();
         if(_loc_1 > this.expireTime)
         {
            return true;
         }
         return false;
      }
  constructor() {
         
         this.list = new Array();
      }
}
$reg('com.jiggmin.pr3.lister.ListCache', ListCache);
