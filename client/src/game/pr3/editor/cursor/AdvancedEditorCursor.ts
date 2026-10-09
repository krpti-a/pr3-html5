// Ported from com/jiggmin/pr3/editor/cursor/AdvancedEditorCursor.as
import { Keyboard, KeyboardEvent, MouseEvent, Point, Shape } from '../../../../flash/index.ts';
import { EditorCursor } from './EditorCursor.ts';
import { $reg } from '../../../refs.ts';

export class AdvancedEditorCursor extends EditorCursor {
  holdingDown: boolean = false;
  holdingShift: boolean = false;
  declare shiftStartPosition: Point;
  declare shiftVisualizer: Shape;
  remove(): void {
         this.shiftVisualizer.graphics.clear();
         if(this.shiftVisualizer.parent != null)
         {
            this.shiftVisualizer.parent.removeChild(this.shiftVisualizer);
         }
         super.remove();
      }
  runFrame(): void {
         var currentPosition: Point= null;
         if(this.holdingShift && this.holdingDown)
         {
            currentPosition = this.getMapPoint();
            if(this.shiftStartPosition == null)
            {
               this.shiftStartPosition = currentPosition;
            }
            this.shiftVisualizer.graphics.clear();
            this.shiftVisualizer.graphics.lineStyle(null);
            this.shiftVisualizer.graphics.beginFill(0,0);
            this.shiftVisualizer.graphics.drawRect(this.shiftStartPosition.x,this.shiftStartPosition.y,currentPosition.x - this.shiftStartPosition.x,currentPosition.y - this.shiftStartPosition.y);
            this.shiftVisualizer.graphics.endFill();
         }
      }
  keyDownHandle(event: KeyboardEvent): void {
         if(event.keyCode == Keyboard.SHIFT)
         {
            this.holdingShift = true;
         }
      }
  keyUpHandler(event: KeyboardEvent): void {
         if(event.keyCode == Keyboard.SHIFT)
         {
            this.holdingShift = false;
            if(this.shiftStartPosition != null)
            {
               this.doShiftAction();
            }
         }
      }
  doShiftAction(): void {
      }
  mouseDownHandler(event: MouseEvent): void {
         if(this.visible)
         {
            this.holdingDown = true;
            if(this.holdingShift)
            {
               this.shiftStartPosition = this.getMapPoint();
            }
         }
         super.mouseDownHandler(event);
      }
  mouseUpHandler(event: MouseEvent): void {
         this.holdingDown = false;
         if(this.shiftStartPosition != null)
         {
            this.doShiftAction();
         }
      }
  constructor() {
         super();
         this.map.getSelectedMap().addChild(this.shiftVisualizer = new Shape());
      }
}
$reg('com.jiggmin.pr3.editor.cursor.AdvancedEditorCursor', AdvancedEditorCursor);
