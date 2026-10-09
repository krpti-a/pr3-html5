// Ported from com/jiggmin/pr3/editor/settingPopup/BGPickerPopup.as
import { int } from '../../../../flash/as3.ts';
import { PickerPopup } from './PickerPopup.ts';
import { BG0, BG1, BG10, BG11, BG2, BG3, BG4, BG5, BG6, BG7, BG8, BG9, Data } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BGPickerPopup extends PickerPopup {
  addBG(param1: string, param2: number): void {
    param2 = int(param2);
         var _loc_3: any= Data.stringToObject(param1);
         var _loc_4: any= {
            "bgImage":param1,
            "bgColor":param2
         };
         this.addButton(_loc_3,_loc_4);
      }
  redraw(): void {
         super.redraw();
         this.y = 5;
      }
  constructor() {
         super();
         this.addBG("BG0",8172673);
         this.addBG("BG1",8172673);
         this.addBG("BG2",13283754);
         this.addBG("BG3",528392);
         this.addBG("BG4",14731448);
         this.addBG("BG5",0);
         this.addBG("BG6",0);
         this.addBG("BG7",0);
         this.addBG("BG8",0);
         this.addBG("BG9",0);
         this.addBG("BG10",0);
         this.addBG("BG11",0);
      }
}
$reg('com.jiggmin.pr3.editor.settingPopup.BGPickerPopup', BGPickerPopup);
