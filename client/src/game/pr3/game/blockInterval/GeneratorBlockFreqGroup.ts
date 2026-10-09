// Ported from com/jiggmin/pr3/game/blockInterval/GeneratorBlockFreqGroup.as
import { int, $each } from '../../../../flash/as3.ts';
import { BlockFreqGroup } from './BlockFreqGroup.ts';
import { Block, BlockList, BlockManager, MapManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class GeneratorBlockFreqGroup extends BlockFreqGroup {
  triggerInterval(): void {
         var blockList: BlockList= null;
         var index: number = int(0);
         var generatorBlock: Block= null;
         var sideInQuestion: string= null;
         var xTileOffset: number = int(0);
         var yTileOffset: number = int(0);
         var target: Block= null;
         for (blockList of $each(this.blockLists))
         {
            for(index = int(0); index < blockList.blockVectorList.length; index++)
            {
               generatorBlock = blockList.blockVectorList[index];
               sideInQuestion = generatorBlock.vars.generatorDirection;
               xTileOffset = int(0);
               yTileOffset = int(0);
               switch(sideInQuestion)
               {
                  case "Up":
                     yTileOffset--;
                     break;
                  case "Down":
                     yTileOffset = int(yTileOffset + (1));
                     break;
                  case "Left":
                     xTileOffset--;
                     break;
                  case "Right":
                     xTileOffset = int(xTileOffset + (1));
                     break;
                  case "Self":
                     MapManager.map.blockMap.addBlockAtTile(BlockManager.requestBlock(generatorBlock.vars.generatorBlockID).clone(),generatorBlock.tileX,generatorBlock.tileY);
                     continue;
               }
               target = MapManager.map.blockMap.getBlockAtPos(generatorBlock.tileX * 40 + xTileOffset * 40,generatorBlock.tileY * 40 + yTileOffset * 40);
               if(target == null)
               {
                  MapManager.map.blockMap.addBlockAtTile(BlockManager.requestBlock(generatorBlock.vars.generatorBlockID).clone(),generatorBlock.tileX + xTileOffset,generatorBlock.tileY + yTileOffset);
               }
            }
         }
      }
  constructor(frequency: number) {
    frequency = int(frequency);
         super(frequency);
      }
}
$reg('com.jiggmin.pr3.game.blockInterval.GeneratorBlockFreqGroup', GeneratorBlockFreqGroup);
