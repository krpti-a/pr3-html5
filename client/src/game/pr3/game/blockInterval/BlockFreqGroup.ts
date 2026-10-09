// Ported from com/jiggmin/pr3/game/blockInterval/BlockFreqGroup.as
import { int, $each } from '../../../../flash/as3.ts';
import { Block, BlockList } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockFreqGroup {
  elapsedMS: number = 0;
  declare blockLists: any[];
  freq: number = 0;
  removeBlock(param1: Block): void {
         var _loc_2: BlockList= this.getBlockList(param1);
         _loc_2.removeBlock(param1);
      }
  remove(): void {
         var _loc_1: BlockList= null;
         for (_loc_1 of $each(this.blockLists))
         {
            _loc_1.remove();
         }
         this.blockLists = null;
      }
  step(param1: number): void {
    param1 = int(param1);
         this.elapsedMS += param1;
         if(this.elapsedMS >= this.freq)
         {
            this.elapsedMS -= this.freq;
            this.triggerInterval();
         }
      }
  createBlockList(param1: Block): BlockList {
         return new BlockList(param1);
      }
  getBlockList(param1: Block): BlockList {
         var _loc_2: number = int(param1.id);
         var _loc_3: BlockList= this.blockLists[_loc_2];
         if(_loc_3 == null)
         {
            _loc_3 = this.createBlockList(param1);
            this.blockLists[_loc_2] = _loc_3;
         }
         return _loc_3;
      }
  addBlock(param1: Block): void {
         if(param1.vars.temporary == true)
         {
         }
         var _loc_2: BlockList= this.getBlockList(param1);
         _loc_2.addBlock(param1);
      }
  triggerInterval(): void {
      }
  constructor(param1: number) {
    param1 = int(param1);
         
         this.blockLists = new Array();
         this.freq = int(param1);
      }
}
$reg('com.jiggmin.pr3.game.blockInterval.BlockFreqGroup', BlockFreqGroup);
