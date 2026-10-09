// Ported from com/jiggmin/pr3/editor/settingPopup/SettingPopup.as
import { Event } from '../../../../flash/index.ts';
import { FocusPopup } from '../../../popup/FocusPopup.ts';
import { EditorPopupBGGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class SettingPopup extends FocusPopup {
  declare _value: any;
  get value(): any {
         return this._value;
      }
  set value(param1: any) {
         if(param1 != this._value)
         {
            this._value = param1;
            this.dispatchChange();
         }
      }
  dispatchChange(): void {
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  remove(): void {
         if(this.stage != null)
         {
            this.stage.focus = this.stage;
         }
         super.remove();
      }
  constructor() {
         super();
         this.setBG(new EditorPopupBGGraphic());
      }
}
$reg('com.jiggmin.pr3.editor.settingPopup.SettingPopup', SettingPopup);
