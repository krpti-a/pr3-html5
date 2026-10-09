// Ported from com/jiggmin/pr3/block/BlockButton.as
import { int, $b } from '../../../flash/as3.ts';
import { ImageButton } from '../../symbols/ImageButton.ts';
import { Block, BlockEvent, BlockManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BlockButton extends ImageButton {
  blockID: number = 0;
  buttonSize: number = 36;
  remove(): void {
         BlockManager.removeEventListener(BlockEvent.BLOCK_AVAILABLE,$b(this, 'blockAvailableHandler'));
         super.remove();
      }
  createToolTip(param1: Block): void {
         this.toolTip = param1.vars.title + "\n" + param1.vars.comment;
      }
  blockAvailableHandler(event: BlockEvent): void {
         if(event.block.id == this.blockID)
         {
            this.createToolTip(event.block);
            BlockManager.removeEventListener(BlockEvent.BLOCK_AVAILABLE,$b(this, 'blockAvailableHandler'));
         }
      }
  constructor(param1: Block, param2: Function) {
         super();
         this.blockID = int(param1.id);
         this.addGraphic(param1.clone());
         this.data = param1;
         this.sendSelf = true;
         var _loc_3: number = int(int(this.buttonSize));
         this.height = _loc_3;
         this.width = _loc_3;
         this.createToolTip(param1);
         this.init("",param2);
         if(param1.vars.temporary == true)
         {
            BlockManager.addEventListener(BlockEvent.BLOCK_AVAILABLE,$b(this, 'blockAvailableHandler'),false,0,true);
         }
      }
}
$reg('com.jiggmin.pr3.block.BlockButton', BlockButton);
