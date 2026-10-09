// Ported from com/jiggmin/pr3/items/SuperTeleport.as
import { Item } from './Item.ts';
import { Data, MapManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SuperTeleport extends Item {
  useItem(): void {
         var _loc_1= 0;
         if(this.player.facing == "right")
         {
            _loc_1 = 160;
         }
         else
         {
            _loc_1 = -160;
         }
         var _loc_2= Data.rotatePoint(_loc_1,0,-this.player.rotation);
         var _loc_3= MapManager.map.blockMap.getBlockAtPos(this.player.realX + _loc_2.x,this.player.realY + _loc_2.y);
         if(_loc_3 == null || !_loc_3.active)
         {
            this.player.showPoofEffect();
            this.player.setRealX(this.player.realX + _loc_2.x);
            this.player.setRealY(this.player.realY + _loc_2.y);
            this.player.showTeleportEffect();
            super.useItem();
         }
      }
  constructor() {
         super();
         this.itemKeyframeName = "superTeleport";
      }
}
$reg('com.jiggmin.pr3.items.SuperTeleport', SuperTeleport);
