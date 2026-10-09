// Ported from com/jiggmin/pr3/editor/settingButton/StampPickerButton.as
import { DisplayObject, Event } from '../../../../flash/index.ts';
import { PickerButton } from './PickerButton.ts';
import { Cursor, SettingPopup, StampCursor, StampPickerPopup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StampPickerButton extends PickerButton {
  createPopup(): SettingPopup {
         return new StampPickerPopup();
      }
  get value(): any {
         return (this._value).clone();
      }
  set buttonValue(data: any) {
         super.value = data;
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  set value(param1: any) {
         var stamp= param1.clone();
         stamp.smoothing = true;
         super.value = stamp;
         if(Cursor.instance instanceof StampCursor)
         {
            (Cursor.instance).stamp = stamp;
         }
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  valToGraphic(param1: any): DisplayObject {
         return param1.clone();
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.StampPickerButton', StampPickerButton);
