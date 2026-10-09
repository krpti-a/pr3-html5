// Ported from com/jiggmin/pr3/block/BlockEvent.as
import { Event } from '../../../flash/index.ts';
import { Block } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BlockEvent extends Event {
  static BLOCK_AVAILABLE: string = "blockAvailable";
  declare _block: Block;
  get block(): Block {
         return this._block;
      }
  constructor(param1: string, param2: Block, param3: boolean = false, param4: boolean = false) {
         super(param1,param3,param4);
         this._block = param2;

      }
}
$reg('com.jiggmin.pr3.block.BlockEvent', BlockEvent);
