// Ported from com/jiggmin/pr3/items/Snowball.as
import { Item } from './Item.ts';
import { LocalPlayer, SnowballEffect, Sounds, SwishSound } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Snowball extends Item {
  useItem(): void {
         var _loc_4= null;
         if(this.player instanceof LocalPlayer)
         {
            if(this.player.facing == "left")
            {
               this.player.velX += this.settings.recoil;
            }
            else
            {
               this.player.velX -= this.settings.recoil;
            }
         }
         Sounds.startGameSound(new SwishSound(),this.player,1.5);
         var _loc_1= this.getItemPoint();
         var _loc_2= _loc_1.x;
         var _loc_3= _loc_1.y;
         var extraKnockback: number= 0;
         if(this.player.tinfoilHat)
         {
            extraKnockback = 999;
         }
         _loc_4 = new SnowballEffect(this.player,this.settings.damage,this.settings.knockback + extraKnockback,this.settings.sap,this.settings.recovery,this.settings.speed,this.settings.range);
         _loc_4.x = _loc_2;
         _loc_4.y = _loc_3;
         _loc_4.initTest();
         super.useItem();
      }
  constructor() {
         super();
         this.itemKeyframeName = "snowball";
         this.localOnly = true;
      }
}
$reg('com.jiggmin.pr3.items.Snowball', Snowball);
