// Ported from com/jiggmin/pr3/editor/blockMenu/BlockDropperMenu.as
import { int } from '../../../../flash/as3.ts';
import { OptionMenu } from '../OptionMenu.ts';
import { BlockDropperCursor, BlockManager, BlockPickerButton, Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockDropperMenu extends OptionMenu {
  declare static instance: BlockDropperMenu;
  static savedBlockID: number = -1;
  declare blockButton: BlockPickerButton;
  remove(): void {
         BlockDropperMenu.savedBlockID = int(this.blockButton.value.id);
         this.blockButton.remove();
         this.blockButton = null;
         Cursor.removeCursor();
         super.remove();
      }
  constructor() {
         super();
         BlockDropperMenu.instance = this;
         Cursor.setCursor(new BlockDropperCursor());
         this.blockButton = new BlockPickerButton();
         this.addOption(this.blockButton);
         if(BlockDropperMenu.savedBlockID == -1)
         {
            this.blockButton.value = BlockManager.requestBlock(1);
         }
         else
         {
            this.blockButton.value = BlockManager.requestBlock(BlockDropperMenu.savedBlockID);
         }
      }
}
$reg('com.jiggmin.pr3.editor.blockMenu.BlockDropperMenu', BlockDropperMenu);
