// Ported from com/jiggmin/pr3/editor/cursor/StampCursor.as
import { Event, MouseEvent } from '../../../../flash/index.ts';
import { HolderCursor } from './HolderCursor.ts';
import { MapPage, StampEditorPage } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StampCursor extends HolderCursor {
  _stampRotation: number = 0;
  _stampSize: number = 100;
  declare _stamp: any;
  _stampAlpha: number = 100;
  get stampRotation(): number {
         return this._stampRotation;
      }
  get stamp(): any {
         return this._stamp;
      }
  set stamp(param1: any) {
         var _loc_2= undefined;
         this._stamp = param1;
         this.graphic = param1;
         this.holder.alpha = this.stampAlpha / 100;
         this.holder.rotation = this.stampRotation;
         _loc_2 = this.stampSize / 100;
         this.holder.scaleY = this.stampSize / 100;
         this.holder.scaleX = _loc_2;
      }
  set stampRotation(param1: number) {
         this._stampRotation = param1;
         this.holder.rotation = param1;
      }
  set stampSize(param1: number) {
         this._stampSize = param1;
         var scale: number= param1 / 100;
         this.holder.scaleY = scale;
         this.holder.scaleX = scale;
      }
  mouseDownHandler(event: MouseEvent): void {
         var _loc_2= null;
         if(this.visible)
         {
            if(this.stamp != null && (Boolean(this.stamp.classic) || Boolean(!(MapPage.instance instanceof StampEditorPage))))
            {
               _loc_2 = this.getMapPoint();
               this.map.addCommand({
                  "type":"stampv2",
                  "stamp":this.stamp.id,
                  "alpha":this.stampAlpha,
                  "rotation":this.stampRotation,
                  "scale":this.stampSize,
                  "x":_loc_2.x,
                  "y":_loc_2.y
               });
            }
         }
         super.mouseDownHandler(event);
      }
  set stampAlpha(param1: number) {
         this._stampAlpha = param1;
         this.holder.alpha = param1 / 100;
      }
  get stampAlpha(): number {
         return this._stampAlpha;
      }
  get stampSize(): number {
         return this._stampSize;
      }
  resizeGraphic(e: Event): void {
         var scale: number= this._stampSize / 100;
         this.holder.scaleX = this.map.scale * scale;
         this.holder.scaleY = this.map.scale * scale;
      }
  constructor() {
         super();
         this.setState("closedHand");
      }
}
$reg('com.jiggmin.pr3.editor.cursor.StampCursor', StampCursor);
