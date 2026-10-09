// Ported from com/jiggmin/pr3/editor/cursor/AdvancedHolderCursor.as
import { DisplayObject, Event, Sprite } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { AdvancedEditorCursor } from './AdvancedEditorCursor.ts';
import { $reg } from '../../../refs.ts';

export class AdvancedHolderCursor extends AdvancedEditorCursor {
  declare _graphic: DisplayObject;
  declare holder: Sprite;
  set graphic(param1: DisplayObject) {
         if(this._graphic != null)
         {
            this.holder.removeChild(this._graphic);
         }
         this._graphic = param1;
         param1.x = -param1.width / 2;
         param1.y = -param1.height / 2;
         this.holder.addChild(param1);
      }
  setGraphic(param1: DisplayObject, x: number, y: number): void {
    x = int(x); y = int(y);
         if(this._graphic != null)
         {
            this.holder.removeChild(this._graphic);
         }
         this._graphic = param1;
         param1.x = x;
         param1.y = y;
         this.holder.addChild(param1);
      }
  remove(): void {
         this._graphic = null;
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'resizeGraphic'));
         super.remove();
      }
  get graphic(): DisplayObject {
         return this._graphic;
      }
  resizeGraphic(e: Event): void {
         this.holder.scaleX = this.map.scale;
         this.holder.scaleY = this.map.scale;
      }
  constructor() {
         super();
         this.holder = new Sprite();
         this.addChild(this.holder);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'resizeGraphic'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.editor.cursor.AdvancedHolderCursor', AdvancedHolderCursor);
