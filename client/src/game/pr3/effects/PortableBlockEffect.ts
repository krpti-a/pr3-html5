// Ported from com/jiggmin/pr3/effects/PortableBlockEffect.as
import { int } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { ActivePlayer, Block, BlockEffectGraphic, BlockManager, MapManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class PortableBlockEffect extends Effect {
  blockID: number = 0;
  declare m: BlockEffectGraphic;
  declare fromPlayer: ActivePlayer;
  createBlock(): void {
         var addThis= BlockManager.requestBlock(this.blockID);
         var atPosX= Math.floor(this.x / Block.width);
         var atPosY= Math.floor(this.y / Block.height);
         MapManager.map.blockMap.addBlockAtTile(addThis,atPosX,atPosY);
      }
  remove(): void {
         this.m.stop();
         this.m = null;
         super.remove();
      }
  constructor(blockIDToGet: number, player: ActivePlayer, frameToGoTo: number = 0) {
    blockIDToGet = int(blockIDToGet); frameToGoTo = int(frameToGoTo);
         super();
         this.m = new BlockEffectGraphic();
         this.blockID = int(blockIDToGet);
         this.fromPlayer = player;
         var _loc_2= BlockManager.requestBlock(this.blockID);
         this.m.anim.addChild(_loc_2);
         this.m.gotoAndPlay(frameToGoTo);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.PortableBlockEffect', PortableBlockEffect);
