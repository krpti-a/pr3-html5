// Ported from com/jiggmin/pr3/editor/cursor/EraserCursor.as
import { DrawCursor } from './DrawCursor.ts';
import { $reg } from '../../../refs.ts';

export class EraserCursor extends DrawCursor {
  constructor() {
         super();
         this.mode = "eraser";
         this.color = 16777215;
      }
}
$reg('com.jiggmin.pr3.editor.cursor.EraserCursor', EraserCursor);
