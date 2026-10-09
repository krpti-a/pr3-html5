// Ported from com/jiggmin/pr3/editor/blockMenu/BlockKillerMenu.as
import { OptionMenu } from '../OptionMenu.ts';
import { BlockKillerCursor, Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockKillerMenu extends OptionMenu {
  remove(): void {
         Cursor.removeCursor();
         super.remove();
      }
  constructor() {
         super();
         Cursor.setCursor(new BlockKillerCursor());
      }
}
$reg('com.jiggmin.pr3.editor.blockMenu.BlockKillerMenu', BlockKillerMenu);
