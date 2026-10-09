// Ported from com/jiggmin/pr3/lister/Selector.as
import { DisplayObject } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Lister } from './Lister.ts';
import { ButtonClass, SelectorEvent } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Selector extends Lister {
  declare _selectedButton: ButtonClass;
  clickButton(param1: ButtonClass): void {
         if(this._selectedButton == param1)
         {
            this.dispatchEvent(new SelectorEvent(SelectorEvent.CONFIRM,this._selectedButton.data));
         }
         else
         {
            this.deselect();
            param1.selected = true;
            this._selectedButton = param1;
            this.dispatchEvent(new SelectorEvent(SelectorEvent.SELECT,this._selectedButton.data));
         }
      }
  addButton(param1: ButtonClass, param2: string = ""): void {
         param1.align = "left";
         param1.sendSelf = true;
         param1.init(param2,$b(this, 'clickButton'));
         this.addGraphic(param1);
      }
  deselect(): void {
         if(this._selectedButton != null)
         {
            this._selectedButton.selected = false;
            this._selectedButton = null;
         }
      }
  get selectedData(): any {
         var _loc_1: any= null;
         if(this._selectedButton != null)
         {
            _loc_1 = this._selectedButton.data;
         }
         return _loc_1;
      }
  remove(): void {
         super.remove();
      }
  removeGraphic(param1: DisplayObject): void {
         var _loc_2= (param1);
         if(!_loc_2.removed)
         {
            _loc_2.remove();
         }
         super.removeGraphic(_loc_2);
      }
  get selectedButton(): ButtonClass {
         return this._selectedButton;
      }
  constructor(param1: number = 7, extraWidth: number = 0) {
    param1 = int(param1); extraWidth = int(extraWidth);
         super(param1,extraWidth);
      }
}
$reg('com.jiggmin.pr3.lister.Selector', Selector);
