// Ported from com/jiggmin/ui/colorPicker/DefaultColors.as
import { int } from '../../../flash/as3.ts';
import { ColorConversion } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class DefaultColors {
  static createBlankPalette(param1: number, param2: number): any[] {
    param1 = int(param1); param2 = int(param2);
         var _loc_5= null;
         var _loc_6= 0;
         var _loc_3= new Array();
         var _loc_4= 0;
         while(_loc_4 < param1)
         {
            _loc_5 = new Array();
            _loc_6 = 0;
            while(_loc_6 < param2)
            {
               _loc_5[_loc_6] = 0;
               _loc_6++;
            }
            _loc_3[_loc_4] = _loc_5;
            _loc_4++;
         }
         return _loc_3;
      }
  static createDefaultPalette(): any[] {
         var _loc_12= undefined;
         var _loc_5= 0;
         var _loc_10= 0;
         var _loc_11= 0;
         var _loc_1= DefaultColors.createBlankPalette(20,12);
         var _loc_2= 0;
         var _loc_3= 0;
         var _loc_4= 0;
         var _loc_6= 0;
         var _loc_7= 0;
         var _loc_8= 0;
         var _loc_9= 0;
         while(_loc_2 <= 255)
         {
            _loc_4 = 0;
            _loc_9 = 0;
            while(_loc_4 <= 255)
            {
               _loc_3 = 0;
               _loc_8 = 0;
               while(_loc_3 <= 255)
               {
                  _loc_5 = ColorConversion.rgbtohex24(_loc_2,_loc_3,_loc_4);
                  _loc_10 = _loc_6 * 6 + _loc_8 + 2;
                  _loc_11 = _loc_7 * 6 + _loc_9;
                  _loc_1[_loc_10][_loc_11] = _loc_5;
                  _loc_8++;
                  _loc_3 += 51;
               }
               _loc_9++;
               _loc_4 += 51;
            }
            _loc_2 += 51;
            _loc_6++;
            if(_loc_6 > 2)
            {
               _loc_6 = 0;
               _loc_7++;
            }
            _loc_12 = 0;
            _loc_9 = 0;
            _loc_8 = _loc_12;
         }
         _loc_1[0][0] = 0;
         _loc_1[0][1] = 3355443;
         _loc_1[0][2] = 6710886;
         _loc_1[0][3] = 10066329;
         _loc_1[0][4] = 13421772;
         _loc_1[0][5] = 16777215;
         _loc_1[0][6] = 16711680;
         _loc_1[0][7] = 65280;
         _loc_1[0][8] = 255;
         _loc_1[0][9] = 16776960;
         _loc_1[0][10] = 65535;
         _loc_1[0][11] = 16711935;
         return _loc_1;
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.ui.colorPicker.DefaultColors', DefaultColors);
