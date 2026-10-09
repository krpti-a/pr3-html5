// Ported from com/jiggmin/pr3/editor/cursor/DrawCursor.as
import { Event, Keyboard, MouseEvent } from '../../../../flash/index.ts';
import { uint, $b } from '../../../../flash/as3.ts';
import { EditorCursor } from './EditorCursor.ts';
import { Key, Maths } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class DrawCursor extends EditorCursor {
  lastX: number = NaN;
  lastY: number = NaN;
  lastCommitY: number = NaN;
  lastCommitX: number = NaN;
  brushAlpha: number = 1;
  lockNum: number = NaN;
  drawing: boolean = false;
  lockDir: string = "";
  mode: string = "brush";
  _color: number = 0;
  maxSingleDraw: number = 2000;
  _thickness: number = NaN;
  _aliasing: boolean = false;
  mouseUpHandler(event: MouseEvent): void {
         if(this.drawing)
         {
            this.commit();
            this.drawing = false;
            this.lockDir = "";
         }
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         super.mouseUpHandler(event);
      }
  set color(param1: number) {
    param1 = uint(param1);
         this._color = uint(param1);
      }
  enterFrameHandler(event: Event): void {
         this.drawLine();
         var _loc_2= this.getMapPoint();
         var _loc_3= _loc_2.x - this.lastCommitX;
         var _loc_4= _loc_2.y - this.lastCommitY;
         var _loc_5= Maths.pythag(_loc_3,_loc_4);
         if(Maths.pythag(_loc_3,_loc_4) > this.maxSingleDraw)
         {
            this.commit();
            this.mouseDownHandler(this.me);
         }
         this.redraw();
      }
  drawLine(): void {
         var _loc_1= false;
         var _loc_2= null;
         var _loc_3= NaN;
         var _loc_4= NaN;
         var _loc_5= null;
         if(this.drawing)
         {
            _loc_1 = false;
            _loc_2 = this.getMapPoint();
            if(this._thickness > 1)
            {
               _loc_2.x = Math.round(_loc_2.x);
               _loc_2.y = Math.round(_loc_2.y);
            }
            else
            {
               _loc_2.x = Math.floor(_loc_2.x);
               _loc_2.y = Math.floor(_loc_2.y);
            }
            if(Key.isDown(Keyboard.SHIFT))
            {
               if(this.lockDir == "")
               {
                  _loc_3 = _loc_2.x - this.lastX;
                  _loc_4 = _loc_2.y - this.lastY;
                  if(Math.abs(_loc_3) > 1 || Math.abs(_loc_4) > 1)
                  {
                     if(Math.abs(_loc_3) > Math.abs(_loc_4))
                     {
                        this.lockDir = "horizontal";
                        this.lockNum = this.lastY;
                     }
                     else
                     {
                        this.lockDir = "vertical";
                        this.lockNum = this.lastX;
                     }
                  }
                  else
                  {
                     _loc_1 = true;
                  }
               }
            }
            else
            {
               this.lockDir = "";
            }
            if(!_loc_1)
            {
               if(this.lockDir == "horizontal")
               {
                  _loc_2.y = this.lockNum;
               }
               if(this.lockDir == "vertical")
               {
                  _loc_2.x = this.lockNum;
               }
               if(_loc_2.x != this.lastX || _loc_2.y != this.lastY)
               {
                  this.lastX = _loc_2.x;
                  this.lastY = _loc_2.y;
                  _loc_5 = ({} as any);
                  _loc_5.type = "lineTo";
                  _loc_5.x = _loc_2.x;
                  _loc_5.y = _loc_2.y;
                  this.map.addCommand(_loc_5);
               }
            }
         }
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'resizeBrushGuide'));
         super.remove();
      }
  set thickness(param1: number) {
         this._thickness = param1;
         this.redraw();
      }
  set aliasing(param1: boolean) {
         this._aliasing = param1;
         this.redraw();
      }
  get color(): number {
         return this._color;
      }
  redraw(): void {
         this.scaleX = this._thickness / 100 * this.map.scale;
         this.scaleY = this._thickness / 100 * this.map.scale;
         var _loc_1= 1 / this.scaleX;
         this.m.center.scaleY = 1 / this.scaleX;
         this.m.center.scaleX = _loc_1;
      }
  mouseDownHandler(event: MouseEvent): void {
         var _loc_2= null;
         if(this.visible || Boolean(this.drawing))
         {
            _loc_2 = this.getMapPoint();
            if(this._thickness > 1)
            {
               _loc_2.x = Math.round(_loc_2.x);
               _loc_2.y = Math.round(_loc_2.y);
            }
            else
            {
               _loc_2.x = Math.floor(_loc_2.x);
               _loc_2.y = Math.floor(_loc_2.y);
            }
            if(this.lockDir == "horizontal")
            {
               _loc_2.y = this.lockNum;
            }
            if(this.lockDir == "vertical")
            {
               _loc_2.x = this.lockNum;
            }
            if(Key.isDown(Keyboard.SHIFT))
            {
               this.map.addCommand({
                  "type":"moveTo",
                  "x":this.lastX,
                  "y":this.lastY,
                  "thickness":this._thickness,
                  "color":this.color,
                  "alpha":this.brushAlpha,
                  "mode":this.mode,
                  "aliasing":this._aliasing
               });
               this.map.addCommand({
                  "type":"lineTo",
                  "x":_loc_2.x,
                  "y":_loc_2.y
               });
            }
            else
            {
               this.map.addCommand({
                  "type":"moveTo",
                  "x":_loc_2.x,
                  "y":_loc_2.y,
                  "thickness":this._thickness,
                  "color":this.color,
                  "alpha":this.brushAlpha,
                  "mode":this.mode,
                  "aliasing":this._aliasing
               });
            }
            this.drawing = true;
            this.lastCommitX = _loc_2.x;
            this.lastCommitY = _loc_2.y;
            this.lastX = _loc_2.x;
            this.lastY = _loc_2.y;
         }
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'resizeBrushGuide'),false,0,true);
         super.mouseDownHandler(event);
      }
  resizeBrushGuide(event: Event): void {
         this.redraw();
      }
  commit(): void {
         this.map.addCommand({"type":"commit"});
         var _loc_1= this.getMapPoint();
         this.lastCommitX = _loc_1.x;
         this.lastCommitY = _loc_1.y;
      }
  constructor() {
         super();
         this.setState("draw");
         this.thickness = 25;
         this.aliasing = false;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'resizeBrushGuide'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.editor.cursor.DrawCursor', DrawCursor);
