// Ported from com/jiggmin/pr3/editor/settingButton/BlockPickerButton.as
import { DisplayObject, Event } from '../../../../flash/index.ts';
import { PickerButton } from './PickerButton.ts';
import { Block, BlockDropperCursor, BlockPickerPopup, Cursor, SettingPopup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockPickerButton extends PickerButton {
  createPopup(): SettingPopup {
         return new BlockPickerPopup();
      }
  get value(): any {
         return (this._value).clone();
      }
  set value(param1: any) {
         super.value = param1;
         this.dispatchEvent(new Event("blockPickerChange"));
         var _loc_2: Block= (this.m);
         var _loc_3: BlockDropperCursor= (Cursor.instance);
         if(_loc_3 != null)
         {
            _loc_3.block = _loc_2.clone();
         }
      }
  removeM(): void {
         if(this.m != null)
         {
            (this.m).remove();
         }
         super.removeM();
      }
  valToGraphic(param1: any): DisplayObject {
         var _loc_2= (param1);
         return _loc_2.clone();
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.BlockPickerButton', BlockPickerButton);
