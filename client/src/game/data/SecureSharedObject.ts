// Ported from com/jiggmin/data/SecureSharedObject.as
import { SharedObject } from '../../flash/index.ts';
import { Encryptor } from '../refs.ts';
import { $reg } from '../refs.ts';

export class SecureSharedObject {
  static setLocal(param1: string, param2: any): void {
         var _loc_3= SecureSharedObject.getEncryptor();
         var _loc_4= SharedObject.getLocal(param1);
         var _loc_5= JSON.stringify(param2);
         var _loc_6= _loc_3.encrypt(_loc_5);
         _loc_4.data.str = _loc_6;
         _loc_4.flush();
      }
  static getEncryptor(): Encryptor {
         return new Encryptor();
      }
  static getLocal(param1: string): any {
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= null;
         var _loc_2= SecureSharedObject.getEncryptor();
         var _loc_3= SharedObject.getLocal(param1);
         var _loc_4= _loc_3.data.str;
         if(_loc_3.data.str == null)
         {
            return null;
         }
         _loc_5 = _loc_4;
         _loc_6 = _loc_2.decrypt(_loc_5);
         return JSON.parse(_loc_6);
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.data.SecureSharedObject', SecureSharedObject);
