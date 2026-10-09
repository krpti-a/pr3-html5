// Ported from com/jiggmin/pr3/game/blockInterval/BlockList.as
import { int, $b } from '../../../../flash/as3.ts';
import { Block, BlockEvent, BlockManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockList {
  declare blockVector: Block[];
  initialized: boolean = false;
  blockID: number = 0;
  removeBlock(param1: Block): void {
         var _loc_2= this.blockVector.indexOf(param1);
         if(_loc_2 != -1)
         {
            this.blockVector.splice(_loc_2,1);
         }
      }
  remove(): void {
         BlockManager.removeEventListener(BlockEvent.BLOCK_AVAILABLE,$b(this, 'blockAvailableHandler'));
         this.blockVector = null;
      }
  addBlock(param1: Block): void {
         this.blockVector.push(param1);
      }
  init(param1: Block): void {
         this.initialized = true;
      }
  blockAvailableHandler(event: BlockEvent): void {
         if(event.block.id == this.blockID)
         {
            BlockManager.removeEventListener(BlockEvent.BLOCK_AVAILABLE,$b(this, 'blockAvailableHandler'));
            this.init(event.block);
         }
      }
  get blockVectorList(): Block[] {
         return this.blockVector;
      }
  constructor(param1: Block) {
         
         this.blockVector =  [];
         this.blockID = int(param1.id);
         if(param1.vars.temporary == true)
         {
            BlockManager.addEventListener(BlockEvent.BLOCK_AVAILABLE,$b(this, 'blockAvailableHandler'),false,0,true);
         }
         else
         {
            this.init(param1);
         }
      }
}
$reg('com.jiggmin.pr3.game.blockInterval.BlockList', BlockList);
