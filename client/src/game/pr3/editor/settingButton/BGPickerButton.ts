// Ported from com/jiggmin/pr3/editor/settingButton/BGPickerButton.as
import { DisplayObject } from '../../../../flash/index.ts';
import { int } from '../../../../flash/as3.ts';
import { PickerButton } from './PickerButton.ts';
import { BG1, BGPickerPopup, MapManager, SettingPopup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BGPickerButton extends PickerButton {
  createPopup(): SettingPopup {
         return new BGPickerPopup();
      }
  set value(param1: any) {
         super.value = param1;
         MapManager.map.setBG(param1.bgImage);
      }
  valToGraphic(param1: any): DisplayObject {
         return super.valToGraphic(param1.bgImage);
      }
  get value(): any { return super.value; }
  constructor() {
         super();
         var _loc_1: string= MapManager.map.bgImage;
         var _loc_2: number = int(int(MapManager.map.bgColor));
         if(_loc_1 == null)
         {
            _loc_1 = "BG1";
         }
         this.value = {
            "bgImage":_loc_1,
            "bgColor":_loc_2
         };
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.BGPickerButton', BGPickerButton);
