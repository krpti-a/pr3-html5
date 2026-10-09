// Ported from com/jiggmin/pr3/game/blockInterval/ChangeBlockFreqGroup.as
import { int, $each } from '../../../../flash/as3.ts';
import { BlockFreqGroup } from './BlockFreqGroup.ts';
import { Block, BlockList, ChangeBlockList } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ChangeBlockFreqGroup extends BlockFreqGroup {
  getNeededBlocks(): any[] {
         var _loc_2= null;
         var _loc_1= new Array();
         for (_loc_2 of $each(this.blockLists))
         {
            _loc_1 = _loc_1.concat(_loc_2.getNeededBlocks());
         }
         return _loc_1;
      }
  triggerInterval(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.blockLists))
         {
            _loc_1.executeChange();
         }
      }
  createBlockList(param1: Block): BlockList {
         return new ChangeBlockList(param1);
      }
  constructor(param1: number) {
    param1 = int(param1);
         super(param1);
         this.elapsedMS = param1;
      }
}
$reg('com.jiggmin.pr3.game.blockInterval.ChangeBlockFreqGroup', ChangeBlockFreqGroup);
