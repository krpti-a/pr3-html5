// Ported from com/jiggmin/pr3/editor/cursor/BrushCursor.as
import { DrawCursor } from './DrawCursor.ts';
import { $reg } from '../../../refs.ts';

export class BrushCursor extends DrawCursor {
  constructor() {
         super();
         this.mode = "brush";
      }
}
$reg('com.jiggmin.pr3.editor.cursor.BrushCursor', BrushCursor);
