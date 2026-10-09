// Ported from com/jiggmin/pr3/game/blockInterval/ChangeBlockList.as
import { int, $each } from '../../../../flash/as3.ts';
import { BlockList } from './BlockList.ts';
import { Block, BlockManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ChangeBlockList extends BlockList {
  declare pattern: any[];
  index: number = 0;
  maxIndex: number = 3;
  randomChange: boolean = false;
  getNeededBlocks(): any[] {
         var _loc_3= 0;
         var _loc_1= new Array();
         var _loc_2= new Array();
         for (_loc_3 of $each(this.pattern))
         {
            if(_loc_1[_loc_3] == null)
            {
               _loc_1[_loc_3] = true;
               _loc_2.push(_loc_3);
            }
         }
         return _loc_2;
      }
  executeChange(): void {
         var targetBlock: Block= null;
         var block: Block= null;
         if(this.initialized)
         {
            targetBlock = BlockManager.requestBlock(this.pattern[this.index]);
            if(this.randomChange)
            {
               targetBlock = BlockManager.requestBlock(this.pattern[Math.floor(Math.random() * (this.maxIndex + 1))]);
            }
            if(!targetBlock.vars.temporary)
            {
               for (block of $each(this.blockVector))
               {
                  if(!block.paused)
                  {
                     block.morphBlockType(targetBlock);
                  }
               }
            }
            if(++this.index > this.maxIndex)
            {
               this.index = int(0);
            }
         }
      }
  init(param1: Block): void {
         super.init(param1);
         if(param1.vars.changePattern.length > 0)
         {
            this.pattern = param1.vars.changePattern;
         }
         this.maxIndex = int(this.pattern.length - 1);
         if(param1.vars.randomChange == true)
         {
            this.randomChange = true;
         }
      }
  constructor(param1: Block) {
         super(param1);
         this.pattern = new Array(101,109,114,124);

      }
}
$reg('com.jiggmin.pr3.game.blockInterval.ChangeBlockList', ChangeBlockList);
