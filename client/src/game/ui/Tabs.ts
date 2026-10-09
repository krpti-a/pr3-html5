// Ported from com/jiggmin/ui/Tabs.as
import { MouseEvent } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { Tab } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Tabs extends Removable {
  static memory: any = ({} as any);
  maxWidth: number = NaN;
  declare tabArray: any[];
  declare saveName: string;
  selected: number = NaN;
  static getLastSelection(param1: string): number {
         return Tabs.memory[param1];
      }
  static setLastSelection(param1: string, param2: number): void {
         Tabs.memory[param1] = param2;
      }
  select(param1: Tab): void {
         var _loc_2= null;
         var _loc_3= 0;
         while(_loc_3 < this.tabArray.length)
         {
            _loc_2 = this.tabArray[_loc_3];
            if(_loc_2 == param1)
            {
               this.selected = _loc_3;
            }
            else
            {
               _loc_2.activate();
            }
            _loc_3 += 1;
         }
         this.arrangeOnTop(this.selected);
      }
  remove(): void {
         this.removeEventListener(MouseEvent.MOUSE_OUT,$b(this, 'onOut'));
         var _loc_1= 0;
         while(_loc_1 < this.tabArray.length)
         {
            this.tabArray[_loc_1].remove();
            _loc_1 += 1;
         }
         this.tabArray = null;
         if(this.saveName != "")
         {
            Tabs.setLastSelection(this.saveName,this.selected);
         }
         super.remove();
      }
  arrangeOnTop(param1: number): void {
         var _loc_2= NaN;
         _loc_2 = 0;
         while(_loc_2 < param1)
         {
            this.placeOnTop(this.tabArray[_loc_2]);
            _loc_2 += 1;
         }
         _loc_2 = this.tabArray.length - 1;
         while(_loc_2 > param1)
         {
            this.placeOnTop(this.tabArray[_loc_2]);
            _loc_2--;
         }
         this.placeOnTop(this.tabArray[param1]);
      }
  onOut(event: MouseEvent): void {
         this.arrangeOnTop(this.selected);
      }
  setMaxWidth(param1: any): void {
         var _loc_2= null;
         var _loc_3= NaN;
         var _loc_4= NaN;
         var _loc_5= NaN;
         _loc_3 = 0;
         _loc_4 = 0;
         while(_loc_4 < this.tabArray.length)
         {
            _loc_2 = this.tabArray[_loc_4];
            _loc_2.x = _loc_3;
            _loc_3 += _loc_2.width;
            _loc_4 += 1;
         }
         if(this.width > param1)
         {
            _loc_5 = (this.width - param1) / (this.tabArray.length - 1);
            _loc_4 = 1;
            while(_loc_4 < this.tabArray.length)
            {
               _loc_2.x -= _loc_5 * _loc_4;
               _loc_4 += 1;
            }
         }
      }
  placeOnTop(param1: Tab): void {
         this.addChildAt(param1,this.numChildren - 1);
      }
  constructor(param1: any[], param2: number = 0, param3: number = 100, param4: string = "", param5: boolean = true) {
         super();
         var _loc_6= null;
         var _loc_7= NaN;
         var _loc_8= NaN;
         this.tabArray = param1;
         this.maxWidth = param3;
         this.selected = param2;
         this.saveName = param4;
         if(param5)
         {
            _loc_8 = Tabs.getLastSelection(param4);
            if(!isNaN(_loc_8) && _loc_8 < param1.length)
            {
               param2 = _loc_8;
            }
         }
         _loc_7 = 0;
         while(_loc_7 < param1.length)
         {
            _loc_6 = param1[_loc_7];
            _loc_6.setTabs(this);
            this.addChild(_loc_6);
            _loc_7 += 1;
         }
         this.setMaxWidth(param3);
         param1[param2].select();
         this.addEventListener(MouseEvent.MOUSE_OUT,$b(this, 'onOut'));
      }
}
$reg('com.jiggmin.ui.Tabs', Tabs);
