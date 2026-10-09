// Ported from com/jiggmin/pr3/items/BlackHole.as
import { Point } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { BlackHoleEffect } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BlackHole extends Item {
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         var speedx: number = int(int(this.settings.speedx));
         if(this.player.facing == "left")
         {
            speedx = int(speedx * (-1));
         }
         var _loc_1: BlackHoleEffect= new BlackHoleEffect(this.player,this.settings.duration,this.settings.strength,speedx,this.settings.speedy);
         var _loc_2: Point= this.getItemPoint();
         _loc_1.x = _loc_2.x;
         _loc_1.y = _loc_2.y;
         super.useItem();
      }
  constructor() {
         super();
         this.localOnly = true;
         this.itemKeyframeName = "blackHole";
      }
}
$reg('com.jiggmin.pr3.items.BlackHole', BlackHole);
