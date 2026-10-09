// Ported from com/jiggmin/data/ColorConversion.as

import { $reg } from '../refs.ts';

export class ColorConversion {
  static hex32toargb(param1: number): any {
         var _loc_2= param1 >> 24 & 0xFF;
         var _loc_3= param1 >> 16 & 0xFF;
         var _loc_4= param1 >> 8 & 0xFF;
         var _loc_5= param1 & 0xFF;
         return {
            "alpha":_loc_2,
            "red":_loc_3,
            "green":_loc_4,
            "blue":_loc_5
         };
      }
  static argbtohex32(param1: number, param2: number, param3: number, param4: number): number {
         return param4 << 24 | param1 << 16 | param2 << 8 | param3;
      }
  static hex24torgb(param1: number): any {
         var _loc_2= param1 >> 16 & 0xFF;
         var _loc_3= param1 >> 8 & 0xFF;
         var _loc_4= param1 & 0xFF;
         return {
            "red":_loc_2,
            "green":_loc_3,
            "blue":_loc_4
         };
      }
  static hex24tohsb(param1: number): any {
         var _loc_2= ColorConversion.hex24torgb(param1);
         return ColorConversion.rgbtohsb(_loc_2.red,_loc_2.green,_loc_2.blue);
      }
  static toHexadecimalString(param1: number): string {
         var hex: string= param1.toString(16).toUpperCase();
         if(hex.length < 6)
         {
            hex = ("00000" + hex).substr(-6);
         }
         return "#" + hex;
      }
  static hsbtohex24(param1: number, param2: number, param3: number): number {
         var _loc_4= ColorConversion.hsbtorgb(param1,param2,param3);
         return ColorConversion.rgbtohex24(_loc_4.red,_loc_4.green,_loc_4.blue);
      }
  static hsbtorgb(param1: number, param2: number, param3: number): any {
         var _loc_4= undefined;
         var _loc_5= undefined;
         var _loc_6= undefined;
         param1 %= 360;
         if(param3 == 0)
         {
            return {
               "red":0,
               "green":0,
               "blue":0
            };
         }
         param2 /= 100;
         param3 /= 100;
         param1 /= 60;
         var _loc_7= Math.floor(param1);
         var _loc_8= param1 - _loc_7;
         var _loc_9= param3 * (1 - param2);
         var _loc_10= param3 * (1 - param2 * _loc_8);
         var _loc_11= param3 * (1 - param2 * (1 - _loc_8));
         switch(_loc_7)
         {
            case 0:
               _loc_4 = param3;
               _loc_5 = _loc_11;
               _loc_6 = _loc_9;
               break;
            case 1:
               _loc_4 = _loc_10;
               _loc_5 = param3;
               _loc_6 = _loc_9;
               break;
            case 2:
               _loc_4 = _loc_9;
               _loc_5 = param3;
               _loc_6 = _loc_11;
               break;
            case 3:
               _loc_4 = _loc_9;
               _loc_5 = _loc_10;
               _loc_6 = param3;
               break;
            case 4:
               _loc_4 = _loc_11;
               _loc_5 = _loc_9;
               _loc_6 = param3;
               break;
            case 5:
               _loc_4 = param3;
               _loc_5 = _loc_9;
               _loc_6 = _loc_10;
         }
         _loc_4 = Math.round(_loc_4 * 255);
         _loc_5 = Math.round(_loc_5 * 255);
         _loc_6 = Math.round(_loc_6 * 255);
         return {
            "red":_loc_4,
            "green":_loc_5,
            "blue":_loc_6
         };
      }
  static rgbtohex24(param1: number, param2: number, param3: number): number {
         return param1 << 16 | param2 << 8 | param3;
      }
  static rgbtohsb(param1: number, param2: number, param3: number): any {
         var _loc_8= undefined;
         var _loc_4= Math.min(Math.min(param1,param2),param3);
         var _loc_5= Math.max(Math.max(param1,param2),param3);
         var _loc_6= Math.max(Math.max(param1,param2),param3) - _loc_4;
         var _loc_7= _loc_5 == 0 ? 0 : _loc_6 / _loc_5;
         if((_loc_5 == 0 ? 0 : _loc_6 / _loc_5) == 0)
         {
            _loc_8 = 0;
         }
         else
         {
            if(param1 == _loc_5)
            {
               _loc_8 = 60 * (param2 - param3) / _loc_6;
            }
            else if(param2 == _loc_5)
            {
               _loc_8 = 120 + 60 * (param3 - param1) / _loc_6;
            }
            else
            {
               _loc_8 = 240 + 60 * (param1 - param2) / _loc_6;
            }
            if(_loc_8 < 0)
            {
               _loc_8 += 360;
            }
         }
         _loc_7 *= 100;
         _loc_5 = _loc_5 / 255 * 100;
         return {
            "hue":_loc_8,
            "saturation":_loc_7,
            "brightness":_loc_5
         };
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.data.ColorConversion', ColorConversion);
