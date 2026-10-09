// Ported from com/jiggmin/pr3/editor/cursor/BlockKillerCursor.as
import { MouseEvent, Point } from '../../../../flash/index.ts';
import { AdvancedEditorCursor } from './AdvancedEditorCursor.ts';
import { $reg } from '../../../refs.ts';

export class BlockKillerCursor extends AdvancedEditorCursor {
  killing: boolean = false;
  mouseDownHandler(event: MouseEvent): void {
         super.mouseDownHandler(event);
         if(this.visible)
         {
            this.killing = true;
            this.kill(event);
         }
      }
  runFrame(): void {
         super.runFrame();
         if(this.killing)
         {
            this.kill(this.me);
         }
      }
  mouseUpHandler(event: MouseEvent): void {
         super.mouseUpHandler(event);
         this.killing = false;
      }
  kill(event: MouseEvent): void {
         var _loc_2: Point= null;
         if(!this.holdingShift)
         {
            _loc_2 = this.getMapPoint();
            this.map.addCommand({
               "type":"removeBlock",
               "x":_loc_2.x,
               "y":_loc_2.y
            });
         }
      }
  doShiftAction(): void {
         var endPoint: Point= this.getMapPoint();
         this.map.addCommand({
            "type":"removeBlocks",
            "startX":this.shiftStartPosition.x,
            "startY":this.shiftStartPosition.y,
            "endX":endPoint.x,
            "endY":endPoint.y
         });
         this.shiftStartPosition = null;
         this.shiftVisualizer.graphics.clear();
      }
  constructor() {
         super();
         this.setState("kill");
      }
}
$reg('com.jiggmin.pr3.editor.cursor.BlockKillerCursor', BlockKillerCursor);
