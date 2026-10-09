// Ported from com/jiggmin/pr3/editor/settingButton/SettingButton.as
import { Event, Point } from '../../../../flash/index.ts';
import { $b } from '../../../../flash/as3.ts';
import { ImageButton } from '../../../symbols/ImageButton.ts';
import { PlatformRacing3, SettingPopup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class SettingButton extends ImageButton {
  declare popup: SettingPopup;
  declare _value: any;
  alignXPopupsTo: string = "right";
  set value(param1: any) {
         this._value = param1;
      }
  removePopup(): void {
         if(this.popup != null)
         {
            this.popup.removeEventListener(Event.CHANGE,$b(this, 'popupChangeHandler'));
            if(this.popup.removed == false)
            {
               this.popup.remove();
            }
            this.popup = null;
         }
      }
  clickHandler(): void {
         this.addPopup();
      }
  addPopup(): void {
         var _loc_1= new Point(0,0);
         _loc_1 = this.localToGlobal(_loc_1);
         this.removePopup();
         this.popup = this.createPopup();
         this.popup.addEventListener(Event.CHANGE,$b(this, 'popupChangeHandler'),false,0,true);
         this.popup.x = _loc_1.x + 45;
         if(this.alignXPopupsTo == "center")
         {
            this.popup.x -= this.popup.x / 2;
         }
         else if(this.alignXPopupsTo == "left")
         {
            this.popup.x -= this.popup.x;
         }
         this.popup.y = _loc_1.y - 10;
         PlatformRacing3.addPopup(this.popup);
      }
  popupChangeHandler(event: Event): void {
         this.value = this.popup.value;
      }
  createPopup(): SettingPopup {
         return null;
      }
  get value(): any {
         return this._value;
      }
  setAlignXPopupsTo(data: string): void {
         this.alignXPopupsTo = data;
      }
  remove(): void {
         this.removePopup();
         this._value = null;
         super.remove();
      }
  constructor() {
         super();
         this.imagePadding = 0;
         this.init("",$b(this, 'clickHandler'));
      }
}
$reg('com.jiggmin.pr3.editor.settingButton.SettingButton', SettingButton);
