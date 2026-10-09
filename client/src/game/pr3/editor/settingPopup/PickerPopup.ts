// Ported from com/jiggmin/pr3/editor/settingPopup/PickerPopup.as
import { DisplayObject, Sprite } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { SettingPopup } from './SettingPopup.ts';
import { ImageButton } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PickerPopup extends SettingPopup {
  spacing: number = 40;
  removeOnPick: boolean = true;
  onlyCustom: boolean = false;
  items: number = 0;
  buttonSize: number = 36;
  startX: number = 0;
  startY: number = 0;
  columns: number = 5;
  declare buttonArray: any[];
  clickButton(param1: ImageButton): void {
         this.value = param1.data;
         if(this.removeOnPick)
         {
            this.remove();
         }
      }
  removeButtons(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.buttonArray))
         {
            _loc_1.remove();
         }
         this.buttonArray = new Array();
         this.items = int(0);
      }
  addButton(param1: DisplayObject, param2: any, param3: string = ""): void {
         var _loc_4= new ImageButton();
         _loc_4.addGraphic(param1);
         _loc_4.data = param2;
         _loc_4.sendSelf = true;
         _loc_4.toolTip = param3;
         _loc_4.clickOnMouseDown = true;
         _loc_4.init("",$b(this, 'clickButton'));
         this.addItem(_loc_4);
         this.buttonArray.push(_loc_4);
      }
  addItem(param1: Sprite): void {
         var _loc_2= this.buttonSize;
         param1.height = this.buttonSize;
         param1.width = _loc_2;
         param1.x = this.items % this.columns * this.spacing;
         param1.y = Math.floor(this.items / this.columns) * this.spacing;
         param1.x += this.startX;
         param1.y += this.startY;
         _loc_2 = this;
         var _loc_3= this.items + 1;
         _loc_2.items = _loc_3;
         this.addGraphic(param1);
      }
  remove(): void {
         this.removeButtons();
         this.buttonArray = null;
         super.remove();
      }
  constructor() {
         super();
         this.buttonArray = new Array();
      }
}
$reg('com.jiggmin.pr3.editor.settingPopup.PickerPopup', PickerPopup);
