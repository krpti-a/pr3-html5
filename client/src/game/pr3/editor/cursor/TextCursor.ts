// Ported from com/jiggmin/pr3/editor/cursor/TextCursor.as
import { MouseEvent, Point } from '../../../../flash/index.ts';
import { HolderCursor } from './HolderCursor.ts';
import { ArtMapLayer, Data, MapText } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class TextCursor extends HolderCursor {
  _textScaleY: number = NaN;
  dragging: boolean = false;
  _textWidth: number = NaN;
  declare mapText: MapText;
  _textRotation: number = NaN;
  _textSize: number = NaN;
  _textColor: number = NaN;
  _textScaleX: number = NaN;
  remove(): void {
         this.deactivateMapText();
         super.remove();
      }
  pause(): void {
         super.remove();
      }
  mouseUpHandler(event: MouseEvent): void {
         super.mouseUpHandler(event);
         this.dragging = false;
      }
  init(): void {
         super.init();
         this.setState("createText");
      }
  deactivateMapText(): void {
         var _loc_1= (this.map.getSelectedMap());
         if(this.mapText != null)
         {
            if(!this.mapText.removed && _loc_1 != null && this.mapText.parent != null)
            {
               if(this.mapText.hasChanged())
               {
                  _loc_1.addCommand({
                     "type":"text",
                     "size":this.mapText.size,
                     "color":this.mapText.color,
                     "rotation":this.mapText.rotation,
                     "text":this.mapText.text,
                     "depth":this.mapText.parent.getChildIndex(this.mapText),
                     "x":this.mapText.x,
                     "y":this.mapText.y
                  });
               }
               this.mapText.deactivate();
            }
            this.mapText = null;
         }
      }
  set textRotation(param1: number) {
         this._textRotation = param1;
         if(this.mapText != null)
         {
            this.mapText.rotation = param1;
         }
      }
  mouseMoveHandler(event: MouseEvent): void {
         var _loc_2= null;
         super.mouseMoveHandler(event);
         if(Boolean(this.dragging) && this.mapText != null)
         {
            if(!this.mapText.removed)
            {
               _loc_2 = new Point(event.stageX,event.stageY);
               _loc_2 = this.mapText.parent.globalToLocal(_loc_2);
               this.mapText.x = _loc_2.x;
               this.mapText.y = _loc_2.y;
            }
            else
            {
               this.deactivateMapText();
               this.active = true;
            }
         }
      }
  set textSize(param1: number) {
         this._textSize = param1;
         if(this.mapText != null)
         {
            this.mapText.size = param1;
         }
      }
  mouseDownHandler(event: MouseEvent): void {
         var mousePoint: Point= null;
         var currentLayer: ArtMapLayer= null;
         var currentMapPosition: Point= null;
         var rotationPoint: Point= null;
         if(!this.active && !this.overMenu)
         {
            if(event.target == this.mapText)
            {
               this.dragging = true;
            }
            else if(event.target.parent != this.mapText)
            {
               mousePoint = this.localToGlobal(new Point(0,0));
               if(this.mapText.isTouchingDragPos(mousePoint.x,mousePoint.y))
               {
                  this.dragging = true;
               }
               else
               {
                  this.deactivateMapText();
                  this.active = true;
               }
            }
         }
         if(this.visible)
         {
            mousePoint = this.localToGlobal(new Point(0,0));
            currentLayer = (this.map.getSelectedMap());
            this.mapText = currentLayer.getTextAtPos(mousePoint.x,mousePoint.y);
            if(this.mapText == null)
            {
               currentMapPosition = this.getMapPoint();
               rotationPoint = Data.rotatePoint(-10,-20,-this._textRotation);
               this.mapText = new MapText();
               this.mapText.size = this._textSize;
               this.mapText.color = this._textColor;
               this.mapText.rotation = this._textRotation;
               this.mapText.x = currentMapPosition.x + rotationPoint.x;
               this.mapText.y = currentMapPosition.y + rotationPoint.y;
               currentLayer.addMapText(this.mapText);
            }
            this.mapText.activate();
            this.active = false;
         }
         super.mouseDownHandler(event);
      }
  set textColor(param1: number) {
         this._textColor = param1;
         if(this.mapText != null)
         {
            this.mapText.color = param1;
         }
      }
  set textWidth(param1: number) {
         this._textWidth = param1;
      }
  set textScaleY(param1: number) {
         this._textScaleY = param1;
      }
  set textScaleX(param1: number) {
         this._textScaleX = param1;
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.editor.cursor.TextCursor', TextCursor);
