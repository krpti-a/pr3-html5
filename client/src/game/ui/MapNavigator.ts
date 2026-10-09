// Ported from com/jiggmin/ui/MapNavigator.as
import { Event, Keyboard, MouseEvent, Sprite, TextField } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { AdvancedEditorCursor, Cursor, EditorNavigationGraphic, Key, MapManager, TransformGestureEvent } from '../refs.ts';
import { $reg } from '../refs.ts';

export class MapNavigator extends Sprite {
  declare zoomArray: any[];
  targetVelX: number = 0;
  targetVelY: number = 0;
  scrollVel: number = 13;
  velX: number = 0;
  velY: number = 0;
  scrollTraction: number = 0.2;
  declare m: any;
  targetScale: number = 1;
  zoomIndex: number = 2;
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.removeScroll();
         this.removeZoom();
         this.m = null;
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  mouseUpHandler(event: MouseEvent): void {
         this.targetVelX = 0;
         this.targetVelY = 0;
      }
  arrowDownHandler(event: MouseEvent): void {
         var _loc_2= (event.target);
         if(_loc_2 == this.m.up)
         {
            this.targetVelY = -this.scrollVel;
         }
         else if(_loc_2 == this.m.down)
         {
            this.targetVelY = this.scrollVel;
         }
         else if(_loc_2 == this.m.right)
         {
            this.targetVelX = this.scrollVel;
         }
         else if(_loc_2 == this.m.left)
         {
            this.targetVelX = -this.scrollVel;
         }
      }
  zoomOutHandler(event: MouseEvent = null): void {
         var _loc_2= undefined;
         var _loc_3= undefined;
         if(this.zoomIndex > 0)
         {
            _loc_2 = this;
            _loc_3 = this.zoomIndex - 1;
            _loc_2.zoomIndex = _loc_3;
            this.targetScale = this.zoomArray[this.zoomIndex];
         }
         else if(Key.isDown(Keyboard.SHIFT))
         {
            this.targetScale /= 1.5;
         }
         else if(Key.isDown(Keyboard.CONTROL))
         {
            this.targetScale /= 1.25;
         }
         else
         {
            this.targetScale = this.zoomArray[this.zoomIndex];
         }
      }
  zoomInHandler(event: MouseEvent = null): void {
         var _loc_2= undefined;
         var _loc_3= undefined;
         if(this.zoomIndex < this.zoomArray.length - 1)
         {
            _loc_2 = this;
            _loc_3 = this.zoomIndex + 1;
            _loc_2.zoomIndex = _loc_3;
            this.targetScale = this.zoomArray[this.zoomIndex];
         }
         else if(Key.isDown(Keyboard.SHIFT))
         {
            if(!(Cursor.instance instanceof AdvancedEditorCursor) || (Cursor.instance).shiftStartPosition == null)
            {
               this.targetScale *= 1.5;
            }
         }
         else if(Key.isDown(Keyboard.CONTROL))
         {
            this.targetScale *= 1.25;
         }
         else
         {
            this.targetScale = this.zoomArray[this.zoomIndex];
         }
      }
  enterFrameHandler(event: Event): void {
         var _loc_3= NaN;
         var _loc_7= NaN;
         var _loc_2= this.scrollVel * (1 / MapManager.map.scale);
         if(Key.isDown(Keyboard.SHIFT))
         {
            if(!(Cursor.instance instanceof AdvancedEditorCursor) || (Cursor.instance).shiftStartPosition == null)
            {
               _loc_2 *= 3;
            }
         }
         else if(Key.isDown(Keyboard.CONTROL))
         {
            _loc_2 *= 2;
         }
         if(Boolean(this.m.up.visible) && this.stage.focus == null || this.stage.focus != null && this.stage.focus.toString() != "[object TextField]")
         {
            if(Boolean(Key.isDown(Keyboard.UP)) || Boolean(Key.isDown(Keyboard.W)))
            {
               _loc_3 = -_loc_2;
            }
            else if(Boolean(Key.isDown(Keyboard.DOWN)) || Boolean(Key.isDown(Keyboard.S)))
            {
               _loc_3 = _loc_2;
            }
            else
            {
               _loc_3 = this.targetVelY;
            }
            if(Boolean(Key.isDown(Keyboard.LEFT)) || Boolean(Key.isDown(Keyboard.A)))
            {
               _loc_7 = -_loc_2;
            }
            else if(Boolean(Key.isDown(Keyboard.RIGHT)) || Boolean(Key.isDown(Keyboard.D)))
            {
               _loc_7 = _loc_2;
            }
            else
            {
               _loc_7 = this.targetVelX;
            }
         }
         else
         {
            _loc_3 = this.targetVelY;
            _loc_7 = this.targetVelX;
         }
         this.velX += (_loc_7 - this.velX) * this.scrollTraction;
         this.velY += (_loc_3 - this.velY) * this.scrollTraction;
         if(Math.abs(this.velX) > 0.1 || Math.abs(this.velY) > 0.1)
         {
            MapManager.map.posX -= this.velX;
            MapManager.map.posY -= this.velY;
         }
         var _loc_4= this.targetScale - MapManager.map.scale;
         var _loc_5= (this.targetScale - MapManager.map.scale) * 0.25;
         MapManager.map.scale += _loc_5;
         if(Math.abs(MapManager.map.scale - this.targetScale) < 0.001)
         {
            MapManager.map.scale = this.targetScale;
         }
         var _loc_6= MapManager.map.blockMap;
         _loc_6.drawBlocks();
      }
  addedToStageHandler(event: Event): void {
         this.stage.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'),false,0,true);
         this.stage.addEventListener(MouseEvent.MOUSE_WHEEL,$b(this, 'mouseWheelHandler'),false,0,true);
         this.stage.addEventListener(TransformGestureEvent.GESTURE_ZOOM,$b(this, 'gestureZoomHandler'),false,0,true);
         this.removeEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'));
      }
  removeScroll(): void {
         var _loc_1= undefined;
         _loc_1 = false;
         this.m.down.visible = false;
         this.m.right.visible = _loc_1;
         this.m.left.visible = _loc_1;
         this.m.up.visible = _loc_1;
         this.m.up.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'arrowDownHandler'));
         this.m.left.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'arrowDownHandler'));
         this.m.right.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'arrowDownHandler'));
         this.m.down.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'arrowDownHandler'));
         _loc_1 = 595;
         this.m.minus.x = 595;
         this.m.plus.x = _loc_1;
      }
  mouseWheelHandler(event: MouseEvent): void {
         if(event.delta > 0)
         {
            this.zoomInHandler(event);
         }
         else
         {
            this.zoomOutHandler(event);
         }
      }
  gestureZoomHandler(event: TransformGestureEvent): void {
         if(event.scaleX > 0)
         {
            this.zoomInHandler();
         }
         else
         {
            this.zoomOutHandler();
         }
      }
  removeZoom(): void {
         var _loc_1= false;
         this.m.minus.visible = false;
         this.m.plus.visible = _loc_1;
         this.m.plus.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'zoomInHandler'));
         this.m.minus.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'zoomOutHandler'));
      }
  zoomToScale(param1: number): void {
         this.targetScale = param1;
      }
  removedFromStageHandler(event: Event): void {
         this.stage.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'));
         this.stage.removeEventListener(MouseEvent.MOUSE_WHEEL,$b(this, 'mouseWheelHandler'));
         this.stage.removeEventListener(TransformGestureEvent.GESTURE_ZOOM,$b(this, 'gestureZoomHandler'));
         this.removeEventListener(Event.REMOVED_FROM_STAGE,$b(this, 'removedFromStageHandler'));
      }
  constructor() {
         super();
         this.zoomArray = new Array(0.25,0.5,1,2,5);
         this.m = new EditorNavigationGraphic();
         this.addChild(this.m);
         this.addEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'),false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,$b(this, 'removedFromStageHandler'),false,0,true);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.m.up.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'arrowDownHandler'),false,0,true);
         this.m.left.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'arrowDownHandler'),false,0,true);
         this.m.right.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'arrowDownHandler'),false,0,true);
         this.m.down.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'arrowDownHandler'),false,0,true);
         this.m.plus.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'zoomInHandler'),false,0,true);
         this.m.minus.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'zoomOutHandler'),false,0,true);
      }
}
$reg('com.jiggmin.ui.MapNavigator', MapNavigator);
