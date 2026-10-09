// Ported from com/jiggmin/ui/colorPicker/Eyedropper.as
import { BitmapData, DisplayObject, Event, Mouse, MouseEvent, clearInterval, setInterval } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { Cursor } from '../Cursor.ts';
import { $reg } from '../../refs.ts';

export class Eyedropper extends Cursor {
  color: number = 0;
  drawInterval: number = 0;
  active: boolean = false;
  declare shieldArray: any[];
  declare screen: BitmapData;
  remove(): void {
         clearInterval(this.drawInterval);
         this.screen.dispose();
         this.screen = null;
         this.shieldArray = null;
         Mouse.show();
         super.remove();
      }
  getColorAtMouse(event: MouseEvent): void {
         var _loc_2= Math.floor(event.stageX);
         var _loc_3= Math.floor(event.stageY);
         this.color = int(this.screen.getPixel(_loc_2,_loc_3));
      }
  mouseDownHandler(event: MouseEvent): void {
         super.mouseDownHandler(event);
      }
  mouseMoveHandler(event: MouseEvent): void {
         super.mouseMoveHandler(event);
         var _loc_2= true;
         var _loc_3= (event.target);
         while(_loc_3.parent != null)
         {
            if(this.isShielded(_loc_3))
            {
               _loc_2 = false;
               break;
            }
            _loc_3 = _loc_3.parent;
         }
         if(_loc_2)
         {
            if(!this.active)
            {
               this.active = true;
               this.visible = true;
               Mouse.hide();
               this.drawScreen();
            }
            this.getColorAtMouse(event);
            this.dispatchEvent(new Event(Event.CHANGE));
         }
         else if(this.active)
         {
            this.active = false;
            this.visible = false;
            Mouse.show();
            this.color = int(-1);
            this.dispatchEvent(new Event(Event.CHANGE));
         }
      }
  drawScreen(): void {
         if(this.visible)
         {
            this.visible = false;
            this.screen.draw(Cursor.stageRef);
            this.visible = true;
         }
      }
  isShielded(param1: DisplayObject): boolean {
         var _loc_2= this.shieldArray.indexOf(param1);
         if(_loc_2 == -1)
         {
            return false;
         }
         return true;
      }
  shieldGraphic(param1: DisplayObject): void {
         this.shieldArray.push(param1);
      }
  constructor() {
         super();
         this.shieldArray = new Array();
         this.setState("eyedropper");
         this.screen = new BitmapData(Cursor.stageRef.stageWidth,Cursor.stageRef.stageHeight);
         this.visible = false;
         this.drawScreen();
         this.drawInterval = uint(setInterval($b(this, 'drawScreen'),250));
      }
}
$reg('com.jiggmin.ui.colorPicker.Eyedropper', Eyedropper);
