// Ported from com/jiggmin/ui/colorPicker/EZColorPicker.as
import { ColorTransform, Event, MouseEvent, Point } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Removable } from '../../basic/Removable.ts';
import { ColorPickerGraphic, ColorPickerPopup, Settings } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class EZColorPicker extends Removable {
  color: number = 0;
  openSide: string = "right";
  declare popup: ColorPickerPopup;
  declare m: any;
  setColor(param1: number): void {
    param1 = int(param1);
         var _loc_2= null;
         if(this.color != param1)
         {
            this.color = int(param1);
            _loc_2 = new ColorTransform();
            _loc_2.color = param1;
            this.m.colorMC.transform.colorTransform = _loc_2;
            this.dispatchEvent(new Event(Event.CHANGE));
         }
      }
  remove(): void {
         this.removeEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'));
         this.removePopup();
         super.remove();
      }
  clickHandler(event: MouseEvent): void {
         if(this.popup != null && !this.popup.removed)
         {
            this.removePopup();
         }
         else
         {
            this.createPopup();
         }
      }
  getColor(): number {
         return this.color;
      }
  popupChangeHandler(event: Event): void {
         this.setColor(this.popup.getColor());
      }
  removePopup(): void {
         if(this.popup != null)
         {
            this.setColor(this.popup.getColor());
            this.popup.removeEventListener(Event.CHANGE,$b(this, 'popupChangeHandler'));
            this.popup.removeEventListener(Removable.REMOVE,$b(this, 'popupRemoveHandler'));
            if(!this.popup.removed)
            {
               this.popup.remove();
            }
            this.popup = null;
         }
         this.dispatchEvent(new Event(Event.CLOSE));
      }
  createPopup(): void {
         this.removePopup();
         var _loc_1= new Point(0,0);
         var _loc_2= this.localToGlobal(_loc_1);
         this.popup = new ColorPickerPopup(this.color);
         if(this.openSide == "right")
         {
            this.popup.x = _loc_2.x + this.width + 5;
         }
         else
         {
            this.popup.x = _loc_2.x - this.popup.width - 5;
         }
         this.popup.addEventListener(Event.CHANGE,$b(this, 'popupChangeHandler'),false,0,true);
         this.popup.addEventListener(Removable.REMOVE,$b(this, 'popupRemoveHandler'),false,0,true);
         this.stage.addChild(this.popup);
         this.popup.init();
         this.popup.shieldGraphic(this);
         this.popup.y = _loc_2.y;
         if(this.popup.y > Settings.gameHeight - this.popup.height)
         {
            this.popup.y = Settings.gameHeight - this.popup.height;
         }
         this.popup.x = Math.round(this.popup.x);
         this.popup.y = Math.round(this.popup.y);
         this.dispatchEvent(new Event(Event.OPEN));
      }
  popupRemoveHandler(event: Event): void {
         this.removePopup();
      }
  constructor() {
         super();
         this.m = new ColorPickerGraphic();
         this.addChild(this.m);
         this.setColor(255);
         this.addEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'),false,0,true);
      }
}
$reg('com.jiggmin.ui.colorPicker.EZColorPicker', EZColorPicker);
