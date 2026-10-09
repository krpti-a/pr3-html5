// Ported from EasyInput.as
import { Capabilities } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { InputFieldClass } from '../ui/InputFieldClass.ts';
import { MD5, Sparkworkz } from '../refs.ts';
import { $reg } from '../refs.ts';

export class EasyInput extends InputFieldClass {
  static __sym = 'EasyInput';
  _loc_2(param1: any): void {
         var _loc_3= undefined;
         var n= undefined;
         var param2= undefined;
         var _loc_1= undefined;
         var _loc_4= undefined;
         var param3= undefined;
         var _loc_5= undefined;
         var _loc_6= undefined;
         var c= undefined;
         var k= undefined;
         try
         {
            this.removeEventListener("addedToStage",$b(this, '_loc_2'));
            if(this.stage["loaderInfo"]["parameters"]["softDebug"] == "true")
            {
               return;
            }
            _loc_3 = [];
            for(n = 0; n < 256; n++)
            {
               c = n;
               for(k = 8; --k >= 0; )
               {
                  c = (c & 1) != 0 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
               }
               _loc_3[n] = c;
            }
            param2 = this["loaderInfo"]["bytes"];
            _loc_1 = 0;
            _loc_4 = 0;
            param3 = param2.length;
            _loc_5 = ~_loc_1;
            while(--param3 >= 0)
            {
               _loc_5 = _loc_3[(_loc_5 ^ param2[_loc_4++]) & 0xFF] ^ _loc_5 >>> 8;
            }
            _loc_1 = ~_loc_5;
            _loc_6 = MD5.hash("L" + _loc_1 + "L");
            Sparkworkz["KEY_A"] = _loc_6.charAt(9);
            Sparkworkz["KEY_F"] = int(_loc_6.charAt(18)) + 56;
            Sparkworkz["KEY_H"] = int(_loc_6.charAt(31)) + 11;
            Sparkworkz["KEY_J"] = _loc_6.charAt(16);
         }
         catch (_loc_7)
         {
         }
      }
  constructor() {
         super();
         try
         {
            if(!EasyInput["_loc_1"])
            {
               EasyInput["_loc_1"] = true;
               if(Capabilities["isDebugger"])
               {
                  return;
               }
               this.addEventListener("addedToStage",$b(this, '_loc_2'));
            }
         }
         catch (_loc_7)
         {
         }
      }
}
$reg('EasyInput', EasyInput);
