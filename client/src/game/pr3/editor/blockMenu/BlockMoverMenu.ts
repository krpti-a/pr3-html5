// Ported from com/jiggmin/pr3/editor/blockMenu/BlockMoverMenu.as
import { OptionMenu } from '../OptionMenu.ts';
import { BlockMoverCursor, Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockMoverMenu extends OptionMenu {
  remove(): void {
         Cursor.removeCursor();
         super.remove();
      }
  constructor() {
         super();
         Cursor.setCursor(new BlockMoverCursor());
      }
}
$reg('com.jiggmin.pr3.editor.blockMenu.BlockMoverMenu', BlockMoverMenu);
