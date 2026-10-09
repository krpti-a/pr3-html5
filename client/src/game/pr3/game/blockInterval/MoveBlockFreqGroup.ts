// Ported from com/jiggmin/pr3/game/blockInterval/MoveBlockFreqGroup.as
import { int, $each } from '../../../../flash/as3.ts';
import { BlockFreqGroup } from './BlockFreqGroup.ts';
import { Block, BlockList, MoveBlockList } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class MoveBlockFreqGroup extends BlockFreqGroup {
  triggerInterval(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.blockLists))
         {
            _loc_1.assignMoveCommands();
         }
         for (_loc_1 of $each(this.blockLists))
         {
            _loc_1.executeMoveCommands();
         }
      }
  createBlockList(param1: Block): BlockList {
         return new MoveBlockList(param1);
      }
  constructor(param1: number) {
    param1 = int(param1);
         super(param1);
      }
}
$reg('com.jiggmin.pr3.game.blockInterval.MoveBlockFreqGroup', MoveBlockFreqGroup);
